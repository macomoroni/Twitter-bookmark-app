import { useQuery } from '@tanstack/react-query';
import { categoriesApi, tagsApi } from '../services/api';
import { Category, Tag } from '../types';

interface SidebarProps {
  onCategorySelect: (categoryId: string | null) => void;
  onTagSelect: (tagId: string | null) => void;
  selectedCategory: string | null;
  selectedTag: string | null;
  onCreateCategory: () => void;
  onCreateTag: () => void;
}

export default function Sidebar({
  onCategorySelect,
  onTagSelect,
  selectedCategory,
  selectedTag,
  onCreateCategory,
  onCreateTag,
}: SidebarProps) {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await categoriesApi.getAll();
      return data.categories as Category[];
    },
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data } = await tagsApi.getAll();
      return data.tags as Tag[];
    },
  });

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Categories</h3>
          <button
            onClick={onCreateCategory}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            + New
          </button>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => onCategorySelect(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
              selectedCategory === null
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Bookmarks
          </button>
          {categoriesData?.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between ${
                selectedCategory === category.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center">
                <span
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </span>
              {category._count && (
                <span className="text-xs text-gray-500">
                  {category._count.bookmarks}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Tags</h3>
          <button
            onClick={onCreateTag}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            + New
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tagsData?.map((tag) => (
            <button
              key={tag.id}
              onClick={() =>
                onTagSelect(selectedTag === tag.id ? null : tag.id)
              }
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                selectedTag === tag.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              #{tag.name}
              {tag._count && (
                <span className="ml-1 opacity-75">({tag._count.bookmarks})</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
