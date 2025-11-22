'use client';

import { useState, useEffect } from 'react';
import { Winery } from '@/types/winery';
import { useSession } from 'next-auth/react';
import CategoryBadges from './category-badges';
import VisitFormModal from './visit-form-modal';
import { saveVisit, hasVisitedWinery } from '@/lib/visit-storage';
import { WineryVisit } from '@/types/visit';

interface WineryCardProps {
  winery: Winery;
  showDistance?: boolean;
  distanceMiles?: number;
}

export default function WineryCard({ winery, showDistance, distanceMiles }: WineryCardProps) {
  const { data: session, status } = useSession();
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [hasVisited, setHasVisited] = useState(false);

  // Check if user has visited this winery
  useEffect(() => {
    if (session?.user?.email) {
      setHasVisited(hasVisitedWinery(winery.id, session.user.email));
    }
  }, [session, winery.id]);

  const handleRecordVisit = () => {
    if (status !== 'authenticated') {
      alert('Please sign in to record your visit.');
      return;
    }
    setIsVisitModalOpen(true);
  };

  const handleSaveVisit = (visit: WineryVisit) => {
    try {
      saveVisit(visit);
      setHasVisited(true);
      alert('Visit recorded successfully!');
    } catch (error) {
      alert('Failed to save visit. Please try again.');
      console.error(error);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200 hover:shadow-lg transition relative">
        {hasVisited && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            ✓ Visited
          </div>
        )}

        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-purple-900">{winery.name}</h3>
          <CategoryBadges categories={winery.categories} />
        </div>

        <p className="text-gray-700 mb-1">
          <span className="font-semibold">📍</span> {winery.city}, {winery.state}
        </p>

        <p className="text-gray-600 mb-2">
          <span className="font-semibold">🗺️</span> {winery.region}
        </p>

        {showDistance && distanceMiles !== undefined && (
          <p className="text-purple-600 font-semibold mb-2">
            <span className="font-semibold">🚗</span> {distanceMiles} miles away
          </p>
        )}

        {winery.website && (
          <p className="text-purple-600 mb-3">
            <a
              href={`https://${winery.website}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-800 font-semibold text-sm"
            >
              Visit Website ↗
            </a>
          </p>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleRecordVisit}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600 transition shadow-md text-sm"
          >
            {hasVisited ? '+ Add Another Visit' : '+ Record Visit'}
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(`${winery.street}, ${winery.city}, ${winery.state} ${winery.zip}`)}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg border border-purple-200 hover:bg-purple-200 font-semibold text-sm"
            title="Copy address to clipboard"
          >
            📋 Address
          </button>
        </div>
      </div>

      <VisitFormModal
        winery={winery}
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        onSave={handleSaveVisit}
      />
    </>
  );
}
