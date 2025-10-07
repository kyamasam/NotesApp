import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { updateNote, fetchUserByEmail, generatePublicId } from "../../../../lib/data";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const noteId = id;
    const publicId = generatePublicId();

    const note = await updateNote(noteId, {
      is_public: true,
      public_id: publicId
    });

    const publicUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${publicId}`;

    return NextResponse.json({
      note,
      publicUrl,
      publicId
    });
  } catch (error) {
    console.error("Error sharing note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const noteId = id;

    const note = await updateNote(noteId, {
      is_public: false,
      public_id: undefined
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Error unsharing note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}