"use client";

import { useState } from "react";

export default function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(value);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex gap-3 mb-8">
      <input
        className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 transition"
        placeholder="Search by name, city, or region..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition">
        Search
      </button>
    </form>
  );
}
