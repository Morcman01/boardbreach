import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId, getTaskAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const { id: taskId } = await params;
  const access = await getTaskAccess(userId, taskId);
  if (!access) {
    return NextResponse.json({ error: "task not found" }, { status: 404 });
  }
  if (access.membership.role === "GUEST") {
    return NextResponse.json({ error: "guests cannot comment" }, { status: 403 });
  }

  const body = await req.json();
  const text = typeof body.body === "string" ? body.body.trim() : "";

  if (text.length === 0) {
    return NextResponse.json({ error: "comment cannot be empty" }, { status: 400 });
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: "comment is too long" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { body: text, taskId, userId },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}

export async function GET(req: NextRequest, { params }: Ctx) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const { id: taskId } = await params;
  const access = await getTaskAccess(userId, taskId);
  if (!access) {
    return NextResponse.json({ error: "task not found" }, { status: 404 });
  }

  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}