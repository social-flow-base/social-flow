import { NextRequest, NextResponse } from "next/server";
import { getLateClient } from "@/lib/getlate";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const platform = searchParams.get("platform");
    const status = searchParams.get("status");

    // Extract account IDs from cookies
    const twitterAccountId = request.cookies.get("twitter_account_id")?.value;
    const threadsAccountId = request.cookies.get("threads_account_id")?.value;
    const linkedinAccountId = request.cookies.get("linkedin_account_id")?.value;
    const instagramAccountId = request.cookies.get(
      "instagram_account_id",
    )?.value;

    const accountIds: string[] = [];
    if (platform) {
      const specificAccountId = request.cookies.get(
        `${platform}_account_id`,
      )?.value;
      if (specificAccountId) {
        accountIds.push(specificAccountId);
      } else {
        // If specific platform requested but no account ID found, return empty
        return NextResponse.json({ posts: [] });
      }
    } else {
      // If no platform specified, collect all connected account IDs
      if (twitterAccountId) accountIds.push(twitterAccountId);
      if (threadsAccountId) accountIds.push(threadsAccountId);
      if (linkedinAccountId) accountIds.push(linkedinAccountId);
      if (instagramAccountId) accountIds.push(instagramAccountId);
    }

    if (accountIds.length === 0) {
      return NextResponse.json({ posts: [] });
    }

    const query: any = {
      page,
      limit,
      accountId: accountIds.length === 1 ? accountIds[0] : accountIds,
    };

    if (platform) query.platform = platform;
    if (status) query.status = status;

    const late = getLateClient();
    const response = await late.posts.listPosts({
      query,
    });

    // Check structure
    let posts: any[] = [];
    if (response && response.data && Array.isArray(response.data.posts)) {
      posts = response.data.posts;
    } else if (Array.isArray(response)) {
      posts = response;
    } else if (response && Array.isArray(response.data)) {
      posts = response.data;
    }

    // Manual filtering by account ID as a fallback/reinforcement
    if (accountIds.length > 0) {
      posts = posts.filter((post: any) => {
        // A post matches if any of its platforms targets one of our logged-in accounts
        return post.platforms?.some((p: any) => {
          const pAccountId =
            typeof p.accountId === "string"
              ? p.accountId
              : p.accountId?._id || p.accountId?.id;
          return accountIds.includes(pAccountId);
        });
      });
    }

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
