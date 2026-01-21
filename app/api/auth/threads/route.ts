import { NextRequest, NextResponse } from "next/server";
import { getLateClient } from "@/lib/getlate";

export async function GET(request: NextRequest) {
  try {
    const late = getLateClient();

    // 1. Get or Create Profile ID
    let profileId = request.cookies.get("late_profile_id")?.value;

    if (!profileId) {
      const { data: profilesData } = await late.profiles.listProfiles();
      if (profilesData?.profiles && profilesData.profiles.length > 0) {
        profileId = profilesData.profiles[0]._id;
      } else {
        const { data: newProfile } = await late.profiles.createProfile({
          body: { name: "User Profile" },
        });
        profileId = newProfile?.profile?._id;
      }
    }

    if (!profileId) {
      throw new Error("Failed to obtain a profile ID");
    }

    // 2. Get Connect URL
    const callbackPath = "/api/auth/threads/callback";
    const requestOrigin = new URL(request.url).origin;

    // Fallback to localhost:3000 if origin seems empty
    const baseUrl =
      requestOrigin && requestOrigin !== "null"
        ? requestOrigin
        : "http://localhost:3000";

    const redirectUrl = new URL(callbackPath, baseUrl).toString();

    console.log(
      "Generating Late Connect URL for Threads with redirect:",
      redirectUrl,
    );

    const { data: connectData } = await late.connect.getConnectUrl({
      path: { platform: "threads" },
      query: {
        profileId,
        redirectUrl,
        // @ts-ignore
        redirect_url: redirectUrl,
      },
    });

    if (!connectData?.authUrl) {
      throw new Error("No connect URL returned");
    }

    console.log("Redirecting user to:", connectData.authUrl);

    const response = NextResponse.redirect(connectData.authUrl);

    // 3. Set profile cookie
    response.cookies.set("late_profile_id", profileId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error: any) {
    console.error("Late Auth Error (Threads):", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate Threads connection" },
      { status: 500 },
    );
  }
}
