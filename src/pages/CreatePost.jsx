import React, { useState, useEffect, useRef } from 'react';
import TopicInput from '../components/TopicInput';
import ContentEditor from '../components/ContentEditor';
import ImagePreview from '../components/ImagePreview';
import ImageControls from '../components/ImageControls';
import { generatePostContent, generateMatchingDescription, buildContextualImagePrompt, generateSmartCategoryContent } from '../services/contentGenerator';
import { groqService } from '../services/groqService';
import { pollinationsService } from '../services/pollinationsService';
import { ollamaService } from '../services/ollamaService';
import { storageService } from '../services/storageService';
import { renderPostToCanvas } from '../services/imageRenderer';
import { DESIGN_STYLES } from '../utils/designTemplates';
import { POST_CATEGORIES, getCategoryById, detectCategoryFromTopic } from '../utils/categories';
import { TEMPLATE_DEFAULT_CONTENT } from '../utils/templateDefaultContent';
export { TEMPLATE_DEFAULT_CONTENT };

export const DEFAULT_HIRING_CONTENT = {
  category: 'hiring',
  headline: 'Senior Cloud & DevOps Engineer (AWS & Kubernetes)',
  headlinePrefix: "WE'RE HIRING",
  role: 'Senior Cloud & DevOps Engineer',
  roleTitle: 'Senior Cloud & DevOps Engineer',
  experience: '5 - 8 Years',
  salary: '₹20 - 30 LPA',
  fresherSalary: '₹6 - 8 LPA',
  location: 'Bengaluru / Remote',
  employmentType: 'Full-Time | Immediate Joiner',
  openings: '3 Openings',
  techStack: ['AWS', 'Terraform', 'Kubernetes', 'Docker', 'Python', 'Linux', 'Git', 'CI/CD', 'Helm', 'Ansible'],
  requirements: [
    '5+ years hands-on production experience with AWS & Kubernetes',
    'Deep expertise in Terraform infrastructure as code (IaC)',
    'Building automated zero-downtime CI/CD deployment pipelines',
    'Production monitoring with Prometheus, Grafana & Datadog'
  ],
  keyPoints: [
    '5+ years hands-on production experience with AWS & Kubernetes',
    'Deep expertise in Terraform infrastructure as code (IaC)',
    'Building automated zero-downtime CI/CD deployment pipelines',
    'Production monitoring with Prometheus, Grafana & Datadog'
  ],
  cta: 'Apply now to shape the future of AI infrastructure with us!',
  phone: '+91 98765 43210',
  email: 'hr@infinitetechai.com',
  caption: "We are hiring a Senior Cloud & DevOps Engineer! Join our core infrastructure team in Bengaluru or Remote.\n\n#Hiring #CloudEngineering #DevOps #Kubernetes #TechJobs"
};

