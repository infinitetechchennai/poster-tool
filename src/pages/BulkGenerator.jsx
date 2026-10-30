import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Sparkles,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit3,
  Eye,
  Trash2,
  X,
  Image as ImageIcon,
  Wand2,
  Palette,
  Layout,
  Check,
  Copy,
  Plus,
  RotateCcw,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { BULK_SAMPLE_TOPICS } from '../utils/sampleTopics';
import { generatePostContent, generateMatchingDescription, buildContextualImagePrompt } from '../services/contentGenerator';
import { groqService } from '../services/groqService';
import { pollinationsService } from '../services/pollinationsService';
import { ollamaService } from '../services/ollamaService';
import { renderPostToCanvas } from '../services/imageRenderer';
import { DESIGN_STYLES, COLOR_PALETTES, IMAGE_DIMENSIONS } from '../utils/designTemplates';
import { exportService } from '../services/exportService';
import { storageService } from '../services/storageService';
import PostCard from '../components/PostCard';

export default function BulkGenerator({
  brand,
  appSettings,
  onShowToast,
  onOpenInEditor,
  initialBulkText = ''
}) {
  const [inputText, setInputText] = useState(initialBulkText || BULK_SAMPLE_TOPICS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '', step: '' });
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [isZipping, setIsZipping] = useState(false);
  const [previewModalPost, setPreviewModalPost] = useState(null);
  const [editModalPost, setEditModalPost] = useState(null);
  const [regeneratingPostId, setRegeneratingPostId] = useState(null);
  const [isModalRegenerating, setIsModalRegenerating] = useState(false);
  const [isModalImageLoading, setIsModalImageLoading] = useState(false);

  // Batch design settings
  const [batchStyle, setBatchStyle] = useState('diverse'); // 'diverse' or specific style ID
  const [batchFormat, setBatchFormat] = useState(brand?.preferredFormat || 'linkedin-square');
  const [batchPalette, setBatchPalette] = useState('diverse');
  const [generateAiImages, setGenerateAiImages] = useState(true);

  // Modal Canvas reference for live preview
  const modalCanvasRef = useRef(null);

  // Parse lines into clean topics (max 20)
  const topicsList = inputText
    .split('\n')
    .map(line => line.replace(/^[\d.)\s*-]+/, '').trim())
    .filter(line => line.length > 0)
    .slice(0, 20);

  // Re-render modal preview canvas whenever editModalPost changes
  useEffect(() => {
    if (!editModalPost || !modalCanvasRef.current) return;
    let isCancelled = false;

    const updateModalCanvas = async () => {
      try {
        await renderPostToCanvas({
          canvas: modalCanvasRef.current,
          post: editModalPost,
          brand,
          styleId: editModalPost.styleId || 'common-01',
          formatId: editModalPost.formatId || 'linkedin-square',
          colorPaletteId: editModalPost.colorPaletteId || 'brand',
          bgPattern: editModalPost.bgPattern || 'grid',
          highResScale: 1
        });
      } catch (err) {
        console.error('Modal canvas render error:', err);
      }
    };

    updateModalCanvas();
    return () => { isCancelled = true; };
  }, [editModalPost?.headline, editModalPost?.description, editModalPost?.imageUrl, editModalPost?.styleId, editModalPost?.formatId, editModalPost?.colorPaletteId]);

  /**
   * Helper: Generate a single post with Groq AI / Ollama / Template and Pollinations AI Image
   */
  const generateSinglePostRecord = async (topicStr, index, total) => {
    const isLikelyHeadline = topicStr.trim().split(/\s+/).length >= 4;
    let content = null;

    // 1. Try Groq AI (Ultra-fast content + custom visual prompt)
    if (groqService.getApiKey()) {
      try {
        const groqRes = await groqService.generatePostAndImagePrompt(topicStr, brand, isLikelyHeadline);
        if (groqRes.success && groqRes.data) {
          content = groqRes.data;
          if (generateAiImages && content.imagePrompt) {
            content.imageUrl = pollinationsService.buildImageUrl(content.imagePrompt, 800, 1000);
          }
        }
      } catch (e) {
        console.warn(`Groq generation failed for "${topicStr}":`, e);
      }
    }

    // 2. Try Ollama AI if enabled
    if (!content && appSettings?.ollamaEnabled) {
      try {
        const ollamaRes = await ollamaService.generateContent(
          topicStr,
          appSettings.ollamaModel,
          appSettings.ollamaUrl,
          brand
        );
        if (ollamaRes.success) {
          content = ollamaRes.data;
        }
      } catch (e) {
        console.warn(`Ollama generation failed for "${topicStr}":`, e);
      }
    }

    // 3. Fallback to built-in template generator
    if (!content) {
      content = generatePostContent(topicStr, brand, index);
    }

    // Clean headlinePrefix
    if (content.headlinePrefix === "Imagine More. Achieve More with AI." || content.headlinePrefix === "Your Business Can't Miss") {
      content.headlinePrefix = "";
    }

    if (!content.cta || /^book\s+(your\s+|a\s+)?demo/i.test(content.cta)) {
      content.cta = 'Explore More';
    }

    // Ensure AI Image URL if enabled
    if (generateAiImages && !content.imageUrl) {
      const defaultVisualPrompt = buildContextualImagePrompt(content.headline || topicStr, content.categoryName, topicStr);
      content.imageUrl = pollinationsService.buildImageUrl(defaultVisualPrompt, 800, 1000);
      content.imagePrompt = defaultVisualPrompt;
    }

    // Resolve Style
    let style;
    if (batchStyle === 'diverse') {
      style = DESIGN_STYLES[index % DESIGN_STYLES.length];
      if (/skypro|calling agent|voice agent|app|saas|platform/i.test(topicStr)) {
        const prodStyle = DESIGN_STYLES.find(s => s.id === 'product-01');
        if (prodStyle) style = prodStyle;
      } else if (/hiring|career|job|recruit|opening|vacancy|join our team/i.test(topicStr)) {
        const hiringStyles = DESIGN_STYLES.filter(s => s.id.startsWith('hiring-'));
        if (hiringStyles.length > 0) {
          style = hiringStyles[index % hiringStyles.length];
        }
      }
    } else {
      style = DESIGN_STYLES.find(s => s.id === batchStyle) || DESIGN_STYLES[0];
    }

    // Resolve Palette
    let palette;
    if (batchPalette === 'diverse') {
      palette = COLOR_PALETTES[(index % (COLOR_PALETTES.length - 1)) + 1];
    } else {
      palette = COLOR_PALETTES.find(p => p.id === batchPalette) || COLOR_PALETTES[0];
    }

    const patterns = ['grid', 'dots', 'glow', 'angles', 'subtle'];
    const pattern = patterns[index % patterns.length];

    // Render to offscreen canvas
    const offscreenCanvas = document.createElement('canvas');
    await renderPostToCanvas({
      canvas: offscreenCanvas,
      post: content,
      brand,
      styleId: style.id,
      formatId: batchFormat,
      colorPaletteId: palette.id,
      bgPattern: pattern,
      highResScale: 1
    });

    const dataUrl = offscreenCanvas.toDataURL('image/png', 0.9);

    return {
      ...content,
      id: `bulk_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 4)}`,
      styleId: style.id,
      formatId: batchFormat,
      colorPaletteId: palette.id,
      bgPattern: pattern,
      dataUrl,
      createdAt: new Date().toISOString()
    };
  };

  /**
   * Bulk generate all posts
   */
  const handleGenerateAll = async () => {
    if (topicsList.length === 0) {
      onShowToast?.({ type: 'error', message: 'Please enter at least one topic.' });
      return;
    }

    setIsGenerating(true);
    setProgress({ current: 0, total: topicsList.length, status: 'Initializing generation...', step: '' });
    const results = [];

    for (let i = 0; i < topicsList.length; i++) {
      const topicStr = topicsList[i];
      setProgress({
        current: i + 1,
        total: topicsList.length,
        status: `Post ${i + 1} of ${topicsList.length}`,
        step: `Synthesizing copy & 3D AI visual for "${topicStr.slice(0, 32)}..."`
      });

      try {
        const postRecord = await generateSinglePostRecord(topicStr, i, topicsList.length);
        results.push(postRecord);
        // Progressively display results so users can see completed cards immediately
        setGeneratedPosts([...results]);
      } catch (err) {
        console.error(`Error generating post for "${topicStr}":`, err);
      }
    }

    setIsGenerating(false);
    onShowToast?.({
      type: 'success',
      message: `Successfully synthesized ${results.length} posts with AI copy & 3D visuals!`
    });
  };

  /**
   * Per-Post: Regenerate AI Image with Pollinations AI
   */
  const handleRegeneratePostImage = async (postToUpdate) => {
    if (!postToUpdate) return;
    setRegeneratingPostId(postToUpdate.id);

    try {
      // Build fresh prompt with new seed
      const prompt = postToUpdate.imagePrompt || buildContextualImagePrompt(postToUpdate.headline || postToUpdate.topic, postToUpdate.categoryName, postToUpdate.topic);
      const freshImageUrl = pollinationsService.buildImageUrl(prompt, 800, 1000);

      const updated = {
        ...postToUpdate,
        imageUrl: freshImageUrl
      };

      // Re-render canvas with new AI visual
      const offscreenCanvas = document.createElement('canvas');
      await renderPostToCanvas({
        canvas: offscreenCanvas,
        post: updated,
        brand,
        styleId: updated.styleId || 'common-01',
        formatId: updated.formatId || 'linkedin-square',
        colorPaletteId: updated.colorPaletteId || 'brand',
        bgPattern: updated.bgPattern || 'grid'
      });

      updated.dataUrl = offscreenCanvas.toDataURL('image/png', 0.9);

      setGeneratedPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
      onShowToast?.({ type: 'success', message: 'Synthesized fresh AI visual with Pollinations!' });
    } catch (err) {
      console.error('Failed to regenerate post image:', err);
      onShowToast?.({ type: 'error', message: 'Could not regenerate AI visual.' });
    } finally {
      setRegeneratingPostId(null);
    }
  };

  /**
   * Batch: Regenerate AI Images for all posts in current list
   */
  const handleRegenerateAllImages = async () => {
    if (generatedPosts.length === 0) return;
    setIsGenerating(true);

    const updatedBatch = [];
    for (let i = 0; i < generatedPosts.length; i++) {
      const p = generatedPosts[i];
      setProgress({
        current: i + 1,
        total: generatedPosts.length,
        status: `Re-generating visual ${i + 1} of ${generatedPosts.length}`,
        step: `Synthesizing new 3D graphic for "${(p.headline || p.topic).slice(0, 30)}..."`
      });

      try {
        const prompt = p.imagePrompt || buildContextualImagePrompt(p.headline || p.topic, p.categoryName, p.topic);
        const freshImageUrl = pollinationsService.buildImageUrl(prompt, 800, 1000);

        const updated = { ...p, imageUrl: freshImageUrl };
        const offscreenCanvas = document.createElement('canvas');
        await renderPostToCanvas({
          canvas: offscreenCanvas,
          post: updated,
          brand,
          styleId: updated.styleId || 'common-01',
          formatId: updated.formatId || 'linkedin-square',
          colorPaletteId: updated.colorPaletteId || 'brand',
          bgPattern: updated.bgPattern || 'grid'
        });

        updated.dataUrl = offscreenCanvas.toDataURL('image/png', 0.9);
        updatedBatch.push(updated);
        setGeneratedPosts([...updatedBatch, ...generatedPosts.slice(i + 1)]);
      } catch (err) {
        console.error('Batch image regenerate error:', err);
        updatedBatch.push(p);
      }
    }

    setIsGenerating(false);
    onShowToast?.({ type: 'success', message: `Refreshed all ${generatedPosts.length} AI images!` });
  };

  /**
   * Quick Edit Modal: Sync Description & Key Points & Visual from Headline (Same as CreatePost)
   */
  const handleSyncModalFromHeadline = async () => {
    if (!editModalPost?.headline?.trim()) return;
    setIsModalRegenerating(true);

    const currentHeadline = editModalPost.headline.trim();

    try {
      if (groqService.getApiKey()) {
        const groqRes = await groqService.generatePostAndImagePrompt(currentHeadline, brand, true);
        if (groqRes.success && groqRes.data) {
          const freshImgUrl = pollinationsService.buildImageUrl(groqRes.data.imagePrompt, 800, 1000);
          const ctaVal = (groqRes.data.cta && !/^book\s+(your\s+|a\s+)?demo/i.test(groqRes.data.cta))
            ? groqRes.data.cta
            : 'Explore More';

          setEditModalPost(prev => ({
            ...prev,
            ...groqRes.data,
            headline: currentHeadline,
            headlinePrefix: groqRes.data.headlinePrefix || "",
            cta: ctaVal,
            imageUrl: freshImgUrl
          }));
          onShowToast?.({ type: 'success', message: 'Generated description, key points, CTA & 3D visual!' });
          return;
        }
      }

      // Fallback
      const matching = generateMatchingDescription(currentHeadline, brand, 1);
      const aiPrompt = buildContextualImagePrompt(currentHeadline, matching.categoryName, matching.extractedTopic);
      const freshImgUrl = pollinationsService.buildImageUrl(aiPrompt, 800, 1000);

      setEditModalPost(prev => ({
        ...prev,
        headline: currentHeadline,
        headlinePrefix: "",
        description: matching.description,
        keyPoints: matching.keyPoints,
        cta: matching.cta,
        hashtags: matching.hashtags,
        categoryName: matching.categoryName,
        caption: matching.caption,
        imageUrl: freshImgUrl,
        imagePrompt: aiPrompt
      }));
      onShowToast?.({ type: 'success', message: 'Content & visual aligned with headline!' });
    } catch (err) {
      console.error('Modal sync error:', err);
      onShowToast?.({ type: 'error', message: 'Could not sync content.' });
    } finally {
      setIsModalRegenerating(false);
    }
  };

  /**
   * Quick Edit Modal: Regenerate only Key Points
   */
  const handleRegenerateModalKeyPoints = () => {
    if (!editModalPost) return;
    const headline = editModalPost.headline || editModalPost.topic || '';
    const matching = generateMatchingDescription(headline, brand, Math.floor(Math.random() * 10) + 1);

    setEditModalPost(prev => {
      const updated = { ...prev, keyPoints: matching.keyPoints };
      const desc = updated.description || '';
      const cta = updated.cta || '';
      const kps = updated.keyPoints || [];
      const tags = updated.hashtags || [];
      updated.caption = `${headline}\n\n${desc}\n\nKey Takeaways:\n${kps.map(k => `✓ ${k}`).join('\n')}\n\n💬 ${cta}\n\n${tags.join(' ')}\n\n—\nFollow ${brand?.companyName || 'Infinite Tech'} for more insights.`;
      return updated;
    });
    onShowToast?.({ type: 'info', message: 'Fresh key points generated!' });
  };

  /**
   * Quick Edit Modal: Regenerate only CTA
   */
  const handleRegenerateModalCta = () => {
    if (!editModalPost) return;
    const headline = editModalPost.headline || editModalPost.topic || '';
    const matching = generateMatchingDescription(headline, brand, Math.floor(Math.random() * 10) + 1);

    setEditModalPost(prev => {
      const updated = { ...prev, cta: matching.cta };
      const desc = updated.description || '';
      const cta = updated.cta || '';
      const kps = updated.keyPoints || [];
      const tags = updated.hashtags || [];
      updated.caption = `${headline}\n\n${desc}\n\nKey Takeaways:\n${kps.map(k => `✓ ${k}`).join('\n')}\n\n💬 ${cta}\n\n${tags.join(' ')}\n\n—\nFollow ${brand?.companyName || 'Infinite Tech'} for more insights.`;
      return updated;
    });
    onShowToast?.({ type: 'info', message: 'Fresh CTA generated!' });
  };

  /**
   * Quick Edit Modal: Regenerate AI Image from Prompt
   */
  const handleRegenerateModalImage = async () => {
    if (!editModalPost) return;
    setIsModalImageLoading(true);

    try {
      const prompt = editModalPost.imagePrompt || buildContextualImagePrompt(editModalPost.headline || editModalPost.topic, editModalPost.categoryName, editModalPost.topic);
      const freshUrl = pollinationsService.buildImageUrl(prompt, 800, 1000);

      setEditModalPost(prev => ({
        ...prev,
        imageUrl: freshUrl,
        imagePrompt: prompt
      }));
      onShowToast?.({ type: 'success', message: 'New AI image synthesized!' });
    } catch (err) {
      console.error(err);
      onShowToast?.({ type: 'error', message: 'Image synthesis failed.' });
    } finally {
      setTimeout(() => setIsModalImageLoading(false), 500);
    }
  };

  /**
   * Quick Edit Modal: Save and Apply Changes to the bulk list
   */
  const handleSaveModalEdit = async () => {
    if (!editModalPost) return;

    const offscreenCanvas = document.createElement('canvas');
    await renderPostToCanvas({
      canvas: offscreenCanvas,
      post: editModalPost,
      brand,
      styleId: editModalPost.styleId || 'common-01',
      formatId: editModalPost.formatId || 'linkedin-square',
      colorPaletteId: editModalPost.colorPaletteId || 'brand',
      bgPattern: editModalPost.bgPattern || 'grid'
    });

    const updatedDataUrl = offscreenCanvas.toDataURL('image/png', 0.9);
    const updatedPost = { ...editModalPost, dataUrl: updatedDataUrl };

    setGeneratedPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    setEditModalPost(null);
    onShowToast?.({ type: 'success', message: 'Post updated & re-rendered!' });
  };

  /**
   * Delete post from bulk list
   */
  const handleDeletePost = (id) => {
    setGeneratedPosts(prev => prev.filter(p => p.id !== id));
    onShowToast?.({ type: 'info', message: 'Post removed from batch.' });
  };

  // Download All as ZIP
  const handleDownloadZip = async () => {
    if (generatedPosts.length === 0) return;
    setIsZipping(true);
    try {
      const ok = await exportService.downloadZip(generatedPosts, `postcraft-bulk-${generatedPosts.length}-posts.zip`);
      if (ok) {
        onShowToast?.({ type: 'success', message: 'ZIP archive downloaded successfully!' });
      } else {
        onShowToast?.({ type: 'error', message: 'Failed to generate ZIP archive.' });
      }
    } catch (e) {
      console.error(e);
      onShowToast?.({ type: 'error', message: 'Error bundling ZIP.' });
    } finally {
      setIsZipping(false);
    }
  };

  // Export content to CSV
  const handleExportCsv = () => {
    if (generatedPosts.length === 0) return;
    const ok = exportService.exportCsv(generatedPosts, `postcraft-posts-data.csv`);
    if (ok) {
      onShowToast?.({ type: 'success', message: 'Content exported as CSV!' });
    } else {
      onShowToast?.({ type: 'error', message: 'Failed to export CSV.' });
    }
  };

  // Save all to My Posts
  const handleSaveAll = () => {
    if (generatedPosts.length === 0) return;
    generatedPosts.forEach(p => storageService.savePost(p));
    onShowToast?.({ type: 'success', message: `Saved ${generatedPosts.length} posts to your library!` });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Input Box & Batch Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <span>Bulk Social Media Post Generator</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Paste up to 20 topics. Every topic receives custom AI copy, 4 key points, tailored CTA, and a bespoke 3D AI-generated visual.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Groq LPU + Pollinations AI</span>
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {topicsList.length} / 20 Topics Loaded
            </span>
          </div>
        </div>

        {/* Textarea for Topics */}
        <textarea
          rows={6}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste topics here, one per line..."
          className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all font-mono leading-relaxed"
        />

        {/* Batch Configuration Bar */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Design Style Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Layout className="w-3.5 h-3.5 text-purple-600" />
              <span>Design Style</span>
            </label>
            <select
              value={batchStyle}
              onChange={(e) => setBatchStyle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            >
              <option value="diverse">Diverse Styles (Auto-cycle templates)</option>
              {DESIGN_STYLES.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.dark ? 'Dark' : 'Light'})</option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio / Format */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Image Format</span>
            </label>
            <select
              value={batchFormat}
              onChange={(e) => setBatchFormat(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            >
              {Object.values(IMAGE_DIMENSIONS).map(dim => (
                <option key={dim.id} value={dim.id}>{dim.label} ({dim.aspect})</option>
              ))}
            </select>
          </div>

          {/* 3D AI Visuals Toggle */}
          <div className="flex flex-col justify-center">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-600" />
              <span>AI Image Generation</span>
            </label>
            <button
              type="button"
              onClick={() => setGenerateAiImages(!generateAiImages)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-colors text-xs font-semibold ${
                generateAiImages
                  ? 'bg-purple-50 border-purple-300 text-purple-700'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <span>{generateAiImages ? '3D AI Visuals: ON' : '3D AI Visuals: OFF'}</span>
              <span className={`w-2 h-2 rounded-full ${generateAiImages ? 'bg-purple-600 animate-pulse' : 'bg-slate-300'}`} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={topicsList.length === 0 || isGenerating}
              onClick={handleGenerateAll}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-display font-semibold text-sm text-white transition-all shadow-md shadow-purple-500/20 ${
                topicsList.length === 0 || isGenerating
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-95'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? `Synthesizing (${progress.current}/${progress.total})...` : `Generate All ${topicsList.length} Posts with AI`}</span>
            </button>

            <button
              type="button"
              onClick={() => setInputText('')}
              className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors"
            >
              Clear
            </button>
          </div>

          <button
            type="button"
            onClick={() => setInputText(BULK_SAMPLE_TOPICS)}
            className="text-xs text-purple-600 hover:text-purple-700 font-semibold transition-colors"
          >
            + Reset to 8 Sample Topics
          </button>
        </div>

        {/* Progress Bar with Live Status */}
        {isGenerating && (
          <div className="mt-5 p-4 rounded-xl bg-purple-50 border border-purple-200/80">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-900 mb-1">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
                <span>{progress.status || 'Generating...'}</span>
              </span>
              <span>{Math.round((progress.current / Math.max(progress.total, 1)) * 100)}%</span>
            </div>
            {progress.step && (
              <p className="text-[11px] text-purple-700 font-medium mb-2.5 truncate">{progress.step}</p>
            )}
            <div className="w-full bg-purple-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Generated Results Area */}
      {generatedPosts.length > 0 && (
        <div className="space-y-4">
          {/* Results Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>Generated Posts ({generatedPosts.length})</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Ready to Publish
                </span>
              </h3>
              <p className="text-xs text-slate-500">Each post has tailored AI copy, 4 key points, and a 3D Pollinations AI visual.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleRegenerateAllImages}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700 text-xs font-semibold transition-colors disabled:opacity-50"
                title="Synthesize fresh AI images for all posts in this batch"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Regenerate All AI Images</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                Save All to Library
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                disabled={isZipping}
                onClick={handleDownloadZip}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 active:scale-95 transition-all"
              >
                <Download className={`w-3.5 h-3.5 ${isZipping ? 'animate-bounce' : ''}`} />
                <span>{isZipping ? 'Bundling ZIP...' : 'Download All as ZIP'}</span>
              </button>
            </div>
          </div>

          {/* Responsive Grid with PostCard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {generatedPosts.map((postItem) => (
              <PostCard
                key={postItem.id}
                post={postItem}
                onEdit={(p) => setEditModalPost({ ...p })}
                onPreview={(p) => setPreviewModalPost(p)}
                onDelete={handleDeletePost}
                onRegenerateImage={handleRegeneratePostImage}
                isRegeneratingImage={regeneratingPostId === postItem.id}
                onShowToast={onShowToast}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {previewModalPost && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewModalPost(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 text-white mb-3">
              <span className="text-sm font-semibold truncate pr-4">{previewModalPost.headline}</span>
              <button
                onClick={() => setPreviewModalPost(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewModalPost.dataUrl}
              alt={previewModalPost.headline}
              className="max-h-[75vh] object-contain rounded-lg shadow-md"
            />
          </div>
        </div>
      )}

      {/* Comprehensive AI Quick Edit Modal (Applies CreatePost functions) */}
      {editModalPost && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={() => setEditModalPost(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-display font-bold text-slate-900 text-base">
                  AI Post Editor — Studio Controls
                </h3>
              </div>
              <button
                onClick={() => setEditModalPost(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Two Columns */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
              {/* Left Column: Content & Generation Form (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Headline & Auto-Sync */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Headline / Title</label>
                    <button
                      type="button"
                      disabled={isModalRegenerating}
                      onClick={handleSyncModalFromHeadline}
                      className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100/80 px-2.5 py-1 rounded-md transition-colors"
                      title="Sync description, key points, CTA and AI image from headline"
                    >
                      <Sparkles className={`w-3 h-3 ${isModalRegenerating ? 'animate-spin' : ''}`} />
                      <span>{isModalRegenerating ? 'Syncing...' : '⚡ Auto-sync from headline'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editModalPost.headline || ''}
                    onChange={(e) => setEditModalPost(prev => ({ ...prev, headline: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    placeholder="Enter post headline..."
                  />
                </div>

                {/* 2. Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editModalPost.description || ''}
                    onChange={(e) => setEditModalPost(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    placeholder="Brief description..."
                  />
                </div>

                {/* 3. Supporting Key Points */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Key Points (4 Pillars)</label>
                    <button
                      type="button"
                      onClick={handleRegenerateModalKeyPoints}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2 py-0.5 rounded transition-colors"
                    >
                      ↻ Refresh Points
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {(editModalPost.keyPoints || []).map((kp, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={kp}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditModalPost(prev => {
                            const newKps = [...(prev.keyPoints || [])];
                            newKps[idx] = val;
                            return { ...prev, keyPoints: newKps };
                          });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                        placeholder={`Point ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* 4. Call to Action (CTA) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Call to Action (CTA)</label>
                    <button
                      type="button"
                      onClick={handleRegenerateModalCta}
                      className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-2 py-0.5 rounded transition-colors"
                    >
                      ↻ Refresh CTA
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editModalPost.cta || ''}
                    onChange={(e) => setEditModalPost(prev => ({ ...prev, cta: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    placeholder="e.g. Explore More"
                  />
                </div>

                {/* 5. AI Image Generation Controls */}
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                      <span>3D AI Visual Prompt</span>
                    </span>
                    <button
                      type="button"
                      disabled={isModalImageLoading}
                      onClick={handleRegenerateModalImage}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold transition-all shadow-sm"
                    >
                      <Sparkles className={`w-3 h-3 ${isModalImageLoading ? 'animate-spin' : ''}`} />
                      <span>{isModalImageLoading ? 'Generating...' : 'Synthesize AI Image'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editModalPost.imagePrompt || ''}
                    onChange={(e) => setEditModalPost(prev => ({ ...prev, imagePrompt: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-lg border border-purple-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    placeholder="Prompt describing 3D corporate visual..."
                  />
                </div>

                {/* 6. Style & Format Selection */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Visual Template</label>
                    <select
                      value={editModalPost.styleId || 'common-01'}
                      onChange={(e) => setEditModalPost(prev => ({ ...prev, styleId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                      {DESIGN_STYLES.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Aspect Ratio</label>
                    <select
                      value={editModalPost.formatId || 'linkedin-square'}
                      onChange={(e) => setEditModalPost(prev => ({ ...prev, formatId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                      {Object.values(IMAGE_DIMENSIONS).map(dim => (
                        <option key={dim.id} value={dim.id}>{dim.label} ({dim.aspect})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Canvas Preview (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-start bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 self-start">Live Canvas Preview</span>
                <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-md border border-slate-200 bg-white flex items-center justify-center">
                  <canvas
                    ref={modalCanvasRef}
                    className="w-full h-full object-contain"
                  />
                  {(isModalRegenerating || isModalImageLoading) && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
                      <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
                      <span className="text-xs font-bold tracking-wide">Synthesizing AI Visual...</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 text-center">
                  Canvas reflects your edits and AI image live.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onOpenInEditor?.(editModalPost);
                  setEditModalPost(null);
                }}
                className="text-xs text-purple-600 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Open in Full Studio Editor</span>
                <span>→</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalPost(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalEdit}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 active:scale-95 transition-all"
                >
                  Apply & Save to Batch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
