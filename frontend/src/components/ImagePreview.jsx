import React, { useRef, useEffect, useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Eye,
  X
} from 'lucide-react';
import { renderPostToCanvas } from '../services/imageRenderer';
import { IMAGE_DIMENSIONS } from '../utils/designTemplates';
import { exportService } from '../services/exportService';

export default function ImagePreview({
  post,
  brand,
  styleId,
  formatId,
  colorPaletteId,
  bgPattern,
  iconType = 'auto',
  onShowToast,
  canvasRef
}) {
  const localCanvasRef = useRef(null);
  const activeCanvasRef = canvasRef || localCanvasRef;
  const [copiedImage, setCopiedImage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [modalDataUrl, setModalDataUrl] = useState('');

  const dim = IMAGE_DIMENSIONS[formatId] || IMAGE_DIMENSIONS['linkedin-square'];

  // Trigger render whenever any design or content prop changes or background image finishes loading
  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      if (!activeCanvasRef.current || !post) return;
      setIsRendering(true);
      try {
        await renderPostToCanvas({
          canvas: activeCanvasRef.current,
          post,
          brand,
          styleId,
          formatId,
          colorPaletteId,
          bgPattern,
          iconType,
          highResScale: 1
        });
      } catch (err) {
        console.error('Canvas render error:', err);
      } finally {
        if (!isCancelled) setIsRendering(false);
      }
    };

    render();

    const handleImageReady = () => {
      setIsAiGenerating(false);
      if (!isCancelled) render();
    };
    const handleImageGenerating = () => setIsAiGenerating(true);
    const handleImageCompleted = () => setIsAiGenerating(false);
    const handleImageEnded = () => setIsAiGenerating(false);

    window.addEventListener('postcraft:image-ready', handleImageReady);
    window.addEventListener('postcraft:image-generating', handleImageGenerating);
    window.addEventListener('postcraft:image-completed', handleImageCompleted);
    window.addEventListener('postcraft:image-timed-out', handleImageEnded);
    window.addEventListener('postcraft:image-failed', handleImageEnded);

    return () => {
      isCancelled = true;
      window.removeEventListener('postcraft:image-ready', handleImageReady);
      window.removeEventListener('postcraft:image-generating', handleImageGenerating);
      window.removeEventListener('postcraft:image-completed', handleImageCompleted);
      window.removeEventListener('postcraft:image-timed-out', handleImageEnded);
      window.removeEventListener('postcraft:image-failed', handleImageEnded);
    };
  }, [post, brand, styleId, formatId, colorPaletteId, bgPattern, iconType, activeCanvasRef]);

  const handleCopyImage = async () => {
    if (!activeCanvasRef.current) return;
    const ok = await exportService.copyCanvasToClipboard(activeCanvasRef.current);
    if (ok) {
      setCopiedImage(true);
      onShowToast?.({ type: 'success', message: 'Graphic copied to clipboard as image!' });
      setTimeout(() => setCopiedImage(false), 2000);
    } else {
      onShowToast?.({ type: 'info', message: 'Direct image copy not supported in this browser. Use Download instead.' });
    }
  };

  const handleOpenModal = () => {
    if (activeCanvasRef.current) {
      setModalDataUrl(activeCanvasRef.current.toDataURL('image/png'));
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-5 sm:p-6 transition-all flex flex-col">
        {/* Preview Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-900 text-sm sm:text-base">
              Live Image Preview
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
              {dim.width} × {dim.height} px
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyImage}
              title="Copy image to clipboard"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              {copiedImage ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleOpenModal}
              title="View full resolution"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Display Viewport */}
        <div className="relative w-full flex-1 min-h-[380px] sm:min-h-[460px] flex items-center justify-center p-3 sm:p-5 rounded-xl bg-slate-100/70 border border-slate-200/60 overflow-hidden group">
          {/* Subtle Grid Backdrop in container */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}
          />

          {/* Active AI generation status overlay */}
          {isAiGenerating && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/95 text-white text-xs font-semibold shadow-xl backdrop-blur-md animate-pulse border border-blue-400/30 pointer-events-none">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Synthesizing AI Image with Pollinations...</span>
            </div>
          )}

          {isRendering && !isAiGenerating && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-10 transition-all">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          )}

          {/* Canvas Element with smooth CSS scaling to fit container */}
          <div className="relative max-w-full max-h-[500px] flex items-center justify-center shadow-2xl rounded-xl overflow-hidden ring-1 ring-slate-900/10">
            <canvas
              ref={activeCanvasRef}
              className="block max-w-full max-h-[500px] w-auto h-auto object-contain transition-transform duration-200"
              style={{
                aspectRatio: `${dim.width} / ${dim.height}`
              }}
            />
          </div>
        </div>

        {/* Viewport Footer info */}
        <div className="mt-3.5 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Ready for export ({dim.label})</span>
          </span>
          <button
            type="button"
            onClick={handleOpenModal}
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Expand Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Modal View */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 text-white mb-3">
              <span className="text-sm font-semibold">{dim.label} — {dim.width} × {dim.height}px</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] flex items-center justify-center rounded-lg">
              <img
                src={modalDataUrl}
                alt="High Resolution Preview"
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
