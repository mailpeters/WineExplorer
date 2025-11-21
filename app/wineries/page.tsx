"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Winery } from "@/types/winery";
import SearchBar from "@/components/SearchBar";
import CategoryBadges from "@/components/category-badges";
import { loadSettings, saveSettings } from "@/lib/user-settings";

function WineriesPageContent() {
  const searchParams = useSearchParams();
  const region = searchParams.get("region");

  const [wineries, setWineries] = useState<Winery[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(() => {
    // Load settings on initialization
    const settings = loadSettings();
    return settings.defaultCategories;
  });

  async function handleSearch(q: string) {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/wineries/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      // Filter by selected categories
      const filtered = (data.wineries || []).filter((w: Winery) => {
        return w.categories.some(cat => selectedCategories[cat]);
      });

      setWineries(filtered);
    } catch (error) {
      console.error("Search error:", error);
      setWineries([]);
    } finally {
      setLoading(false);
    }
  }

  const toggleCategory = (category: keyof typeof selectedCategories) => {
    setSelectedCategories(prev => {
      const newCategories = {
        ...prev,
        [category]: !prev[category]
      };

      // Save to settings
      const settings = loadSettings();
      settings.defaultCategories = newCategories;
      saveSettings(settings);

      return newCategories;
    });
  };

  // Auto-search when region parameter is present or categories change
  useEffect(() => {
    if (region) {
      handleSearch(region);
    }
  }, [region, selectedCategories]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-900 mb-8">
          🍷 {region ? `${region} Wineries` : 'Search Wineries'}
        </h1>
        <SearchBar onSearch={handleSearch} />

        {/* Region Input Box */}
        {region && (
          <div className="mb-8">
            <label className="block text-sm font-semibold text-purple-900 mb-2">Region</label>
            <input
              type="text"
              value={region}
              readOnly
              className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-lg text-purple-900 font-semibold"
            />
          </div>
        )}

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 bg-white rounded-lg p-4 border-2 border-purple-200 shadow-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.winery}
                onChange={() => toggleCategory('winery')}
                className="w-5 h-5 rounded accent-purple-500"
              />
              <span className="font-semibold text-purple-900">🍷 Wineries</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.distillery}
                onChange={() => toggleCategory('distillery')}
                className="w-5 h-5 rounded accent-blue-500"
              />
              <span className="font-semibold text-blue-800">🥃 Distilleries</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.brewery}
                onChange={() => toggleCategory('brewery')}
                className="w-5 h-5 rounded accent-yellow-500"
              />
              <span className="font-semibold text-yellow-800">🍺 Breweries</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.cidery}
                onChange={() => toggleCategory('cidery')}
                className="w-5 h-5 rounded accent-amber-500"
              />
              <span className="font-semibold text-amber-800">🍎 Cideries</span>
            </label>
          </div>
        </div>

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
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-bold text-purple-900">{w.name}</h2>
                      <CategoryBadges categories={w.categories} />
                    </div>
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">📍</span> {w.city}, {w.state}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-semibold">🗺️</span> {w.region}
                    </p>
                    {w.phone && (
                      <p className="text-gray-600 mb-2">
                        <span className="font-semibold">📞</span> {w.phone}
                      </p>
                    )}
                    {w.website && (
                      <p className="text-purple-600 hover:text-purple-800">
                        <span className="font-semibold">🌐</span>{' '}
                        <a href={`https://${w.website}`} target="_blank" rel="noopener noreferrer" className="underline">
                          {w.website}
                        </a>
                      </p>
                    )}
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

export default function WineriesPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-purple-900 mb-8">🍷 Loading...</h1>
        </div>
      </main>
    }>
      <WineriesPageContent />
    </Suspense>
  );
}
