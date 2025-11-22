import { WineryVisit } from '@/types/visit';

const STORAGE_KEY = 'winery-visits';

/**
 * Get all visits for a specific user
 */
export function getUserVisits(userId: string): WineryVisit[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const allVisits: WineryVisit[] = JSON.parse(stored);
    return allVisits.filter(visit => visit.userId === userId);
  } catch (error) {
    console.error('Error loading visits:', error);
    return [];
  }
}

/**
 * Get all visits (across all users)
 */
export function getAllVisits(): WineryVisit[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading all visits:', error);
    return [];
  }
}

/**
 * Save a new visit
 */
export function saveVisit(visit: WineryVisit): void {
  if (typeof window === 'undefined') return;

  try {
    const allVisits = getAllVisits();
    allVisits.push(visit);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allVisits));
  } catch (error) {
    console.error('Error saving visit:', error);
    throw new Error('Failed to save visit');
  }
}

/**
 * Update an existing visit
 */
export function updateVisit(visitId: string, updates: Partial<WineryVisit>): void {
  if (typeof window === 'undefined') return;

  try {
    const allVisits = getAllVisits();
    const index = allVisits.findIndex(v => v.id === visitId);

    if (index === -1) {
      throw new Error('Visit not found');
    }

    allVisits[index] = {
      ...allVisits[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allVisits));
  } catch (error) {
    console.error('Error updating visit:', error);
    throw new Error('Failed to update visit');
  }
}

/**
 * Delete a visit
 */
export function deleteVisit(visitId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const allVisits = getAllVisits();
    const filtered = allVisits.filter(v => v.id !== visitId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting visit:', error);
    throw new Error('Failed to delete visit');
  }
}

/**
 * Get visits for a specific winery
 */
export function getWineryVisits(wineryId: string, userId?: string): WineryVisit[] {
  const allVisits = userId ? getUserVisits(userId) : getAllVisits();
  return allVisits.filter(visit => visit.wineryId === wineryId);
}

/**
 * Check if a user has visited a specific winery
 */
export function hasVisitedWinery(wineryId: string, userId: string): boolean {
  const visits = getWineryVisits(wineryId, userId);
  return visits.length > 0;
}

/**
 * Get the most recent visit to a winery
 */
export function getLatestVisit(wineryId: string, userId: string): WineryVisit | null {
  const visits = getWineryVisits(wineryId, userId);
  if (visits.length === 0) return null;

  return visits.sort((a, b) =>
    new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
  )[0];
}
