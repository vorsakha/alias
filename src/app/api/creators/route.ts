import { db } from "@/server/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const creators = await db.creator.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
      },
    });

    return NextResponse.json(creators);
  } catch (error) {
    console.error("Error fetching creators:", error);
    return NextResponse.json(
      { error: "Failed to fetch creators" },
      { status: 500 },
    );
  }
}
