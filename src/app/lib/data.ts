import postgres from "postgres";

import { Note, User } from "./definitions";
const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

export async function createUser(userData: {
  email: string;
  full_name: string;
}): Promise<User> {
  try {
    const [user] = await sql<User[]>`
      INSERT INTO users (email, full_name, token)
      VALUES (${userData.email}, ${userData.full_name}, '')
      RETURNING *
    `;
    return user;
  } catch (error) {
    console.error("Database Error creating user:", error);
    throw error;
  }
}

export async function fetchUser(userId: string): Promise<User | null> {
  try {
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE id = ${userId}
    `;
    return user || null;
  } catch (error) {
    console.error("Database Error fetching user:", error);
    throw error;
  }
}

export async function fetchUserByEmail(email: string): Promise<User | null> {
  try {
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email}
    `;
    return user || null;
  } catch (error) {
    console.error("Database Error fetching user by email:", error);
    throw error;
  }
}

export async function updateUser(
  userId: string,
  updates: { full_name?: string; avatar_url?: string }
): Promise<User> {
  try {
    let query;

    if (updates.full_name && updates.avatar_url) {
      query = sql<User[]>`
        UPDATE users
        SET full_name = ${updates.full_name}, avatar_url = ${updates.avatar_url}, updated_at = NOW()
        WHERE id = ${userId}
        RETURNING *
      `;
    } else if (updates.full_name) {
      query = sql<User[]>`
        UPDATE users
        SET full_name = ${updates.full_name}, updated_at = NOW()
        WHERE id = ${userId}
        RETURNING *
      `;
    } else if (updates.avatar_url) {
      query = sql<User[]>`
        UPDATE users
        SET avatar_url = ${updates.avatar_url}, updated_at = NOW()
        WHERE id = ${userId}
        RETURNING *
      `;
    } else {
      throw new Error("No updates provided");
    }

    const result = await query;
    const [user] = result;
    return user;
  } catch (error) {
    console.error("Database Error updating user:", error);
    throw error;
  }
}

export async function fetchNotes(user_id: string): Promise<Note[]> {
  try {
    const data = await sql<Note[]>`
      SELECT * FROM notes
      WHERE user_id = ${user_id}
      ORDER BY created_at DESC
    `;
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
  }
}

export async function createNote(noteData: {
  title: string;
  content: string;
  userId: string|null;
}): Promise<Note> {
  try {
    const [note] = await sql<Note[]>`
      INSERT INTO notes (title, content, user_id)
      VALUES (${noteData.title}, ${noteData.content}, ${noteData.userId})
      RETURNING *
    `;
    return note;
  } catch (error) {
    console.error("Database Error creating note:", error);
    throw error;
  }
}

export async function updateNote(
  noteId: string,
  updates: { title?: string; content?: string; is_public?: boolean; public_id?: string }
): Promise<Note> {
  try {
    const fields = [];
    const values = [];

    if (updates.title !== undefined) {
      fields.push('title = $' + (values.length + 1));
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      fields.push('content = $' + (values.length + 1));
      values.push(updates.content);
    }
    if (updates.is_public !== undefined) {
      fields.push('is_public = $' + (values.length + 1));
      values.push(updates.is_public);
    }
    if (updates.public_id !== undefined) {
      fields.push('public_id = $' + (values.length + 1));
      values.push(updates.public_id);
    }

    if (fields.length === 0) {
      throw new Error("No updates provided");
    }

    fields.push('updated_at = NOW()');
    values.push(noteId);

    const queryString = `
      UPDATE notes
      SET ${fields.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `;

    const result = await sql.unsafe(queryString, values) as Note[];
    const [note] = result;
    return note;
  } catch (error) {
    console.error("Database Error updating note:", error);
    throw error;
  }
}

export async function deleteNote(
  noteId: string,
  userId: string
): Promise<void> {
  try {
    await sql`
      DELETE FROM notes
      WHERE id = ${noteId} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error("Database Error deleting note:", error);
    throw error;
  }
}

export async function fetchPublicNote(publicId: string): Promise<Note | null> {
  try {
    const [note] = await sql<Note[]>`
      SELECT n.*, u.full_name as author_name FROM notes n
      JOIN users u ON n.user_id = u.id
      WHERE n.public_id = ${publicId} AND n.is_public = true
    `;
    return note || null;
  } catch (error) {
    console.error("Database Error fetching public note:", error);
    throw error;
  }
}

export function generatePublicId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
