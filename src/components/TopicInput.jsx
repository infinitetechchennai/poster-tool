import React, { useState } from 'react';
import { Sparkles, Trash2, Layers, Lightbulb, ArrowRight, CornerDownLeft } from 'lucide-react';
import { SAMPLE_TOPICS, BULK_SAMPLE_TOPICS } from '../utils/sampleTopics';
import { POST_CATEGORIES, getCategoryById, detectCategoryFromTopic } from '../utils/categories';
import { findMatchingFolder } from '../utils/localAiImages';

export default function TopicInput({
  topic,
  setTopic,
  onGenerateSingle,
  onGenerateBulk,
  isGenerating,
  mode = 'single',
  setMode,
  selectedCategory = 'hiring',
  onSelectCategory,
  onCycleImage,
  currentFolder,
  currentImageIndex = 0,
  totalImages = 0
}) {
  const [activeChipIndex, setActiveChipIndex] = useState(null);

  const activeCat = getCategoryById(selectedCategory);
  const matchedFolder = currentFolder || findMatchingFolder(topic, selectedCategory);

  const handleClear = () => {
    setTopic('');
    setActiveChipIndex(null);
  };

  const handleSelectSample = (sampleText, index) => {
    setTopic(sampleText);
    setActiveChipIndex(index);
  };

  const handleBulkPreset = () => {
    setTopic(BULK_SAMPLE_TOPICS);
  };

  const handleCategoryClick = (catId) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    setActiveChipIndex(null);
  };

  // Count lines for multiple mode
  const topicLines = topic
    .split('\n')
    .map(t => t.trim())
    .filter(t => t.length > 0);
  const topicCount = topicLines.length;

  // Use category sample topics if available, otherwise fallback to general sample topics
  const currentSamples = (activeCat?.sampleTopics && activeCat.sampleTopics.length > 0)
    ? activeCat.sampleTopics
    : SAMPLE_TOPICS.slice(0, 6).map(s => s.topic);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 sm:p-7 transition-all">
      {/* Mode Selector & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
        <div>
          <label className="block text-base sm:text-lg font-display font-bold text-slate-900">
            What do you want to post about?
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a category, enter your topic, and PostCraft AI will structure the perfect content & branded graphic.
          </p>
        </div>

        {/* Mode Selector Pill */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto border border-slate-200/70">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === 'single'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Single Topic
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('multiple');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === 'multiple'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Multiple Topics</span>
          </button>
        </div>
      </div>

      {/* Category Selector Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Post Category
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {activeCat.description}
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {POST_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300'
                  }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Field */}
      <div className="relative">
        {mode === 'single' ? (
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setActiveChipIndex(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isGenerating && topic.trim()) {
                  onGenerateSingle();
                }
              }}
              placeholder="Enter a topic, title, heading, or keyword... e.g. How AI Automation Helps Businesses Grow"
              className="w-full px-4 py-3.5 pr-28 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            {topic && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Clear input"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <textarea
              rows={5}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={`Enter one topic per line (up to 20 topics):\nAI in Healthcare\nBenefits of Cloud Computing\nImportance of Cybersecurity\nBusiness Process Automation\nFuture of Artificial Intelligence`}
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all font-mono leading-relaxed"
            />
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1 px-1">
              <span>{topicCount} / 20 topics detected</span>
              <button
                type="button"
                onClick={handleBulkPreset}
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                + Paste 8 Sample Topics
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Matched Local Images_AI Folder Pill */}
      {mode === 'single' && matchedFolder && matchedFolder.files && matchedFolder.files.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 px-3.5 py-2 bg-teal-50/80 border border-teal-200/70 rounded-xl text-xs text-teal-950 transition-all">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-bold text-teal-800">
              📸 <span className="font-extrabold">{matchedFolder.label}</span>
            </span>
            <span className="text-[11px] text-teal-700 bg-teal-100/90 px-2 py-0.5 rounded-full font-semibold">
              {matchedFolder.files.length} images
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-teal-800 font-medium">
              Photo {((currentImageIndex ?? 0) % matchedFolder.files.length) + 1} of {matchedFolder.files.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onCycleImage?.(-1)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-100 text-teal-900 border border-teal-200 shadow-xs font-bold transition-all text-xs active:scale-95"
                title="Previous photo in folder"
              >
                ◀ Prev
              </button>
              <button
                type="button"
                onClick={() => onCycleImage?.(1)}
                className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-xs text-xs active:scale-95"
                title="Next photo in folder"
              >
                Next Photo ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sample Quick-Picks (Single Mode) tailored to Category */}
      {mode === 'single' && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Try these {activeCat.label} ideas:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentSamples.map((sampleText, idx) => {
              const isSelected = activeChipIndex === idx || topic === sampleText;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sampleText, idx)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${isSelected
                      ? 'border-teal-500 bg-teal-50 text-teal-800 font-semibold shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  <span>{sampleText}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {mode === 'single' ? (
          <button
            type="button"
            disabled={!topic.trim() || isGenerating}
            onClick={onGenerateSingle}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-display font-semibold text-sm text-white transition-all shadow-md shadow-blue-500/20 ${!topic.trim() || isGenerating
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.99]'
              }`}
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating Content & Image...' : 'Generate Post'}</span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono opacity-80 bg-white/20 px-1.5 py-0.5 rounded">↵ Enter</kbd>
          </button>
        ) : (
          <button
            type="button"
            disabled={topicCount === 0 || isGenerating}
            onClick={onGenerateBulk}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-display font-semibold text-sm text-white transition-all shadow-md shadow-purple-500/20 ${topicCount === 0 || isGenerating
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-purple-500/30 active:scale-[0.99]'
              }`}
          >
            <Layers className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? `Generating ${topicCount} Posts...` : `Generate All ${topicCount} Posts`}</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium text-sm transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
