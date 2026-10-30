import React from 'react';
import { Menu, Sparkles, Cpu, ShieldCheck } from 'lucide-react';

export default function Header({ onMenuClick, currentTabTitle, brand, isOllamaEnabled }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/70 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Create Stunning Social Media Posts</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal line-clamp-1">
              Turn your ideas into professional social media content and beautiful branded images in seconds.
            </p>
          </div>
        </div>

        {/* Right: Status Badges */}
        <div className="hidden sm:flex items-center gap-2.5">
          {isOllamaEnabled ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
              <span>Ollama AI Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Engine Ready</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-sm text-slate-800 text-xs font-medium">
            {brand?.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand?.companyName || 'Logo'}
                className="h-5 w-auto max-w-[110px] object-contain rounded"
              />
            ) : (
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: brand?.primaryColor || '#00a2a2' }}
              />
            )}
            <span className="font-bold text-slate-800 truncate max-w-[130px]">{brand?.companyName || 'Infinite Tech'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
