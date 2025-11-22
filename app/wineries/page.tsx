"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Winery } from "@/types/winery";
import SearchBar from "@/components/SearchBar";
import CategoryBadges from "@/components/category-badges";
import WineryCard from "@/components/winery-card";
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

      // Filter by selected categories AND region (if specified)
      const filtered = (data.wineries || []).filter((w: Winery) => {
        const matchesCategory = w.categories.some(cat => selectedCategories[cat]);
        const matchesRegion = region ? w.region === region : true;
        return matchesCategory && matchesRegion;
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
          🍷 {region ? `${region} venues` : 'Search venues'}
        </h1>
        <SearchBar onSearch={handleSearch} />

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
              <span className="font-semibold text-blue-800">🍸 Distilleries</span>
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
              <p className="text-gray-500">No venues found. Try a different search.</p>
            ) : (
              <div className="grid gap-4">
                {wineries.map((w) => (
                  <WineryCard key={w.id} winery={w} />
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
