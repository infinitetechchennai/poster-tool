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
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              isSaved
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'styles'
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'formats'
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'colors'
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'backgrounds'
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'icons'
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'visuals'
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
              className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
                styleCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Styles ({DESIGN_STYLES.length})
            </button>

            <button
              type="button"
              onClick={() => setStyleCategory('hiring')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all shrink-0 ${
                styleCategory === 'hiring'
                  ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-500/20'
                  : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
              }`}
            >
              <span>💼 Hiring ({DESIGN_STYLES.filter(s => s.id.startsWith('hiring-') || s.category === 'hiring').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setStyleCategory('product')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all shrink-0 ${
                styleCategory === 'product'
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/20'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span>🚀 Products ({DESIGN_STYLES.filter(s => s.id.startsWith('product-') || s.category === 'product').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setStyleCategory('festival')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all shrink-0 ${
                styleCategory === 'festival'
                  ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/20'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span>🎉 Festivals ({DESIGN_STYLES.filter(s => s.id.startsWith('festival-') || s.category === 'festival').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setStyleCategory('common')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all shrink-0 ${
                styleCategory === 'common'
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
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all relative overflow-hidden group ${
                    isSelected
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
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
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
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  isSelected
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

      {/* 4. BACKGROUND PATTERNS */}
      {activeTab === 'backgrounds' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {BACKGROUND_PATTERNS.map((pat) => {
            const isSelected = bgPattern === pat.id || (!bgPattern && pat.id === 'grid');
            return (
              <button
                key={pat.id}
                type="button"
                onClick={() => setBgPattern(pat.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30 text-blue-700 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xs">{pat.name}</span>
                {isSelected && <span className="text-[10px] text-blue-600 mt-1 font-bold">Active</span>}
              </button>
            );
          })}
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
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    isSelected
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

      {/* 6. HEADING VISUALS / RIGHT-SIDE IMAGE */}
      {activeTab === 'visuals' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              The right side displays a high-resolution visual matching your headline. Pick an alternate preset below or keep <strong>Auto Match</strong>:
            </p>
            {post.imageUrl && (
              <button
                type="button"
                onClick={() => {
                  onUpdateField?.('imageUrl', null);
                  onShowToast?.({ type: 'info', message: 'Reset visual to smart auto-match' });
                }}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
              >
                Reset to Auto
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {/* Signature 3D Architectural Studio Model (Scaler Masterclass Style) */}
            <button
              type="button"
              onClick={() => {
                onUpdateField?.('imageUrl', '3d-model');
                onUpdateField?.('visualMode', '3d');
                onShowToast?.({ type: 'info', message: 'Applied Signature 3D Studio Architecture!' });
              }}
              className={`group relative rounded-xl border overflow-hidden text-left transition-all flex flex-col ${
                !post.imageUrl || post.imageUrl === '3d-model' || post.visualMode === '3d'
                  ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-full h-16 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
                <span className="absolute bottom-1 left-1.5 text-[9px] font-bold text-cyan-300 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
                  3D Studio Model
                </span>
              </div>
              <div className="p-2 bg-white">
                <span className="text-xs font-bold text-slate-800 block truncate">3D Tech Model</span>
                <span className="text-[10px] text-blue-600 font-semibold block truncate mt-0.5">Signature Scaler Style</span>
              </div>
            </button>

            {TOPIC_IMAGE_PRESETS.map((preset) => {
              const isSelected = post.imageUrl === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onUpdateField?.('imageUrl', preset.url);
                    onUpdateField?.('visualMode', 'photo');
                    onShowToast?.({ type: 'info', message: `Visual updated: ${preset.label}` });
                  }}
                  className={`group relative rounded-xl border overflow-hidden text-left transition-all flex flex-col ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-full h-16 relative overflow-hidden bg-slate-100">
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-1 left-1.5 text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                      {preset.category}
                    </span>
                  </div>
                  <div className="p-2 bg-white">
                    <span className="text-xs font-bold text-slate-800 block truncate">{preset.label}</span>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5">{preset.tag}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
