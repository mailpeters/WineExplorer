'use client';

import { useState } from 'react';
import Link from 'next/link';
import { wineries, getRegions } from '@/lib/wineries-data';
import { Winery } from '@/types/winery';
import AuthButton from '@/components/auth-button';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Winery[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const regions = getRegions();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/wineries/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.wineries || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20"></div>
        <div className="relative max-w-6xl mx-auto px-8 py-20">
          {/* Auth Button - Top Right */}
          <div className="flex justify-end mb-8">
            <AuthButton />
          </div>
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
              🍷 Dave's Virginia Wine Explorer
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-2">
              Discover {wineries.length} amazing wineries across Virginia
            </p>
            <p className="text-lg text-purple-200">Explore regions, find your favorites, and plan your wine adventures</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by winery name, city, or region..."
                className="flex-1 px-6 py-4 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-pink-400 shadow-lg"
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

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
              <div className="text-4xl font-bold text-pink-300 mb-2">{wineries.length}</div>
              <div className="text-purple-100">Total Wineries</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
              <div className="text-4xl font-bold text-pink-300 mb-2">{regions.length}</div>
              <div className="text-purple-100">Regions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
              <div className="text-4xl font-bold text-pink-300 mb-2">0</div>
              <div className="text-purple-100">Visited</div>
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
                    <h3 className="text-xl font-bold text-purple-900 mb-2">{w.name}</h3>
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
    </main>
  );
}

