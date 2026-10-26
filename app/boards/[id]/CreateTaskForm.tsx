"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTaskForm({ boardId }: { boardId:string }) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        const res = await fetch(`/api/boards/${boardId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
        });

        if(!res.ok){
            const data = await res.json();
            setError(data.error ?? "Could not create task");
            return;
        }

        setTitle("");
        router.refresh();
    }

    return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task title"
        className="border rounded px-3 py-2 flex-1"
        required
      />
      <button type="submit" className="bg-blue-600 text-white rounded px-4">
        Add
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}   