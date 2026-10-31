import React, { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  Plus,
  Trash2,
  Download,
  Eye,
  Edit3,
  X,
  FileSpreadsheet,
  Search,
  Sparkles
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { exportService } from '../services/exportService';
import PostCard from '../components/PostCard';

export default function MyPosts({
  onReopenPost,
  onNavigateToCreate,
  onShowToast,
  refreshTrigger
}) {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewModalPost, setPreviewModalPost] = useState(null);

  const loadPosts = () => {
    const list = storageService.getSavedPosts();
    setPosts(list);
  };

  useEffect(() => {
    loadPosts();
  }, [refreshTrigger]);

  const handleDelete = (id) => {
    if (window.confirm('Delete this saved post from your local library?')) {
      storageService.deletePost(id);
      loadPosts();
      onShowToast?.({ type: 'info', message: 'Post removed from your library' });
    }
  };

  const handleExportAllCsv = () => {
    if (posts.length === 0) return;
    const ok = exportService.exportCsv(posts, 'my-saved-posts.csv');
    if (ok) {
      onShowToast?.({ type: 'success', message: 'Exported saved posts to CSV!' });
    }
  };

  // Filter posts
  const filteredPosts = posts.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      (p.headline && p.headline.toLowerCase().includes(q)) ||
      (p.topic && p.topic.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-display font-bold text-slate-900">My Posts Library</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {posts.length} Saved
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            All posts and high-resolution graphics saved locally on your device. Zero cloud sync required.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {posts.length > 0 && (
            <button
              type="button"
              onClick={handleExportAllCsv}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNavigateToCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Post</span>
          </button>
        </div>
      </div>

      {/* Search Bar if posts exist */}
      {posts.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved posts by headline, topic, or keyword..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-sm"
          />
        </div>
      )}

      {/* Empty State */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <BookmarkCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-display font-bold text-slate-900">No Saved Posts Yet</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Generate your first corporate post or bulk batch and click &quot;Save Post&quot; to keep it in your local library.
          </p>
          <button
            type="button"
            onClick={onNavigateToCreate}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-display font-semibold text-sm shadow-md shadow-blue-500/25 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate First Post</span>
          </button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 text-sm">
          No saved posts matched &quot;{searchQuery}&quot;. Try another search.
        </div>
      ) : (
        /* Posts Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={onReopenPost}
              onDelete={handleDelete}
              onPreview={(p) => setPreviewModalPost(p)}
              onShowToast={onShowToast}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {previewModalPost && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewModalPost(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 text-white mb-3">
              <span className="text-sm font-semibold truncate pr-4">{previewModalPost.headline}</span>
              <button
                onClick={() => setPreviewModalPost(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewModalPost.dataUrl}
              alt={previewModalPost.headline}
              className="max-h-[75vh] object-contain rounded-lg shadow-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
