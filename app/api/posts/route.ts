import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initial auth check
    const authHeader = request.headers.get("authorization");
    const userIdHeader = request.headers.get("X-User-Id");

    let user = null;

    if (authHeader) {
      const { data, error: authError } = await supabase.auth.getUser(
        authHeader.replace("Bearer ", ""),
      );
      if (!authError && data.user) {
        user = data.user;
      }
    }

    // Fallback/Alternative: Wallet User ID
    if (!user && userIdHeader) {
      user = { id: userIdHeader };
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const platform = searchParams.get("platform");
    const status = searchParams.get("status");

    // Calculate range
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Determine select string based on platform filter
    // If filtering by platform, use !inner to filter parent posts by child existence
    // Determine select string based on platform filter
    // Platforms is now a JSONB column, so we select *
    const selectStr = "*";

    let query = supabase
      .from("getlate_posts")
      .select(selectStr, { count: "exact" })
      .eq("user_id", user.id)
      .range(from, to)
      .order("created_at", { ascending: false });

    // Status filter
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Platform filter: check if the platforms JSONB array contains an object with the specified platform
    if (platform && platform !== "all") {
      // Using PostgreSQL JSONB containment operator @>
      query = query.contains(
        "platforms",
        JSON.stringify([{ platform: platform }]),
      );
    }

    const { data: posts, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ posts, count });
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
