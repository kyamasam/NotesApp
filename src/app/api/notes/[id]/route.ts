import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { deleteNote, updateNote, fetchUserByEmail } from "../../../lib/data";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  

    const { title, content } = await request.json();
    const noteId = params.id;

    const note = await updateNote(noteId, { title, content });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const noteId = params.id;
    const user = await fetchUserByEmail(session.user.email!);
    const userId = user.id;

    await deleteNote(noteId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
