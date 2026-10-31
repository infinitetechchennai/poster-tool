import React, { useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  Palette
} from 'lucide-react';
import { DESIGN_STYLES, IMAGE_DIMENSIONS } from '../utils/designTemplates';
import { DEFAULT_BRAND } from '../services/storageService';

export default function BrandSettingsForm({
  brand,
  setBrand,
  onSave,
  onReset,
  onShowToast
}) {
  const fileInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast?.({ type: 'error', message: 'Please upload an image file (PNG, JPG, SVG).' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      onShowToast?.({ type: 'error', message: 'Logo file size must be under 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result;
      setBrand(prev => ({ ...prev, logoUrl: dataUrl }));
      onShowToast?.({ type: 'success', message: 'Logo uploaded successfully!' });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setBrand(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    onShowToast?.({ type: 'info', message: 'Logo removed' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 sm:p-8 space-y-6 max-w-4xl">
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900">Brand Identity & Presets</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure your brand identity once. Every new post and bulk generation will automatically adopt your colors, logo, and style.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-semibold text-xs transition-all shadow-md shadow-blue-500/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Brand Settings</span>
          </button>
        </div>
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Company / Brand Name
            </label>
            <input
              type="text"
              value={brand.companyName || ''}
              onChange={(e) => setBrand(prev => ({ ...prev, companyName: e.target.value }))}
              placeholder="e.g. Acme Technologies"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Website URL
            </label>
            <input
              type="text"
              value={brand.websiteUrl || ''}
              onChange={(e) => setBrand(prev => ({ ...prev, websiteUrl: e.target.value }))}
              placeholder="e.g. www.acmetech.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Default Call-to-Action (CTA)
            </label>
            <input
              type="text"
              value={brand.defaultCta || ''}
              onChange={(e) => setBrand(prev => ({ ...prev, defaultCta: e.target.value }))}
              placeholder="e.g. Transform Your Business Today →"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Preferred Format */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Preferred Image Format
            </label>
            <select
              value={brand.preferredFormat || 'linkedin-square'}
              onChange={(e) => setBrand(prev => ({ ...prev, preferredFormat: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
            >
              {Object.values(IMAGE_DIMENSIONS).map(fmt => (
                <option key={fmt.id} value={fmt.id}>
                  {fmt.label} ({fmt.width} × {fmt.height})
                </option>
              ))}
            </select>
          </div>

          {/* Default Style */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Default Design Style
            </label>
            <select
              value={brand.defaultStyle || 'common-01'}
              onChange={(e) => setBrand(prev => ({ ...prev, defaultStyle: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
            >
              {DESIGN_STYLES.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.dark ? 'Dark' : 'Light'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column: Logo & Colors */}
        <div className="space-y-5">
          {/* Company Logo Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Company Logo (PNG / JPG / SVG)
            </label>
            <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center">
              {brand.logoUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-xl bg-white p-2 shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden">
                    <img src={brand.logoUrl} alt="Company Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      Change Logo
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-xs text-rose-500 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-2">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Click to upload logo
                  </button>
                  <p className="text-[11px] text-slate-400 mt-1">Transparent PNG recommended (Max 2MB)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Color Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brand.primaryColor || '#2563EB'}
                  onChange={(e) => setBrand(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <input
                  type="text"
                  value={brand.primaryColor || '#2563EB'}
                  onChange={(e) => setBrand(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono uppercase font-semibold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Secondary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brand.secondaryColor || '#7C3AED'}
                  onChange={(e) => setBrand(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <input
                  type="text"
                  value={brand.secondaryColor || '#7C3AED'}
                  onChange={(e) => setBrand(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono uppercase font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Brand Preview Card Widget */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-white p-0.5 border border-white/20 shadow-md overflow-hidden shrink-0"
              >
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-white" style={{ backgroundColor: brand.primaryColor || '#00a2a2' }}>
                    {(brand.companyName || 'I').charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">{brand.companyName || 'Infinitetech Ai'}</p>
                <p className="text-[11px] text-slate-400">{brand.websiteUrl || 'www.infinitetechai.com'}</p>
              </div>
            </div>

            <div
              className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: brand.primaryColor || '#2563EB' }}
            >
              Brand Preset Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
