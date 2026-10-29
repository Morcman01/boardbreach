"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CommentForm({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const res = await fetch(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "could not post comment");
      return;
    }

    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a comment..."
        rows={3}
        className="w-full border rounded px-3 py-2"
        required
      />
      <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">
        Comment
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}