import React from 'react';
import {
  Sparkles,
  Layers,
  Share2,
  BookmarkCheck,
  Palette,
  Settings,
  Flame,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, brand, savedPostsCount = 0, isMobileOpen, setIsMobileOpen }) {
  const navItems = [
    {
      id: 'create',
      label: 'Create Post',
      description: 'Single topic to image',
      icon: Sparkles,
      badge: 'Core'
    },
    {
      id: 'bulk',
      label: 'Bulk Generator',
      description: 'Up to 20 posts at once',
      icon: Layers,
      badge: 'Batch'
    },
    {
      id: 'autopost',
      label: 'Auto-Posting',
      description: 'Connect accounts & schedule',
      icon: Share2,
      badge: 'Auto'
    },
    {
      id: 'posts',
      label: 'My Posts',
      description: 'Saved library & drafts',
      icon: BookmarkCheck,
      count: savedPostsCount
    },
    {
      id: 'brand',
      label: 'Brand Settings',
      description: 'Logo, colors & presets',
      icon: Palette
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Ollama AI & backups',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white border-r border-slate-200/80 z-40 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-lg text-slate-900 tracking-tight">PostCraft</span>
                <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">AI</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Free Social Media Studio</p>
            </div>
          </div>
        </div>

        {/* Free Plan Badge */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/80 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-800">100% Free Forever</p>
            <p className="text-slate-500">No API keys required</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                  <div className="text-left">
                    <p className="leading-tight">{item.label}</p>
                    <p className={`text-[11px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>{item.description}</p>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-blue-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Active Brand Profile Widget */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => {
              setActiveTab('brand');
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-left transition-colors border border-slate-200/60"
          >
            <div
              className="w-12 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-white border border-slate-200/90 shadow-sm shrink-0 overflow-hidden p-0.5"
            >
              {brand?.logoUrl ? (
                <img src={brand.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-white text-xs font-bold" style={{ backgroundColor: brand?.primaryColor || '#00a2a2' }}>
                  {(brand?.companyName || 'I').charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{brand?.companyName || 'Infinitetech Ai'}</p>
              <p className="text-[11px] text-slate-400 truncate">{brand?.websiteUrl || 'www.infinitetechai.com'}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
}
