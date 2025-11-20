export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-purple-900 mb-4">
            🍷 Virginia Wine Trail ✨
          </h1>
          <p className="text-xl text-purple-700">
            Discover 273 amazing wineries across Virginia
          </p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">273</div>
            <div className="text-gray-600">Wineries</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">10</div>
            <div className="text-gray-600">Regions</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
            <div className="text-gray-600">Visited</div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Features Coming Soon
          </h2>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <span className="text-gray-700">Find wineries near you</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-2xl">⭐</span>
              <span className="text-gray-700">Rate and review visits</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-2xl">📸</span>
              <span className="text-gray-700">Upload photos</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-2xl">🗺️</span>
              <span className="text-gray-700">Plan wine trail routes</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}