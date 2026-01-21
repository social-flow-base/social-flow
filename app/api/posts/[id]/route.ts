import { NextRequest, NextResponse } from "next/server";
import { getLateClient } from "@/lib/getlate";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 },
      );
    }

    console.log(`Attempting to delete post with ID: ${id}`);

    const late = getLateClient();

    // Call the delete method on the SDK
    try {
      console.log("Calling late.posts.deletePost...");

      await late.posts.deletePost({ path: { postId: id } });
      console.log(`Successfully deleted post with ID: ${id}`);
    } catch (sdkError: any) {
      console.error("SDK Error during delete:", sdkError);
      throw sdkError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting post (outer catch):", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to delete post",
        details: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      },
      { status: 500 },
    );
  }
}
