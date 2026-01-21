import { NextRequest, NextResponse } from "next/server";
import { getLateClient } from "@/lib/getlate";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const connected = searchParams.get("connected");
  const profileIdParam = searchParams.get("profileId");

  // Check if connection was successful
  if (!connected) {
    return NextResponse.redirect(
      new URL("/generator?error=threads_connection_failed", request.url),
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

    // List accounts to find the new Threads account
    const { data: accountsData } = await late.accounts.listAccounts({
      query: { profileId },
    });

    const threadsAccount = accountsData?.accounts?.find(
      (acc) => acc.platform === "threads",
    );

    if (!threadsAccount) {
      return NextResponse.redirect(
        new URL("/generator?error=threads_account_not_found", request.url),
      );
    }

    const response = NextResponse.redirect(
      new URL("/generator?connected=true&platform=threads", request.url),
    );

    // Set cookies for UI and future use
    response.cookies.set("threads_is_connected", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.set("threads_username", threadsAccount.username || "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.set("threads_account_id", threadsAccount._id || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    // Ensure profile cookies is set
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
    console.error("Error in Threads callback:", error);
    return NextResponse.redirect(
      new URL("/generator?error=callback_error", request.url),
    );
  }
}
