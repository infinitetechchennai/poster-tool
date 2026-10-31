import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Edit3,
  Trash2,
  Eye,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { exportService } from '../services/exportService';

export default function PostCard({
  post,
  onEdit,
  onDelete,
  onPreview,
  onRegenerateImage,
  isRegeneratingImage = false,
  onShowToast
}) {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [downloadMenu, setDownloadMenu] = useState(false);

  const handleCopyCaption = async () => {
    const ok = await exportService.copyTextToClipboard(post.caption);
    if (ok) {
      setCopiedCaption(true);
      onShowToast?.({ type: 'success', message: 'Caption copied to clipboard!' });
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  const handleDownload = (format = 'png') => {
    if (!post.dataUrl) return;
    const safeTitle = (post.headline || post.topic || 'postcraft-post')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 35);

    const link = document.createElement('a');
    link.href = post.dataUrl;
    link.download = `${safeTitle}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast?.({ type: 'success', message: `Downloaded ${format.toUpperCase()}` });
    setDownloadMenu(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col overflow-hidden group">
      {/* Thumbnail Area */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden border-b border-slate-100 flex items-center justify-center">
        {post.dataUrl ? (
          <img
            src={post.dataUrl}
            alt={post.headline || post.topic}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <Sparkles className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-medium">Generating preview...</span>
          </div>
        )}

        {/* Hover Quick Actions Overlay */}
        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
          {onPreview && post.dataUrl && (
            <button
              type="button"
              onClick={() => onPreview(post)}
              className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 shadow-md transition-transform hover:scale-105"
              title="Preview Image"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {onRegenerateImage && (
            <button
              type="button"
              onClick={() => onRegenerateImage(post)}
              disabled={isRegeneratingImage}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-transform hover:scale-105 disabled:opacity-50"
              title="Generate New AI Image with Pollinations"
            >
              <Sparkles className={`w-4 h-4 ${isRegeneratingImage ? 'animate-spin' : ''}`} />
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(post)}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-transform hover:scale-105"
              title="Edit Post"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => handleDownload('png')}
            className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 shadow-md transition-transform hover:scale-105"
            title="Download PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Shimmering Loading Overlay when regenerating AI image */}
        {isRegeneratingImage && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <Sparkles className="w-7 h-7 text-cyan-400 animate-spin" />
            <span className="text-xs font-bold text-white tracking-wide">Synthesizing AI Visual...</span>
            <span className="text-[10px] text-slate-400">Pollinations AI</span>
          </div>
        )}

        {/* Category Pill Tag */}
        {post.categoryName && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/70 backdrop-blur-md text-[10px] font-bold text-white tracking-wider uppercase">
            {post.categoryName}
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-600 line-clamp-1 mb-1">
            {post.topic || 'Custom Post'}
          </p>
          <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
            {post.headline || 'Untitled Post'}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
            {post.description}
          </p>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopyCaption}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 text-xs transition-colors"
              title="Copy social caption"
            >
              {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(post.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs transition-colors"
                title="Delete post"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onRegenerateImage && (
              <button
                type="button"
                onClick={() => onRegenerateImage(post)}
                disabled={isRegeneratingImage}
                className="flex items-center gap-1 px-2 py-1 rounded-lg border border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700 text-xs font-semibold transition-colors disabled:opacity-50"
                title="Synthesize new AI Image for this post"
              >
                <Sparkles className={`w-3 h-3 text-purple-600 ${isRegeneratingImage ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">AI Img</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(post)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors"
              >
                Edit
              </button>
            )}

            <button
              type="button"
              onClick={() => handleDownload('png')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
