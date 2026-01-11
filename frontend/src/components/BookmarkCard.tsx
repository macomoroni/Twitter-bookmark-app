import { Bookmark } from '../types';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit: () => void;
  onDelete: () => void;
}

export default function BookmarkCard({ bookmark, onEdit, onDelete }: BookmarkCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start space-x-3 mb-3">
        {bookmark.authorProfileImage && (
          <img
            src={bookmark.authorProfileImage}
            alt={bookmark.authorName}
            className="w-12 h-12 rounded-full"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900 truncate">
              {bookmark.authorName}
            </span>
            <span className="text-gray-500 text-sm truncate">
              @{bookmark.authorUsername}
            </span>
          </div>
          <time className="text-xs text-gray-500">
            {new Date(bookmark.createdAt).toLocaleDateString()}
          </time>
        </div>
      </div>

      <p className="text-gray-800 mb-3 whitespace-pre-wrap">{bookmark.text}</p>

      {bookmark.mediaUrls && bookmark.mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {bookmark.mediaUrls.slice(0, 4).map((url, index) => (
            <img
              key={index}
              src={url}
              alt=""
              className="w-full h-32 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {bookmark.categories && bookmark.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {bookmark.categories.map(({ category }) => (
            <span
              key={category.id}
              className="px-2 py-1 rounded-md text-xs font-medium text-white"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          ))}
        </div>
      )}

      {bookmark.tags && bookmark.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {bookmark.tags.map(({ tag }) => (
            <span
              key={tag.id}
              className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <a
          href={bookmark.tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View on Twitter →
        </a>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
