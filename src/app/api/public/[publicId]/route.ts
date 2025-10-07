import { NextRequest, NextResponse } from "next/server";
import { fetchPublicNote } from "../../../lib/data";

export async function GET(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const publicId = params.publicId;
    const note = await fetchPublicNote(publicId);

    if (!note) {
      return NextResponse.json(
        { error: "Note not found or not public" },
        { status: 404 }
      );
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Error fetching public note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}