export default function CreatePost({
  brand,
  appSettings,
  onShowToast,
  onNavigateToBulk,
  initialPostToEdit = null
}) {
  const [topic, setTopic] = useState('Senior Cloud & DevOps Engineer (AWS & Kubernetes)');
  const [mode, setMode] = useState('single');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return initialPostToEdit?.category || 'hiring';
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [variationIndex, setVariationIndex] = useState(0);

  // Design state
  const [styleId, setStyleId] = useState(() => {
    if (initialPostToEdit?.styleId) return initialPostToEdit.styleId;
    const cat = initialPostToEdit?.category || 'hiring';
    if (cat === 'hiring') {
      return (brand?.defaultStyle && brand.defaultStyle.startsWith('hiring-'))
        ? brand.defaultStyle
        : 'hiring-01';
    }
    const catObj = getCategoryById(cat);
    return catObj?.defaultTemplate || 'hiring-01';
  });
  const [formatId, setFormatId] = useState(brand.preferredFormat || 'linkedin-square');
  const [colorPaletteId, setColorPaletteId] = useState('brand');
  const [bgPattern, setBgPattern] = useState(null);
  const [iconType, setIconType] = useState('auto'); // 'auto', 'sparkle', 'cloud', 'zap', 'shield', 'rocket', 'chart', 'target', 'lightbulb', 'none'
  const [isSaved, setIsSaved] = useState(false);

  // Active Post content state
  const [post, setPost] = useState(null);
  const canvasRef = useRef(null);

  // Category change handler with automatic template realignment and smart category content sync
  const handleCategoryChange = (newCatId) => {
    setSelectedCategory(newCatId);
    const catObj = getCategoryById(newCatId);
    let nextStyle = styleId;
    if (catObj) {
      if (newCatId === 'hiring') {
        if (!styleId.startsWith('hiring-')) {
          nextStyle = catObj.defaultTemplate || 'hiring-01';
          setStyleId(nextStyle);
        }
      } else if (!catObj.recommendedTemplates?.includes(styleId)) {
        nextStyle = catObj.defaultTemplate;
        setStyleId(nextStyle);
      }
      if (catObj.sampleTopics && catObj.sampleTopics.length > 0) {
        setTopic(catObj.sampleTopics[0]);
      }

      const activeHeadline = post?.headline || topic.trim() || (catObj.sampleTopics?.[0] || 'Senior Cloud & DevOps Engineer');
      const smartCat = generateSmartCategoryContent(activeHeadline, newCatId, brand, variationIndex, nextStyle);

      setPost(prev => prev ? {
        ...prev,
        ...smartCat,
        category: newCatId,
        keyPoints: newCatId === 'hiring' ? smartCat.requirements : newCatId === 'services' ? smartCat.deliverables.slice(0, 4) : prev.keyPoints
      } : prev);

      onShowToast?.({ type: 'info', message: `Switched to ${catObj.label} layout.` });
    }
  };

  // Template style selector with automatic category & editor synchronization
  const handleSelectStyle = (newStyleId) => {
    setStyleId(newStyleId);
    setIsSaved(false);

    // Determine category from selected style
    let targetCat = 'general';
    if (newStyleId.startsWith('hiring-')) {
      targetCat = 'hiring';
    } else if (newStyleId.startsWith('product-')) {
      targetCat = 'product';
    } else if (newStyleId.startsWith('festival-')) {
      targetCat = 'festival';
    } else if (newStyleId.startsWith('common-')) {
      targetCat = 'knowledge';
    } else {
      const found = DESIGN_STYLES.find(s => s.id === newStyleId);
      if (found?.category) targetCat = found.category;
    }

    const stObj = DESIGN_STYLES.find(s => s.id === newStyleId);
    if (stObj?.category) targetCat = stObj.category;

    // 1. If template has authentic preset content (by style ID or by templateUrl), load it directly into editor
    const tplContent = TEMPLATE_DEFAULT_CONTENT[newStyleId] || (stObj?.templateUrl ? TEMPLATE_DEFAULT_CONTENT[stObj.templateUrl] : null);
    if (tplContent) {
      const finalCat = tplContent.category || targetCat;
      setSelectedCategory(finalCat);
      setPost(prev => ({
        ...prev,
        ...tplContent,
        category: finalCat,
        styleId: newStyleId,
        isCustomized: false,
        showTemplateOverlay: null,
        userToggledOverlayOff: false
      }));
      if (tplContent.headline) {
        setTopic(tplContent.headline);
      }
      const stName = stObj?.name || 'Selected';
      onShowToast?.({ type: 'info', message: `Loaded ${stName} template text into editor.` });
      return;
    }

    setSelectedCategory(targetCat);

    // 2. For hiring templates, load hiring defaults if switching into hiring
    if (targetCat === 'hiring' && (!post?.role || post?.category !== 'hiring')) {
      setPost(prev => ({
        ...prev,
        ...DEFAULT_HIRING_CONTENT,
        category: targetCat,
        styleId: newStyleId
      }));
      setTopic(DEFAULT_HIRING_CONTENT.headline);
      return;
    }

    // 3. Fallback: smart category enrichment for any existing headline
    const activeHeadline = (post?.headline || topic || '').trim();
    if (activeHeadline) {
      const smartCat = generateSmartCategoryContent(activeHeadline, targetCat, brand, variationIndex, newStyleId);
      setPost(prev => prev ? {
        ...prev,
        ...smartCat,
        category: targetCat,
        styleId: newStyleId,
        role: smartCat.role,
        techStack: smartCat.techStack,
        requirements: smartCat.requirements,
        experience: smartCat.experience,
        salary: smartCat.salary,
        fresherSalary: smartCat.fresherSalary,
        stages: smartCat.stages,
        serviceName: smartCat.serviceName,
        productName: smartCat.productName,
        tagline: smartCat.tagline,
        deliverables: smartCat.deliverables,
        features: smartCat.features,
        phone: smartCat.phone,
        keyPoints: targetCat === 'hiring'
          ? smartCat.requirements
          : targetCat === 'services'
          ? smartCat.deliverables.slice(0, 4)
          : targetCat === 'product'
          ? smartCat.features.map(f => `${f.title}: ${f.desc}`)
          : prev.keyPoints
      } : prev);
    }
  };

  // Initialize with initial post or default generation
  useEffect(() => {
    if (initialPostToEdit) {
      setPost(initialPostToEdit);
      setTopic(initialPostToEdit.topic || '');
      if (initialPostToEdit.category) setSelectedCategory(initialPostToEdit.category);
      if (initialPostToEdit.styleId) setStyleId(initialPostToEdit.styleId);
      if (initialPostToEdit.formatId) setFormatId(initialPostToEdit.formatId);
      if (initialPostToEdit.colorPaletteId) setColorPaletteId(initialPostToEdit.colorPaletteId);
      if (initialPostToEdit.iconType) setIconType(initialPostToEdit.iconType);
      setIsSaved(true);
    } else if (!post) {
      // Default generate on first mount
      handleGenerateSingle();
    }
  }, [initialPostToEdit]);

  // Keep brand defaults in sync if changed, respecting current category
  useEffect(() => {
    if (brand?.defaultStyle && !initialPostToEdit) {
      if (selectedCategory === 'hiring') {
        if (brand.defaultStyle.startsWith('hiring-')) {
          setStyleId(brand.defaultStyle);
        }
      } else {
        const catObj = getCategoryById(selectedCategory);
        if (catObj?.recommendedTemplates?.includes(brand.defaultStyle)) {
          setStyleId(brand.defaultStyle);
        }
      }
    }
    if (brand?.preferredFormat && !initialPostToEdit) {
      setFormatId(brand.preferredFormat);
    }
  }, [brand, selectedCategory]);

  // Single post generation
  const handleGenerateSingle = async () => {
    const inputTopic = topic.trim() || 'Senior Cloud & DevOps Engineer (AWS & Kubernetes)';
    setIsGenerating(true);
    setIsSaved(false);

    // Auto-detect or align category and template
    const catObj = getCategoryById(selectedCategory);
    let activeStyleId = styleId;
    if (selectedCategory === 'hiring' && !styleId.startsWith('hiring-')) {
      activeStyleId = catObj?.defaultTemplate || 'hiring-01';
      setStyleId(activeStyleId);
    } else if (catObj && !catObj.recommendedTemplates?.includes(styleId)) {
      activeStyleId = catObj.defaultTemplate;
      setStyleId(activeStyleId);
    }

    try {
      let generated = null;

      // 1. Try Groq AI (Ultra-fast content + custom visual prompt)
      if (groqService.getApiKey()) {
        const isLikelyHeadline = inputTopic.trim().split(/\s+/).length >= 4;
        const groqRes = await groqService.generatePostAndImagePrompt(inputTopic, brand, isLikelyHeadline, selectedCategory);
        if (groqRes.success && groqRes.data) {
          generated = { ...groqRes.data, category: selectedCategory, imageUrl: null };
          onShowToast?.({ type: 'success', message: 'Synthesized with Groq LPU!' });
        }
      }

      // 2. Check if Ollama AI is enabled
      if (!generated && appSettings?.ollamaEnabled) {
        const ollamaRes = await ollamaService.generateContent(
          inputTopic,
          appSettings.ollamaModel,
          appSettings.ollamaUrl,
          brand
        );
        if (ollamaRes.success) {
          generated = { ...ollamaRes.data, category: selectedCategory };
          onShowToast?.({ type: 'success', message: 'Generated via Ollama Local AI!' });
        }
      }

      // 3. Fallback to built-in template generator
      if (!generated) {
        generated = { ...generatePostContent(inputTopic, brand, variationIndex), category: selectedCategory };
      }

      // Smart category content enrichment for all templates (Hiring, Services, Products, Roadmap)
      const smartCat = generateSmartCategoryContent(
        generated.headline || inputTopic,
        selectedCategory,
        brand,
        variationIndex,
        activeStyleId
      );

      generated = {
        ...smartCat,
        ...generated,
        category: selectedCategory
      };

      if (selectedCategory === 'hiring' || activeStyleId.startsWith('hiring-') || activeStyleId.startsWith('tpl-hiring')) {
        generated.role = smartCat.role;
        generated.techStack = smartCat.techStack;
        generated.requirements = smartCat.requirements;
        generated.experience = smartCat.experience;
        generated.salary = smartCat.salary;
        generated.fresherSalary = smartCat.fresherSalary;
        generated.keyPoints = smartCat.requirements.slice(0, 4);
      } else if (selectedCategory === 'services' || activeStyleId.includes('service') || activeStyleId.startsWith('tpl-services')) {
        generated.serviceName = smartCat.serviceName;
        generated.deliverables = smartCat.deliverables;
        generated.tagline = smartCat.tagline;
        generated.phone = smartCat.phone;
        generated.keyPoints = smartCat.deliverables.slice(0, 4);
      } else if (selectedCategory === 'product' || activeStyleId.includes('product') || activeStyleId.startsWith('tpl-product')) {
        generated.productName = smartCat.productName;
        generated.features = smartCat.features;
        generated.tagline = smartCat.tagline;
        generated.keyPoints = smartCat.features.map(f => `${f.title}: ${f.desc}`);
      } else if (selectedCategory === 'education' || selectedCategory === 'career-roadmap' || activeStyleId === 'hiring-white-executive' || activeStyleId === 'hiring-teal-leadership') {
        generated.stages = smartCat.stages;
      }

      generated.imageUrl = null;

      if (!generated.cta || /^book\s+(your\s+|a\s+)?demo/i.test(generated.cta)) {
        generated.cta = selectedCategory === 'hiring' ? 'Send Your Resume →' : 'Explore More';
      }

      if (generated.headlinePrefix === "Imagine More. Achieve More with AI." || generated.headlinePrefix === "Your Business Can't Miss") {
        generated.headlinePrefix = "";
      }

      generated.category = selectedCategory;
      setPost(generated);
    } catch (err) {
      console.error('Generation error:', err);
      const fallback = { ...generatePostContent(inputTopic, brand, 0), category: selectedCategory };
      setPost(fallback);
      onShowToast?.({ type: 'error', message: 'Template fallback applied.' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate content (cycles variations with brand new phrasing & points)
  const handleRegenerateContent = async () => {
    const currentHeadline = post?.headline || topic.trim();
    if (!currentHeadline) return;
    setIsRegenerating(true);
    setIsSaved(false);

    try {
      const activeCat = post?.category || selectedCategory;
      const nextIndex = variationIndex + 1;
      setVariationIndex(nextIndex);

      const smartCat = generateSmartCategoryContent(currentHeadline, activeCat, brand, nextIndex, styleId);

      if (groqService.getApiKey()) {
        const groqRes = await groqService.generatePostAndImagePrompt(currentHeadline, brand, true, activeCat);
        if (groqRes.success && groqRes.data) {
          setPost(prev => ({
            ...prev,
            ...smartCat,
            ...groqRes.data,
            category: activeCat,
            imageUrl: null
          }));
          onShowToast?.({ type: 'success', message: 'Refreshed template content!' });
          return;
        }
      }

      const matching = generateMatchingDescription(currentHeadline, brand, nextIndex);
      setPost(prev => ({
        ...prev,
        ...smartCat,
        ...matching,
        category: activeCat,
        headline: currentHeadline,
        keyPoints: (activeCat === 'hiring' || (styleId && (styleId.startsWith('hiring-') || styleId.startsWith('tpl-hiring'))))
          ? (smartCat.requirements || matching.keyPoints)
          : (activeCat === 'services' || (styleId && (styleId.includes('service') || styleId.startsWith('tpl-services'))))
          ? (smartCat.deliverables?.slice(0, 4) || matching.keyPoints)
          : matching.keyPoints
      }));

      onShowToast?.({ type: 'info', message: 'Fresh content variation & key points generated!' });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Regenerate visual design (cycles through templates matching the current category)
  const handleRegenerateDesign = () => {
    setIsSaved(false);
    const catObj = getCategoryById(selectedCategory);
    let availableStyles = DESIGN_STYLES;
    if (selectedCategory === 'hiring') {
      availableStyles = DESIGN_STYLES.filter(s => s.id.startsWith('hiring-'));
    } else if (catObj?.recommendedTemplates?.length > 0) {
      availableStyles = DESIGN_STYLES.filter(s => catObj.recommendedTemplates.includes(s.id));
    }

    const currentIndex = availableStyles.findIndex(s => s.id === styleId);
    let nextIndex = (currentIndex + 1) % availableStyles.length;
    const nextStyle = availableStyles[nextIndex] || availableStyles[0];

    if (nextStyle) {
      setStyleId(nextStyle.id);
      onShowToast?.({ type: 'info', message: `Applied ${nextStyle.name} style!` });
    }

    // Randomize pattern
    const patterns = ['grid', 'dots', 'glow', 'angles', 'subtle'];
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    setBgPattern(randomPattern);
  };

  // Automatically update description, key points, category, and caption based on a new headline
  const handleSyncDescriptionFromHeadline = async (newHeadline, showToast = true) => {
    if (!newHeadline || !newHeadline.trim()) return;
    setIsSaved(false);
    setIsRegenerating(true);

    try {
      // Determine active category from styleId first, then selectedCategory
      let activeCat = selectedCategory;
      if (styleId === 'hiring-white-executive' || styleId === 'hiring-teal-leadership') {
        activeCat = 'career-roadmap';
      } else if (styleId === 'hiring-white-internship' || styleId === 'hiring-teal-referral') {
        activeCat = 'education';
      } else if (styleId?.startsWith('tpl-hiring') || styleId?.startsWith('hiring-')) {
        activeCat = 'hiring';
      } else if (styleId?.startsWith('tpl-services') || styleId === 'service-creative-agency' || styleId === 'ai-solutions-crimson') {
        activeCat = 'services';
      } else if (styleId?.startsWith('tpl-product') || styleId === 'tech-cyber-touch' || styleId === 'tech-violet-pedestal') {
        activeCat = 'product';
      } else if (styleId?.startsWith('tpl-common')) {
        activeCat = 'common';
      }

      const nextVariation = showToast ? variationIndex + 1 : variationIndex;
      if (showToast) {
        setVariationIndex(nextVariation);
      }

      // Generate smart category fields (role, techStack, requirements, deliverables, features, stages)
      const smartCat = generateSmartCategoryContent(newHeadline, activeCat, brand, nextVariation, styleId);

      if (groqService.getApiKey()) {
        try {
          const groqRes = await groqService.generatePostAndImagePrompt(newHeadline, brand, true, activeCat);
          if (groqRes.success && groqRes.data) {
            const ctaValue = (groqRes.data.cta && !/^book\s+(your\s+|a\s+)?demo/i.test(groqRes.data.cta))
              ? groqRes.data.cta
              : (activeCat === 'hiring' ? 'Send Your Resume →' : 'Explore More');
            setPost(prev => ({
              ...prev,
              ...smartCat,
              ...groqRes.data,
              category: activeCat,
              headlinePrefix: groqRes.data.headlinePrefix || "",
              cta: ctaValue,
              headline: newHeadline,
              role: smartCat.role,
              roleTitle: smartCat.roleTitle,
              techStack: smartCat.techStack,
              requirements: smartCat.requirements,
              experience: smartCat.experience,
              salary: smartCat.salary,
              fresherSalary: smartCat.fresherSalary,
              stages: smartCat.stages,
              serviceName: smartCat.serviceName,
              productName: smartCat.productName,
              tagline: smartCat.tagline,
              deliverables: smartCat.deliverables,
              features: smartCat.features,
              phone: smartCat.phone,
              keyPoints: activeCat === 'hiring'
                ? smartCat.requirements
                : activeCat === 'services'
                ? smartCat.deliverables.slice(0, 4)
                : activeCat === 'product'
                ? smartCat.features.map(f => `${f.title}: ${f.desc}`)
                : prev?.keyPoints,
              imageUrl: null
            }));
            if (showToast) {
              onShowToast?.({ type: 'success', message: 'Template content updated!' });
            }
            return;
          }
        } catch (err) {
          console.warn('Groq sync failed, falling back to template engine:', err);
        }
      }

      const matching = generateMatchingDescription(newHeadline, brand, nextVariation);
      
      // Also keep the main topic input updated so everything is aligned
      if (matching.extractedTopic) {
        setTopic(matching.extractedTopic);
      }

      setPost(prev => ({
        ...prev,
        ...smartCat,
        ...matching,
        category: activeCat,
        topic: matching.extractedTopic || newHeadline,
        headline: newHeadline,
        description: matching.description,
        role: smartCat.role,
        roleTitle: smartCat.roleTitle,
        techStack: smartCat.techStack,
        requirements: smartCat.requirements,
        experience: smartCat.experience,
        salary: smartCat.salary,
        fresherSalary: smartCat.fresherSalary,
        stages: smartCat.stages,
        serviceName: smartCat.serviceName,
        productName: smartCat.productName,
        tagline: smartCat.tagline,
        deliverables: smartCat.deliverables,
        features: smartCat.features,
        phone: smartCat.phone,
        keyPoints: (activeCat === 'hiring' || (styleId && (styleId.startsWith('hiring-') || styleId.startsWith('tpl-hiring'))))
          ? smartCat.requirements
          : (activeCat === 'services' || (styleId && (styleId.includes('service') || styleId.startsWith('tpl-services'))))
          ? smartCat.deliverables.slice(0, 4)
          : (activeCat === 'product' || (styleId && (styleId.includes('product') || styleId.startsWith('tpl-product'))))
          ? smartCat.features.map(f => `${f.title}: ${f.desc}`)
          : matching.keyPoints,
        cta: activeCat === 'hiring' ? 'Send Your Resume →' : (matching.cta || 'Explore More'),
        imageUrl: null
      }));

      if (showToast) {
        onShowToast?.({ type: 'info', message: 'Content synchronized from headline!' });
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  // Dedicated generator to refresh ONLY key points from current headline
  const handleRegenerateKeyPoints = () => {
    const currentHeadline = post?.headline || topic.trim();
    if (!currentHeadline) {
      onShowToast?.({ type: 'error', message: 'Please enter a headline first.' });
      return;
    }
    setIsSaved(false);
    const nextVariation = variationIndex + 1;
    setVariationIndex(nextVariation);
    const matching = generateMatchingDescription(currentHeadline, brand, nextVariation);

    setPost(prev => {
      const updated = {
        ...prev,
        keyPoints: matching.keyPoints
      };
      const headline = updated.headline || '';
      const description = updated.description || '';
      const keyPoints = updated.keyPoints || [];
      const cta = updated.cta || '';
      const hashtags = updated.hashtags || [];
      updated.caption = `${headline}\n\n${description}\n\nKey Takeaways:\n${keyPoints.map(kp => `✓ ${kp}`).join('\n')}\n\n💬 ${cta}\n\n${hashtags.join(' ')}\n\n—\nFollow ${brand?.companyName || 'Infinite Tech'} for more insights.`;
      return updated;
    });

    onShowToast?.({ type: 'success', message: 'Fresh key points generated!' });
  };

  // Dedicated generator to refresh ONLY Call to Action (CTA) from current headline
  const handleRegenerateCta = () => {
    const currentHeadline = post?.headline || topic.trim();
    if (!currentHeadline) {
      onShowToast?.({ type: 'error', message: 'Please enter a headline first.' });
      return;
    }
    setIsSaved(false);
    const nextVariation = variationIndex + 1;
    setVariationIndex(nextVariation);
    const matching = generateMatchingDescription(currentHeadline, brand, nextVariation);

    setPost(prev => {
      const updated = {
        ...prev,
        cta: matching.cta
      };
      const headline = updated.headline || '';
      const description = updated.description || '';
      const keyPoints = updated.keyPoints || [];
      const cta = updated.cta || '';
      const hashtags = updated.hashtags || [];
      updated.caption = `${headline}\n\n${description}\n\nKey Takeaways:\n${keyPoints.map(kp => `✓ ${kp}`).join('\n')}\n\n💬 ${cta}\n\n${hashtags.join(' ')}\n\n—\nFollow ${brand?.companyName || 'Infinite Tech'} for more insights.`;
      return updated;
    });

    onShowToast?.({ type: 'success', message: 'Fresh tailored Call to Action generated!' });
  };

  // Live content field edit
  const handleUpdateField = (field, value) => {
    setIsSaved(false);
    setPost(prev => {
      const isOverlayToggle = field === 'showTemplateOverlay';
      const updated = {
        ...prev,
        [field]: value,
        isCustomized: isOverlayToggle ? prev?.isCustomized : true
      };
      if (isOverlayToggle && value === false) {
        updated.userToggledOverlayOff = true;
      } else if (isOverlayToggle && value === true) {
        updated.userToggledOverlayOff = false;
      }
      // If headline or description changed, sync caption
      if (field === 'headline' || field === 'description') {
        const headline = field === 'headline' ? value : updated.headline;
        const description = field === 'description' ? value : updated.description;
        const keyPoints = updated.keyPoints || [];
        const cta = updated.cta || '';
        const hashtags = updated.hashtags || [];
        updated.caption = `${headline}\n\n${description}\n\nKey Takeaways:\n${keyPoints.map(kp => `✓ ${kp}`).join('\n')}\n\n💬 ${cta}\n\n${hashtags.join(' ')}\n\n—\nFollow ${brand?.companyName || 'Infinite Tech'} for more insights.`;
      }
      return updated;
    });
  };

  // Save to My Posts
  const handleSavePost = () => {
    if (!post || !canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png', 0.85);
      const postToSave = {
        ...post,
        styleId,
        formatId,
        colorPaletteId,
        bgPattern,
        iconType,
        dataUrl,
        savedAt: new Date().toISOString()
      };

      storageService.savePost(postToSave);
      setIsSaved(true);
      onShowToast?.({ type: 'success', message: 'Post saved to My Posts library!' });
    } catch (err) {
      console.error('Failed to save post:', err);
      onShowToast?.({ type: 'error', message: 'Could not save post locally.' });
    }
  };

  // Multiple mode triggers navigation to Bulk Generator
  const handleGenerateBulk = () => {
    onNavigateToBulk?.(topic);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Topic Input Area */}
      <TopicInput
        topic={topic}
        setTopic={setTopic}
        onGenerateSingle={handleGenerateSingle}
        onGenerateBulk={handleGenerateBulk}
        isGenerating={isGenerating}
        mode={mode}
        setMode={setMode}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
      />

      {/* 2. Main Studio Grid (Content Editor on Left, Live Image on Right) */}
      {post && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Content Editor & Controls (7 cols on large screens) */}
          <div className="lg:col-span-6 space-y-6">
            <ContentEditor
              post={post}
              selectedCategory={selectedCategory}
              styleId={styleId}
              onUpdateField={handleUpdateField}
              onSyncDescriptionFromHeadline={handleSyncDescriptionFromHeadline}
              onRegenerateKeyPoints={handleRegenerateKeyPoints}
              onRegenerateCta={handleRegenerateCta}
              onRegenerateContent={handleRegenerateContent}
              isRegenerating={isRegenerating}
              onShowToast={onShowToast}
            />

            <ImageControls
              canvasRef={canvasRef}
              post={post}
              brand={brand}
              selectedCategory={selectedCategory}
              styleId={styleId}
              setStyleId={handleSelectStyle}
              formatId={formatId}
              setFormatId={setFormatId}
              colorPaletteId={colorPaletteId}
              setColorPaletteId={setColorPaletteId}
              bgPattern={bgPattern}
              setBgPattern={setBgPattern}
              iconType={iconType}
              setIconType={setIconType}
              onUpdateField={handleUpdateField}
              onRegenerateDesign={handleRegenerateDesign}
              onSavePost={handleSavePost}
              onShowToast={onShowToast}
              isSaved={isSaved}
            />
          </div>

          {/* Right Column: Sticky Live Image Preview (6 cols on large screens) */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <ImagePreview
              canvasRef={canvasRef}
              post={post}
              brand={brand}
              styleId={styleId}
              formatId={formatId}
              colorPaletteId={colorPaletteId}
              bgPattern={bgPattern}
              iconType={iconType}
              onShowToast={onShowToast}
            />
          </div>
        </div>
      )}
    </div>
  );
}
