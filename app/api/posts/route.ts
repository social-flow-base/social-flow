import { NextRequest, NextResponse } from "next/server";
import { getLateClient } from "@/lib/getlate";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const platform = searchParams.get("platform");
    const status = searchParams.get("status");

    const query: any = {
      page,
      limit,
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

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
