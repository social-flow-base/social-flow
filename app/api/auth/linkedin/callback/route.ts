import { NextRequest, NextResponse } from "next/server";
import { getLateClient } from "@/lib/getlate";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const connected = searchParams.get("connected");
  const profileIdParam = searchParams.get("profileId");

  // Check if connection was successful
  if (!connected) {
    return NextResponse.redirect(
      new URL("/?error=linkedin_connection_failed", request.url),
    );
  }

  // Determine profileId
  let profileId =
    profileIdParam || request.cookies.get("late_profile_id")?.value;

  if (!profileId) {
    return NextResponse.json({ error: "Profile ID missing" }, { status: 400 });
  }

  try {
    const late = getLateClient();

    // List accounts to find the new LinkedIn account
    const { data: accountsData } = await late.accounts.listAccounts({
      query: { profileId },
    });

    const linkedinAccount = accountsData?.accounts?.find(
      (acc: any) => acc.platform === "linkedin",
    );

    if (!linkedinAccount) {
      return NextResponse.redirect(
        new URL("/?error=linkedin_account_not_found", request.url),
      );
    }

    const response = NextResponse.redirect(
      new URL("/?connected=true&platform=linkedin", request.url),
    );

    // Set cookies for UI and future use
    response.cookies.set("linkedin_is_connected", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.set("linkedin_username", linkedinAccount.username || "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.set("linkedin_account_id", linkedinAccount._id || "", {
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
    console.error("Error in LinkedIn callback:", error);
    return NextResponse.redirect(
      new URL("/?error=callback_error", request.url),
    );
  }
}
