"use client";

import { useState } from "react";
import { Winery } from "@/types/winery";
import SearchBar from "@/components/SearchBar";

export default function WineriesPage() {
  const [wineries, setWineries] = useState<Winery[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(q: string) {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/wineries/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setWineries(data.wineries || []);
    } catch (error) {
      console.error("Search error:", error);
      setWineries([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-900 mb-8">🍷 Search Wineries</h1>
        <SearchBar onSearch={handleSearch} />

        {loading && <p className="text-gray-600">Searching...</p>}

        {searched && !loading && (
          <div>
            <p className="text-gray-600 mb-4">Found {wineries.length} winery(ies)</p>
            {wineries.length === 0 ? (
              <p className="text-gray-500">No wineries found. Try a different search.</p>
            ) : (
              <div className="grid gap-4">
                {wineries.map((w) => (
                  <div key={w.id} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition">
                    <h2 className="text-xl font-bold text-purple-900">{w.name}</h2>
                    <p className="text-gray-600">{w.city}, {w.state}</p>
                    <p className="text-sm text-gray-500">{w.region}</p>
                    {w.phone && <p className="text-sm text-gray-600 mt-2">{w.phone}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
