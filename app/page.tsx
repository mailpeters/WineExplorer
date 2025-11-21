'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { wineries, getRegions } from '@/lib/wineries-data';
import { Winery } from '@/types/winery';
import AuthButton from '@/components/auth-button';
import CategoryBadges from '@/components/category-badges';
import { loadSettings, saveSettings } from '@/lib/user-settings';
import SettingsModal from '@/components/settings-modal';

const videos = [
  '/videos/landscape.mp4',
  '/videos/pour.mp4',
  '/videos/barrels.mp4',
  '/videos/rows.mp4',
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Winery[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [randomVideo, setRandomVideo] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState({
    winery: true,
    cidery: false,
    brewery: false,
    distillery: false,
  });
  const regions = getRegions();

  useEffect(() => {
    // Select a random video on component mount
    const randomIndex = Math.floor(Math.random() * videos.length);
    setRandomVideo(videos[randomIndex]);

    // Load user settings
    const settings = loadSettings();
    setSelectedCategories(settings.defaultCategories);
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/wineries/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      // Filter by selected categories
      const filtered = (data.wineries || []).filter((w: Winery) => {
        return w.categories.some(cat => selectedCategories[cat]);
      });

      setSearchResults(filtered);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Video */}
        {randomVideo && (
          <div className="absolute inset-0 overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={randomVideo} type="video/mp4" />
            </video>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-6xl mx-auto px-8 py-20">
          {/* Header - Title and Buttons */}
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              🍷 Dave's Virginia Wine Explorer
            </h1>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition border border-white/30 backdrop-blur-sm"
                title="Open settings"
              >
                ⚙️ Settings
              </button>
              <AuthButton />
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6 relative z-10">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by winery name, city, or region..."
                className="flex-1 px-6 py-4 bg-white text-gray-900 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-pink-400 shadow-lg placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-lg shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Category Filters */}
          <div className="max-w-2xl mx-auto mb-12 relative z-10">
            <div className="flex flex-wrap gap-4 justify-center bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <label className="flex items-center gap-2 cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={selectedCategories.winery}
                  onChange={() => toggleCategory('winery')}
                  className="w-5 h-5 rounded accent-purple-500"
                />
                <span className="font-semibold">🍷 Wineries</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={selectedCategories.distillery}
                  onChange={() => toggleCategory('distillery')}
                  className="w-5 h-5 rounded accent-blue-500"
                />
                <span className="font-semibold">🥃 Distilleries</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={selectedCategories.brewery}
                  onChange={() => toggleCategory('brewery')}
                  className="w-5 h-5 rounded accent-yellow-500"
                />
                <span className="font-semibold">🍺 Breweries</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={selectedCategories.cidery}
                  onChange={() => toggleCategory('cidery')}
                  className="w-5 h-5 rounded accent-amber-500"
                />
                <span className="font-semibold">🍎 Cideries</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Search Results <span className="text-pink-600">({searchResults.length})</span>
              </h2>
              <button
                onClick={() => setShowResults(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {searchResults.length === 0 ? (
              <p className="text-gray-600 text-lg">No wineries found. Try a different search term.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map((w) => (
                  <div key={w.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-purple-900">{w.name}</h3>
                      <CategoryBadges categories={w.categories} />
                    </div>
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">📍</span> {w.city}, {w.state}
                    </p>
                    <p className="text-gray-600 mb-3">
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
        </div>
      )}

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Explore Virginia Wine Regions</h2>

        {/* Virginia Map Layout - 3 Rows */}
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Row 1 - Northern */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/wineries?region=Shenandoah Valley">
              <img
                src="/regions/valley.png"
                alt="Shenandoah Valley"
                className="w-full h-auto hover:scale-105 transition-transform cursor-pointer rounded-lg shadow-lg hover:shadow-2xl"
                title="Shenandoah Valley"
              />
            </Link>
            <Link href="/wineries?region=Northern Virginia">
              <img
                src="/regions/north.png"
                alt="Northern Virginia"
                className="w-full h-auto hover:scale-105 transition-transform cursor-pointer rounded-lg shadow-lg hover:shadow-2xl"
                title="Northern Virginia"
              />
            </Link>
          </div>

          {/* Row 2 - Central */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/wineries?region=Mountains">
              <img
                src="/regions/mountains.png"
                alt="Mountains"
                className="w-full h-auto hover:scale-105 transition-transform cursor-pointer rounded-lg shadow-lg hover:shadow-2xl"
                title="Mountains"
              />
            </Link>
            <Link href="/wineries?region=Central Virginia">
              <img
                src="/regions/central.png"
                alt="Central Virginia"
                className="w-full h-auto hover:scale-105 transition-transform cursor-pointer rounded-lg shadow-lg hover:shadow-2xl"
                title="Central Virginia"
              />
            </Link>
            <Link href="/wineries?region=Chesapeake Bay">
              <img
                src="/regions/bay.png"
                alt="Chesapeake Bay"
                className="w-full h-auto hover:scale-105 transition-transform cursor-pointer rounded-lg shadow-lg hover:shadow-2xl"
                title="Chesapeake Bay"
              />
            </Link>
            <Link href="/wineries?region=Eastern Shore">
              <img
                src="/regions/shore.png"
                alt="Eastern Shore"
                className="w-full h-auto hover:scale-105 transition-transform cursor-pointer rounded-lg shadow-lg hover:shadow-2xl"
                title="Eastern Shore"
              />
            </Link>

          </div>

          {/* Row 3 - Southern */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/wineries?region=Heart of Appalachia">
              <img
                src="/regions/appalatia.png"
                alt="Heart of Appalachia"
                className="w-full h-auto hover:scale-105 transition-transform cursor-pointer rounded-lg shadow-lg hover:shadow-2xl"
                title="Heart of Appalachia"
              />
            </Link>

            <Link href="/wineries?region=Blue Ridge">
              <img
                src="/regions/blue.png"
                alt="Blue Ridge"
                className="w-full h-auto hover:scale-105 transition-transform cursor-pointer rounded-lg shadow-lg hover:shadow-2xl"
                title="Blue Ridge"
              />
            </Link>
            <Link href="/wineries?region=Southern Virginia">
              <img
                src="/regions/south.png"
                alt="Southern Virginia"
                className="w-full h-auto hover:scale-105 transition-transform cursor-pointer rounded-lg shadow-lg hover:shadow-2xl"
                title="Southern Virginia"
              />
            </Link>
            <Link href="/wineries?region=Hampton Roads">
              <img
                src="/regions/hampton.png"
                alt="Hampton Roads"
                className="w-full h-auto hover:scale-105 transition-transform cursor-pointer rounded-lg shadow-lg hover:shadow-2xl"
                title="Hampton Roads"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 hover:bg-white/15 transition">
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-2xl font-bold text-white mb-2">Find Wineries Near You</h3>
            <p className="text-purple-100">Use your location to discover wineries within a custom radius</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 hover:bg-white/15 transition">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-2xl font-bold text-white mb-2">Rate & Review</h3>
            <p className="text-purple-100">Share your experiences and see what other visitors loved</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 hover:bg-white/15 transition">
            <div className="text-5xl mb-4">📸</div>
            <h3 className="text-2xl font-bold text-white mb-2">Upload Photos</h3>
            <p className="text-purple-100">Capture and share your favorite moments from your visits</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 hover:bg-white/15 transition">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="text-2xl font-bold text-white mb-2">Wine Trail Routes</h3>
            <p className="text-purple-100">Plan the perfect wine tour with suggested routes and itineraries</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/30 border-t border-white/10 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-8 text-center text-purple-200">
          <p>🍷 Virginia Wine Explorer • Discover, Explore, Enjoy</p>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </main>
  );
}

