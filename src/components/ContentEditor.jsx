import React, { useState, useEffect, useRef } from 'react';
import {
  Edit3,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Check,
  Hash,
  MessageSquare,
  Sparkles,
  Zap,
  Info,
  X,
  Briefcase,
  MapPin,
  DollarSign,
  Code2,
  Calendar,
  Layers,
  GraduationCap,
  TrendingUp,
  FileText,
  Rocket,
  Award,
  ChevronRight
} from 'lucide-react';
import { exportService } from '../services/exportService';
import { pickImageForTopic } from '../utils/localAiImages';

const DEFAULT_CAREER_STAGES = [
  {
    role: 'Junior DevOps',
    years: '0 - 2 yrs',
    badge: 'Learn • Explore • Build',
    color: '#38BDF8',
    points: [
      'Learns Linux and automation',
      'Writes first CI/CD pipeline',
      'Gets hands-on with cloud',
      'Explores AI/ML workloads'
    ]
  },
  {
    role: 'DevOps Engineer',
    years: '2 - 4 yrs',
    badge: 'Automate • Deploy • Repeat',
    color: '#34D399',
    points: [
      'Builds and maintains CI/CD',
      'Deploys and manages infrastructure',
      'Automates workflows',
      'Supports AI/ML deployments'
    ]
  },
  {
    role: 'Senior DevOps',
    years: '4 - 6 yrs',
    badge: 'Stability • Scale • Reliability',
    color: '#FBBF24',
    points: [
      'Owns production systems',
      'Improves reliability and scalability',
      'Builds self-serve infrastructure',
      'Enables AI/ML workflows at scale'
    ]
  },
  {
    role: 'Platform / AI Infra',
    years: '6 - 8 yrs',
    badge: 'Design • Standardize • Enable',
    color: '#A855F7',
    points: [
      'Designs and builds internal platforms',
      'Standardizes infrastructure for AI/ML',
      'Optimizes cost, performance and security',
      'Enables teams to train and deploy models'
    ]
  },
  {
    role: 'Principal Engineer',
    years: '8 - 10 yrs',
    badge: 'Strategy • Influence • Lead',
    color: '#EC4899',
    points: [
      'Sets platform strategy',
      'Architects scalable systems',
      'Drives automation and governance',
      'Leads AI infrastructure initiatives'
    ]
  },
  {
    role: 'CTO / Architect',
    years: '10+ yrs',
    badge: 'Vision • Business • Impact',
    color: '#10B981',
    points: [
      'Defines long-term cloud and AI strategy',
      'Builds high-performing teams',
      'Aligns infrastructure with business impact',
      'Drives innovation at scale'
    ]
  }
];

const DEFAULT_EDU_HIGHLIGHTS = [
  'Project-Based Learning',
  'Real-World Industry Projects',
  'Internship Offer Letter',
  'Internship Certificate',
  'Practical Tasks & Assignments',
  '100% Online Program'
];

