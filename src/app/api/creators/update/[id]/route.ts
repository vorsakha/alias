import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { NextResponse } from "next/server";
import { profileUpdateSchema } from "@/server/api/routers/profiles";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { id } = await params;

    // Get existing creator to verify ownership
    const creator = await db.creator.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Check if the authenticated user is the owner of this creator profile
    if (creator.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this profile" },
        { status: 403 },
      );
    }

    // Parse and validate request body
    const body = (await request.json()) as unknown;
    const validationResult = profileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input data",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const validData = validationResult.data;

    // Update the creator profile
    const updatedCreator = await db.creator.update({
      where: { id },
      data: {
        ...(validData.displayName !== undefined && {
          displayName: validData.displayName,
        }),
        ...(validData.bio !== undefined && { bio: validData.bio }),
        ...(validData.avatarUrl !== undefined && {
          avatarUrl: validData.avatarUrl,
        }),
        ...(validData.lightningAddress !== undefined && {
          lightningAddress: validData.lightningAddress,
        }),
      },
    });

    return NextResponse.json(updatedCreator);
  } catch (error) {
    const resolvedParams = await params;
    console.error(`Error updating creator ${resolvedParams.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update creator profile" },
      { status: 500 },
    );
  }
}
