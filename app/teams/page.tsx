import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateTeamForm from "./CreateTeamForm";

export default async function TeamsPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const teams = await prisma.team.findMany({
    where: { members: { some: { userId } } },
    include: { _count: { select: { members: true, boards: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Your teams</h1>

      <CreateTeamForm />

      {teams.length === 0 ? (
        <p className="text-gray-500">You aren&apos;t in any teams yet.</p>
      ) : (
        <ul className="space-y-2">
          {teams.map((team) => (
            <li key={team.id}>
              <Link
                href={`/teams/${team.id}`}
                className="block border rounded p-4 hover:bg-gray-50"
              >
                <p className="font-medium">{team.name}</p>
                <p className="text-sm text-gray-500">
                  {team._count.members} members · {team._count.boards} boards
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}