import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { platform } = await request.json();

  const response = NextResponse.json({ success: true });

  if (platform === "twitter" || platform === "all") {
    // Clear all Twitter-related cookies
    response.cookies.delete("twitter_is_connected");
    response.cookies.delete("twitter_username");
    response.cookies.delete("twitter_account_id");
  }

  if (platform === "threads" || platform === "all") {
    // Clear all Threads-related cookies
    response.cookies.delete("threads_is_connected");
    response.cookies.delete("threads_username");
    response.cookies.delete("threads_account_id");
  }

  // We do NOT delete late_profile_id because it might be used for other platforms
  // If we wanted to fully reset:
  // response.cookies.delete("late_profile_id");

  return response;
}
