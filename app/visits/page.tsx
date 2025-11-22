'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { WineryVisit } from '@/types/visit';
import { getUserVisits, deleteVisit } from '@/lib/visit-storage';
import CategoryBadges from '@/components/category-badges';
import { wineries } from '@/lib/wineries-data';

export default function VisitsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [visits, setVisits] = useState<WineryVisit[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [filterRecommended, setFilterRecommended] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (session?.user?.email) {
      const userVisits = getUserVisits(session.user.email);
      setVisits(userVisits);
    }
  }, [session, status, router]);

  const handleDelete = (visitId: string) => {
    if (confirm('Are you sure you want to delete this visit record?')) {
      deleteVisit(visitId);
      if (session?.user?.email) {
        setVisits(getUserVisits(session.user.email));
      }
    }
  };

  // Get winery details for enrichment
  const getWineryDetails = (wineryId: string) => {
    return wineries.find(w => w.id === wineryId);
  };

  // Filter and sort visits
  const filteredVisits = visits
    .filter(visit => {
      if (filterRecommended === null) return true;
      return visit.wouldRecommend === filterRecommended;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime();
      }
      return a.wineryName.localeCompare(b.wineryName);
    });

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 p-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white text-xl">Loading...</p>
        </div>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition border border-white/30 backdrop-blur-sm"
          >
            ← Back to Home
          </Link>
        </div>
        <header className="mb-10 text-center">
          <p className="text-5xl mb-4">📚</p>
          <h1 className="text-4xl font-bold text-white mb-4">My Visit History</h1>
          <p className="text-purple-100">
            Your personal log of winery experiences and memories
          </p>
        </header>

        {/* Filters and Controls */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-semibold text-purple-900 mr-2">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                className="px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="date">Visit Date (Newest First)</option>
                <option value="name">Winery Name (A-Z)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-purple-900">Filter:</label>
              <button
                onClick={() => setFilterRecommended(null)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterRecommended === null
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterRecommended(true)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterRecommended === true
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                Recommended
              </button>
              <button
                onClick={() => setFilterRecommended(false)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterRecommended === false
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Not Recommended
              </button>
            </div>

            <div className="ml-auto">
              <p className="text-purple-900 font-semibold">
                {filteredVisits.length} visit{filteredVisits.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        </div>

        {/* Visits List */}
        {filteredVisits.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-12 shadow-xl text-center">
            <p className="text-gray-600 text-lg mb-4">
              {visits.length === 0
                ? "You haven't recorded any visits yet."
                : 'No visits match your current filter.'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600 transition shadow-lg"
            >
              Explore Wineries
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredVisits.map((visit) => {
              const wineryDetails = getWineryDetails(visit.wineryId);
              return (
                <div
                  key={visit.id}
                  className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold">{visit.wineryName}</h2>
                        <p className="text-purple-100">
                          Visited on {new Date(visit.visitDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {visit.wouldRecommend ? (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            ✓ Recommended
                          </span>
                        ) : (
                          <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            Not Recommended
                          </span>
                        )}
                      </div>
                    </div>
                    {wineryDetails && (
                      <div className="mt-2">
                        <CategoryBadges categories={wineryDetails.categories} />
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    {visit.winesLoved && (
                      <div>
                        <h3 className="font-bold text-purple-900 mb-1">🍷 Wines I Loved</h3>
                        <p className="text-gray-700">{visit.winesLoved}</p>
                      </div>
                    )}

                    {visit.winesDisliked && (
                      <div>
                        <h3 className="font-bold text-purple-900 mb-1">👎 Wines I Disliked</h3>
                        <p className="text-gray-700">{visit.winesDisliked}</p>
                      </div>
                    )}

                    {visit.boughtBottle && (
                      <div>
                        <h3 className="font-bold text-purple-900 mb-1">🛍️ Bottles Purchased</h3>
                        <p className="text-gray-700">{visit.boughtBottle}</p>
                      </div>
                    )}

                    {visit.howLongStayed && (
                      <div>
                        <h3 className="font-bold text-purple-900 mb-1">⏱️ Duration</h3>
                        <p className="text-gray-700">{visit.howLongStayed}</p>
                      </div>
                    )}

                    {visit.whatStoodOut && (
                      <div>
                        <h3 className="font-bold text-purple-900 mb-1">✨ What Stood Out</h3>
                        <p className="text-gray-700">{visit.whatStoodOut}</p>
                      </div>
                    )}

                    {visit.comments && (
                      <div>
                        <h3 className="font-bold text-purple-900 mb-1">📝 Comments</h3>
                        <p className="text-gray-700">{visit.comments}</p>
                      </div>
                    )}

                    {visit.shareWithVineyard && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-purple-900 text-sm">
                          💌 You chose to share this experience with the vineyard
                        </p>
                      </div>
                    )}

                    {visit.photos && visit.photos.length > 0 && (
                      <div>
                        <h3 className="font-bold text-purple-900 mb-2">📸 Photos</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {visit.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Visit photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg shadow-md"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-purple-100">
                      <p className="text-xs text-gray-500">
                        Added {new Date(visit.createdAt).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => handleDelete(visit.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold text-sm"
                      >
                        Delete Visit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
