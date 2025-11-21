"use client";

import { useState, useEffect } from "react";
import { loadSettings, saveSettings, UserSettings } from "@/lib/user-settings";
import { getRegions } from "@/lib/wineries-data";

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [settings, setSettings] = useState<UserSettings>(loadSettings());
  const regions = getRegions();

  useEffect(() => {
    if (isOpen) {
      setSettings(loadSettings());
    }
  }, [isOpen]);

  const handleSave = () => {
    saveSettings(settings);
    onClose();
    // Reload the page to apply settings
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">⚙️ Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Default Category Filters */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Default Category Filters</h3>
            <p className="text-sm text-gray-600 mb-3">Choose which types to show by default when you search</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={settings.defaultCategories.winery}
                  onChange={(e) => setSettings({
                    ...settings,
                    defaultCategories: { ...settings.defaultCategories, winery: e.target.checked }
                  })}
                  className="w-5 h-5 rounded accent-purple-500"
                />
                <span className="font-semibold">🍷 Wineries</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={settings.defaultCategories.cidery}
                  onChange={(e) => setSettings({
                    ...settings,
                    defaultCategories: { ...settings.defaultCategories, cidery: e.target.checked }
                  })}
                  className="w-5 h-5 rounded accent-amber-500"
                />
                <span className="font-semibold">🍎 Cideries</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={settings.defaultCategories.brewery}
                  onChange={(e) => setSettings({
                    ...settings,
                    defaultCategories: { ...settings.defaultCategories, brewery: e.target.checked }
                  })}
                  className="w-5 h-5 rounded accent-yellow-500"
                />
                <span className="font-semibold">🍺 Breweries</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={settings.defaultCategories.distillery}
                  onChange={(e) => setSettings({
                    ...settings,
                    defaultCategories: { ...settings.defaultCategories, distillery: e.target.checked }
                  })}
                  className="w-5 h-5 rounded accent-blue-500"
                />
                <span className="font-semibold">🥃 Distilleries</span>
              </label>
            </div>
          </div>

          {/* Favorite Region */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Favorite Region</h3>
            <p className="text-sm text-gray-600 mb-3">Select your favorite Virginia wine region</p>
            <select
              value={settings.favoriteRegion || ''}
              onChange={(e) => setSettings({ ...settings, favoriteRegion: e.target.value || undefined })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="">None</option>
              {regions.map((region) => (
                <option key={region.name} value={region.name}>
                  {region.name} ({region.count} venues)
                </option>
              ))}
            </select>
          </div>

          {/* Sort Preference */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Default Sort Order</h3>
            <p className="text-sm text-gray-600 mb-3">How should results be sorted?</p>
            <select
              value={settings.sortBy}
              onChange={(e) => setSettings({ ...settings, sortBy: e.target.value as any })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="name">Name (A-Z)</option>
              <option value="distance">Distance (Coming Soon)</option>
              <option value="rating">Rating (Coming Soon)</option>
            </select>
          </div>

          {/* View Mode */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">View Mode</h3>
            <p className="text-sm text-gray-600 mb-3">Choose how results are displayed</p>
            <div className="flex gap-3">
              <button
                onClick={() => setSettings({ ...settings, viewMode: 'grid' })}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
                  settings.viewMode === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Grid View
              </button>
              <button
                onClick={() => setSettings({ ...settings, viewMode: 'list' })}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
                  settings.viewMode === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📝 List View
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
