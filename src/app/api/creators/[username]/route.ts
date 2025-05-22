import { db } from "@/server/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { username: string } },
) {
  try {
    const { username } = params;

    const creator = await db.creator.findUnique({
      where: {
        username,
      },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    return NextResponse.json(creator);
  } catch (error) {
    console.error(`Error fetching creator ${params.username}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch creator" },
      { status: 500 },
    );
  }
}
