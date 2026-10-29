import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId, getTaskAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CommentForm from "./CommentForm";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const { id: taskId } = await params;

  const access = await getTaskAccess(userId, taskId);
  if (!access) {
    notFound();
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: { select: { name: true } },
      createdBy: { select: { name: true } },
      comments: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!task) {
    notFound();
  }

  const canComment = access.membership.role !== "GUEST";

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-6 text-gray-900">
      <Link href={`/boards/${task.boardId}`} className="text-sm text-blue-600">
        ← Back to board
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <p className="text-sm text-gray-500">
          {task.status.replace("_", " ")} · created by {task.createdBy.name} ·{" "}
          {task.assignee ? `assigned to ${task.assignee.name}` : "unassigned"}
        </p>
        {task.description && <p>{task.description}</p>}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          Comments ({task.comments.length})
        </h2>

        {task.comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          <ul className="space-y-3">
            {task.comments.map((c) => (
              <li key={c.id} className="border rounded p-3">
                <p className="text-sm font-medium">
                  {c.user.name}{" "}
                  <span className="font-normal text-gray-500">
                    · {c.createdAt.toLocaleString()}
                  </span>
                </p>
                <p className="whitespace-pre-wrap">{c.body}</p>
              </li>
            ))}
          </ul>
        )}

        {canComment && <CommentForm taskId={task.id} />}
      </section>
    </main>
  );
}