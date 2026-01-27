import { NextRequest, NextResponse } from "next/server";
import { getLateClient } from "@/lib/getlate";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const connected = searchParams.get("connected");
  const profileIdParam = searchParams.get("profileId");

  // Check if connection was successful
  // Late redirects with ?connected=twitter (or similar)
  if (!connected) {
    return NextResponse.redirect(
      new URL("/?error=twitter_connection_failed", request.url),
    );
  }

  // Determine profileId
  let profileId =
    profileIdParam || request.cookies.get("late_profile_id")?.value;

  if (!profileId) {
    // If we don't have profileId, we can't look up the account.
    // But if 'connected' is present, the connection happened.
    return NextResponse.json({ error: "Profile ID missing" }, { status: 400 });
  }

  try {
    const late = getLateClient();

    // List accounts to find the new Twitter account
    const { data: accountsData } = await late.accounts.listAccounts({
      query: { profileId },
    });

    const twitterAccount = accountsData?.accounts?.find(
      (acc: any) => acc.platform === "twitter",
    );

    if (!twitterAccount) {
      return NextResponse.redirect(
        new URL("/?error=twitter_account_not_found", request.url),
      );
    }

    const response = NextResponse.redirect(
      new URL("/?connected=true&platform=twitter", request.url),
    );

    // Set cookies for UI and future use
    response.cookies.set("twitter_is_connected", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.set("twitter_username", twitterAccount.username || "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.set("twitter_account_id", twitterAccount._id || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    // Ensure profile cookies is set if we got it from params
    if (profileIdParam && !request.cookies.get("late_profile_id")) {
      response.cookies.set("late_profile_id", profileIdParam, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return response;
  } catch (error) {
    console.error("Error in Twitter callback:", error);
    return NextResponse.redirect(
      new URL("/?error=callback_error", request.url),
    );
  }
}
