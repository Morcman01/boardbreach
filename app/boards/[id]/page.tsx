import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId, getBoardAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateTaskForm from "./CreateTaskForm";
import TaskCard from "./TaskCard";

const COLUMNS = [
  { status: "TODO", label: "To do" },
  { status: "IN_PROGRESS", label: "In progress" },
  { status: "DONE", label: "Done" },
] as const;

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const { id: boardId } = await params;

  const access = await getBoardAccess(userId, boardId);
  if (!access) {
    notFound();
  }

  const tasks = await prisma.task.findMany({
    where: { boardId },
    include: { assignee: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const members = await prisma.teamMember.findMany({
    where: { teamId: access.board.teamId },
    include: { user: { select: { id: true, name: true } } },
  });

  const memberOptions = members.map((m) => ({
    id: m.user.id,
    name: m.user.name,
  }));

  const isAdmin = ["OWNER", "ADMIN"].includes(access.membership.role);

  const canEdit = access.membership.role !== "GUEST";

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-6">
      <Link
        href={`/teams/${access.board.teamId}`}
        className="text-sm text-blue-600"
      >
        ← Back to team
      </Link>
      <h1 className="text-2xl font-bold">{access.board.title}</h1>

      {canEdit && <CreateTaskForm boardId={boardId} />}

      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.status);

          return (
            <section key={col.status} className="bg-gray-100 rounded p-3 space-y-3">
              <h2 className="font-semibold">
                {col.label} ({columnTasks.length})
              </h2>

              {columnTasks.length === 0 ? (
                <p className="text-sm text-gray-500">No tasks</p>
              ) : (
                columnTasks.map((t) => (
                  <TaskCard
                  key={t.id}
                  canEdit={canEdit}
                  canDelete={isAdmin || t.createdById === userId}
                  members={memberOptions}
                  task={{
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    status: t.status,
                    assigneeId: t.assigneeId,
                  }}
                />
                ))
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}