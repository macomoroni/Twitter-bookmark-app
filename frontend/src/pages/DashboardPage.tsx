import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarksApi, categoriesApi, tagsApi } from '../services/api';
import { Bookmark } from '../types';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import BookmarkCard from '../components/BookmarkCard';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks', { searchQuery, selectedCategory, selectedTag, page }],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (searchQuery) params.q = searchQuery;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedTag) params.tagId = selectedTag;

      const endpoint = searchQuery || selectedCategory || selectedTag
        ? await import('../services/api').then(m => m.searchApi.search(params))
        : await bookmarksApi.getAll(params);

      return endpoint.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bookmarksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSelectedTag(null);
    setSearchQuery('');
    setPage(1);
  };

  const handleTagSelect = (tagId: string | null) => {
    setSelectedTag(tagId);
    setPage(1);
  };

  const handleCreateCategory = () => {
    const name = prompt('Enter category name:');
    if (name) {
      categoriesApi.create({ name }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      });
    }
  };

  const handleCreateTag = () => {
    const name = prompt('Enter tag name:');
    if (name) {
      tagsApi.create({ name }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['tags'] });
      });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedCategory={selectedCategory}
          selectedTag={selectedTag}
          onCategorySelect={handleCategorySelect}
          onTagSelect={handleTagSelect}
          onCreateCategory={handleCreateCategory}
          onCreateTag={handleCreateTag}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <SearchBar onSearch={handleSearch} />
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-2">Loading bookmarks...</p>
              </div>
            ) : data?.bookmarks?.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600 text-lg mb-2">No bookmarks found</p>
                <p className="text-gray-500 text-sm">
                  Install the browser extension to start syncing your Twitter bookmarks!
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {data?.bookmarks?.map((bookmark: Bookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      onEdit={() => {
                        // TODO: Implement edit modal
                        console.log('Edit bookmark:', bookmark.id);
                      }}
                      onDelete={() => {
                        if (confirm('Are you sure you want to delete this bookmark?')) {
                          deleteMutation.mutate(bookmark.id);
                        }
                      }}
                    />
                  ))}
                </div>

                {data?.pagination && data.pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="text-gray-600">
                      Page {page} of {data.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
