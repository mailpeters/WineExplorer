'use client';

import { SpeedInsights } from "@vercel/speed-insights/next"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { wineries, getRegions, NearbyWinery } from '@/lib/wineries-data';
import { Winery } from '@/types/winery';
import AuthButton from '@/components/auth-button';
import CategoryBadges from '@/components/category-badges';
import WineryCard from '@/components/winery-card';
import { loadSettings, saveSettings } from '@/lib/user-settings';
import SettingsModal from '@/components/settings-modal';

const NearbyMap = dynamic(() => import('@/components/nearby-map'), { ssr: false });

const videos = [
  '/videos/landscape.mp4',
  '/videos/pour.mp4',
  '/videos/barrels.mp4',
  '/videos/rows.mp4',
];

interface Coordinates {
  lat: number;
  lng: number;
}

const DEFAULT_RADIUS = 25;

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

  // Nearby wineries state
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [nearbyResults, setNearbyResults] = useState<NearbyWinery[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [nearbyCategories, setNearbyCategories] = useState({
    winery: true,
    cidery: true,
    brewery: true,
    distillery: true,
  });

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

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setNearbyError("Geolocation isn't supported in this browser.");
      return;
    }

    setNearbyError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setNearbyError(err.message || "Unable to access your location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const toggleNearbyCategory = (category: keyof typeof nearbyCategories) => {
    setNearbyCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Filter nearby results by selected categories
  const filteredNearbyResults = nearbyResults.filter(({ winery }) =>
    winery.categories.some(cat => nearbyCategories[cat])
  );

  useEffect(() => {
    if (!coords) return;

    const currentCoords = coords;
    const controller = new AbortController();

    async function fetchNearby() {
      setNearbyLoading(true);
      setNearbyError(null);
      try {
        const params = new URLSearchParams({
          lat: currentCoords.lat.toString(),
          lng: currentCoords.lng.toString(),
          radius: radius.toString(),
        });

        const res = await fetch(`/api/wineries/nearby?${params}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Unable to fetch nearby venues");
        }

        const data = await res.json();
        setNearbyResults(data.results ?? []);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setNearbyError(err instanceof Error ? err.message : "Unknown error");
        setNearbyResults([]);
      } finally {
        setNearbyLoading(false);
      }
    }

    fetchNearby();
    return () => controller.abort();
  }, [coords, radius]);

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
            <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Dave's Craft Beverage Explorer (Virginia)
            </h2>
            <div className="flex flex-col gap-2 items-end">
              <AuthButton />
              <Link
                href="/visits"
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition border border-white/30 backdrop-blur-sm shadow-md"
                title="View your visit history"
              >
                📚 My Visits
              </Link>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition border border-white/30 backdrop-blur-sm"
                title="Open settings"
              >
                ⚙️ Settings
              </button>
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
                <span className="font-semibold">🍸 Distilleries</span>
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
              <p className="text-gray-600 text-lg">No venues found. Try a different search term.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map((w) => (
                  <WineryCard key={w.id} winery={w} />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/wineries?region=Shenandoah Valley" className="md:col-start-2">
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

      {/* Near Me Feature */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center mb-10"> <h2 className="text-4xl font-bold text-white mb-4">📍Find Venues Near You</h2>
        </div>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={requestLocation}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:from-purple-700 hover:to-pink-600 transition disabled:opacity-50"
              disabled={locating}
            >
              {locating ? 'Locating...' : 'Use My Location'}
            </button>

            <div className="flex items-center gap-2">
              <label className="text-sm text-purple-600 font-semibold whitespace-nowrap">
                Max Distance:
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={radius}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 1 && value <= 1000) {
                    setRadius(value);
                  }
                }}
                className="w-24 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="miles"
              />
              <span className="text-sm text-purple-600">mi</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 ml-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nearbyCategories.winery}
                  onChange={() => toggleNearbyCategory('winery')}
                  className="w-4 h-4 rounded accent-purple-500"
                />
                <span className="text-purple-900 font-medium text-sm">🍷 Wineries</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nearbyCategories.distillery}
                  onChange={() => toggleNearbyCategory('distillery')}
                  className="w-4 h-4 rounded accent-blue-500"
                />
                <span className="text-purple-900 font-medium text-sm">🍸 Distilleries</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nearbyCategories.brewery}
                  onChange={() => toggleNearbyCategory('brewery')}
                  className="w-4 h-4 rounded accent-yellow-500"
                />
                <span className="text-purple-900 font-medium text-sm">🍺 Breweries</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nearbyCategories.cidery}
                  onChange={() => toggleNearbyCategory('cidery')}
                  className="w-4 h-4 rounded accent-amber-500"
                />
                <span className="text-purple-900 font-medium text-sm">🍎 Cideries</span>
              </label>
            </div>
          </div>
        </div>

        {nearbyError && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg">
            {nearbyError}
          </div>
        )}

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 p-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-purple-900">Nearby Venus</h3>
                  <p className="text-purple-600 text-sm">
                    {coords
                      ? nearbyLoading
                        ? "Searching for locations..."
                        : `${filteredNearbyResults.length} place${filteredNearbyResults.length === 1 ? "" : "s"} within ${radius} miles`
                      : "Share your location to see nearby results."}
                  </p>
                </div>
              </div>

              {nearbyLoading && (
                <p className="text-purple-600">Loading nearby venues...</p>
              )}

              {!nearbyLoading && coords && filteredNearbyResults.length === 0 && (
                <p className="text-gray-500">
                  No venues found within {radius} miles. Try expanding the radius or changing the category filters.
                </p>
              )}

              {!nearbyLoading && filteredNearbyResults.length > 0 && (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {filteredNearbyResults.map(({ winery, distanceMiles }) => (
                    <WineryCard
                      key={winery.id}
                      winery={winery}
                      showDistance={true}
                      distanceMiles={distanceMiles}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-purple-900">Map View</h3>
                  <p className="text-purple-600 text-sm">
                    {coords ? `Viewing venues within ${radius} miles` : "Share your location to center the map"}
                  </p>
                </div>
                {coords && (
                  <div className="text-sm text-purple-500 font-semibold">
                    {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-[300px] md:min-h-[500px]">
                <NearbyMap origin={coords} results={filteredNearbyResults} radiusMiles={radius} />
              </div>
            </div>
          </div>
        </div>
      </section>

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

