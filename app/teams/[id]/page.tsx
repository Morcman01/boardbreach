import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId, getTeamMembership } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateBoardForm from "./CreateBoardForm";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const { id: teamId } = await params;

  const membership = await getTeamMembership(userId, teamId);
  if (!membership) {
    notFound();
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      boards: {
        orderBy: { createdAt: "asc" },
        include: { _count: { select: { tasks: true } } },
      },
    },
  });

  if (!team) {
    notFound();
  }

  const canCreate = membership.role !== "GUEST";

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-6">
      <Link href="/teams" className="text-sm text-blue-600">
        ← All teams
      </Link>
      <h1 className="text-2xl font-bold">{team.name}</h1>

      {canCreate && <CreateBoardForm teamId={team.id} />}

      {team.boards.length === 0 ? (
        <p className="text-gray-500">No boards yet.</p>
      ) : (
        <ul className="space-y-2">
          {team.boards.map((board) => (
            <li key={board.id}>
              <Link
                href={`/boards/${board.id}`}
                className="block border rounded p-4 hover:bg-gray-50"
              >
                <p className="font-medium">{board.title}</p>
                <p className="text-sm text-gray-500">
                  {board._count.tasks} tasks
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}