export default function ContentEditor({
  post,
  onUpdateField,
  onSyncDescriptionFromHeadline,
  onRegenerateKeyPoints,
  onRegenerateCta,
  onRegenerateContent,
  isRegenerating,
  onShowToast,
  selectedCategory = 'hiring',
  styleId = ''
}) {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [headlineInput, setHeadlineInput] = useState(post?.headline || '');
  const [isTyping, setIsTyping] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [autoSyncContent, setAutoSyncContent] = useState(true);
  const [newTechInput, setNewTechInput] = useState('');
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const debounceTimerRef = useRef(null);

  // Keep local headlineInput in sync when post?.headline changes externally (unless user is actively typing)
  useEffect(() => {
    if (post?.headline !== undefined && !isTyping) {
      setHeadlineInput(post.headline);
    }
  }, [post?.headline, isTyping]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  if (!post) return null;

  // Template-driven, mutually-exclusive category mode detection
  // The concrete selected template (styleId) ALWAYS takes primary precedence!
  const isHiring = Boolean(styleId?.startsWith('hiring-') || selectedCategory === 'hiring' || post?.category === 'hiring');
  const isProduct = !isHiring && Boolean(styleId?.startsWith('product-') || selectedCategory === 'product' || post?.category === 'product');
  const isFestival = !isHiring && !isProduct && Boolean(styleId?.startsWith('festival-') || selectedCategory === 'festival' || post?.category === 'festival');
  const isCommon = !isHiring && !isProduct && !isFestival;
  const isBeforeAfter = Boolean(styleId === 'common-21' || styleId?.includes('before-after'));
  const isRoadmap = false;
  const isEducation = false;
  const isService = false;
  const isGeneral = isCommon;

  // Word count helper for description
  const descWords = (post.description || '')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0).length;

  /**
   * Finalizes the sentence input, updates post headline, and triggers image & content generation.
   */
  const completeAndGenerate = (textToGenerate, showToast = true) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setIsTyping(false);
    const cleanVal = (textToGenerate !== undefined ? textToGenerate : headlineInput).trim();
    if (!cleanVal) {
      onShowToast?.({ type: 'error', message: 'Please enter a headline or sentence first.' });
      return;
    }

    onUpdateField('headline', cleanVal);
    onSyncDescriptionFromHeadline?.(cleanVal, showToast);

    setStatusMessage({
      type: 'success',
      text: `Generated graphic & content for: "${cleanVal.length > 36 ? cleanVal.slice(0, 36) + '...' : cleanVal}"`
    });

    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  const handleHeadlineChange = (newHeadline) => {
    setHeadlineInput(newHeadline);
    setIsTyping(true);

    // Immediately sync headline to canvas preview on every keystroke
    onUpdateField('headline', newHeadline);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const trimmed = newHeadline.trim();
    if (autoSyncContent && trimmed.length >= 3) {
      const hasSentencePunctuation = /[.?!]$/.test(trimmed);
      const delay = hasSentencePunctuation ? 700 : 1800;

      debounceTimerRef.current = setTimeout(() => {
        completeAndGenerate(newHeadline, false);
      }, delay);
    }
  };

  const handleHeadlineBlur = () => {
    const cleanVal = headlineInput.trim();
    const currentHeadline = (post.headline || '').trim();
    if (cleanVal && cleanVal !== currentHeadline) {
      completeAndGenerate(cleanVal, false);
    } else {
      setIsTyping(false);
    }
  };

  const handleHeadlineKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (headlineInput.trim()) {
        completeAndGenerate(headlineInput, true);
      }
    }
  };

  const handleManualSync = () => {
    const val = headlineInput.trim() || (post.headline || '').trim();
    if (!val) {
      onShowToast?.({ type: 'error', message: 'Please enter a headline or sentence first.' });
      return;
    }
    completeAndGenerate(val, true);
  };

  const handleCopyCaption = async () => {
    const ok = await exportService.copyTextToClipboard(post.caption);
    if (ok) {
      setCopiedCaption(true);
      onShowToast?.({ type: 'success', message: 'Social media caption copied to clipboard!' });
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  // --- Career Roadmap Handlers ---
  const currentStages = (Array.isArray(post.stages) && post.stages.length >= 4)
    ? post.stages
    : DEFAULT_CAREER_STAGES;

  const handleStageChange = (idx, field, val) => {
    const updated = currentStages.map((st, i) => {
      if (i === idx) {
        return { ...st, [field]: val };
      }
      return st;
    });
    onUpdateField('stages', updated);
  };

  const handleStagePointChange = (stageIdx, pointIdx, val) => {
    const updated = currentStages.map((st, i) => {
      if (i === stageIdx) {
        const newPoints = [...(st.points || [])];
        newPoints[pointIdx] = val;
        return { ...st, points: newPoints };
      }
      return st;
    });
    onUpdateField('stages', updated);
  };

  // --- Education Highlight Handlers ---
  const currentEduFeatures = (Array.isArray(post.features) && post.features.length >= 4)
    ? post.features
    : (Array.isArray(post.keyPoints) && post.keyPoints.length >= 4
        ? post.keyPoints
        : DEFAULT_EDU_HIGHLIGHTS);

  const handleEduHighlightChange = (idx, val) => {
    const updated = [...currentEduFeatures];
    updated[idx] = val;
    onUpdateField('features', updated);
    onUpdateField('keyPoints', updated);
  };

  // --- Tech stack chip handlers (Hiring) ---
  const techStackList = Array.isArray(post.techStack) && post.techStack.length > 0
    ? post.techStack
    : ['React', 'Node.js', 'Python', 'Docker', 'AWS', 'PostgreSQL', 'Kubernetes', 'Git'];

  const handleAddTechChip = () => {
    const val = newTechInput.trim();
    if (!val) return;
    if (!techStackList.includes(val)) {
      onUpdateField('techStack', [...techStackList, val]);
    }
    setNewTechInput('');
  };

  const handleRemoveTechChip = (item) => {
    onUpdateField('techStack', techStackList.filter(t => t !== item));
  };

  // --- Requirements checklist handlers (Hiring) ---
  const reqList = Array.isArray(post.requirements) && post.requirements.length > 0
    ? post.requirements
    : (Array.isArray(post.keyPoints) && post.keyPoints.length > 0
      ? post.keyPoints
      : [
          'Solid knowledge of modern technologies and frameworks.',
          'Build scalable and high-performance applications.',
          'Work collaboratively in a cross-functional team.',
          'Write clean, maintainable and reusable code.',
          'Good problem-solving and debugging skills.',
          'Eagerness to learn and adapt to new technologies.'
        ]);

  const handleReqChange = (index, value) => {
    const updated = [...reqList];
    updated[index] = value;
    onUpdateField('requirements', updated);
    onUpdateField('keyPoints', updated);
  };

  const handleAddReq = () => {
    if (reqList.length >= 7) return;
    const updated = [...reqList, 'New role requirement'];
    onUpdateField('requirements', updated);
    onUpdateField('keyPoints', updated);
  };

  const handleRemoveReq = (index) => {
    const updated = reqList.filter((_, i) => i !== index);
    onUpdateField('requirements', updated);
    onUpdateField('keyPoints', updated);
  };

  // --- Key point handlers (General, Product, Services) ---
  const handleKeyPointChange = (index, value) => {
    const updated = [...(post.keyPoints || [])];
    updated[index] = value;
    onUpdateField('keyPoints', updated);
    if (isService) {
      onUpdateField('deliverables', updated);
    }
    if (isProduct) {
      onUpdateField('features', updated.map(pt => {
        const parts = String(pt).split(/[:–]/);
        return { title: (parts[0] || '').trim(), desc: (parts.slice(1).join(' ') || '').trim() };
      }));
    }
  };

  const handleAddKeyPoint = (placeholder = 'New actionable point') => {
    if ((post.keyPoints || []).length >= 8) return;
    const updated = [...(post.keyPoints || []), placeholder];
    onUpdateField('keyPoints', updated);
    if (isService) onUpdateField('deliverables', updated);
  };

  const handleRemoveKeyPoint = (index) => {
    const updated = (post.keyPoints || []).filter((_, i) => i !== index);
    onUpdateField('keyPoints', updated);
    if (isService) onUpdateField('deliverables', updated);
  };

  const handleHashtagsChange = (value) => {
    const tags = value
      .split(/[\s,]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(t => t.startsWith('#') ? t : `#${t}`);
    onUpdateField('hashtags', tags);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 transition-all">
      {/* Header with Regenerate button & Active Mode Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-lg text-slate-900">Editable Post Content</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Live Preview Sync
            </span>
            {isRoadmap && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                Career Roadmap Mode
              </span>
            )}
            {isEducation && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Education Mode
              </span>
            )}
            {isFestival && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                Festival & Celebration Mode
              </span>
            )}
            {isProduct && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Product Showcase Mode
              </span>
            )}
            {isService && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Services Mode
              </span>
            )}
            {isHiring && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                Hiring Card Mode
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify any field below. Changes immediately update the rendered visual card.
          </p>
        </div>

        <button
          type="button"
          onClick={onRegenerateContent}
          disabled={isRegenerating}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-teal-500 bg-white hover:bg-teal-50/50 text-slate-700 hover:text-teal-800 text-xs font-semibold transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-teal-600' : ''}`} />
          <span>Regenerate Content</span>
        </button>
      </div>

      {/* Fields List */}
      <div className="space-y-4 mt-5">
        {/* 1. Headline / Topic Sentence (Always available across all post modes) */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Headline / Sentence
              </label>
              <button
                type="button"
                onClick={() => setAutoSyncContent(!autoSyncContent)}
                className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
                  autoSyncContent
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-500 hover:text-slate-700'
                }`}
                title="When ON, completing your sentence automatically generates the graphic and matching content"
              >
                <Zap className={`w-3 h-3 ${autoSyncContent ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Auto-generate: {autoSyncContent ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                {headlineInput.length} chars
              </span>
            </div>
          </div>

          {/* Input field with integrated Generate Image action button */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={headlineInput}
              onChange={(e) => handleHeadlineChange(e.target.value)}
              onBlur={handleHeadlineBlur}
              onKeyDown={handleHeadlineKeyDown}
              placeholder={
                isRoadmap
                  ? "Type engineer role... (e.g. Senior DevOps & Cloud Infrastructure Engineer)"
                  : isEducation
                  ? "Type program title... (e.g. Winter Internship Program 2026-27)"
                  : isProduct
                  ? "Type product name... (e.g. SkyPro AI Calling Agent: 50,000 Calls Every Morning)"
                  : isService
                  ? "Type enterprise service... (e.g. Enterprise Cloud Modernization & DevOps Migration)"
                  : "Type your topic sentence or role... (e.g. We're Hiring: Full Stack Developer)"
              }
              className="w-full px-4 py-3 pr-36 rounded-xl border border-slate-200 text-slate-900 font-semibold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => completeAndGenerate(headlineInput, true)}
              disabled={isRegenerating || !headlineInput.trim()}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm ${
                !headlineInput.trim() || isRegenerating
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : isTyping
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-500/25 animate-pulse'
                  : 'bg-teal-600 hover:bg-teal-700 active:scale-95'
              }`}
              title="Update template design & content once your sentence is complete"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Updating...' : 'Update Template'}</span>
              <kbd className="hidden sm:inline-block text-[10px] font-mono opacity-80 bg-white/20 px-1 rounded">↵</kbd>
            </button>
          </div>

          {/* Real-time typing & sentence completion status */}
          <div className="flex items-center justify-between text-xs mt-1.5 px-1 min-h-[20px]">
            {isTyping ? (
              <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Typing sentence... Press <strong>Enter ↵</strong> or click <strong>Update Template</strong> when complete.</span>
              </span>
            ) : statusMessage ? (
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{statusMessage.text}</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>Complete your sentence, then press <strong>Enter ↵</strong> to update template & content.</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleManualSync}
              className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 hover:underline ml-auto"
              title="Regenerate all content sections from the current headline"
            >
              <RefreshCw className="w-3 h-3 text-teal-700" />
              <span>Sync All Content</span>
            </button>
          </div>
        </div>

        {/* Featured Photo from local images_AI folder with Transparency Controls */}
        <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200/70 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt="Selected visual"
                  className="w-14 h-14 object-cover rounded-lg border border-teal-300 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-14 h-14 bg-teal-100/80 rounded-lg flex items-center justify-center text-xl shrink-0">
                  📸
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-teal-950 block">
                  {post.localFolder?.label || 'Topic Matched Photo'}
                </span>
                <span className="text-[11px] text-teal-800 block truncate max-w-[220px]" title={post.imageUrl || ''}>
                  {post.imageUrl ? decodeURI(post.imageUrl.split('/').pop()) : 'Auto Matched from images_AI'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => {
                  const currentIdx = post.localImageIndex ?? 0;
                  const match = pickImageForTopic(post.headline || '', post.category, currentIdx - 1);
                  if (match?.image?.url) {
                    onUpdateField('imageUrl', match.image.url);
                    onUpdateField('localImageIndex', match.index);
                    onUpdateField('localFolder', match.folder);
                    onShowToast?.({ type: 'info', message: `Photo: ${match.image.name}` });
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-bold shadow-xs active:scale-95"
                title="Previous photo in folder"
              >
                ◀ Prev Photo
              </button>
              <button
                type="button"
                onClick={() => {
                  const currentIdx = post.localImageIndex ?? 0;
                  const match = pickImageForTopic(post.headline || '', post.category, currentIdx + 1);
                  if (match?.image?.url) {
                    onUpdateField('imageUrl', match.image.url);
                    onUpdateField('localImageIndex', match.index);
                    onUpdateField('localFolder', match.folder);
                    onShowToast?.({ type: 'info', message: `Photo: ${match.image.name}` });
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs active:scale-95"
                title="Next photo in folder"
              >
                Next Photo ▶
              </button>
            </div>
          </div>

          {/* Quick Transparency Bar */}
          <div className="pt-2 border-t border-teal-200/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[11px] font-semibold text-teal-900">Poster Card Transparency:</span>
            <div className="flex items-center gap-1">
              {[
                { label: '👻 Transparent (No Box)', val: 0.0 },
                { label: '🌌 Subtle Tint (15%)', val: 0.15 },
                { label: '💎 Light Glass (35%)', val: 0.35 },
                { label: '✨ Frosted (65%)', val: 0.65 }
              ].map((opt) => {
                const currentVal = post.cardOpacity ?? 0.0;
                const isSelected = Math.abs(currentVal - opt.val) < 0.05;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      onUpdateField('cardOpacity', opt.val);
                      onShowToast?.({ type: 'info', message: `Card transparency: ${opt.label}` });
                    }}
                    className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition-all ${
                      isSelected
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-white text-teal-900 hover:bg-teal-100 border border-teal-200/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* A. CAREER ROADMAP ("Life of an Engineer" 0 to 10+ Yrs Progression)        */}
        {/* ========================================================================= */}
        {isRoadmap && (
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/70 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-purple-200/50">
              <TrendingUp className="w-4 h-4 text-purple-700" />
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                Career Roadmap Progression (0 to 10+ Yrs)
              </span>
              <span className="text-[10px] text-purple-600 font-medium ml-auto">
                Renders on the diagonal career curve
              </span>
            </div>

            {/* Title, Subtitle & Quote Header Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Role Title (Life of a ...)
                </label>
                <input
                  type="text"
                  value={post.roleTitle || post.role || post.headline || 'DevOps Engineer'}
                  onChange={(e) => {
                    onUpdateField('roleTitle', e.target.value);
                    onUpdateField('role', e.target.value);
                  }}
                  placeholder="e.g. DevOps Engineer"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Progression Subtitle
                </label>
                <input
                  type="text"
                  value={post.description || 'From Automation to Impact'}
                  onChange={(e) => onUpdateField('description', e.target.value)}
                  placeholder="e.g. From Automation to Impact"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Hero Quote
                </label>
                <input
                  type="text"
                  value={post.quote || 'Same Engineer. Different Responsibilities. Bigger Impact.'}
                  onChange={(e) => onUpdateField('quote', e.target.value)}
                  placeholder="e.g. Same Engineer. Different Responsibilities. Bigger Impact."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>
            </div>

            {/* 6 Career Progression Stages Navigator & Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>6 Career Milestones (Click tab to customize stage)</span>
                </label>
                <span className="text-[10px] text-purple-600 font-medium">
                  Stage {activeStageIndex + 1} of 6
                </span>
              </div>

              {/* Stage Selection Pills */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-3">
                {currentStages.map((st, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveStageIndex(i)}
                    className={`px-2 py-1.5 rounded-lg text-left transition-all border ${
                      activeStageIndex === i
                        ? 'bg-purple-600 text-white border-purple-700 shadow-sm font-bold'
                        : 'bg-white text-slate-700 hover:bg-purple-100/60 border-purple-200/60 font-semibold'
                    }`}
                  >
                    <div className="text-[9px] opacity-80 leading-tight">Stage {i + 1}</div>
                    <div className="text-[10px] truncate leading-tight font-bold">{st.years || `${i * 2}-${i * 2 + 2} yrs`}</div>
                  </button>
                ))}
              </div>

              {/* Active Stage Details Editor Card */}
              {currentStages[activeStageIndex] && (
                <div className="p-3.5 bg-white rounded-xl border border-purple-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Stage Role Name
                      </label>
                      <input
                        type="text"
                        value={currentStages[activeStageIndex].role || ''}
                        onChange={(e) => handleStageChange(activeStageIndex, 'role', e.target.value)}
                        placeholder="e.g. Junior DevOps"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Experience Range
                      </label>
                      <input
                        type="text"
                        value={currentStages[activeStageIndex].years || ''}
                        onChange={(e) => handleStageChange(activeStageIndex, 'years', e.target.value)}
                        placeholder="e.g. 0 - 2 yrs"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Milestone Badge (3 Keywords)
                      </label>
                      <input
                        type="text"
                        value={currentStages[activeStageIndex].badge || ''}
                        onChange={(e) => handleStageChange(activeStageIndex, 'badge', e.target.value)}
                        placeholder="e.g. Learn • Explore • Build"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* 4 Bullet Points for this Stage */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Action Responsibilities on Poster (4 Points)
                    </label>
                    <div className="space-y-1.5">
                      {(currentStages[activeStageIndex].points || []).map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {pIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={pt}
                            onChange={(e) => handleStagePointChange(activeStageIndex, pIdx, e.target.value)}
                            placeholder={`Point ${pIdx + 1} (e.g. Writes first CI/CD pipeline)`}
                            className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* B. EDUCATION / INTERNSHIP DEDICATED FIELDS                                */}
        {/* ========================================================================= */}
        {isEducation && (
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/70 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-blue-200/50">
              <GraduationCap className="w-4 h-4 text-blue-700" />
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Education & Campus Cohort Specs
              </span>
              <span className="text-[10px] text-blue-600 font-medium ml-auto">
                Directly rendered on certificate & timeline
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Program Title
                </label>
                <input
                  type="text"
                  value={post.programTitle || post.headline || 'Winter Internship Program 2026-27'}
                  onChange={(e) => {
                    onUpdateField('programTitle', e.target.value);
                    onUpdateField('headline', e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Cohort Timeline Months
                </label>
                <input
                  type="text"
                  value={post.months || 'November • December • January'}
                  onChange={(e) => onUpdateField('months', e.target.value)}
                  placeholder="e.g. November • December • January"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Program Tagline / Kicker
                </label>
                <input
                  type="text"
                  value={post.kicker || post.description || 'Turn Your Winter Into A Real Opportunity'}
                  onChange={(e) => onUpdateField('kicker', e.target.value)}
                  placeholder="e.g. Turn Your Winter Into A Real Opportunity"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Status Stamp / Badge
                </label>
                <input
                  type="text"
                  value={post.badge || post.status || 'Registrations Open'}
                  onChange={(e) => {
                    onUpdateField('badge', e.target.value);
                    onUpdateField('status', e.target.value);
                  }}
                  placeholder="e.g. Registrations Open"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Student Hero Quote
                </label>
                <input
                  type="text"
                  value={post.quote || 'Same Winter. A Brighter You!'}
                  onChange={(e) => onUpdateField('quote', e.target.value)}
                  placeholder="e.g. Same Winter. A Brighter You!"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            {/* 6 Program Highlight Cards (2 Columns x 3 Rows on Poster) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                6 Program Highlight Cards (Directly on Poster)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentEduFeatures.slice(0, 6).map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {fIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => handleEduHighlightChange(fIdx, e.target.value)}
                      placeholder={`Highlight ${fIdx + 1}...`}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* C. PRODUCTS & LAUNCH DEDICATED FIELDS                                     */}
        {/* ========================================================================= */}
        {isProduct && (
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-amber-200/50">
              <Rocket className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Product Showcase & Feature Highlights
              </span>
              <span className="text-[10px] text-amber-600 font-medium ml-auto">
                Directly rendered on product poster
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Product / Platform Name
                </label>
                <input
                  type="text"
                  value={post.headline || post.productName || 'SkyPro AI Calling Agent'}
                  onChange={(e) => {
                    onUpdateField('headline', e.target.value);
                    onUpdateField('productName', e.target.value);
                  }}
                  placeholder="e.g. SkyPro AI Calling Agent"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tagline / Value Proposition
                </label>
                <input
                  type="text"
                  value={post.headlinePrefix || post.tagline || '50,000 Calls Every Morning. AI Can.'}
                  onChange={(e) => {
                    onUpdateField('headlinePrefix', e.target.value);
                    onUpdateField('tagline', e.target.value);
                  }}
                  placeholder="e.g. 50,000 Calls Every Morning. AI Can."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>

            {/* 4 Key Product Features */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700">
                  4 Key Product Features / Capabilities (On Card)
                </label>
                {(post.keyPoints || []).length < 4 && (
                  <button
                    type="button"
                    onClick={() => handleAddKeyPoint('New Product Feature: Subtitle')}
                    className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Feature</span>
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {(post.keyPoints && post.keyPoints.length > 0 ? post.keyPoints : [
                  'Sub-500ms Voice Latency: Natural conversational engine that speaks & listens',
                  'Instant CRM Integration: Automatically logs caller intent to Salesforce & HubSpot',
                  '50,000+ Concurrent Calls: Enterprise-scale auto-scaling cloud infrastructure',
                  'Multilingual Intelligence: Fluent real-time communication across 40+ global languages'
                ]).slice(0, 4).map((pt, pIdx) => (
                  <div key={pIdx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {pIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={pt}
                      onChange={(e) => handleKeyPointChange(pIdx, e.target.value)}
                      placeholder="Feature Title: Short description..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    {(post.keyPoints || []).length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyPoint(pIdx)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* D. SERVICES & SOLUTIONS DEDICATED FIELDS                                  */}
        {/* ========================================================================= */}
        {isService && (
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-emerald-200/50">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Services & Solutions Specifications
              </span>
              <span className="text-[10px] text-emerald-600 font-medium ml-auto">
                Directly rendered on service poster
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Service / Practice Name
                </label>
                <input
                  type="text"
                  value={post.headline || post.serviceName || 'Enterprise Cloud & DevOps Consulting'}
                  onChange={(e) => {
                    onUpdateField('headline', e.target.value);
                    onUpdateField('serviceName', e.target.value);
                  }}
                  placeholder="e.g. Enterprise Cloud & DevOps Consulting"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Value Proposition / SLA Tagline
                </label>
                <input
                  type="text"
                  value={post.headlinePrefix || post.tagline || 'Zero-Downtime Infrastructure Modernization'}
                  onChange={(e) => {
                    onUpdateField('headlinePrefix', e.target.value);
                    onUpdateField('tagline', e.target.value);
                  }}
                  placeholder="e.g. Zero-Downtime Infrastructure Modernization"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            {/* 4 Core Deliverables & ROI Metrics */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700">
                  4 Core Service Deliverables / ROI Metrics
                </label>
                {(post.keyPoints || []).length < 4 && (
                  <button
                    type="button"
                    onClick={() => handleAddKeyPoint('Deliverable: 99.99% SLA')}
                    className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Deliverable</span>
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {(post.keyPoints && post.keyPoints.length > 0 ? post.keyPoints : [
                  '99.99% Uptime Guarantee: Multi-region active-active clusters with automated failover',
                  '35% Cloud Cost Reduction: Continuous FinOps rightsizing, spot optimization and waste elimination',
                  'Zero-Downtime Migration: Battle-tested database cutover and live traffic transition playbooks',
                  '24/7 Managed SOC: Proactive real-time threat hunting, SLA response and compliance monitoring'
                ]).slice(0, 4).map((pt, pIdx) => (
                  <div key={pIdx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {pIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={pt}
                      onChange={(e) => handleKeyPointChange(pIdx, e.target.value)}
                      placeholder="Deliverable Title: Description & metrics..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    {(post.keyPoints || []).length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyPoint(pIdx)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hotline Phone & Website URL on Services Poster */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/50">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Website URL / Link (Pill Button)
                </label>
                <input
                  type="text"
                  value={post.websiteUrl || 'www.nextgensolutions.com'}
                  onChange={(e) => onUpdateField('websiteUrl', e.target.value)}
                  placeholder="e.g. www.nextgensolutions.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Hotline / Contact Number (Yellow Bar / CTA)
                </label>
                <input
                  type="text"
                  value={post.phone || post.cta || '+92 314 3113216'}
                  onChange={(e) => {
                    onUpdateField('phone', e.target.value);
                    onUpdateField('cta', e.target.value);
                  }}
                  placeholder="e.g. +92 314 3113216"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* E. HIRING & JOBS DEDICATED FIELDS                                         */}
        {/* ========================================================================= */}
        {isHiring && (
          <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-200/60 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-teal-200/50">
              <Briefcase className="w-4 h-4 text-teal-700" />
              <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                Hiring Card Specifications
              </span>
              <span className="text-[10px] text-teal-600 font-medium ml-auto">
                Directly rendered on the template
              </span>
            </div>

            {/* Role, Experience & Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Job Role / Position
                </label>
                <input
                  type="text"
                  value={post.role || post.headline || ''}
                  onChange={(e) => onUpdateField('role', e.target.value)}
                  placeholder="e.g. Cloud & DevOps Engineer"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Experience Required
                </label>
                <input
                  type="text"
                  value={post.experience || '0 - 3 Years'}
                  onChange={(e) => onUpdateField('experience', e.target.value)}
                  placeholder="e.g. 0 - 3 Years / Freshers"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Location & Work Mode
                </label>
                <input
                  type="text"
                  value={post.location || 'Bengaluru / Remote'}
                  onChange={(e) => onUpdateField('location', e.target.value)}
                  placeholder="e.g. Bengaluru / Remote / Hybrid"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>

            {/* Salary Breakdown & Job Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Experienced CTC / Salary
                </label>
                <input
                  type="text"
                  value={post.salary || '₹6 - 12 LPA (Experienced)'}
                  onChange={(e) => onUpdateField('salary', e.target.value)}
                  placeholder="e.g. ₹6 - 12 LPA"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Fresher CTC (If applicable)
                </label>
                <input
                  type="text"
                  value={post.fresherSalary || '₹4 - 6 LPA (Fresher)'}
                  onChange={(e) => onUpdateField('fresherSalary', e.target.value)}
                  placeholder="e.g. ₹4 - 6 LPA"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Employment Type
                </label>
                <input
                  type="text"
                  value={post.jobType || 'Full-time | Contractual'}
                  onChange={(e) => onUpdateField('jobType', e.target.value)}
                  placeholder="e.g. Full-Time | Contractual"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>

            {/* Qualification & Industry (Directly rendered on hiring templates) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Qualification Required
                </label>
                <input
                  type="text"
                  value={post.qualification || 'Graduate'}
                  onChange={(e) => onUpdateField('qualification', e.target.value)}
                  placeholder="e.g. Graduate / B.Tech / MBA"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Industry / Domain
                </label>
                <input
                  type="text"
                  value={post.industry || 'Edtech'}
                  onChange={(e) => onUpdateField('industry', e.target.value)}
                  placeholder="e.g. Edtech / SaaS / FinTech"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>

            {/* Tech Stack Chips Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-teal-700" />
                  <span>Tech Stack ({techStackList.length} technologies on poster)</span>
                </label>
                <span className="text-[10px] text-slate-400">Click × to remove, type below to add</span>
              </div>

              {/* Badges list */}
              <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-white rounded-lg border border-teal-200/50 min-h-[38px]">
                {techStackList.map((tech, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-50 text-teal-900 text-xs font-semibold border border-teal-200"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTechChip(tech)}
                      className="text-teal-600 hover:text-rose-600 transition-colors ml-0.5"
                      title="Remove technology"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add custom tech input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTechInput}
                  onChange={(e) => setNewTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTechChip();
                    }
                  }}
                  placeholder="Add technology (e.g. Docker, Terraform, Kubernetes, AWS, Python, React)..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
                <button
                  type="button"
                  onClick={handleAddTechChip}
                  disabled={!newTechInput.trim()}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold disabled:opacity-50 transition-all flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Tech</span>
                </button>
              </div>
            </div>

            {/* Requirements / What We're Looking For */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700">
                  What We're Looking For ({reqList.length} checklist bullets on poster)
                </label>
                {reqList.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddReq}
                    className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Requirement</span>
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {reqList.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                      ✓
                    </span>
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleReqChange(idx, e.target.value)}
                      placeholder="Brief requirement (max 10-14 words)..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                    {reqList.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveReq(idx)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Remove requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* F. GENERAL POST FIELDS (When Knowledge or General Style)                  */}
        {/* ========================================================================= */}
        {isGeneral && (
          <div className="space-y-4">
            {/* Supporting Key Points */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {isBeforeAfter ? 'Before & After Transformation Points' : 'Key Points (Supporting Section)'}
                  </label>
                  <button
                    type="button"
                    onClick={onRegenerateKeyPoints || handleManualSync}
                    className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 hover:underline px-1.5 py-0.5 rounded hover:bg-teal-50"
                    title="Generate fresh key points matching the headline"
                  >
                    <Sparkles className="w-3 h-3 text-teal-700" />
                    <span>Auto-generate from headline</span>
                  </button>
                </div>
                {(post.keyPoints || []).length < 4 && (
                  <button
                    type="button"
                    onClick={() => handleAddKeyPoint(isBeforeAfter ? 'New transformation takeaway' : 'New key supporting takeaway')}
                    className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Point</span>
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {(post.keyPoints || []).map((pt, idx) => {
                  const isBeforePoint = isBeforeAfter && idx < 2;
                  const isAfterPoint = isBeforeAfter && idx >= 2;
                  return (
                    <div key={idx} className="flex items-start gap-2.5">
                      {isBeforePoint ? (
                        <span className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1 whitespace-nowrap">
                          🔴 Before #{idx + 1}
                        </span>
                      ) : isAfterPoint ? (
                        <span className="px-2 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1 whitespace-nowrap">
                          🟢 After #{idx - 1}
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-200/60 text-teal-800 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                          {idx + 1}
                        </span>
                      )}
                      <textarea
                        rows={2}
                        value={pt}
                        onChange={(e) => handleKeyPointChange(idx, e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 leading-snug resize-none font-medium bg-slate-50/40 focus:bg-white transition-colors"
                        placeholder={isBeforePoint ? "Before problem / friction point..." : isAfterPoint ? "After outcome / AI breakthrough..." : "Key supporting point..."}
                      />
                      {(post.keyPoints || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyPoint(idx)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors mt-1"
                          title="Remove point"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* COMMON DESCRIPTION (Available in all non-roadmap modes)                   */}
        {/* ========================================================================= */}
        {!isRoadmap && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Description
                </label>
                <button
                  type="button"
                  onClick={handleManualSync}
                  className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 hover:underline px-1.5 py-0.5 rounded hover:bg-teal-50"
                  title="Regenerate description and key points to match the headline"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-generate from headline</span>
                </button>
              </div>
              <span className={`text-[11px] font-medium ${descWords >= 40 && descWords <= 75 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {descWords} words (Target: 40–70)
              </span>
            </div>
            <textarea
              rows={3}
              value={post.description || ''}
              onChange={(e) => onUpdateField('description', e.target.value)}
              placeholder="Professional post description..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all leading-relaxed"
            />
          </div>
        )}

        {/* Call to Action (CTA) - Tailored for active mode */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Call to Action (CTA)
              </label>
              <button
                type="button"
                onClick={onRegenerateCta || handleManualSync}
                className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 hover:underline px-1.5 py-0.5 rounded hover:bg-teal-50"
                title="Generate fresh Call to Action matching the headline"
              >
                <Sparkles className="w-3 h-3 text-teal-700" />
                <span>Auto-generate from headline</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-400">
              Live button preview on image
            </span>
          </div>
          <input
            type="text"
            value={post.cta || ''}
            onChange={(e) => {
              onUpdateField('cta', e.target.value);
              onUpdateField('ctaText', e.target.value);
            }}
            placeholder={
              isRoadmap
                ? 'e.g. Follow for More Engineering Roadmaps | Join Our Team'
                : isEducation
                ? 'e.g. Apply Now → maincrafts.com/programs'
                : isProduct
                ? 'e.g. Try SkyPro Free Today →'
                : isService
                ? 'e.g. Schedule Free Architecture Review →'
                : isHiring
                ? 'e.g. Comment "DEVOPS" if you\'re interested! or Send your resume →'
                : 'e.g. Discover How Cloud AI Solutions Drive Growth →'
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[
              'Apply Now',
              'Get Started',
              'Follow InfiniteTech AI',
              'Schedule a Call',
              'Register Today',
              'Send Your Resume',
              'Claim 50% Off'
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  onUpdateField('cta', preset);
                  onUpdateField('ctaText', preset);
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all ${
                  (post.cta || '').toLowerCase() === preset.toLowerCase()
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-500 hover:text-teal-700'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Top & Bottom Wave Divider Style (User Requested Wave & Hanging Lights) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Top & Bottom Wave Frame</span>
            </label>
            <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Active Style
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'lights', label: '✨ Waves + Lights', desc: 'Garland & hanging lamps' },
              { id: 'wave', label: '🌊 Fluid Waves', desc: 'Curved top & bottom' },
              { id: 'straight', label: '➖ Straight Lines', desc: 'Minimal clean borders' }
            ].map((styleOpt) => (
              <button
                key={styleOpt.id}
                type="button"
                onClick={() => onUpdateField('footerStyle', styleOpt.id)}
                className={`p-2 rounded-xl text-left border transition-all ${
                  (post.footerStyle || 'lights') === styleOpt.id
                    ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-500 hover:bg-teal-50/40'
                }`}
              >
                <div className="text-xs font-bold">{styleOpt.label}</div>
                <div className={`text-[10px] font-normal mt-0.5 ${
                  (post.footerStyle || 'lights') === styleOpt.id ? 'text-teal-100' : 'text-slate-600'
                }`}>
                  {styleOpt.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Hashtags */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Hash className="w-3 h-3 text-slate-400" />
              <span>Hashtags</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {(post.hashtags || []).length} tags
            </span>
          </div>
          <input
            type="text"
            value={(post.hashtags || []).join(' ')}
            onChange={(e) => handleHashtagsChange(e.target.value)}
            placeholder={
              isRoadmap
                ? '#DevOps #CareerRoadmap #CloudEngineer #TechCareers'
                : isEducation
                ? '#Internship #CampusHiring #WinterInternship #Freshers'
                : isProduct
                ? '#AI #ProductLaunch #SaaS #Automation #TechInnovation'
                : isService
                ? '#CloudConsulting #DevOps #EnterpriseAI #Migration'
                : '#Hiring #DevOps #CloudEngineering #TechJobs'
            }
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-mono"
          />
        </div>

        {/* Social Media Caption (Ready to Publish) */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
              <span>Social Media Caption (Ready to Publish)</span>
            </label>
            <button
              type="button"
              onClick={handleCopyCaption}
              className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
            >
              {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
            </button>
          </div>
          <textarea
            rows={5}
            value={post.caption || ''}
            onChange={(e) => onUpdateField('caption', e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-slate-700 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 leading-relaxed font-sans"
          />
        </div>
      </div>

      {/* Engine Transparency Notice */}
      <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          Generated using {post.source === 'groq' ? 'Groq LPU + Pollinations AI' : post.source === 'ollama' ? 'Ollama Local AI model' : 'PostCraft Built-in Template Engine'}.
        </span>
      </div>
    </div>
  );
}
