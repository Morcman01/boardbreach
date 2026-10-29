"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type TaskCardData = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assigneeId: string | null;
};

type Member = { id: string; name: string };

export default function TaskCard({
  task,
  members,
  canEdit,
  canDelete,
}: {
  task: TaskCardData;
  members: Member[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function updateTask(data: object) {
    setError("");
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? "update failed");
      return;
    }
    router.refresh();
  }

  async function deleteTask() {
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    setError("");
    const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? "delete failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="border rounded p-3 bg-white text-gray-900 space-y-2">
      <Link href={`/tasks/${task.id}`} className="font-medium hover:underline">
        {task.title}
      </Link>
      {task.description && (
        <p className="text-sm text-gray-600">{task.description}</p>
      )}

      <select
        value={task.status}
        onChange={(e) => updateTask({ status: e.target.value })}
        disabled={!canEdit}
        className="text-sm border rounded px-2 py-1 w-full disabled:opacity-50"
      >
        <option value="TODO">To do</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="DONE">Done</option>
      </select>

      <select
        value={task.assigneeId ?? ""}
        onChange={(e) => updateTask({ assigneeId: e.target.value || null })}
        disabled={!canEdit}
        className="text-sm border rounded px-2 py-1 w-full disabled:opacity-50"
      >
        <option value="">Unassigned</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      {canDelete && (
        <button
          onClick={deleteTask}
          className="text-xs text-red-600 hover:underline"
        >
          Delete
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}