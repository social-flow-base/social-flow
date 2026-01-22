import { NextRequest, NextResponse } from "next/server";
import { getLateClient } from "@/lib/getlate";
import { supabase as supabaseClient } from "@/supabase/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      content,
      platform,
      platforms: requestedPlatforms,
      scheduledFor,
    } = body;

    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    // Enforce array format: "saat post atau schedule post ... tetap kirim dalam bentuk array"
    // We prioritize 'platforms' usage, but support 'platform' for backward compatibility by converting it to an array.
    const platformsToProcess: string[] = Array.isArray(requestedPlatforms)
      ? requestedPlatforms
      : platform
        ? [platform]
        : [];

    if (platformsToProcess.length === 0) {
      return NextResponse.json(
        { error: "No platform specified" },
        { status: 400 },
      );
    }

    // Authenticate user via Supabase
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    const {
      data: { user },
    } = token
      ? await supabaseClient.auth.getUser(token)
      : await supabaseClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Credit Check
    const { data: creditData, error: creditError } = await supabaseClient
      .from("user_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (creditError || !creditData || creditData.credits_remaining <= 0) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          message: "You have run out of credits. Please top up to continue.",
        },
        { status: 403 },
      );
    }

    const platformPayloads = [];
    for (const p of platformsToProcess) {
      const accountIdCookieName = `${p}_account_id`;
      const accountId = request.cookies.get(accountIdCookieName)?.value;

      if (!accountId) {
        return NextResponse.json(
          { error: `Not authenticated with ${p}` },
          { status: 401 },
        );
      }
      platformPayloads.push({ platform: p as any, accountId: accountId });
    }

    const late = getLateClient();

    try {
      const payload: any = {
        content,
        platforms: platformPayloads,
      };

      if (scheduledFor) {
        payload.scheduledFor = scheduledFor;
      } else {
        payload.publishNow = true;
      }

      // 1. Deduct Credit IMMEDIATELY
      const { error: updateError } = await supabaseClient.rpc("deduct_credit", {
        p_user_id: user.id,
      });

      // If RPC fails (e.g. not defined), fallback to manual update
      if (updateError) {
        console.warn(
          "RPC deduct_credit failed, falling back to manual update",
          updateError,
        );
        const { data: currentCredits } = await supabaseClient
          .from("user_credits")
          .select("credits_remaining")
          .eq("user_id", user.id)
          .maybeSingle();

        if (currentCredits) {
          await supabaseClient
            .from("user_credits")
            .update({ credits_remaining: currentCredits.credits_remaining - 1 })
            .eq("user_id", user.id);
        }
      }

      const { data: postResult } = await late.posts.createPost({
        body: payload,
      });

      const postResultAny = postResult as any;
      const externalPostId = postResultAny?._id || postResultAny?.id;

      // 1. Record the post in Supabase
      const { data: post, error: postError } = await supabaseClient
        .from("posts")
        .insert([
          {
            user_id: user.id,
            content: content,
            status: scheduledFor ? "scheduled" : "published",
            scheduled_for: scheduledFor || null,
            metadata: { late_post_id: externalPostId },
          },
        ])
        .select()
        .single();

      if (postError) {
        console.error("Error creating post in Supabase:", postError);
        // We still return success since Late post was created, but log the error
      } else if (post) {
        // 2. Record distributions and ensure oauth_accounts exist
        for (const pPayload of platformPayloads) {
          const platform = pPayload.platform;
          const externalAccountId = pPayload.accountId;

          // Find or create oauth_account
          let { data: oauthAccount } = await supabaseClient
            .from("oauth_accounts")
            .select("id")
            .eq("user_id", user.id)
            .eq("provider", platform)
            .eq("provider_account_id", externalAccountId)
            .maybeSingle();

          if (!oauthAccount) {
            // Get username/display name from cookies if available
            const username = request.cookies.get(`${platform}_username`)?.value;

            const { data: newAccount, error: accError } = await supabaseClient
              .from("oauth_accounts")
              .insert([
                {
                  user_id: user.id,
                  provider: platform,
                  provider_account_id: externalAccountId,
                  username: username || null,
                  access_token: "late_managed", // Marks that tokens are handled by Late
                },
              ])
              .select("id")
              .single();

            if (accError) {
              console.error(
                `Error creating oauth_account for ${platform}:`,
                accError,
              );
            } else {
              oauthAccount = newAccount;
            }
          }

          // Insert distribution
          if (oauthAccount) {
            const username = request.cookies.get(`${platform}_username`)?.value;

            const { error: distError } = await supabaseClient
              .from("post_distributions")
              .insert([
                {
                  post_id: post.id,
                  platform: platform,
                  platform_name: platform,
                  username: username,
                  oauth_account_id: oauthAccount.id,
                  status: scheduledFor ? "scheduled" : "published",
                  scheduled_for: scheduledFor || null,
                  external_post_id: externalPostId,
                },
              ]);

            if (distError) {
              console.error(
                `Error creating distribution for ${platform}:`,
                distError,
              );
            }
          }
        }
      }

      // 3. Deduct Credit (MOVED to before external call)
      // This block is now handled earlier

      return NextResponse.json({ success: true, result: postResult });
    } catch (lateError: any) {
      console.error("Late API Error:", lateError);

      // REFUND CREDIT if Late API fails
      try {
        console.log("Refunding credit due to API failure...");
        // Attempts to refund via RPC usually, but for simplicity here we just increment manually
        // or effectively 'undo' the deduction.
        // Ideally we have a 'refund_credit' RPC, but manual is fine for now as fallback.

        const { data: currentCredits } = await supabaseClient
          .from("user_credits")
          .select("credits_remaining")
          .eq("user_id", user.id)
          .maybeSingle();

        if (currentCredits) {
          await supabaseClient
            .from("user_credits")
            .update({ credits_remaining: currentCredits.credits_remaining + 1 })
            .eq("user_id", user.id);
        }
      } catch (refundError) {
        console.error("Failed to refund credit after API error", refundError);
      }

      return NextResponse.json(
        {
          error: lateError.message || `Failed to post via Late`,
          details: lateError.details || lateError,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error posting content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
