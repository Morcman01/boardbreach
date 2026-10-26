import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId, getTaskAccess, getTeamMembership } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const access = await getTaskAccess(userId, id);
  if (!access) {
    return NextResponse.json({ error: "task not found" }, { status: 404 });
  }

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: { select: { id: true, name: true } },
      comments: true,
    },
  });

  return NextResponse.json(task);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const access = await getTaskAccess(userId, id);
  if (!access) {
    return NextResponse.json({ error: "task not found" }, { status: 404 });
  }
  if (access.membership.role === "GUEST") {
    return NextResponse.json({ error: "guests cannot edit tasks" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, status, assigneeId } = body;

  const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];
  if (status !== undefined && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  if (assigneeId) {
    const m = await getTeamMembership(assigneeId, access.board.teamId);
    if (!m) {
      return NextResponse.json(
        { error: "assignee is not a member of this team" },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(assigneeId !== undefined && { assigneeId }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const access = await getTaskAccess(userId, id);
  if (!access) {
    return NextResponse.json({ error: "task not found" }, { status: 404 });
  }

  // creator or OWNER/ADMIN only
  const isCreator = access.task.createdById === userId;
  const isAdmin = ["OWNER", "ADMIN"].includes(access.membership.role);
  if (!isCreator && !isAdmin) {
    return NextResponse.json({ error: "not allowed to delete this task" }, { status: 403 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}