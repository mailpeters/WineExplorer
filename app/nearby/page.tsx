"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { NearbyWinery } from "@/lib/wineries-data";
import CategoryBadges from "@/components/category-badges";
import WineryCard from "@/components/winery-card";

const NearbyMap = dynamic(() => import("@/components/nearby-map"), { ssr: false });

interface Coordinates {
  lat: number;
  lng: number;
}

const DEFAULT_RADIUS = 25;

export default function NearbyPage() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [results, setResults] = useState<NearbyWinery[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation isn't supported in this browser.");
      return;
    }

    setError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setError(err.message || "Unable to access your location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  useEffect(() => {
    if (!coords) return;

    const currentCoords = coords;

    const controller = new AbortController();

    async function fetchNearby() {
      setLoading(true);
      setError(null);
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
        setResults(data.results ?? []);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNearby();
    return () => controller.abort();
  }, [coords, radius]);

  const formattedCoords = coords
    ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
    : "Not set";

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <p className="text-5xl mb-4">📍</p>
          <h1 className="text-4xl font-bold text-purple-900 mb-4">Find venues Near You</h1>
          <p className="text-purple-700">
            Grant location access to discover Virginia craft beverage venues within your preferred radius.
          </p>
        </header>

        <section className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6 mb-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-purple-500 font-semibold">
                Your Location
              </p>
              <p className="text-2xl font-bold text-purple-900">{formattedCoords}</p>
            </div>
            <button
              onClick={requestLocation}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:from-purple-700 hover:to-pink-600 transition disabled:opacity-50"
              disabled={locating}
            >
              {locating ? "Locating..." : "Use My Location"}
            </button>
          </div>

          <div className="mt-8">
            <div className="flex justify-between text-sm text-purple-600 font-semibold">
              <span>Radius</span>
              <span>{radius} miles</span>
            </div>
            <input
              type="range"
              min={5}
              max={150}
              step={5}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full mt-2 accent-purple-600"
            />
            <div className="flex justify-between text-xs text-purple-400 uppercase tracking-wide">
              <span>5 mi</span>
              <span>75 mi</span>
              <span>150 mi</span>
            </div>
          </div>

          {!coords && (
            <p className="mt-6 text-sm text-purple-600">
              Tip: Location access works best on HTTPS (or localhost). If you're testing locally,
              allow location in your browser prompt.
            </p>
          )}
        </section>

        {error && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-purple-900">Nearby venues</h2>
                  <p className="text-purple-600 text-sm">
                    {coords
                      ? loading
                        ? "Searching for locations..."
                        : `${results.length} place${results.length === 1 ? "" : "s"} within ${radius} miles`
                      : "Share your location to see nearby results."}
                  </p>
                </div>
              </div>

              {loading && (
                <p className="text-purple-600">Loading nearby venues...</p>
              )}

              {!loading && coords && results.length === 0 && (
                <p className="text-gray-500">
                  No venues found within {radius} miles. Try expanding the radius.
                </p>
              )}

              {!loading && results.length > 0 && (
                <div className="space-y-4">
                  {results.map(({ winery, distanceMiles }) => (
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
                  <h2 className="text-2xl font-bold text-purple-900">Map View</h2>
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
                <NearbyMap origin={coords} results={results} radiusMiles={radius} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
