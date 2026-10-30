import React, { useState, useEffect } from 'react';
import {
  Download,
  Palette,
  Layout,
  Sparkles,
  Layers,
  BookmarkPlus,
  Check,
  ChevronDown,
  Image as ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IMAGE_DIMENSIONS, DESIGN_STYLES, COLOR_PALETTES, BACKGROUND_PATTERNS } from '../utils/designTemplates';
import { TOPIC_IMAGE_PRESETS } from '../utils/topicImages';
import { LOCAL_AI_FOLDERS, findMatchingFolder } from '../utils/localAiImages';
import { exportService } from '../services/exportService';

const ICON_OPTIONS = [
  { id: 'auto', label: 'Auto Detect', icon: '✨', desc: 'Smart topic match' },
  { id: 'briefcase', label: 'Briefcase', icon: '💼', desc: 'Hiring & Career' },
  { id: 'sparkle', label: 'Sparkle', icon: '✨', desc: 'AI & Innovation' },
  { id: 'cloud', label: 'Cloud', icon: '☁️', desc: 'Cloud & DevOps' },
  { id: 'rocket', label: 'Rocket', icon: '🚀', desc: 'Growth & Launch' },
  { id: 'shield', label: 'Shield', icon: '🛡️', desc: 'Security & Trust' },
  { id: 'chart', label: 'Chart', icon: '📊', desc: 'Data & Analytics' },
  { id: 'zap', label: 'Zap', icon: '⚡', desc: 'Speed & Voice' },
  { id: 'target', label: 'Target', icon: '🎯', desc: 'Strategy & Focus' },
  { id: 'lightbulb', label: 'Lightbulb', icon: '💡', desc: 'Ideas & Innovation' },
  { id: 'none', label: 'None', icon: '✖️', desc: 'Hide topic icon' }
];

