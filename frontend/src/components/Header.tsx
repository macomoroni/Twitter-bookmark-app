import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../services/api';
import { Stats } from '../types';

export default function Header() {
  const { user, logout } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await searchApi.getStats();
      return data.stats as Stats;
    },
  });

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🔖 Twitter Bookmarks
          </h1>
          <p className="text-sm text-gray-600">
            Welcome back, {user?.username}
          </p>
        </div>

        <div className="flex items-center space-x-6">
          {data && (
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">
                  {data.totalBookmarks}
                </div>
                <div className="text-gray-600">Bookmarks</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">
                  {data.totalCategories}
                </div>
                <div className="text-gray-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">
                  {data.totalTags}
                </div>
                <div className="text-gray-600">Tags</div>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
