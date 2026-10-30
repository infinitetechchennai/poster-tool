import React, { useState, useEffect } from 'react';
import {
  Share2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Settings,
  Zap,
  Clock,
  Calendar,
  Globe,
  Radio,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Send,
  Sliders,
  X,
  Check,
  Lock,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { storageService } from '../services/storageService';

// Default supported social media platforms
const INITIAL_PLATFORMS = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    tagline: 'Professional Network & Company Pages',
    color: '#0A66C2',
    bgLight: 'bg-blue-50/70',
    borderLight: 'border-blue-200',
    iconLetter: 'in',
    connected: true,
    handle: '@infinitetech-ai',
    accountName: 'Infinitetech AI Solutions',
    accountType: 'Company Page',
    autoPostEnabled: true,
    followers: '24.5K',
    bestTime: '09:30 AM (Tue - Thu)',
    supportedFormats: 'Square 1:1, Landscape 1.91:1'
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    tagline: 'Real-time Tech & Industry Updates',
    color: '#0F1419',
    bgLight: 'bg-slate-50',
    borderLight: 'border-slate-200',
    iconLetter: '𝕏',
    connected: false,
    handle: '',
    accountName: '',
    accountType: 'Creator / Pro',
    autoPostEnabled: false,
    followers: '0',
    bestTime: '12:00 PM (Daily)',
    supportedFormats: 'Square 1:1, Landscape 16:9'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    tagline: 'Visual Branding & Story Carousels',
    color: '#E1306C',
    bgLight: 'bg-pink-50/70',
    borderLight: 'border-pink-200',
    iconLetter: 'IG',
    connected: true,
    handle: '@infinitetech.ai',
    accountName: 'Infinitetech AI Official',
    accountType: 'Business Graph API',
    autoPostEnabled: true,
    followers: '18.2K',
    bestTime: '06:00 PM (Mon - Fri)',
    supportedFormats: 'Portrait 4:5, Square 1:1'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    tagline: 'Corporate Pages & Community Groups',
    color: '#1877F2',
    bgLight: 'bg-indigo-50/60',
    borderLight: 'border-indigo-200',
    iconLetter: 'f',
    connected: false,
    handle: '',
    accountName: '',
    accountType: 'Meta Business Page',
    autoPostEnabled: false,
    followers: '0',
    bestTime: '01:00 PM (Daily)',
    supportedFormats: 'Landscape 1.91:1, Square 1:1'
  },
  {
    id: 'threads',
    name: 'Threads',
    tagline: 'Text & Visual Micro-conversations',
    color: '#000000',
    bgLight: 'bg-slate-50',
    borderLight: 'border-slate-200',
    iconLetter: '@',
    connected: false,
    handle: '',
    accountName: '',
    accountType: 'Threads Profile',
    autoPostEnabled: false,
    followers: '0',
    bestTime: '10:00 AM (Daily)',
    supportedFormats: 'Portrait 4:5, Square 1:1'
  },
  {
    id: 'youtube',
    name: 'YouTube Community',
    tagline: 'Channel Feed Image & Text Updates',
    color: '#FF0000',
    bgLight: 'bg-red-50/60',
    borderLight: 'border-red-200',
    iconLetter: '▶',
    connected: false,
    handle: '',
    accountName: '',
    accountType: 'Brand Channel',
    autoPostEnabled: false,
    followers: '0',
    bestTime: '04:30 PM (Wed - Sun)',
    supportedFormats: 'Square 1:1'
  }
];

