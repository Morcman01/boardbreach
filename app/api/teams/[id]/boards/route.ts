import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId, getTeamMembership } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const { id: teamId } = await params;

  // Any team member can create a board — not restricted to OWNER/ADMIN
  const membership = await getTeamMembership(userId, teamId);
  if (!membership) {
    return NextResponse.json(
      { error: "you are not a member of this team" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { title } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json(
      { error: "board title is required" },
      { status: 400 }
    );
  }

  const board = await prisma.board.create({
    data: {
      title: title.trim(),
      teamId,
    },
  });

  return NextResponse.json(board, { status: 201 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const { id: teamId } = await params;

  const membership = await getTeamMembership(userId, teamId);
  if (!membership) {
    return NextResponse.json(
      { error: "you are not a member of this team" },
      { status: 403 }
    );
  }

  const boards = await prisma.board.findMany({
    where: { teamId },
  });

  return NextResponse.json(boards);
}