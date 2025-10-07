import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

export async function GET() {
  try {
    const leaderboard = await sql`
      SELECT
        u.id,
        u.full_name,
        
        u.avatar_url,
        COUNT(n.id) as note_count
      FROM users u
      LEFT JOIN notes n ON u.id = n.user_id
      GROUP BY u.id, u.full_name, u.email, u.avatar_url
      ORDER BY note_count DESC, u.full_name ASC
    `;

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}