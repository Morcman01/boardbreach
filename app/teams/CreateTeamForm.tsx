"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTeamForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "could not create team");
      return;
    }

    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New team name"
        className="border rounded px-3 py-2 flex-1"
        required
      />
      <button type="submit" className="bg-blue-600 text-white rounded px-4">
        Create
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}