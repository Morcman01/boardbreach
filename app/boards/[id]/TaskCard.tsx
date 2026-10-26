"use client";

import { useRouter } from "next/navigation";

export type TaskCardData = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assigneeName: string | null;
};

export default function TaskCard({
  task,
  canEdit,
}: {
  task: TaskCardData;
  canEdit: boolean;
}) {
  const router = useRouter();

  async function changeStatus(newStatus: string) {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="border rounded p-3 bg-white space-y-2">
      <p className="font-medium">{task.title}</p>
      {task.description && (
        <p className="text-sm text-gray-600">{task.description}</p>
      )}
      {task.assigneeName && (
        <p className="text-xs text-gray-500">Assigned to {task.assigneeName}</p>
      )}
      <select
        value={task.status}
        onChange={(e) => changeStatus(e.target.value)}
        disabled={!canEdit}
        className="text-sm border rounded px-2 py-1 w-full disabled:opacity-50"
      >
        <option value="TODO">To do</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="DONE">Done</option>
      </select>
    </div>
  );
}