function renderStyleWireframe(st) {
  // Modern adaptive wireframe for all templates
  const isSplit = st.layout === 'left-split';
  const isCenter = st.layout === 'center';
  return (
    <div
      className="w-full h-10 rounded-lg mb-2 p-1.5 flex items-center justify-between shadow-inner relative overflow-hidden transition-transform group-hover:scale-[1.02]"
      style={{
        background: `linear-gradient(135deg, ${st.bgStart || '#0F172A'}, ${st.bgEnd || '#1E293B'})`,
        border: `1px solid ${st.accentColor || '#3B82F6'}40`
      }}
    >
      {isSplit ? (
        <div className="w-full h-full flex items-center justify-between gap-1">
          <div className="w-[58%] flex flex-col gap-1 pl-0.5">
            <div className="h-1.5 w-4/5 rounded-full" style={{ backgroundColor: st.textColor || '#FFFFFF' }} />
            <div className="h-1 w-3/5 rounded-full" style={{ backgroundColor: st.accentColor || '#3B82F6' }} />
            <div className="h-0.5 w-full bg-white/20 rounded-full mt-0.5" />
          </div>
          <div
            className="w-[38%] h-full rounded border flex items-center justify-center text-[8px]"
            style={{ backgroundColor: `${st.accentColor || '#3B82F6'}25`, borderColor: `${st.accentColor || '#3B82F6'}50` }}
          >
            {st.category === 'hiring' ? '💼' : st.category === 'product' ? '📱' : st.category === 'festival' ? '🎉' : '💡'}
          </div>
        </div>
      ) : isCenter ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
          <div className="h-1.5 w-3/5 rounded-full" style={{ backgroundColor: st.textColor || '#FFFFFF' }} />
          <div className="h-1 w-2/5 rounded-full" style={{ backgroundColor: st.accentColor || '#3B82F6' }} />
          <div
            className="h-2 w-4/5 rounded-full border flex items-center justify-center text-[6px]"
            style={{ backgroundColor: `${st.accentColor || '#3B82F6'}20`, borderColor: `${st.accentColor || '#3B82F6'}40` }}
          >
            {st.category === 'festival' ? '✨' : '⭐'}
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col justify-between p-0.5">
          <div className="flex items-center justify-between">
            <div className="h-1.5 w-1/2 rounded-full" style={{ backgroundColor: st.textColor || '#FFFFFF' }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: st.accentColor || '#3B82F6' }} />
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="h-2 rounded bg-white/15" />
            <div className="h-2 rounded bg-white/15" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ImageControls({
  canvasRef,
  post,
  brand,
  selectedCategory = 'hiring',
  styleId,
  setStyleId,
  formatId,
  setFormatId,
  colorPaletteId,
  setColorPaletteId,
  bgPattern,
  setBgPattern,
  iconType = 'auto',
  setIconType,
  onUpdateField,
  onRegenerateDesign,
  onSavePost,
  onShowToast,
  isSaved
}) {
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('styles'); // 'styles' | 'formats' | 'colors' | 'backgrounds' | 'icons' | 'visuals'
  const [selectedFolderId, setSelectedFolderId] = useState('auto');
  const [styleCategory, setStyleCategory] = useState(() => {
    return selectedCategory === 'hiring' ? 'hiring' : 'all';
  });

  // Automatically align style filter when user switches categories
  useEffect(() => {
    if (selectedCategory === 'hiring') {
      setStyleCategory('hiring');
    } else if (selectedCategory === 'education' || selectedCategory === 'career-roadmap') {
      setStyleCategory('hiring');
    } else if (selectedCategory) {
      setStyleCategory('general');
    }
  }, [selectedCategory]);

  const fireCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#2563EB', '#7C3AED', '#06B6D4', '#10B981']
      });
    } catch (e) {
      // ignore
    }
  };

  const handleDownloadPNG = () => {
    if (!canvasRef?.current) return;
    const safeTitle = (post?.headline || 'postcraft-post')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 35);
    const ok = exportService.downloadCanvas(canvasRef.current, safeTitle, 'png');
    if (ok) {
      fireCelebration();
      onShowToast?.({ type: 'success', message: 'PNG downloaded successfully!' });
    }
    setDownloadMenuOpen(false);
  };

  const handleDownloadJPEG = () => {
    if (!canvasRef?.current) return;
    const safeTitle = (post?.headline || 'postcraft-post')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 35);
    const ok = exportService.downloadCanvas(canvasRef.current, safeTitle, 'jpeg', 0.95);
    if (ok) {
      fireCelebration();
      onShowToast?.({ type: 'success', message: 'JPEG (95% quality) downloaded successfully!' });
    }
    setDownloadMenuOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 transition-all space-y-5">
      {/* Top Action Row: Quick Style Shuffle & Primary Downloads */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRegenerateDesign}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 hover:border-blue-300 text-blue-700 font-semibold text-xs transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Regenerate Design (Randomize)</span>
          </button>
        </div>

        {/* Download Buttons Group */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSavePost}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${isSaved
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Saved to My Posts' : 'Save Post'}</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Image</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {downloadMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-20 animate-in fade-in slide-in-from-top-2">
                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">PNG</span>
                    <span>High Quality</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Lossless</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJPEG}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">JPG</span>
                    <span>Standard</span>
                  </span>
                  <span className="text-[10px] text-slate-400">95%</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('styles')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'styles'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Design Style (8)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('formats')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'formats'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Image Format (5)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('colors')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'colors'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Color Palette</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backgrounds')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'backgrounds'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Background</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('icons')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'icons'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Topic Icon</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('visuals')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'visuals'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
          <span>Heading Visual</span>
        </button>
      </div>

      {/* Tab Panels */}
      {/* 1. STYLES GRID */}
      {activeTab === 'styles' && (
        <div className="space-y-3">
          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setStyleCategory('all')}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 ${styleCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              All Styles ({DESIGN_STYLES.length})
            </button>

            <button
              type="button"
              onClick={() => setStyleCategory('hiring')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all shrink-0 ${styleCategory === 'hiring'
                  ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-500/20'
                  : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                }`}
            >
              <span>💼 Hiring ({DESIGN_STYLES.filter(s => s.id.startsWith('hiring-') || s.category === 'hiring').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setStyleCategory('product')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all shrink-0 ${styleCategory === 'product'
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/20'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
            >
              <span>🚀 Products ({DESIGN_STYLES.filter(s => s.id.startsWith('product-') || s.category === 'product').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setStyleCategory('festival')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all shrink-0 ${styleCategory === 'festival'
                  ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/20'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
            >
              <span>🎉 Festivals ({DESIGN_STYLES.filter(s => s.id.startsWith('festival-') || s.category === 'festival').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setStyleCategory('common')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all shrink-0 ${styleCategory === 'common'
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                }`}
            >
              <span>💡 Common ({DESIGN_STYLES.filter(s => s.id.startsWith('common-') || s.category === 'knowledge').length})</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {DESIGN_STYLES.filter(st => {
              if (styleCategory === 'hiring') return st.id.startsWith('hiring-') || st.category === 'hiring';
              if (styleCategory === 'product') return st.id.startsWith('product-') || st.category === 'product';
              if (styleCategory === 'festival') return st.id.startsWith('festival-') || st.category === 'festival';
              if (styleCategory === 'common') return st.id.startsWith('common-') || st.category === 'knowledge';
              return true;
            }).map((st) => {
              const isSelected = styleId === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  title={st.description}
                  onClick={() => setStyleId(st.id)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all relative overflow-hidden group ${isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                >
                  {/* Visual miniature layout blueprint preview */}
                  {renderStyleWireframe(st)}

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">{st.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 line-clamp-1">{st.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. FORMATS GRID */}
      {activeTab === 'formats' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {Object.values(IMAGE_DIMENSIONS).map((fmt) => {
            const isSelected = formatId === fmt.id;
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setFormatId(fmt.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{fmt.label}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {fmt.aspect}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{fmt.description}</p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. COLORS GRID */}
      {activeTab === 'colors' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {COLOR_PALETTES.map((pal) => {
            const isSelected = colorPaletteId === pal.id;
            const primaryColor = pal.isBrand ? (brand?.primaryColor || '#2563EB') : pal.primary;
            const secondaryColor = pal.isBrand ? (brand?.secondaryColor || '#7C3AED') : pal.secondary;

            return (
              <button
                key={pal.id}
                type="button"
                onClick={() => setColorPaletteId(pal.id)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
              >
                <div className="flex -space-x-1 shrink-0">
                  <span
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: secondaryColor }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-slate-800 block truncate">{pal.name}</span>
                  {pal.isBrand && <span className="text-[9px] text-blue-600 font-bold">Custom Brand</span>}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* 4. BACKGROUND PATTERNS & TRANSPARENCY */}
      {activeTab === 'backgrounds' && (
        <div className="space-y-4">
          {/* Card Transparency / Frosted Glass Controls */}
          <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-teal-950 block">Poster Card Transparency (Glassmorphism)</span>
                <span className="text-[11px] text-teal-700">Controls how much of the background image shows through cards & elements</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-teal-900">
                <input
                  type="checkbox"
                  checked={post.showBackgroundImage !== false}
                  onChange={(e) => {
                    onUpdateField?.('showBackgroundImage', e.target.checked);
                    onShowToast?.({ type: 'info', message: e.target.checked ? 'Background photo enabled!' : 'Background photo hidden' });
                  }}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>Show Background Image</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                { label: '👻 Transparent', val: 0.0, desc: 'No box (Floating words)' },
                { label: '🌌 Subtle Tint', val: 0.15, desc: '15% ultra-sheer' },
                { label: '💎 Light Glass', val: 0.35, desc: '35% soft glass' },
                { label: '✨ Frosted', val: 0.65, desc: '65% frosted' }
              ].map((opt) => {
                const currentVal = post.cardOpacity ?? 0.0;
                const isSelected = Math.abs(currentVal - opt.val) < 0.05;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      onUpdateField?.('cardOpacity', opt.val);
                      onShowToast?.({ type: 'info', message: `Card transparency set to ${opt.label}` });
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-teal-600 ring-2 ring-teal-500/20 bg-white text-teal-900 shadow-xs font-bold'
                        : 'border-teal-200/60 bg-white/60 hover:bg-white text-slate-700 font-medium'
                    }`}
                  >
                    <span className="text-xs block">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Scrim & Image Clarity */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-slate-800 block">Background Image Visibility / Scrim Tint</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '🌟 Vibrant Photo', val: 0.25, desc: '25% tint (Max visibility)' },
                { label: '⚡ Balanced', val: 0.38, desc: '38% tint (Optimal contrast)' },
                { label: '🌫️ Muted Scrim', val: 0.58, desc: '58% tint (Soft contrast)' }
              ].map((scrimOpt) => {
                const currentAlpha = post.bgOverlayOpacity ?? 0.38;
                const isSelected = Math.abs(currentAlpha - scrimOpt.val) < 0.06;
                return (
                  <button
                    key={scrimOpt.val}
                    type="button"
                    onClick={() => {
                      onUpdateField?.('bgOverlayOpacity', scrimOpt.val);
                      onShowToast?.({ type: 'info', message: `Background tint set to ${scrimOpt.label}` });
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-teal-600 ring-2 ring-teal-500/20 bg-white text-teal-900 shadow-xs font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xs block">{scrimOpt.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{scrimOpt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-wider">Fallback Vector Pattern</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {BACKGROUND_PATTERNS.map((pat) => {
                const isSelected = bgPattern === pat.id || (!bgPattern && pat.id === 'grid');
                return (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => setBgPattern(pat.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${isSelected
                        ? 'border-teal-600 ring-2 ring-teal-500/20 bg-teal-50/40 text-teal-800 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                  >
                    <span className="text-xs">{pat.name}</span>
                    {isSelected && <span className="text-[10px] text-teal-600 mt-1 font-bold">Active</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. TOPIC ICONS */}
      {activeTab === 'icons' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Select a custom vector icon to render inside your graphic above the headline, or keep <strong>Auto Detect</strong> for instant AI matching.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {ICON_OPTIONS.map((ico) => {
              const isSelected = (iconType || 'auto') === ico.id;
              return (
                <button
                  key={ico.id}
                  type="button"
                  onClick={() => {
                    setIconType?.(ico.id);
                    onShowToast?.({ type: 'info', message: `Icon set to: ${ico.label}` });
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40 text-blue-700 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                >
                  <span className="text-xl mb-1">{ico.icon}</span>
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">{ico.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{ico.desc}</span>
                  {isSelected && (
                    <span className="text-[10px] text-blue-600 font-bold mt-1 px-1.5 py-0.2 bg-blue-100 rounded">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. LOCAL AI IMAGES / RIGHT-SIDE IMAGE */}
      {activeTab === 'visuals' && (() => {
        const autoFolder = findMatchingFolder(post?.headline || post?.topic || '', selectedCategory);
        const currentFolder = selectedFolderId === 'auto'
          ? autoFolder
          : (LOCAL_AI_FOLDERS.find(f => f.id === selectedFolderId) || autoFolder);

        const currentImages = currentFolder?.files || [];

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  📁 images_AI Repository: <span className="text-teal-700 font-extrabold">{currentFolder?.label}</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  {currentImages.length} high-resolution photos indexed from your local folder.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {post.imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateField?.('imageUrl', null);
                      setSelectedFolderId('auto');
                      onShowToast?.({ type: 'info', message: 'Reset visual to smart auto-match' });
                    }}
                    className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-2 py-1 rounded-md border border-teal-200"
                  >
                    Reset to Auto
                  </button>
                )}
              </div>
            </div>

            {/* Folder Filter Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setSelectedFolderId('auto')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${selectedFolderId === 'auto'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
              >
                ✨ Auto ({autoFolder?.label})
              </button>
              {LOCAL_AI_FOLDERS.map((f) => {
                const isFolderActive = selectedFolderId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFolderId(f.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all border ${isFolderActive
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                  >
                    {f.label} ({f.files.length})
                  </button>
                );
              })}
            </div>

            {/* Image Thumbnail Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-80 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
              {currentImages.map((img, idx) => {
                const isSelected = post.imageUrl === img.url || (!post.imageUrl && idx === 0 && selectedFolderId === 'auto');
                return (
                  <button
                    key={img.name}
                    type="button"
                    onClick={() => {
                      onUpdateField?.('imageUrl', img.url);
                      onUpdateField?.('localImageIndex', idx);
                      onShowToast?.({ type: 'info', message: `Applied: ${img.name}` });
                    }}
                    className={`group relative rounded-xl border overflow-hidden text-left transition-all flex flex-col bg-white ${isSelected
                        ? 'border-teal-600 ring-2 ring-teal-500/30 shadow-md scale-[1.02]'
                        : 'border-slate-200 hover:border-teal-400 hover:shadow-xs'
                      }`}
                  >
                    <div className="w-full h-20 relative overflow-hidden bg-slate-100">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-teal-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-xs">
                          Active
                        </div>
                      )}
                    </div>
                    <div className="p-1.5">
                      <span className="text-[10px] font-semibold text-slate-700 block truncate" title={img.name}>
                        {img.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