export default function AutoPosting({ brand, onShowToast }) {
  // Accounts state persisted in localStorage
  const [platforms, setPlatforms] = useState(() => {
    try {
      const saved = localStorage.getItem('postcraft_social_channels');
      return saved ? JSON.parse(saved) : INITIAL_PLATFORMS;
    } catch {
      return INITIAL_PLATFORMS;
    }
  });

  // Schedule settings
  const [scheduleConfig, setScheduleConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('postcraft_schedule_config');
      return saved ? JSON.parse(saved) : {
        isMasterAutoPostOn: true,
        approvalMode: 'approval', // 'instant' or 'approval'
        timeSlots: ['09:00 AM', '01:30 PM', '06:45 PM'],
        timezone: 'UTC+05:30 (IST)',
        hashtagStrategy: 'auto',
        includeSignature: true
      };
    } catch {
      return {
        isMasterAutoPostOn: true,
        approvalMode: 'approval',
        timeSlots: ['09:00 AM', '01:30 PM', '06:45 PM'],
        timezone: 'UTC+05:30 (IST)',
        hashtagStrategy: 'auto',
        includeSignature: true
      };
    }
  });

  // Modal connection states
  const [connectingPlatform, setConnectingPlatform] = useState(null);
  const [connectFormData, setConnectFormData] = useState({
    handle: '',
    accountName: '',
    accountType: 'Business / Company'
  });
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Active view tab in this page: 'channels' | 'schedule' | 'queue'
  const [subTab, setSubTab] = useState('channels');

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('postcraft_social_channels', JSON.stringify(platforms));
    } catch (e) {
      console.error(e);
    }
  }, [platforms]);

  useEffect(() => {
    try {
      localStorage.setItem('postcraft_schedule_config', JSON.stringify(scheduleConfig));
    } catch (e) {
      console.error(e);
    }
  }, [scheduleConfig]);

  // Connected accounts count
  const connectedCount = platforms.filter(p => p.connected).length;
  const autoPostActiveCount = platforms.filter(p => p.connected && p.autoPostEnabled).length;

  // Toggle platform auto-posting on/off
  const handleToggleAutoPost = (id) => {
    setPlatforms(prev => prev.map(p => {
      if (p.id === id) {
        const nextState = !p.autoPostEnabled;
        onShowToast?.({
          type: nextState ? 'success' : 'info',
          message: `${p.name} auto-posting ${nextState ? 'enabled' : 'paused'}`
        });
        return { ...p, autoPostEnabled: nextState };
      }
      return p;
    }));
  };

  // Open Connect Modal
  const handleOpenConnect = (platform) => {
    setConnectingPlatform(platform);
    setConnectFormData({
      handle: `@${(brand?.companyName || 'infinitetech').toLowerCase().replace(/\s+/g, '')}`,
      accountName: `${brand?.companyName || 'Infinitetech AI'} Official`,
      accountType: platform.accountType || 'Business Page'
    });
  };

  // Confirm Connect
  const handleConfirmConnect = () => {
    if (!connectingPlatform) return;
    setIsAuthorizing(true);

    setTimeout(() => {
      setPlatforms(prev => prev.map(p => {
        if (p.id === connectingPlatform.id) {
          return {
            ...p,
            connected: true,
            autoPostEnabled: true,
            handle: connectFormData.handle.startsWith('@') ? connectFormData.handle : `@${connectFormData.handle}`,
            accountName: connectFormData.accountName || `${connectingPlatform.name} Page`,
            accountType: connectFormData.accountType,
            followers: '12.4K'
          };
        }
        return p;
      }));

      setIsAuthorizing(false);
      setConnectingPlatform(null);
      onShowToast?.({
        type: 'success',
        message: `Successfully connected ${connectingPlatform.name} account!`
      });
    }, 1000);
  };

  // Disconnect Account
  const handleDisconnect = (id, name) => {
    if (window.confirm(`Are you sure you want to disconnect ${name}? Scheduled posts will not be auto-published.`)) {
      setPlatforms(prev => prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            connected: false,
            autoPostEnabled: false,
            handle: '',
            accountName: '',
            followers: '0'
          };
        }
        return p;
      }));
      onShowToast?.({ type: 'info', message: `${name} disconnected.` });
    }
  };

  // Add Time Slot
  const handleAddTimeSlot = () => {
    const defaultNewSlots = ['08:00 AM', '11:30 AM', '03:15 PM', '08:00 PM'];
    const current = scheduleConfig.timeSlots || [];
    const available = defaultNewSlots.find(s => !current.includes(s)) || '10:00 AM';

    setScheduleConfig(prev => ({
      ...prev,
      timeSlots: [...current, available]
    }));
    onShowToast?.({ type: 'info', message: `Added ${available} publishing slot` });
  };

  // Remove Time Slot
  const handleRemoveTimeSlot = (slotToRemove) => {
    setScheduleConfig(prev => ({
      ...prev,
      timeSlots: (prev.timeSlots || []).filter(s => s !== slotToRemove)
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Hero Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-cyan-300">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Multi-Channel Auto-Publishing Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Connect Social Media & Automate Publishing
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Link your brand's social accounts to automatically publish high-converting visuals, synced descriptions, and tailored hashtags directly from PostCraft AI.
            </p>
          </div>

          {/* Quick Metrics Badge Card */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 shrink-0">
            <div className="px-3.5 py-1.5 border-r border-white/10 text-center">
              <span className="block text-2xl font-display font-extrabold text-white">{connectedCount} / {platforms.length}</span>
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Connected</span>
            </div>

            <div className="px-3.5 py-1.5 border-r border-white/10 text-center">
              <span className="block text-2xl font-display font-extrabold text-cyan-400">{autoPostActiveCount}</span>
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Auto-Active</span>
            </div>

            <div className="px-3.5 py-1.5 text-center">
              <span className="block text-2xl font-display font-extrabold text-emerald-400">100%</span>
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Free API</span>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="relative z-10 flex items-center gap-2 mt-6 pt-5 border-t border-white/10">
          <button
            type="button"
            onClick={() => setSubTab('channels')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'channels'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Connected Channels ({connectedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'schedule'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Auto-Post Schedule & Rules</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('queue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'queue'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publishing Queue Preview</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-TAB: CHANNELS LIST */}
      {subTab === 'channels' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                <span>Available Publishing Channels</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Direct API OAuth
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Connect official developer APIs or business profiles. All credentials remain encrypted in your local browser sandbox.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPlatforms(INITIAL_PLATFORMS);
                  onShowToast?.({ type: 'info', message: 'Reset social channels to defaults.' });
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Reset Demo Accounts
              </button>
            </div>
          </div>

          {/* Social Platforms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {platforms.map((platform) => {
              const isConn = platform.connected;

              return (
                <div
                  key={platform.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 shadow-card hover:shadow-card-hover flex flex-col justify-between overflow-hidden ${
                    isConn ? 'border-slate-200' : 'border-slate-200/70 bg-slate-50/40'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Platform Icon Badge */}
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-lg text-white shadow-md shrink-0"
                          style={{ backgroundColor: platform.color }}
                        >
                          {platform.iconLetter}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-display font-bold text-slate-900 text-base">{platform.name}</h3>
                            {isConn && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active Connection" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{platform.tagline}</p>
                        </div>
                      </div>

                      {/* Connection Status Pill */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isConn
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {isConn ? 'Connected' : 'Offline'}
                      </span>
                    </div>

                    {/* Connected Account Details */}
                    {isConn ? (
                      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 truncate">{platform.accountName}</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100/70 text-blue-800">
                            {platform.accountType}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-mono text-purple-600 font-medium">{platform.handle}</span>
                          <span className="font-semibold text-slate-700">{platform.followers} followers</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-3 rounded-xl bg-slate-100/60 border border-slate-200/60 space-y-1.5 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Direct API Publishing Ready</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          Enables automatic publishing of 1200x1200px branded graphics, AI copy, and hashtags.
                        </p>
                      </div>
                    )}

                    {/* Metadata Specs */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Peak: {platform.bestTime}</span>
                      <span>{platform.supportedFormats}</span>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-4 pt-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                    {isConn ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleToggleAutoPost(platform.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            platform.autoPostEnabled
                              ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-500'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          <Zap className="w-3 h-3" />
                          <span>{platform.autoPostEnabled ? 'Auto-Post: ON' : 'Auto-Post: PAUSED'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDisconnect(platform.id, platform.name)}
                          className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors px-2 py-1"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenConnect(platform)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.98]"
                        style={{ backgroundColor: platform.color === '#000000' || platform.color === '#0F1419' ? '#0F172A' : platform.color }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Connect {platform.name}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SUB-TAB: AUTO-POST SCHEDULE & RULES */}
      {subTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Automation Rules & Settings (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-600" />
                <span>Automated Publishing Rules</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Configure how and when newly generated posts are dispatched to your connected channels.
              </p>
            </div>

            {/* Master Switch */}
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-purple-950 block">Master Automation Dispatcher</span>
                <span className="text-xs text-purple-700">When enabled, queued posts are posted at their scheduled times.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setScheduleConfig(prev => ({ ...prev, isMasterAutoPostOn: !prev.isMasterAutoPostOn }));
                  onShowToast?.({
                    type: 'info',
                    message: `Master dispatcher ${!scheduleConfig.isMasterAutoPostOn ? 'activated' : 'paused'}`
                  });
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  scheduleConfig.isMasterAutoPostOn ? 'bg-purple-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    scheduleConfig.isMasterAutoPostOn ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Approval Workflow */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Safety & Approval Workflow
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setScheduleConfig(prev => ({ ...prev, approvalMode: 'approval' }))}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    scheduleConfig.approvalMode === 'approval'
                      ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Review & Approve First</span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Recommended</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Generated posts are saved to queue. You confirm with 1-click before the post is published.
                  </p>
                </div>

                <div
                  onClick={() => setScheduleConfig(prev => ({ ...prev, approvalMode: 'instant' }))}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    scheduleConfig.approvalMode === 'instant'
                      ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Full Autopilot</span>
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Instant</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Direct auto-publish immediately after AI content generation finishes without waiting.
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Schedule Slots */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Daily Publishing Slots ({scheduleConfig.timezone})
                </label>
                <button
                  type="button"
                  onClick={handleAddTimeSlot}
                  className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Time Slot</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(scheduleConfig.timeSlots || []).map((slot, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>{slot}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTimeSlot(slot)}
                      className="text-slate-400 hover:text-rose-600 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Signature */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Include Brand Signature Line</span>
                <span className="text-[11px] text-slate-500">
                  Appends "Follow {brand?.companyName || 'Infinite Tech'} for more insights" to captions.
                </span>
              </div>
              <input
                type="checkbox"
                checked={scheduleConfig.includeSignature}
                onChange={(e) => setScheduleConfig(prev => ({ ...prev, includeSignature: e.target.checked }))}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Right Column: Platform Best Practices (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Cross-Platform AI Optimization</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                <span className="font-bold text-blue-600 block">LinkedIn Masterclass</span>
                <p>1:1 Square posters with 4 key feature points and clean contrast deliver 3.2x higher impressions in corporate feeds.</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                <span className="font-bold text-pink-600 block">Instagram Graph API</span>
                <p>Auto-formats visual content into 1080x1350 vertical aspect for maximum mobile viewport real estate.</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-900 block">X / Twitter Fast Sync</span>
                <p>Truncates copy to fit 280-char limits while prioritizing headline, call to action, and core tech hashtags.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onShowToast?.({ type: 'success', message: 'Publishing rules saved successfully!' })}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 active:scale-95 transition-all"
              >
                Save Schedule Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB: PUBLISHING QUEUE PREVIEW */}
      {subTab === 'queue' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                <span>Upcoming Scheduled Queue</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Posts prepared from your studio ready to be auto-published to your active channels.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                3 Posts Queued
              </span>
            </div>
          </div>

          {/* Queue Items */}
          <div className="space-y-3">
            {[
              {
                time: 'Tomorrow, 09:30 AM',
                title: 'SkyPro AI Calling Agent: 50,000 Calls Every Morning. AI Can.',
                channels: ['LinkedIn', 'Instagram'],
                status: 'Ready to Publish',
                statusColor: 'emerald'
              },
              {
                time: 'Tomorrow, 01:30 PM',
                title: 'Next-Gen Cloud Computing Architecture 2026: Scale Zero Bottlenecks',
                channels: ['LinkedIn'],
                status: 'Awaiting 1-Click Approval',
                statusColor: 'amber'
              },
              {
                time: 'Thursday, 06:45 PM',
                title: 'Data Engineering in 2026: Skills, Tools & Modern Streaming Pipelines',
                channels: ['LinkedIn', 'X (Twitter)'],
                status: 'Queued',
                statusColor: 'purple'
              }
            ].map((q, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-purple-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{q.time}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {q.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{q.title}</h4>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] text-slate-500 font-medium">Target Channels:</span>
                    {q.channels.map((ch, idx) => (
                      <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => onShowToast?.({ type: 'success', message: 'Publishing now...' })}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
                  >
                    Publish Now
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast?.({ type: 'info', message: 'Queue item removed.' })}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Interactive Connect Account Modal */}
      {connectingPlatform && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setConnectingPlatform(null)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: connectingPlatform.color }}
                >
                  {connectingPlatform.iconLetter}
                </div>
                <h3 className="font-display font-bold text-slate-900 text-base">
                  Connect {connectingPlatform.name}
                </h3>
              </div>
              <button
                onClick={() => setConnectingPlatform(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Account Handle / Username
                </label>
                <input
                  type="text"
                  value={connectFormData.handle}
                  onChange={(e) => setConnectFormData(prev => ({ ...prev, handle: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  placeholder="@yourcompany"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Page or Profile Name
                </label>
                <input
                  type="text"
                  value={connectFormData.accountName}
                  onChange={(e) => setConnectFormData(prev => ({ ...prev, accountName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  placeholder="e.g. Infinitetech AI Solutions"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Account Type
                </label>
                <select
                  value={connectFormData.accountType}
                  onChange={(e) => setConnectFormData(prev => ({ ...prev, accountType: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                >
                  <option value="Company / Business Page">Company / Business Page</option>
                  <option value="Personal Creator Profile">Personal Creator Profile</option>
                  <option value="Organization / Group">Organization / Group</option>
                </select>
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl flex items-start gap-2 text-xs text-purple-900">
                <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  Authorizing enables PostCraft to publish 1200x1200px branded media and captions on your schedule.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConnectingPlatform(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isAuthorizing}
                onClick={handleConfirmConnect}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAuthorizing ? 'animate-spin' : ''}`} />
                <span>{isAuthorizing ? 'Authorizing API...' : 'Authorize & Connect'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
