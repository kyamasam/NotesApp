import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createNote, fetchNotes, fetchUserByEmail } from "../../lib/data";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    const user = await fetchUserByEmail(session.user.email);
    const notes = await fetchNotes(user.id);

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content } = await request.json();
    const user = await fetchUserByEmail(session.user.email!);
    const userId = user.id;

    const note = await createNote({
      title: title || "Untitled Note",
      content: content || "",
      userId,
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
