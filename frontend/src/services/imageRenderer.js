/**
 * Master HTML5 Canvas Image Rendering Engine for PostCraft AI
 * Renders high-resolution, branded social media graphics with 100% vector/canvas
 * precision, text wrapping, dynamic scaling, and no external API dependencies.
 */

import { IMAGE_DIMENSIONS, DESIGN_STYLES, COLOR_PALETTES } from '../utils/designTemplates';
import {
  drawRoundRect,
  wrapText,
  fitHeadline,
  wrapDescription,
  drawCheckmarkIcon,
  drawArrowRight,
  drawGlobeIcon,
  drawSparkleIcon,
  drawZapIcon,
  drawModernBulletBadge,
  drawCtaArrowBadge,
  drawTopicIconBadge,
  detectTopicIcon,
  drawTopicFeatureCard,
  drawMarkerHighlight,
  drawMultiColorCategoryBadge,
  drawMasterclassPresenterCard,
  drawFloatingTechBadges,
  drawPhoneHandsetIcon,
  drawStopwatchIcon,
  drawGrowthBarChartIcon,
  drawIndustryIcon,
  drawScriptMarketingNote,
  drawCuteAiRobotAvatar,
  drawAudioSoundwave,
  drawAiHeroImageShowcase,
  draw3dPedestalWithSmartphone,
  drawFourInfinitetechFeatureCards,
  drawDarkWaveRibbon,
  drawInfinitetechFooter,
  drawCalendarIcon
} from '../utils/textLayout';
import { getTopicRelatedImage, drawCoverImage } from '../utils/topicImages';
import { TEMPLATE_DEFAULT_CONTENT } from '../utils/templateDefaultContent';
import { renderUnifiedPoster } from './unifiedPosterRenderer';

// In-memory cache for loaded logo images
const imageCache = new Map();

function loadImage(src, timeoutMs = 4000) {
  if (!src) return Promise.resolve(null);
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src));

  const isAiGen = typeof src === 'string' && (src.includes('pollinations') || src.startsWith('/api/'));
  const actualTimeout = isAiGen ? Math.max(timeoutMs, 22000) : timeoutMs;

  return new Promise((resolve) => {
    let settled = false;
    const img = new Image();
    // Use anonymous CORS for cross-origin URLs, omit for local same-origin proxy URLs
    if (typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'))) {
      img.crossOrigin = 'anonymous';
    }

    if (isAiGen && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('postcraft:image-generating', { detail: { src } }));
    }

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        console.warn('Image load timed out initial window:', src);
        if (isAiGen && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('postcraft:image-timed-out', { detail: { src } }));
        }
        resolve(null);
      }
    }, actualTimeout);

    img.onload = () => {
      imageCache.set(src, img);
      if (isAiGen && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('postcraft:image-completed', { detail: { src } }));
      }
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(img);
      } else {
        // Late load: image finished generating in background! Notify canvas preview to re-render
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('postcraft:image-ready', { detail: { src } }));
        }
      }
    };
    img.onerror = () => {
      if (isAiGen && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('postcraft:image-failed', { detail: { src } }));
      }
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        console.warn('Failed to load image:', src);
        resolve(null);
      }
    };
    img.src = src;
  });
}

/**
 * Renders custom imported templates (from Downloads/templetes) with their high-res base graphic
 * and dynamically overlays company logo, category badge, dynamic headline card, tech chips, and CTA.
 */
async function renderCustomTemplatePoster({
  canvas,
  ctx,
  width,
  height,
  post,
  style,
  brand,
  logoImg,
  topicImg,
  isLandscape
}) {
  // 1. Draw solid background
  ctx.fillStyle = style.dark ? '#0B0F19' : '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // 2. Load and draw the underlying template image
  const tplImg = await loadImage(style.templateUrl);
  if (tplImg) {
    const scale = Math.max(width / tplImg.width, height / tplImg.height);
    const drawW = tplImg.width * scale;
    const drawH = tplImg.height * scale;
    const drawX = (width - drawW) / 2;
    const drawY = (height - drawH) / 2;
    ctx.drawImage(tplImg, drawX, drawY, drawW, drawH);
  }

  const padX = Math.round(width * 0.05);
  const padY = Math.round(height * 0.04);
  const isDark = style.dark !== false;

  // 3. Dynamic Logo in top-left
  const headerH = isLandscape ? 40 : 48;
  if (logoImg) {
    const scale = Math.min(headerH / logoImg.height, 160 / logoImg.width);
    const lw = logoImg.width * scale;
    const lh = logoImg.height * scale;
    drawRoundRect(ctx, padX - 8, padY - 5, lw + 16, lh + 10, 10);
    ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.85)';
    ctx.fill();
    ctx.drawImage(logoImg, padX, padY, lw, lh);
  } else if (post.showBrandingBadge === true) {
    // Branded company badge only if explicitly requested
    ctx.save();
    const compName = (brand?.companyName || 'INFINITETECH AI').toUpperCase();
    ctx.font = `800 ${isLandscape ? 12 : 14}px "Outfit", sans-serif`;
    const nw = ctx.measureText(compName).width + 24;
    drawRoundRect(ctx, padX, padY, nw, headerH - 8, 8);
    ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.85)';
    ctx.fill();
    ctx.fillStyle = isDark ? '#FFFFFF' : '#0B0F19';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(compName, padX + 12, padY + (headerH - 8) / 2);
    ctx.restore();
  }

  // 4. Category Badge & Dynamic Headline Glass Card (Active when user edits content or toggles overlay)
  const defaultEntry = TEMPLATE_DEFAULT_CONTENT[style.id] || (style.templateUrl ? TEMPLATE_DEFAULT_CONTENT[style.templateUrl] : null);
  const isHeadlineEdited = Boolean(defaultEntry && post.headline && post.headline.trim() !== defaultEntry.headline?.trim());
  const isRoleEdited = Boolean(defaultEntry && post.role && post.role.trim() !== defaultEntry.role?.trim());
  const isContentModified = post.showTemplateOverlay === true || (
    post.userToggledOverlayOff !== true && (
      post.isCustomized === true ||
      isHeadlineEdited ||
      isRoleEdited ||
      Boolean(!defaultEntry && post.headline && post.headline.trim())
    )
  );

  if (isContentModified && post.headline && post.headline.trim()) {
    const catLabel = style.category === 'hiring' ? "WE'RE HIRING"
      : style.category === 'services' ? 'SPECIALIZED SERVICES'
      : style.category === 'product' ? 'PRODUCT SHOWCASE'
      : 'INDUSTRY INSIGHT';

    ctx.save();
    ctx.font = `800 ${isLandscape ? 11 : 13}px "Plus Jakarta Sans", sans-serif`;
    const badgeW = ctx.measureText(catLabel).width + 28;
    const badgeH = isLandscape ? 28 : 34;
    const badgeX = width - padX - badgeW;
    const badgeY = padY + 4;
    drawRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 16);
    ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.strokeStyle = style.accentColor || '#008080';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = style.accentColor || (isDark ? '#00D2B4' : '#008080');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(catLabel, badgeX + badgeW / 2, badgeY + badgeH / 2);
    ctx.restore();

    ctx.save();
    const cardX = padX;
    const cardY = padY + headerH + (isLandscape ? 14 : 20);
    const cardW = width - padX * 2;

    // Determine headline text & kicker based on category
    let kicker = (post.headlinePrefix || '').trim();
    let headlineText = post.headline.trim();

    if (style.category === 'hiring') {
      headlineText = post.role || post.headline;
      if (!kicker) kicker = 'CAREER OPPORTUNITY';
    } else if (style.category === 'services') {
      headlineText = post.serviceName || post.headline;
      if (!kicker) kicker = 'PREMIER SERVICES';
    } else if (style.category === 'product') {
      headlineText = post.productName || post.headline;
      if (!kicker) kicker = 'NEW RELEASE';
    }

    // Measure headline with fitHeadline
    const maxTextW = cardW - 48;
    const initialFs = isLandscape ? 34 : 44;
    const fitted = fitHeadline(ctx, headlineText, maxTextW, isLandscape ? 96 : 124, 2, initialFs, 22);

    let contentH = fitted.totalHeight + (kicker ? 28 : 0) + 36;
    // Add space for pills or key points
    const userPoints = (post.keyPoints || post.deliverables || []).filter(k => k && k.trim().length > 0).slice(0, 3);
    const hasPills = (style.category === 'hiring' && post.experience) ||
                     (style.category === 'services' && post.tagline) ||
                     (style.category === 'product' && post.tagline) ||
                     (post.description) ||
                     (userPoints.length > 0);
    if (hasPills) {
      contentH += (isLandscape ? 40 : 54);
    }

    // Seamless In-Place Text Area Wash (NO FLOATING CARD BOX!)
    // Dissolves old baked-in template text cleanly into the background
    const washBg = style.bgStart || (isDark ? '#0B0F19' : '#FFFFFF');
    const isSplitLeft = style.category === 'services' || style.category === 'hiring';
    const washW = isSplitLeft ? Math.round(width * 0.58) : width;
    const washH = isSplitLeft ? height : Math.min(height * 0.52, contentH + 110);

    ctx.save();
    const washGrad = isSplitLeft
      ? ctx.createLinearGradient(0, 0, washW, 0)
      : ctx.createLinearGradient(0, cardY - 20, 0, cardY + washH);

    if (isSplitLeft) {
      washGrad.addColorStop(0, washBg);
      washGrad.addColorStop(0.70, washBg);
      washGrad.addColorStop(0.92, isDark ? 'rgba(11, 15, 25, 0.92)' : 'rgba(255, 255, 255, 0.92)');
      washGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = washGrad;
      ctx.fillRect(0, 0, washW, height);
    } else {
      washGrad.addColorStop(0, washBg);
      washGrad.addColorStop(0.75, washBg);
      washGrad.addColorStop(0.92, isDark ? 'rgba(11, 15, 25, 0.88)' : 'rgba(255, 255, 255, 0.88)');
      washGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = washGrad;
      ctx.fillRect(0, cardY - 20, width, washH + 20);
    }
    ctx.restore();

    let textY = cardY + 8;
    const contentLeftX = padX;

    // Draw Kicker
    if (kicker) {
      ctx.font = `800 ${isLandscape ? 11 : 13}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = style.accentColor || (isDark ? '#00D2B4' : '#008080');
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(kicker.toUpperCase(), contentLeftX, textY);
      textY += (isLandscape ? 18 : 22);
    }

    // Draw Headline Lines
    ctx.save();
    ctx.font = `900 ${fitted.fontSize}px "Outfit", "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = isDark ? '#FFFFFF' : (style.textColor || '#0F172A');
    ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
    ctx.shadowBlur = 6;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (const line of fitted.lines) {
      ctx.fillText(line, contentLeftX, textY);
      textY += fitted.lineHeight;
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Draw Category Specific Sub-Info (Pills, Tech Stack, or Key Points)
    textY += (isLandscape ? 6 : 10);

    if (style.category === 'hiring') {
      // Experience, Salary, Location Pill
      const specText = `${post.experience || '3-5 Yrs'}  •  ${post.salary || 'Competitive CTC'}  •  ${post.location || 'Remote/Hybrid'}`;
      ctx.font = `700 ${isLandscape ? 12 : 14}px "Plus Jakarta Sans", sans-serif`;
      const specW = ctx.measureText(specText).width + 24;
      drawRoundRect(ctx, contentLeftX, textY, Math.min(specW, maxTextW), isLandscape ? 28 : 34, 10);
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 128, 128, 0.08)';
      ctx.fill();
      ctx.fillStyle = isDark ? '#E2E8F0' : '#0F172A';
      ctx.textBaseline = 'middle';
      ctx.fillText(specText, contentLeftX + 12, textY + (isLandscape ? 14 : 17));

      // Tech Stack chips if available
      if (post.techStack && post.techStack.length > 0) {
        let chipX = contentLeftX + specW + 12;
        ctx.font = `700 ${isLandscape ? 11 : 12}px "Plus Jakarta Sans", sans-serif`;
        const visibleTechs = post.techStack.slice(0, 4);
        for (const tech of visibleTechs) {
          const tw = ctx.measureText(tech).width + 16;
          if (chipX + tw > cardX + cardW - 24) break;
          drawRoundRect(ctx, chipX, textY, tw, isLandscape ? 28 : 34, 8);
          ctx.fillStyle = isDark ? 'rgba(0, 210, 180, 0.15)' : 'rgba(0, 128, 128, 0.12)';
          ctx.fill();
          ctx.strokeStyle = isDark ? 'rgba(0, 210, 180, 0.3)' : 'rgba(0, 128, 128, 0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = isDark ? '#00D2B4' : '#008080';
          ctx.textBaseline = 'middle';
          ctx.fillText(tech, chipX + 8, textY + (isLandscape ? 14 : 17));
          chipX += tw + 8;
        }
      }
    } else {
      // For Products, Services, Knowledge & General: Render Tagline or Supporting Key Point Chips
      if (userPoints.length > 0) {
        let chipX = contentLeftX;
        ctx.font = `700 ${isLandscape ? 11 : 13}px "Plus Jakarta Sans", sans-serif`;
        for (const pt of userPoints) {
          const cleanPt = String(pt).replace(/^[✓•\-\*]\s*/, '').trim();
          const ptText = `✓  ${cleanPt.length > 32 ? cleanPt.slice(0, 32) + '...' : cleanPt}`;
          const pw = ctx.measureText(ptText).width + 24;
          if (chipX + pw > cardX + cardW - 24) break;
          drawRoundRect(ctx, chipX, textY, pw, isLandscape ? 28 : 34, 8);
          ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)';
          ctx.fill();
          ctx.strokeStyle = style.accentColor || (isDark ? '#38BDF8' : '#0284C7');
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = isDark ? '#F1F5F9' : '#0F172A';
          ctx.textBaseline = 'middle';
          ctx.fillText(ptText, chipX + 12, textY + (isLandscape ? 14 : 17));
          chipX += pw + 10;
        }
      } else if (post.tagline) {
        ctx.font = `600 ${isLandscape ? 13 : 15}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = isDark ? '#CBD5E1' : '#475569';
        ctx.textBaseline = 'top';
        const subLines = wrapText(ctx, post.tagline, maxTextW);
        if (subLines[0]) ctx.fillText(subLines[0], contentLeftX, textY);
      } else if (post.description) {
        ctx.font = `500 ${isLandscape ? 13 : 15}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = isDark ? '#CBD5E1' : '#475569';
        ctx.textBaseline = 'top';
        const descLines = wrapText(ctx, post.description, maxTextW);
        if (descLines[0]) ctx.fillText(descLines[0], contentLeftX, textY);
      }
    }

    ctx.restore();
  }

  // 6. Dynamic CTA Button in bottom-right (rendered when content is modified or overlay active)
  if (isContentModified && post.cta && post.cta.trim()) {
    const ctaText = post.cta.trim();
    ctx.save();
    ctx.font = `800 ${isLandscape ? 13 : 16}px "Outfit", "Plus Jakarta Sans", sans-serif`;
    const ctaW = ctx.measureText(ctaText).width + 36;
    const ctaH = isLandscape ? 38 : 46;
    const ctaX = width - padX - ctaW;
    const ctaY = height - padY - ctaH;

    drawRoundRect(ctx, ctaX, ctaY, ctaW, ctaH, 24);
    ctx.fillStyle = style.ctaBg || (isDark ? '#00D2B4' : '#008080');
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 14;
    ctx.fill();

    ctx.fillStyle = style.ctaText || '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;
    ctx.fillText(ctaText, ctaX + ctaW / 2, ctaY + ctaH / 2);
    ctx.restore();
  }

  // 7. Contact phone or website in bottom-left (rendered when content is modified or overlay active)
  if (isContentModified && (post.phone || brand?.websiteUrl)) {
    const contactText = post.phone || brand?.websiteUrl || 'www.infinitetechai.com';
    ctx.save();
    const phoneH = isLandscape ? 32 : 40;
    const phoneY = height - padY - phoneH;
    ctx.font = `800 ${isLandscape ? 12 : 14}px "Plus Jakarta Sans", sans-serif`;
    const displayText = post.phone ? `📞 ${post.phone}` : `🌐 ${contactText}`;
    const pw = ctx.measureText(displayText).width + 36;
    drawRoundRect(ctx, padX, phoneY, pw, phoneH, 12);
    ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.78)' : 'rgba(255, 255, 255, 0.88)';
    ctx.fill();
    ctx.strokeStyle = style.accentColor || '#008080';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = style.accentColor || (isDark ? '#00D2B4' : '#008080');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, padX + 16, phoneY + phoneH / 2);
    ctx.restore();
  }
}

/**
 * Draws background with gradients and decorative geometry
 */
function drawBackground(ctx, width, height, style, bgPattern, activePalette) {
  ctx.save();

  let bgStart = style.bgStart;
  let bgEnd = style.bgEnd;
  const isDark = style.dark;

  // Custom palette color override if provided
  let accentColor = activePalette?.primary || style.accentColor;
  let secondaryAccent = activePalette?.secondary || style.secondaryAccent;

  // 1. Draw base linear gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, bgStart);
  bgGrad.addColorStop(1, bgEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw decorative pattern/background elements
  const patternType = bgPattern || style.bgType;

  if (patternType === 'grid' || patternType === 'gradient-grid') {
    // Elegant geometric grid lines
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)';
    ctx.lineWidth = 1.5;
    const step = 60;
    ctx.beginPath();
    for (let x = 0; x <= width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Top-right glowing accent orb
    const radial = ctx.createRadialGradient(width * 0.85, height * 0.15, 10, width * 0.85, height * 0.15, width * 0.45);
    radial.addColorStop(0, isDark ? `${accentColor}33` : `${accentColor}18`);
    radial.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.15, width * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Bottom-left subtle orb
    const radial2 = ctx.createRadialGradient(width * 0.15, height * 0.9, 10, width * 0.15, height * 0.9, width * 0.35);
    radial2.addColorStop(0, isDark ? `${secondaryAccent}25` : `${secondaryAccent}12`);
    radial2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = radial2;
    ctx.beginPath();
    ctx.arc(width * 0.15, height * 0.9, width * 0.35, 0, Math.PI * 2);
    ctx.fill();
  } else if (patternType === 'dots') {
    // Dot matrix
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)';
    const spacing = 40;
    const dotRadius = 2;
    for (let x = spacing / 2; x < width; x += spacing) {
      for (let y = spacing / 2; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Glowing corner
    const glow = ctx.createRadialGradient(width, 0, 0, width, 0, width * 0.5);
    glow.addColorStop(0, `${accentColor}35`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  } else if (patternType === 'glow' || patternType === 'cyber-glow') {
    // High-tech cyber glow with intersecting neon circles
    const orb1 = ctx.createRadialGradient(width * 0.9, height * 0.1, 5, width * 0.9, height * 0.1, width * 0.5);
    orb1.addColorStop(0, `${accentColor}44`);
    orb1.addColorStop(0.5, `${accentColor}15`);
    orb1.addColorStop(1, 'transparent');
    ctx.fillStyle = orb1;
    ctx.fillRect(0, 0, width, height);

    const orb2 = ctx.createRadialGradient(width * 0.1, height * 0.85, 5, width * 0.1, height * 0.85, width * 0.45);
    orb2.addColorStop(0, `${secondaryAccent}38`);
    orb2.addColorStop(0.6, `${secondaryAccent}10`);
    orb2.addColorStop(1, 'transparent');
    ctx.fillStyle = orb2;
    ctx.fillRect(0, 0, width, height);

    // Subtle diagonal cyber accents
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let offset = -width; offset < width * 2; offset += 140) {
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset + height, height);
    }
    ctx.stroke();
  } else if (patternType === 'angles') {
    // Modern abstract geometric polygon shapes
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
    ctx.beginPath();
    ctx.moveTo(width * 0.7, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height * 0.45);
    ctx.lineTo(width * 0.55, height * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `${accentColor}18`;
    ctx.beginPath();
    ctx.moveTo(width, height * 0.3);
    ctx.lineTo(width, height * 0.7);
    ctx.lineTo(width * 0.75, height * 0.55);
    ctx.closePath();
    ctx.fill();
  } else if (patternType === 'cyber-rings') {
    // Concentric holographic rings
    ctx.strokeStyle = `${accentColor}25`;
    ctx.lineWidth = 1.5;
    for (let r = 80; r < width * 0.6; r += 70) {
      ctx.beginPath();
      ctx.arc(width * 0.85, height * 0.2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (patternType === 'masterclass-light') {
    // Crisp architectural warm-white with technical subtle dot matrix
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    const spacing = 44;
    for (let x = spacing / 2; x < width; x += spacing) {
      for (let y = spacing / 2; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Top subtle gradient glow
    const topGlow = ctx.createLinearGradient(0, 0, width, height * 0.35);
    topGlow.addColorStop(0, 'rgba(37, 99, 235, 0.07)');
    topGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, height * 0.35);
  } else if (patternType && patternType.startsWith('hiring-')) {
    // Specialized high-end Hiring & Career geometric patterns
    if (patternType.includes('white')) {
      // White canvas with technical #008080 teal geometric grid and subtle watermark
      ctx.strokeStyle = 'rgba(0, 128, 128, 0.07)';
      ctx.lineWidth = 1.2;
      const step = 55;
      ctx.beginPath();
      for (let x = 0; x <= width; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Top-right soft teal aura
      const radial = ctx.createRadialGradient(width * 0.88, height * 0.12, 10, width * 0.88, height * 0.12, width * 0.45);
      radial.addColorStop(0, 'rgba(0, 128, 128, 0.14)');
      radial.addColorStop(0.6, 'rgba(0, 128, 128, 0.04)');
      radial.addColorStop(1, 'transparent');
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(width * 0.88, height * 0.12, width * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Subtle bottom-left geometric polygon accent
      ctx.fillStyle = 'rgba(0, 128, 128, 0.03)';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.7);
      ctx.lineTo(width * 0.35, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
    } else {
      // Rich #008080 teal canvas with modern black & white technical grid & corner depth
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.2;
      const step = 60;
      ctx.beginPath();
      for (let x = 0; x <= width; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Subtle black vignette along top and bottom for executive depth
      const topVignette = ctx.createLinearGradient(0, 0, 0, height * 0.28);
      topVignette.addColorStop(0, 'rgba(0, 0, 0, 0.32)');
      topVignette.addColorStop(1, 'transparent');
      ctx.fillStyle = topVignette;
      ctx.fillRect(0, 0, width, height * 0.28);

      const botVignette = ctx.createLinearGradient(0, height * 0.75, 0, height);
      botVignette.addColorStop(0, 'transparent');
      botVignette.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
      ctx.fillStyle = botVignette;
      ctx.fillRect(0, height * 0.75, width, height * 0.25);

      // Radial white soft light behind upper area
      const radial = ctx.createRadialGradient(width * 0.5, height * 0.3, 10, width * 0.5, height * 0.3, width * 0.55);
      radial.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      radial.addColorStop(1, 'transparent');
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.3, width * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw subtle top border accent line
  const topAccent = ctx.createLinearGradient(0, 0, width, 0);
  topAccent.addColorStop(0, accentColor);
  topAccent.addColorStop(0.5, secondaryAccent);
  topAccent.addColorStop(1, accentColor);
  ctx.fillStyle = topAccent;
  ctx.fillRect(0, 0, width, 6);

  ctx.restore();
}

/**
 * Draws modern geometric fallback logo when user hasn't uploaded a logo file
 */
function drawBrandedLogoPlaceholder(ctx, x, y, size, brandName, accentColor, isDark) {
  ctx.save();
  // Rounded square container
  const boxBg = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)';
  const boxBorder = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.1)';
  
  drawRoundRect(ctx, x, y - size / 2, size, size, Math.round(size * 0.26));
  ctx.fillStyle = boxBg;
  ctx.fill();
  ctx.strokeStyle = boxBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw modern spark / geometric diamond icon inside
  const cx = x + size / 2;
  const cy = y;
  const iconSize = size * 0.55;

  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(cx, cy - iconSize / 2);
  ctx.quadraticCurveTo(cx, cy, cx + iconSize / 2, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + iconSize / 2);
  ctx.quadraticCurveTo(cx, cy, cx - iconSize / 2, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - iconSize / 2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Renders the 3D Datacenter Workstation with isometric server rack, baseplate,
 * front holographic analytics screen, bronze database canisters, and glowing neon conduits
 * connecting up to floating cloud tech badges (AWS, Databricks, Spark, Airflow).
 */
function draw3dMasterclassDatacenter(ctx, x, y, width, height, topic = '') {
  ctx.save();

  // 1. Ambient lighting glow behind the workstation
  // Cyan core glow
  const centerGlow = ctx.createRadialGradient(
    x + width * 0.55,
    y + height * 0.58,
    20,
    x + width * 0.55,
    y + height * 0.58,
    width * 0.52
  );
  centerGlow.addColorStop(0, 'rgba(0, 229, 255, 0.28)');
  centerGlow.addColorStop(0.5, 'rgba(37, 99, 235, 0.16)');
  centerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = centerGlow;
  ctx.beginPath();
  ctx.arc(x + width * 0.55, y + height * 0.58, width * 0.52, 0, Math.PI * 2);
  ctx.fill();

  // Orange ambient warm accent at top-right
  const orangeGlow = ctx.createRadialGradient(
    x + width * 0.82,
    y + height * 0.18,
    10,
    x + width * 0.82,
    y + height * 0.18,
    width * 0.35
  );
  orangeGlow.addColorStop(0, 'rgba(255, 122, 0, 0.18)');
  orangeGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = orangeGlow;
  ctx.beginPath();
  ctx.arc(x + width * 0.82, y + height * 0.18, width * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // 2. Isometric Dark Metallic Baseplate / Pedestal
  const baseX = x + width * 0.14;
  const baseY = y + height * 0.60;
  const baseW = width * 0.78;
  const baseH = height * 0.32;

  // Isometric polygon floor surface
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(baseX + baseW * 0.45, baseY); // top corner
  ctx.lineTo(baseX + baseW, baseY + baseH * 0.32); // right corner
  ctx.lineTo(baseX + baseW * 0.55, baseY + baseH); // bottom corner
  ctx.lineTo(baseX, baseY + baseH * 0.65); // left corner
  ctx.closePath();

  const floorGrad = ctx.createLinearGradient(baseX, baseY, baseX + baseW, baseY + baseH);
  floorGrad.addColorStop(0, '#0F172A');
  floorGrad.addColorStop(0.5, '#1E293B');
  floorGrad.addColorStop(1, '#0B132B');
  ctx.fillStyle = floorGrad;
  ctx.shadowColor = 'rgba(0, 229, 255, 0.35)';
  ctx.shadowBlur = 24;
  ctx.fill();

  // Glowing neon edge on perimeter of baseplate
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#00E5FF';
  ctx.shadowBlur = 12;
  ctx.stroke();

  // Baseplate front edge thickness
  ctx.beginPath();
  ctx.moveTo(baseX, baseY + baseH * 0.65);
  ctx.lineTo(baseX + baseW * 0.55, baseY + baseH);
  ctx.lineTo(baseX + baseW * 0.55, baseY + baseH + 16);
  ctx.lineTo(baseX, baseY + baseH * 0.65 + 16);
  ctx.closePath();
  ctx.fillStyle = '#090D1A';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Right edge depth
  ctx.beginPath();
  ctx.moveTo(baseX + baseW * 0.55, baseY + baseH);
  ctx.lineTo(baseX + baseW, baseY + baseH * 0.32);
  ctx.lineTo(baseX + baseW, baseY + baseH * 0.32 + 16);
  ctx.lineTo(baseX + baseW * 0.55, baseY + baseH + 16);
  ctx.closePath();
  ctx.fillStyle = '#060913';
  ctx.fill();
  ctx.restore();

  // Circuit trace lines on baseplate
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.65)';
  ctx.lineWidth = 1.8;
  ctx.shadowColor = '#00E5FF';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(baseX + baseW * 0.22, baseY + baseH * 0.62);
  ctx.lineTo(baseX + baseW * 0.42, baseY + baseH * 0.48);
  ctx.lineTo(baseX + baseW * 0.62, baseY + baseH * 0.56);
  ctx.stroke();

  // Glowing nodes on the floor
  [[baseX + baseW * 0.22, baseY + baseH * 0.62], [baseX + baseW * 0.42, baseY + baseH * 0.48], [baseX + baseW * 0.62, baseY + baseH * 0.56]].forEach(([px, py]) => {
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#00E5FF';
    ctx.fill();
  });
  ctx.restore();

  // 3. 3D Server Stack (Central Multi-tier Unit)
  const rackX = baseX + baseW * 0.30;
  const rackY = baseY - height * 0.28;
  const rackW = width * 0.40;
  const rackH = height * 0.38;

  // Draw 4 Server Blades
  const bladeCount = 4;
  const bladeH = rackH / bladeCount;

  for (let i = 0; i < bladeCount; i++) {
    const curBY = rackY + i * bladeH;

    ctx.save();
    // Isometric server blade top
    ctx.beginPath();
    ctx.moveTo(rackX + rackW * 0.35, curBY);
    ctx.lineTo(rackX + rackW, curBY + bladeH * 0.22);
    ctx.lineTo(rackX + rackW * 0.65, curBY + bladeH * 0.42);
    ctx.lineTo(rackX, curBY + bladeH * 0.20);
    ctx.closePath();
    ctx.fillStyle = i === 0 ? '#334155' : '#1E293B';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Server blade front face
    ctx.beginPath();
    ctx.moveTo(rackX, curBY + bladeH * 0.20);
    ctx.lineTo(rackX + rackW * 0.65, curBY + bladeH * 0.42);
    ctx.lineTo(rackX + rackW * 0.65, curBY + bladeH * 0.42 + bladeH * 0.65);
    ctx.lineTo(rackX, curBY + bladeH * 0.20 + bladeH * 0.65);
    ctx.closePath();

    const frontGrad = ctx.createLinearGradient(rackX, curBY, rackX + rackW * 0.65, curBY + bladeH);
    frontGrad.addColorStop(0, '#0F172A');
    frontGrad.addColorStop(1, '#0B1120');
    ctx.fillStyle = frontGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Server blade right side face
    ctx.beginPath();
    ctx.moveTo(rackX + rackW * 0.65, curBY + bladeH * 0.42);
    ctx.lineTo(rackX + rackW, curBY + bladeH * 0.22);
    ctx.lineTo(rackX + rackW, curBY + bladeH * 0.22 + bladeH * 0.65);
    ctx.lineTo(rackX + rackW * 0.65, curBY + bladeH * 0.42 + bladeH * 0.65);
    ctx.closePath();
    ctx.fillStyle = '#070A12';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Horizontal glowing cyan intake vent slots on front face
    const ventStartY = curBY + bladeH * 0.36;
    for (let v = 0; v < 3; v++) {
      ctx.beginPath();
      ctx.moveTo(rackX + 16, ventStartY + v * 7);
      ctx.lineTo(rackX + rackW * 0.44, ventStartY + v * 7 + 9);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.60)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Status LEDs on front panel
    const ledColors = ['#10B981', '#00E5FF', '#F59E0B', '#EF4444'];
    for (let l = 0; l < 4; l++) {
      const ledX = rackX + rackW * 0.48 + l * 9;
      const ledY = ventStartY + 8 + l * 3;
      ctx.beginPath();
      ctx.arc(ledX, ledY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = ledColors[(i + l) % ledColors.length];
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 7;
      ctx.fill();
      ctx.shadowColor = 'transparent';
    }

    ctx.restore();
  }

  // 4. Front Holographic Display Console (In front on baseplate)
  const holoX = baseX + baseW * 0.08;
  const holoY = baseY + baseH * 0.14;
  const holoW = width * 0.30;
  const holoH = height * 0.17;

  ctx.save();
  // Angled isometric screen
  ctx.beginPath();
  ctx.moveTo(holoX + 10, holoY);
  ctx.lineTo(holoX + holoW, holoY + 18);
  ctx.lineTo(holoX + holoW - 12, holoY + holoH);
  ctx.lineTo(holoX, holoY + holoH - 18);
  ctx.closePath();

  ctx.fillStyle = 'rgba(11, 23, 48, 0.94)';
  ctx.shadowColor = 'rgba(0, 229, 255, 0.55)';
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Internal chart visual on holo display
  // 3 Glowing 3D Bars: Purple, Cyan, Orange
  const barColors = ['#A855F7', '#00E5FF', '#FF9900'];
  const barHeights = [holoH * 0.48, holoH * 0.74, holoH * 0.40];
  for (let b = 0; b < 3; b++) {
    const bx = holoX + 26 + b * 20;
    const byBottom = holoY + holoH - 26 + b * 3;
    const bh = barHeights[b];

    ctx.fillStyle = barColors[b];
    ctx.shadowColor = barColors[b];
    ctx.shadowBlur = 8;
    ctx.fillRect(bx, byBottom - bh, 14, bh);
    ctx.shadowColor = 'transparent';
  }

  // Holographic circuit / flowchart nodes on left of screen
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.75)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(holoX + holoW * 0.50, holoY + 28);
  ctx.lineTo(holoX + holoW * 0.70, holoY + 34);
  ctx.lineTo(holoX + holoW * 0.82, holoY + 54);
  ctx.stroke();

  [[holoX + holoW * 0.50, holoY + 28], [holoX + holoW * 0.70, holoY + 34], [holoX + holoW * 0.82, holoY + 54]].forEach(([nx, ny]) => {
    ctx.beginPath();
    ctx.arc(nx, ny, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#00E5FF';
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 6;
    ctx.fill();
  });
  ctx.restore();

  // 5. Metallic Bronze Storage Cylinders (Database Discs) on Right of Baseplate
  const dbX = baseX + baseW * 0.76;
  const dbY = baseY + baseH * 0.26;
  const dbW = width * 0.16;
  const dbH = height * 0.19;

  ctx.save();
  for (let disc = 0; disc < 3; disc++) {
    const dy = dbY + disc * (dbH / 3);
    const radX = dbW / 2;
    const radY = dbH * 0.15;

    // Cylinder body
    ctx.beginPath();
    ctx.ellipse(dbX + radX, dy + 12, radX, radY, 0, 0, Math.PI * 2);
    const dbGrad = ctx.createLinearGradient(dbX, dy, dbX + dbW, dy);
    dbGrad.addColorStop(0, '#78350F');
    dbGrad.addColorStop(0.3, '#D97706');
    dbGrad.addColorStop(0.7, '#FBBF24');
    dbGrad.addColorStop(1, '#92400E');
    ctx.fillStyle = dbGrad;
    ctx.fill();

    // Cylinder top lip
    ctx.beginPath();
    ctx.ellipse(dbX + radX, dy, radX, radY, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FDE68A';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Glowing cyan vertical indicator
    ctx.fillStyle = '#00E5FF';
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 5;
    ctx.fillRect(dbX + radX * 0.8, dy + 3, 3, 8);
    ctx.shadowColor = 'transparent';
  }
  ctx.restore();

  // 6. Floating Cloud & AI Ecosystem Badges & Glowing Neon Conduits
  const topicLower = (topic || '').toLowerCase();
  const isDataEng = topicLower.includes('data engineering') || topicLower.includes('spark') || topicLower.includes('databricks') || topicLower.includes('pipeline') || topicLower.includes('etl') || topicLower.includes('lakehouse') || topicLower.includes('warehouse');
  const isCloud = topicLower.includes('cloud') || topicLower.includes('devops') || topicLower.includes('kubernetes') || topicLower.includes('docker');
  const isCyber = topicLower.includes('cyber') || topicLower.includes('security') || topicLower.includes('zero trust');

  let badgeDefs = [];
  if (isDataEng) {
    badgeDefs = [
      { id: 'aws', label: 'aws', conduitColor: '#FF9900', w: Math.max(86, width * 0.18) },
      { id: 'databricks', label: 'Databricks', conduitColor: '#FF3621', w: Math.max(126, width * 0.27) },
      { id: 'spark', label: 'Spark', conduitColor: '#E25A1C', w: Math.max(96, width * 0.21) },
      { id: 'airflow', label: 'Airflow', conduitColor: '#00C7D4', w: Math.max(120, width * 0.26) }
    ];
  } else if (isCloud) {
    badgeDefs = [
      { id: 'aws', label: 'aws', conduitColor: '#FF9900', w: Math.max(86, width * 0.18) },
      { id: 'k8s', label: 'Kubernetes', conduitColor: '#326CE5', w: Math.max(128, width * 0.27) },
      { id: 'docker', label: 'Docker', conduitColor: '#2496ED', w: Math.max(98, width * 0.21) },
      { id: 'azure', label: 'Azure', conduitColor: '#0089D6', w: Math.max(106, width * 0.24) }
    ];
  } else if (isCyber) {
    badgeDefs = [
      { id: 'zerotrust', label: 'Zero Trust', conduitColor: '#10B981', w: Math.max(118, width * 0.25) },
      { id: 'shield', label: 'Cloud Shield', conduitColor: '#6366F1', w: Math.max(126, width * 0.27) },
      { id: 'crypto', label: 'AES-256', conduitColor: '#00E5FF', w: Math.max(96, width * 0.21) },
      { id: 'soc2', label: 'SOC 2 Type II', conduitColor: '#F59E0B', w: Math.max(124, width * 0.26) }
    ];
  } else {
    // Default to AI & Innovation (OpenAI, PyTorch, Python, Hugging Face)
    badgeDefs = [
      { id: 'openai', label: 'OpenAI', conduitColor: '#10A37F', w: Math.max(112, width * 0.24) },
      { id: 'pytorch', label: 'PyTorch', conduitColor: '#EE4C2C', w: Math.max(110, width * 0.24) },
      { id: 'python', label: 'Python', conduitColor: '#38BDF8', w: Math.max(100, width * 0.22) },
      { id: 'huggingface', label: 'Hugging Face', conduitColor: '#F59E0B', w: Math.max(130, width * 0.28) }
    ];
  }

  const BADGES = [
    {
      ...badgeDefs[0],
      x: x + width * 0.08,
      y: y + height * 0.08,
      h: Math.max(40, height * 0.076),
      startOffset: { dx: 0.5, dy: 1 },
      dest: { x: rackX + rackW * 0.25, y: rackY + 10 }
    },
    {
      ...badgeDefs[1],
      x: x + width * 0.38,
      y: y + height * 0.01,
      h: Math.max(40, height * 0.076),
      startOffset: { dx: 0.5, dy: 1 },
      dest: { x: rackX + rackW * 0.45, y: rackY }
    },
    {
      ...badgeDefs[2],
      x: x + width * 0.72,
      y: y + height * 0.06,
      h: Math.max(40, height * 0.076),
      startOffset: { dx: 0.5, dy: 1 },
      dest: { x: rackX + rackW * 0.75, y: rackY + 12 }
    },
    {
      ...badgeDefs[3],
      x: x + width * 0.68,
      y: y + height * 0.23,
      h: Math.max(42, height * 0.080),
      startOffset: { dx: 0.2, dy: 1 },
      dest: { x: rackX + rackW * 0.85, y: rackY + bladeH * 1.5 }
    }
  ];

  // Draw Glowing Neon Conduit Cables First (Behind the badges)
  BADGES.forEach(b => {
    ctx.save();
    const startX = b.x + b.w * b.startOffset.dx;
    const startY = b.y + b.h * b.startOffset.dy;

    ctx.strokeStyle = b.conduitColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = b.conduitColor;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    // Smooth bezier curve downwards
    const midX = (startX + b.dest.x) / 2;
    const midY = (startY + b.dest.y) / 2 + 25;
    ctx.bezierCurveTo(startX, startY + 35, midX, midY, b.dest.x, b.dest.y);
    ctx.stroke();

    // Glowing cable connector at dest
    ctx.beginPath();
    ctx.arc(b.dest.x, b.dest.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = b.conduitColor;
    ctx.fill();
    ctx.restore();
  });

  // Draw Floating Cloud & AI Badges (Crisp White Rounded Cards with Soft Shadows)
  BADGES.forEach(b => {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;

    drawRoundRect(ctx, b.x, b.y, b.w, b.h, 12);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.07)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Badge Logo & Text
    const midY = b.y + b.h / 2;
    ctx.textBaseline = 'middle';

    if (b.id === 'openai') {
      const iconSize = Math.round(b.h * 0.44);
      const iconX = b.x + 10;
      // OpenAI Teal Flower
      ctx.strokeStyle = '#10A37F';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(iconX + iconSize / 2, midY, iconSize * 0.40, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#10A37F';
      ctx.beginPath();
      ctx.arc(iconX + iconSize / 2, midY, iconSize * 0.18, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = `800 ${Math.round(b.h * 0.38)}px "Outfit", sans-serif`;
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.fillText('OpenAI', iconX + iconSize + 7, midY);
    } else if (b.id === 'pytorch') {
      const iconSize = Math.round(b.h * 0.44);
      const iconX = b.x + 10;
      // PyTorch Flame/Spark
      drawSparkleIcon(ctx, iconX + iconSize / 2, midY, iconSize * 0.9, '#EE4C2C');

      ctx.font = `800 ${Math.round(b.h * 0.38)}px "Outfit", sans-serif`;
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.fillText('PyTorch', iconX + iconSize + 7, midY);
    } else if (b.id === 'python') {
      const iconSize = Math.round(b.h * 0.44);
      const iconX = b.x + 10;
      // Python dual color curves
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(iconX + iconSize / 2 - 2, midY - 2, iconSize * 0.32, Math.PI, Math.PI * 1.8);
      ctx.stroke();
      ctx.strokeStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(iconX + iconSize / 2 + 2, midY + 2, iconSize * 0.32, 0, Math.PI * 0.8);
      ctx.stroke();

      ctx.font = `800 ${Math.round(b.h * 0.38)}px "Outfit", sans-serif`;
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.fillText('Python', iconX + iconSize + 7, midY);
    } else if (b.id === 'huggingface') {
      const iconSize = Math.round(b.h * 0.44);
      const iconX = b.x + 10;
      // Hugging Face glowing badge
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(iconX + iconSize / 2, midY, iconSize * 0.40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(iconX + iconSize / 2, midY + 1, iconSize * 0.20, 0, Math.PI);
      ctx.fill();

      ctx.font = `800 ${Math.round(b.h * 0.36)}px "Outfit", sans-serif`;
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.fillText('Hugging Face', iconX + iconSize + 7, midY);
    } else if (b.id === 'aws') {
      ctx.font = `800 ${Math.round(b.h * 0.44)}px "Outfit", sans-serif`;
      ctx.fillStyle = '#232F3E';
      ctx.textAlign = 'center';
      ctx.fillText('aws', b.x + b.w / 2, midY - 3);

      // AWS Orange Smile Arrow
      ctx.strokeStyle = '#FF9900';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2, midY + 4, b.w * 0.22, Math.PI * 0.2, Math.PI * 0.8, false);
      ctx.stroke();
    } else if (b.id === 'databricks') {
      const iconSize = Math.round(b.h * 0.42);
      const iconX = b.x + 10;
      // Red Databricks layered parallelogram icon
      ctx.fillStyle = '#FF3621';
      ctx.beginPath();
      ctx.moveTo(iconX + iconSize * 0.5, midY - iconSize * 0.5);
      ctx.lineTo(iconX + iconSize, midY - iconSize * 0.1);
      ctx.lineTo(iconX + iconSize * 0.5, midY + iconSize * 0.3);
      ctx.lineTo(iconX, midY - iconSize * 0.1);
      ctx.closePath();
      ctx.fill();

      ctx.font = `800 ${Math.round(b.h * 0.38)}px "Outfit", sans-serif`;
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.fillText('Databricks', iconX + iconSize + 7, midY);
    } else if (b.id === 'spark') {
      const iconSize = Math.round(b.h * 0.42);
      const iconX = b.x + 10;
      // Spark Orange Flame
      drawSparkleIcon(ctx, iconX + iconSize / 2, midY, iconSize, '#E25A1C');

      ctx.font = `800 ${Math.round(b.h * 0.38)}px "Outfit", sans-serif`;
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.fillText('Spark', iconX + iconSize + 7, midY);
    } else if (b.id === 'airflow') {
      const iconSize = Math.round(b.h * 0.45);
      const iconX = b.x + 12;
      // Multi-colored pinwheel for Airflow
      const colors = ['#00C7D4', '#E43B30', '#2E963D', '#FFB400'];
      for (let p = 0; p < 4; p++) {
        const ang = (p * Math.PI) / 2;
        ctx.fillStyle = colors[p];
        ctx.beginPath();
        ctx.arc(iconX + iconSize / 2 + Math.cos(ang) * 4, midY + Math.sin(ang) * 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = `800 ${Math.round(b.h * 0.38)}px "Outfit", sans-serif`;
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.fillText('Airflow', iconX + iconSize + 8, midY);
    } else if (b.id === 'k8s') {
      const iconSize = Math.round(b.h * 0.44);
      const iconX = b.x + 10;
      ctx.fillStyle = '#326CE5';
      ctx.beginPath();
      ctx.arc(iconX + iconSize / 2, midY, iconSize * 0.40, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = `800 ${Math.round(b.h * 0.36)}px "Outfit", sans-serif`;
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.fillText('Kubernetes', iconX + iconSize + 7, midY);
    } else {
      ctx.font = `800 ${Math.round(b.h * 0.38)}px "Outfit", sans-serif`;
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, b.x + b.w / 2, midY);
    }

    ctx.restore();
  });

  ctx.restore();
}

/**
 * Dedicated Infinitetech AI Flagship Poster Renderer
 * Recreates the official SkyPro AI Calling Agent poster with 100% vector precision:
 * - Top header with Infinitetech AI logo & tagline + handwritten script note
 * - Multi-tier bold headline with brand teal punchline & teal underline bar
 * - Subtitle with highlighted keyword & [ 📅 Book a Demo > ] CTA button
 * - 3D metallic smartphone on glowing pedestal with cute AI robot avatar & soundwaves
 * - 4-column floating feature cards with mint circular badges
 * - Lower dark organic wave ribbon with industry icons
 * - Clean white bottom footer with website & slogan
 */
export function renderMasterclassPoster({
  canvas,
  ctx,
  width,
  height,
  post,
  style,
  brand,
  logoImg,
  topicImg,
  topicImageMeta
}) {
  const isLandscape = height < 750;
  const brandPrimary = brand?.primaryColor || '#00A2A2';
  const website = brand?.websiteUrl || post?.websiteUrl || 'www.infinitetechai.com';

  // 1. Draw Clean High-Tech Background
  // Radiant white-to-mint soft gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#FFFFFF');
  bgGrad.addColorStop(0.55, '#F7FCFC');
  bgGrad.addColorStop(1, '#EDF8F8');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft cyan ambient radial aura behind the phone on right side
  const phoneCx = isLandscape ? width * 0.74 : width * 0.73;
  const phoneCy = isLandscape ? height * 0.36 : height * 0.38;
  const auraR = isLandscape ? width * 0.28 : width * 0.36;

  const aura = ctx.createRadialGradient(phoneCx, phoneCy, 10, phoneCx, phoneCy, auraR);
  aura.addColorStop(0, 'rgba(0, 240, 255, 0.20)');
  aura.addColorStop(0.45, 'rgba(94, 234, 212, 0.16)');
  aura.addColorStop(1, 'transparent');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, width, height);

  // Mint/cyan soundwave backdrop bars radiating behind the phone
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 162, 162, 0.22)';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  const waveW = isLandscape ? width * 0.36 : width * 0.44;
  const waveStartX = phoneCx - waveW / 2;
  const waveBars = 32;
  const waveStep = waveW / waveBars;
  for (let i = 0; i < waveBars; i++) {
    const wx = waveStartX + i * waveStep;
    const norm = Math.sin((i / waveBars) * Math.PI);
    const barH = norm * (isLandscape ? 70 : 110) * (0.35 + 0.65 * Math.sin(i * 0.95));
    ctx.beginPath();
    ctx.moveTo(wx, phoneCy - barH / 2);
    ctx.lineTo(wx, phoneCy + barH / 2);
    ctx.stroke();
  }
  ctx.restore();

  // Floating subtle particles / dots around the aura
  ctx.save();
  ctx.fillStyle = 'rgba(0, 200, 200, 0.32)';
  const particles = [
    { dx: -120, dy: -90, r: 2.5 },
    { dx: 110, dy: -120, r: 3 },
    { dx: -140, dy: 60, r: 2 },
    { dx: 130, dy: 70, r: 3.5 },
    { dx: -70, dy: -140, r: 2 }
  ];
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(phoneCx + p.dx, phoneCy + p.dy, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // Layout Boundaries & Padding
  const padX = Math.round(width * (isLandscape ? 0.04 : 0.05));
  const padY = Math.round(height * (isLandscape ? 0.038 : 0.042));

  // 2. Top Header
  // 2.1 Left: Logo & Tagline
  const logoH = isLandscape ? 46 : 64;
  let logoBottomY = padY + logoH;

  if (logoImg) {
    const isWideLogo = (logoImg.width / logoImg.height) > 1.4;
    const logoW = isWideLogo
      ? Math.min(Math.round(logoH * (logoImg.width / logoImg.height)), isLandscape ? 220 : 310)
      : logoH;

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(logoImg, padX, padY, logoW, logoH);
    ctx.restore();

    // Tagline underneath logo: Only render if brand explicitly has a tagline
    if (brand?.tagline) {
      ctx.font = `700 ${isLandscape ? 9 : 12}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = '#475569';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(brand.tagline, padX + 2, padY + logoH + (isLandscape ? 14 : 18));
      logoBottomY = padY + logoH + (isLandscape ? 18 : 24);
    } else {
      logoBottomY = padY + logoH + (isLandscape ? 8 : 12);
    }
  } else {
    // Vector Brand Logo (Dynamically uses user's brand company name)
    const compName = brand?.companyName || 'POSTCRAFT';
    ctx.save();
    ctx.font = `900 ${isLandscape ? 24 : 32}px "Plus Jakarta Sans", "Outfit", sans-serif`;
    ctx.fillStyle = brandPrimary || '#00A2A2';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(compName, padX, padY + (isLandscape ? 24 : 32));

    if (brand?.tagline) {
      ctx.font = `700 ${isLandscape ? 9 : 12}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = '#475569';
      ctx.fillText(brand.tagline, padX + 2, padY + (isLandscape ? 44 : 56));
      logoBottomY = padY + (isLandscape ? 48 : 62);
    } else {
      logoBottomY = padY + (isLandscape ? 32 : 40);
    }
    ctx.restore();
  }

  // 3. Right Side: AI Generated Hero Visual Showcase (replaces mobile mockup)
  const heroAreaX = isLandscape ? width * 0.52 : width * 0.49;
  const heroAreaY = padY + (isLandscape ? 6 : 14);
  const heroAreaW = width - heroAreaX - padX;
  const heroAreaH = isLandscape ? height * 0.61 : height * 0.57;

  drawAiHeroImageShowcase(ctx, heroAreaX, heroAreaY, heroAreaW, heroAreaH, brandPrimary, post, topicImg);

  // 4. Upper Left: Multi-tier Headline, Subtitle, and CTA Button
  const leftX = padX;
  const leftW = heroAreaX - leftX - (isLandscape ? 16 : 24);
  let curY = logoBottomY + (isLandscape ? 16 : 28);

  // 4.1 Multi-tier Headline
  // Optional prefix ONLY if explicitly provided and not default placeholder
  let prefixText = (post.headlinePrefix || '').trim();
  if (prefixText === "Imagine More. Achieve More with AI." || prefixText === "Your Business Can't Miss") {
    prefixText = '';
  }
  let headlineMain = (post.headline || post.topic || '').trim();
  if (!headlineMain) {
    headlineMain = 'Create Something Great';
  }
  if (headlineMain.toLowerCase().includes("business can't miss") || headlineMain.toLowerCase().includes("your business")) {
    headlineMain = headlineMain.replace(/your business can't miss/i, '').replace(/^[:\-\s]+/, '').trim();
  }

  // Draw Prefix Line (ONLY if explicitly set)
  if (prefixText) {
    let prefixSize = isLandscape ? 18 : 28;
    ctx.save();
    ctx.font = `800 ${prefixSize}px "Plus Jakarta Sans", "Outfit", sans-serif`;
    ctx.fillStyle = '#0F172A';
    ctx.textBaseline = 'alphabetic';

    // Wrap prefix if needed
    let prefixLines = wrapText(ctx, prefixText, leftW);
    if (prefixLines.length > 2 && prefixSize > 22) {
      prefixSize = 24;
      ctx.font = `800 ${prefixSize}px "Plus Jakarta Sans", "Outfit", sans-serif`;
      prefixLines = wrapText(ctx, prefixText, leftW);
    }

    prefixLines.forEach(pl => {
      ctx.fillText(pl, leftX, curY + prefixSize * 0.82);
      curY += Math.round(prefixSize * 1.15);
    });
    ctx.restore();
    curY += isLandscape ? 4 : 8;
  }

  // Draw Giant Teal Headline: dynamically formatted from user's actual headline
  let hlLines = [];
  const words = headlineMain.split(/\s+/).filter(Boolean);
  if (words.length <= 3) {
    hlLines = [headlineMain];
  } else if (words.length <= 5) {
    const mid = Math.ceil(words.length / 2);
    hlLines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  } else {
    const third = Math.ceil(words.length / 3);
    hlLines = [
      words.slice(0, third).join(' '),
      words.slice(third, third * 2).join(' '),
      words.slice(third * 2).join(' ')
    ].filter(Boolean);
  }

  // Calculate optimal font size for the teal punchline
  let hlFontSize = isLandscape ? 36 : 64;
  const hlFontFamily = '"Plus Jakarta Sans", "Outfit", sans-serif';

  // Scale down if any line exceeds available width
  ctx.font = `900 ${hlFontSize}px ${hlFontFamily}`;
  let maxW = 0;
  hlLines.forEach(l => {
    const w = ctx.measureText(l).width;
    if (w > maxW) maxW = w;
  });

  if (maxW > leftW) {
    hlFontSize = Math.floor(hlFontSize * (leftW / maxW));
  }

  const hlLineH = Math.round(hlFontSize * 1.06);

  ctx.save();
  ctx.font = `900 ${hlFontSize}px ${hlFontFamily}`;
  ctx.fillStyle = brandPrimary || '#00A2A2';
  ctx.textBaseline = 'alphabetic';

  hlLines.forEach(line => {
    ctx.fillText(line, leftX, curY + hlFontSize * 0.82);
    curY += hlLineH;
  });
  ctx.restore();

  // Solid Teal Accent Bar underneath the last headline line
  ctx.fillStyle = brandPrimary || '#00A2A2';
  const barW = Math.min(84, leftW * 0.35);
  drawRoundRect(ctx, leftX, curY + (isLandscape ? 4 : 8), barW, isLandscape ? 4 : 6, 3);
  ctx.fill();

  curY += isLandscape ? 18 : 28;

  // 4.2 Subtitle & Description dynamically extracted from post.description
  let subSentence1 = '';
  let subSentence2 = '';

  if (post.description) {
    const sentences = post.description.split(/(?<=[.?!])\s+/);
    subSentence1 = sentences[0] || post.description;
    subSentence2 = sentences.length > 1 ? sentences[1] : '';
  }

  if (subSentence1) {
    const subFontSize = isLandscape ? 12 : 16;
    const subLineH = Math.round(subFontSize * 1.42);

    ctx.save();
    ctx.font = `500 ${subFontSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
    ctx.fillStyle = '#334155';
    ctx.textBaseline = 'alphabetic';

    // Wrap Sentence 1
    const sub1Lines = wrapText(ctx, subSentence1, leftW);
    sub1Lines.forEach(sl => {
      ctx.fillText(sl, leftX, curY + subFontSize * 0.85);
      curY += subLineH;
    });

    // Sentence 2 (if present)
    if (subSentence2) {
      curY += isLandscape ? 3 : 6;
      ctx.font = `600 ${subFontSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
      ctx.fillStyle = '#1E293B';
      const sub2Lines = wrapText(ctx, subSentence2, leftW);
      sub2Lines.forEach(sl => {
        ctx.fillText(sl, leftX, curY + subFontSize * 0.85);
        curY += subLineH;
      });
    }
    ctx.restore();
    curY += isLandscape ? 14 : 22;
  }

  // 4.3 Call to Action (CTA) Pill Button: strictly user's post.cta
  const ctaBtnH = isLandscape ? 38 : 50;
  let rawCta = (post.cta || 'Learn More').replace(/[>→\->]+$/, '').trim();
  const ctaLabel = rawCta || 'Learn More';

  ctx.save();
  ctx.font = `800 ${isLandscape ? 13 : 17}px "Plus Jakarta Sans", sans-serif`;
  const labelMetrics = ctx.measureText(ctaLabel);

  const hasCalendar = /book|schedule|calendar|seat|register|event/i.test(ctaLabel);
  const leftTextOffset = hasCalendar ? (isLandscape ? 34 : 46) : (isLandscape ? 22 : 28);
  const ctaBtnW = Math.min(leftW, Math.max(isLandscape ? 140 : 180, labelMetrics.width + leftTextOffset + (isLandscape ? 28 : 36)));
  const ctaBtnY = curY;

  // Soft teal drop shadow
  ctx.shadowColor = 'rgba(0, 162, 162, 0.35)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;

  drawRoundRect(ctx, leftX, ctaBtnY, ctaBtnW, ctaBtnH, 12);
  const ctaGrad = ctx.createLinearGradient(leftX, ctaBtnY, leftX + ctaBtnW, ctaBtnY + ctaBtnH);
  ctaGrad.addColorStop(0, '#008B8B');
  ctaGrad.addColorStop(1, '#00A2A2');
  ctx.fillStyle = ctaGrad;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  const ctaMidY = ctaBtnY + ctaBtnH / 2;

  // Calendar Icon only if scheduling/booking
  if (hasCalendar) {
    const calSize = isLandscape ? 16 : 20;
    drawCalendarIcon(ctx, leftX + (isLandscape ? 18 : 24), ctaMidY, calSize, '#FFFFFF');
  }

  // CTA Text
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'middle';
  ctx.fillText(ctaLabel, leftX + leftTextOffset, ctaMidY);

  // Chevron Arrow on Right
  drawArrowRight(ctx, leftX + ctaBtnW - (isLandscape ? 16 : 20), ctaMidY, isLandscape ? 12 : 14, '#FFFFFF');
  ctx.restore();

  // 5. Middle Feature Cards: Only rendered if user provided key points
  const userKeyPoints = (post.keyPoints || []).filter(k => k && k.trim().length > 0);
  if (userKeyPoints.length > 0) {
    const featCardX = padX;
    const featCardY = isLandscape ? height * 0.635 : height * 0.615;
    const featCardW = width - padX * 2;
    const featCardH = isLandscape ? 72 : 104;

    drawFourInfinitetechFeatureCards(
      ctx,
      featCardX,
      featCardY,
      featCardW,
      featCardH,
      userKeyPoints,
      brandPrimary,
      isLandscape
    );
  }

  // 6. Lower Dark Organic Wave Ribbon: dynamically populated from brand and post
  const ribbonY = isLandscape ? height * 0.77 : height * 0.76;
  const ribbonH = isLandscape ? height * 0.15 : height * 0.155;

  drawDarkWaveRibbon(
    ctx,
    0,
    ribbonY,
    width,
    ribbonH,
    brandPrimary,
    isLandscape,
    post,
    brand
  );

  // 7. Bottom White Footer Bar: dynamically populated with brand website & tagline
  const footY = ribbonY + ribbonH;
  const footH = height - footY;

  drawInfinitetechFooter(
    ctx,
    0,
    footY,
    width,
    footH,
    website,
    brandPrimary,
    isLandscape,
    brand
  );

  return canvas;
}

/**
 * Master image rendering function
 * Renders complete social media image onto the provided HTML5 Canvas element
 */
export async function renderPostToCanvas({
  canvas,
  post,
  brand,
  styleId = 'corporate',
  formatId = 'linkedin-square',
  colorPaletteId = 'brand',
  bgPattern = null,
  iconType = 'auto',
  highResScale = 1 // 1 for normal 1200px, 2 for retina 2400px if requested
}) {
  if (!canvas || !post) return;

  // Ensure custom web fonts are fully loaded before rendering to canvas
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      // Continue even if font loading threw
    }
  }

  const dim = IMAGE_DIMENSIONS[formatId] || IMAGE_DIMENSIONS['linkedin-square'];
  const width = dim.width;
  const height = dim.height;

  // Set real canvas pixel dimensions
  canvas.width = width * highResScale;
  canvas.height = height * highResScale;

  const ctx = canvas.getContext('2d');
  if (highResScale !== 1) {
    ctx.scale(highResScale, highResScale);
  }

  // Resolve style and palette
  let resolvedStyleId = styleId;
  if (!resolvedStyleId) {
    if (post?.category === 'hiring') resolvedStyleId = 'hiring-01';
    else if (post?.category === 'product') resolvedStyleId = 'product-01';
    else if (post?.category === 'festival') resolvedStyleId = 'festival-01';
    else resolvedStyleId = 'common-01';
  } else if (post?.category === 'hiring' && !resolvedStyleId.startsWith('hiring-') && !resolvedStyleId.startsWith('tpl-hiring')) {
    resolvedStyleId = 'hiring-01';
  } else if (post?.category === 'product' && !resolvedStyleId.startsWith('product-') && !resolvedStyleId.startsWith('tpl-product')) {
    resolvedStyleId = 'product-01';
  } else if (post?.category === 'festival' && !resolvedStyleId.startsWith('festival-')) {
    resolvedStyleId = 'festival-01';
  }

  const style = DESIGN_STYLES.find(s => s.id === resolvedStyleId) || DESIGN_STYLES[0];
  const activePalette = COLOR_PALETTES.find(p => p.id === colorPaletteId);

  const isHiring = style.id?.startsWith('hiring-');
  const isHiringWhite = isHiring && style.id.includes('white');
  const isHiringTeal = isHiring && style.id.includes('teal');

  let accentColor = style.accentColor;
  let secondaryAccent = style.secondaryAccent;
  let ctaBg = style.ctaBg;
  let ctaText = style.ctaText;

  if (isHiring) {
    // Preserve strict hiring palette (#008080 and #FFFFFF / #0F172A)
    accentColor = style.accentColor;
    secondaryAccent = style.secondaryAccent;
    ctaBg = style.ctaBg;
    ctaText = style.ctaText;
  } else if (colorPaletteId === 'brand' && brand?.primaryColor) {
    accentColor = brand.primaryColor;
    secondaryAccent = brand.secondaryColor || brand.primaryColor;
    ctaBg = brand.primaryColor;
    ctaText = '#FFFFFF';
  } else if (activePalette && !activePalette.isBrand && activePalette.primary) {
    accentColor = activePalette.primary;
    secondaryAccent = activePalette.secondary || activePalette.primary;
    ctaBg = activePalette.primary;
    ctaText = '#FFFFFF';
  }

  // Preload logo image (defaults to /logo.png)
  let logoImg = null;
  const rawLogoUrl = brand?.logoUrl || '/logo.png';
  const logoUrlToLoad = rawLogoUrl === '/logo.png' ? '/logo.png?v=3' : rawLogoUrl;
  if (logoUrlToLoad) {
    logoImg = await loadImage(logoUrlToLoad);
  }

  // Resolve and preload related image for the right side (AI generated image or curated visual)
  let topicImageMeta = getTopicRelatedImage(
    post.topic || post.headline,
    post.headline,
    post.categoryName,
    post.imageUrl
  );
  let topicImg = null;
  if (topicImageMeta?.url) {
    const isAi = topicImageMeta.url.includes('pollinations') || topicImageMeta.url.startsWith('/api/');
    topicImg = await loadImage(topicImageMeta.url, isAi ? 22000 : 4000);
  }

  // If custom AI image timed out or failed to load, fall back gracefully to curated topic preset
  if (!topicImg && post.imageUrl) {
    const fallbackMeta = getTopicRelatedImage(
      post.topic || post.headline,
      post.headline,
      post.categoryName,
      null // force curated preset
    );
    if (fallbackMeta?.url && fallbackMeta.url !== topicImageMeta?.url) {
      topicImageMeta = fallbackMeta;
      topicImg = await loadImage(fallbackMeta.url, 4000);
    }
  }

  // Set background photo & card transparency state on ctx
  const hasValidBgImage = Boolean((post?.uploadedImage && post.uploadedImage.width) || (topicImg && topicImg.width) || post?.imageUrl);
  ctx.__hasBackgroundImage = hasValidBgImage && post?.showBackgroundImage !== false;
  ctx.__cardOpacity = post?.cardOpacity ?? 0.0;
  ctx.__bgOverlayOpacity = post?.bgOverlayOpacity ?? 0.38;

  const isLandscape = height < 750; // true for 1200x627 and 1200x630

  // 1. Dedicated Multi-Layout Renders for the 50 Core Professional Templates
  const isUnified50 = Boolean(
    style.id && (
      style.id.startsWith('hiring-') ||
      style.id.startsWith('product-') ||
      style.id.startsWith('festival-') ||
      style.id.startsWith('common-')
    )
  );

  if (isUnified50) {
    return renderUnifiedPoster({
      canvas,
      ctx,
      width,
      height,
      post,
      style,
      brand,
      logoImg,
      topicImg,
      isLandscape
    });
  }

  // Exact 1:1 Scaler Tech Masterclass dedicated full-bleed rendering
  if (style.isMasterclass || style.id === 'masterclass') {
    return renderMasterclassPoster({
      canvas,
      ctx,
      width,
      height,
      post,
      style,
      brand,
      logoImg,
      topicImg,
      topicImageMeta,
      activePalette
    });
  }

  // If style has templateUrl or legacy template ID, map cleanly to unified poster renderer
  if (style.templateUrl || style.id) {
    const fallbackCategory = (style.category || post.category || 'common').toLowerCase();
    let targetId = 'common-01';
    if (fallbackCategory === 'hiring') targetId = 'hiring-01';
    else if (fallbackCategory === 'product') targetId = 'product-01';
    else if (fallbackCategory === 'festival') targetId = 'festival-01';

    return renderUnifiedPoster({
      canvas,
      ctx,
      width,
      height,
      post,
      style: { ...style, id: style.id && style.id.includes('-') ? style.id : targetId },
      brand,
      logoImg,
      topicImg,
      isLandscape
    });
  }

  // 1. Draw Background
  drawBackground(ctx, width, height, style, bgPattern, { primary: accentColor, secondary: secondaryAccent });
  const isDark = style.dark;
  const textColor = style.textColor;
  const textSecondary = style.textSecondary;

  // 2. Proportional Split Grid
  // Left Side = All text (Headline, description, key points, CTA, logo, URL)
  // Right Side = Related image to the heading
  const paddingX = Math.round(width * (isLandscape ? 0.05 : 0.045));
  const paddingY = Math.round(height * (isLandscape ? 0.055 : 0.045));
  const colGap = isLandscape ? 32 : 36;

  const availWidth = width - (paddingX * 2) - colGap;
  const leftColWidth = Math.round(availWidth * (isLandscape ? 0.54 : 0.52));
  const rightColWidth = availWidth - leftColWidth;

  const leftX = paddingX;
  const rightX = leftX + leftColWidth + colGap;

  const cardTopY = paddingY;
  const cardBottomY = height - paddingY;
  const cardHeight = cardBottomY - cardTopY;

  // ==========================================
  // RIGHT SIDE: Related Image to the Heading
  // ==========================================
  ctx.save();
  // Ambient radial color glow behind the right image card
  const glowRadius = Math.max(rightColWidth, cardHeight) * 0.55;
  const ambientGlow = ctx.createRadialGradient(
    rightX + rightColWidth * 0.5,
    cardTopY + cardHeight * 0.5,
    10,
    rightX + rightColWidth * 0.5,
    cardTopY + cardHeight * 0.5,
    glowRadius
  );
  ambientGlow.addColorStop(0, `${accentColor}28`);
  ambientGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = ambientGlow;
  ctx.beginPath();
  ctx.arc(rightX + rightColWidth * 0.5, cardTopY + cardHeight * 0.5, glowRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Draw the cover image inside the right card
  const cardRadius = isLandscape ? 20 : 24;
  drawCoverImage(ctx, topicImg, rightX, cardTopY, rightColWidth, cardHeight, cardRadius, isDark, accentColor);

  // Floating pill badge on the top of the image card
  const imageBadgeText = (topicImageMeta?.tag || post.categoryName || 'FEATURED VISUAL').toUpperCase();
  ctx.save();
  ctx.font = `700 ${isLandscape ? 11 : 12}px "Plus Jakarta Sans", sans-serif`;
  const tagMetrics = ctx.measureText(imageBadgeText);
  const tagPaddingH = 12;
  const tagH = isLandscape ? 28 : 32;
  const tagW = tagMetrics.width + (tagPaddingH * 2) + 16;
  const tagX = rightX + rightColWidth - tagW - 14;
  const tagY = cardTopY + 14;

  drawRoundRect(ctx, tagX, tagY, tagW, tagH, tagH / 2);
  ctx.fillStyle = isHiringWhite ? '#FFFFFF' : (isDark ? 'rgba(15, 23, 42, 0.82)' : 'rgba(255, 255, 255, 0.9)');
  ctx.fill();
  ctx.strokeStyle = isHiringWhite ? '#008080' : (isDark ? `${accentColor}55` : 'rgba(0, 0, 0, 0.12)');
  ctx.lineWidth = 1.2;
  ctx.stroke();

  drawSparkleIcon(ctx, tagX + tagPaddingH + 2, tagY + tagH / 2, 12, isHiringWhite ? '#008080' : accentColor);
  ctx.fillStyle = isHiringWhite ? '#008080' : (isDark ? '#FFFFFF' : '#0F172A');
  ctx.textBaseline = 'middle';
  ctx.fillText(imageBadgeText, tagX + tagPaddingH + 14, tagY + tagH / 2);
  ctx.restore();

  // Floating bottom badge on the image card
  ctx.save();
  const bottomBadgeH = isLandscape ? 28 : 34;
  const bottomBadgeY = cardBottomY - bottomBadgeH - 14;
  const bottomBadgeX = rightX + 14;
  const bottomBadgeText = (post.topic || post.headline || 'Industry Intelligence').slice(0, 26);
  ctx.font = `600 ${isLandscape ? 11 : 12}px "Plus Jakarta Sans", sans-serif`;
  const bMetrics = ctx.measureText(bottomBadgeText);
  const bW = bMetrics.width + 26;

  drawRoundRect(ctx, bottomBadgeX, bottomBadgeY, bW, bottomBadgeH, bottomBadgeH / 2);
  ctx.fillStyle = isHiringWhite ? '#FFFFFF' : (isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(255, 255, 255, 0.85)');
  ctx.fill();
  ctx.strokeStyle = isHiringWhite ? 'rgba(0, 128, 128, 0.35)' : (isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)');
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = isHiringWhite ? '#008080' : (isDark ? '#E2E8F0' : '#1E293B');
  ctx.textBaseline = 'middle';
  ctx.fillText(bottomBadgeText, bottomBadgeX + 13, bottomBadgeY + bottomBadgeH / 2);
  ctx.restore();

  const isMasterclass = style.isMasterclass || style.id === 'masterclass';
  if (isMasterclass) {
    drawFloatingTechBadges(ctx, rightX, cardTopY, rightColWidth, cardHeight, post.topic || post.headline, isDark);
  }

  // ==========================================
  // LEFT SIDE: All The Text
  // ==========================================
  let currentY = paddingY;

  // 1. Header (Logo + Company Branding - Bold and Prominent)
  const isWideLogo = logoImg && (logoImg.width / logoImg.height) > 1.35;
  const logoH = isLandscape ? 56 : 72;
  const logoW = isWideLogo 
    ? Math.min(Math.round(logoH * (logoImg.width / logoImg.height)), Math.round(leftColWidth * 0.70))
    : (isLandscape ? 50 : 64);
  const headerY = currentY + logoH / 2;
  let brandTextX = leftX;

  if (logoImg) {
    if (isWideLogo) {
      // Draw rectangular banner logo (Infinite Tech) in an immaculate rounded card badge
      const badgePadX = isLandscape ? 12 : 16;
      const badgePadY = isLandscape ? 7 : 9;
      const badgeW = logoW + (badgePadX * 2);
      const badgeH = logoH + (badgePadY * 2);
      const badgeRadius = 14;

      ctx.save();
      // Clean white backdrop badge ensuring the logo displays with 100% clarity on all styles
      ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 3;
      drawRoundRect(ctx, leftX, currentY, badgeW, badgeH, badgeRadius);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();

      ctx.save();
      drawRoundRect(ctx, leftX, currentY, badgeW, badgeH, badgeRadius);
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.10)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // Draw the logo image
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(logoImg, leftX + badgePadX, currentY + badgePadY, logoW, logoH);
      ctx.restore();

      brandTextX = leftX + badgeW + 14;
    } else {
      ctx.save();
      const logoRadius = Math.round(logoW * 0.25);
      drawRoundRect(ctx, leftX, currentY, logoW, logoH, logoRadius);
      ctx.clip();
      ctx.drawImage(logoImg, leftX, currentY, logoW, logoH);
      ctx.restore();
      brandTextX = leftX + logoW + 14;

      // Company Name for square logos
      ctx.save();
      ctx.font = `700 ${isLandscape ? 18 : 21}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'middle';
      ctx.fillText(brand?.companyName || 'Infinite Tech', brandTextX, headerY);
      ctx.restore();
    }
  } else {
    drawBrandedLogoPlaceholder(ctx, leftX, headerY, logoW, brand?.companyName || 'Infinite Tech', accentColor, isDark);
    brandTextX = leftX + logoW + 14;

    ctx.save();
    ctx.font = `700 ${isLandscape ? 18 : 21}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';
    ctx.fillText(brand?.companyName || 'Infinite Tech', brandTextX, headerY);
    ctx.restore();
  }

  // Category pill on top right of the left column
  const categoryLabel = (post.categoryName || 'INDUSTRY INSIGHTS').toUpperCase();
  ctx.save();
  ctx.font = `700 11px "Plus Jakarta Sans", sans-serif`;
  const catMetrics = ctx.measureText(categoryLabel);
  const catPillW = catMetrics.width + 20;
  const catPillH = isLandscape ? 24 : 26;
  const catPillX = leftX + leftColWidth - catPillW;

  if (catPillX > brandTextX + 15) {
    drawRoundRect(ctx, catPillX, headerY - catPillH / 2, catPillW, catPillH, catPillH / 2);
    ctx.fillStyle = style.categoryPillBg;
    ctx.fill();
    ctx.strokeStyle = style.categoryPillBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = style.categoryPillText;
    ctx.textBaseline = 'middle';
    ctx.fillText(categoryLabel, catPillX + 10, headerY);
  }
  ctx.restore();

  currentY += (isWideLogo ? (logoH + 10) : logoH) + (isLandscape ? 16 : 22);

  // 2. Small Topic Icon Badge
  const resolvedIcon = (!iconType || iconType === 'auto')
    ? detectTopicIcon(post.topic || post.headline, post.categoryName)
    : iconType;

  if (resolvedIcon !== 'none') {
    const iconBadgeSize = isLandscape ? 32 : 38;
    drawTopicIconBadge(ctx, leftX + iconBadgeSize / 2, currentY + iconBadgeSize / 2, iconBadgeSize, resolvedIcon, accentColor, isDark);

    // Micro pill label next to icon badge
    ctx.save();
    ctx.font = `700 ${isLandscape ? 11 : 12}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = accentColor;
    ctx.textBaseline = 'middle';
    ctx.fillText(categoryLabel, leftX + iconBadgeSize + 12, currentY + iconBadgeSize / 2);
    ctx.restore();

    currentY += iconBadgeSize + (isLandscape ? 10 : 16);
  }

  // 3. Headline (Bold, Commanding Outfit Font with High-Impact Pop)
  const headlineMaxLines = 3;
  const availableLeftHeight = cardBottomY - currentY - (isLandscape ? 70 : 90);
  const maxHeadlineH = availableLeftHeight * 0.46;

  const headlineFit = fitHeadline(
    ctx,
    post.headline,
    leftColWidth,
    maxHeadlineH,
    headlineMaxLines,
    isLandscape ? (isMasterclass ? 50 : 46) : (isMasterclass ? 78 : 70),
    isLandscape ? 28 : 40,
    '"Outfit", "Bricolage Grotesque", "Plus Jakarta Sans", sans-serif'
  );

  currentY += headlineFit.fontSize * 0.74;
  ctx.save();
  ctx.textBaseline = 'alphabetic';

  headlineFit.lines.forEach((line, lineIdx) => {
    const isLastLine = lineIdx === headlineFit.lines.length - 1;
    const yearMatch = line.match(/\b(202\d|203\d)\b/);

    if (isMasterclass && (yearMatch || isLastLine)) {
      let prefix = '';
      let highlightWord = '';

      if (yearMatch) {
        const matchIdx = line.indexOf(yearMatch[0]);
        prefix = line.slice(0, matchIdx);
        highlightWord = line.slice(matchIdx);
      } else {
        const words = line.split(' ');
        if (words.length > 1) {
          prefix = words.slice(0, -1).join(' ') + ' ';
          highlightWord = words[words.length - 1];
        } else {
          highlightWord = line;
        }
      }

      // Draw prefix words in deep black/navy
      ctx.font = `900 ${headlineFit.fontSize}px "Outfit", "Bricolage Grotesque", "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = textColor;
      ctx.fillText(prefix, leftX, currentY);

      const prefixW = ctx.measureText(prefix).width;
      const highlightW = ctx.measureText(highlightWord).width;

      // Draw signature Yellow Marker Highlight behind punchline (like "in 2026")
      const markerH = Math.max(14, Math.round(headlineFit.fontSize * 0.32));
      drawMarkerHighlight(ctx, leftX + prefixW, currentY, highlightW, markerH, style.highlightColor || '#FACC15');

      // Draw punchline in vibrant Electric Blue
      ctx.fillStyle = accentColor;
      ctx.fillText(highlightWord, leftX + prefixW, currentY);
    } else {
      ctx.font = `900 ${headlineFit.fontSize}px "Outfit", "Bricolage Grotesque", "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = textColor;
      ctx.fillText(line, leftX, currentY);
    }

    currentY += headlineFit.lineHeight;
  });

  // Gradient underline accent bar under headline (for non-masterclass styles)
  if (!isMasterclass) {
    const dividerY = currentY + 6;
    const divGrad = ctx.createLinearGradient(leftX, dividerY, leftX + 90, dividerY);
    divGrad.addColorStop(0, accentColor);
    divGrad.addColorStop(1, secondaryAccent || accentColor);
    ctx.fillStyle = divGrad;
    ctx.fillRect(leftX, dividerY, 80, 4);
  }
  ctx.restore();

  currentY += isLandscape ? 16 : 22;

  // 4. Description / Sub-headline
  const maxDescH = (cardBottomY - currentY - (isLandscape ? 80 : 130)) * 0.45;
  const descFit = wrapDescription(
    ctx,
    post.description,
    leftColWidth,
    maxDescH,
    isLandscape ? (isMasterclass ? 16 : 15) : (isMasterclass ? 22 : 20),
    isLandscape ? (isMasterclass ? 23 : 22) : (isMasterclass ? 30 : 28),
    '"Plus Jakarta Sans", "Inter", sans-serif'
  );

  ctx.save();
  ctx.font = `${isMasterclass ? '700' : '500'} ${descFit.fontSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
  ctx.fillStyle = isMasterclass ? (isDark ? '#E2E8F0' : '#1E293B') : textSecondary;
  ctx.textBaseline = 'alphabetic';
  descFit.lines.forEach(line => {
    ctx.fillText(line, leftX, currentY);
    currentY += descFit.lineHeight;
  });
  ctx.restore();

  currentY += isLandscape ? 12 : 20;

  // 5. Key Points with Multi-Colored 3D Circular Badges
  const points = (post.keyPoints || []).slice(0, isLandscape ? 2 : (isMasterclass ? 4 : 3));
  const remainingForPoints = cardBottomY - currentY - (isLandscape ? 60 : (isMasterclass ? 115 : 80));

  if (points.length > 0 && remainingForPoints > 50) {
    const ptCardH = Math.min(remainingForPoints, points.length * (isLandscape ? 50 : (isMasterclass ? 68 : 62)) + 18);

    ctx.save();
    if (!isMasterclass) {
      drawRoundRect(ctx, leftX, currentY, leftColWidth, ptCardH, 16);
      ctx.fillStyle = style.cardBg;
      ctx.fill();
      ctx.strokeStyle = style.cardBorder;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    let ptY = currentY + (isLandscape ? 26 : 34);
    const bulletSize = isLandscape ? 26 : (isMasterclass ? 36 : 28);
    const ptTextWidth = leftColWidth - bulletSize - 34;

    const isWhiteCard = style.cardBg === '#FFFFFF' || style.cardBg === 'rgba(255, 255, 255, 0.95)';
    const cardTextColor = isHiringWhite
      ? '#008080'
      : (isHiringTeal ? (isWhiteCard ? '#0F172A' : '#FFFFFF') : textColor);
    const cardAccentColor = isHiringWhite
      ? '#008080'
      : (isHiringTeal ? (isWhiteCard ? '#0F172A' : '#FFFFFF') : accentColor);

    points.forEach((pt, idx) => {
      if (ptY > currentY + ptCardH - 12) return;

      if (isMasterclass || style.useMultiColorBadges) {
        drawMultiColorCategoryBadge(ctx, leftX + 14 + bulletSize / 2, ptY - 4, bulletSize, idx, pt, isDark);
      } else {
        drawModernBulletBadge(ctx, leftX + 14 + bulletSize / 2, ptY - 5, bulletSize, cardAccentColor, isDark && !isWhiteCard);
      }

      // Highlight [Topic]: prefix if present
      const colonIndex = pt.indexOf(':');
      if (colonIndex > 0 && colonIndex < 35) {
        const topicPrefix = pt.slice(0, colonIndex + 1);
        const restText = pt.slice(colonIndex + 1).trim();

        ctx.font = `700 ${isLandscape ? 14 : 18}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = isMasterclass ? (isDark ? '#FFFFFF' : '#0B132B') : cardAccentColor;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(topicPrefix, leftX + 14 + bulletSize + 14, ptY);

        const prefixWidth = ctx.measureText(topicPrefix + ' ').width;

        ctx.font = `500 ${isLandscape ? 14 : 17}px "Plus Jakarta Sans", "Inter", sans-serif`;
        ctx.fillStyle = isMasterclass ? (isDark ? '#CBD5E1' : '#475569') : cardTextColor;
        const ptLines = wrapText(ctx, restText, ptTextWidth - prefixWidth);
        ctx.fillText(ptLines[0] || restText, leftX + 14 + bulletSize + 14 + prefixWidth, ptY);
      } else {
        ctx.font = `700 ${isLandscape ? 14 : 18}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = isMasterclass ? (isDark ? '#FFFFFF' : '#0B132B') : cardTextColor;
        ctx.textBaseline = 'alphabetic';
        const ptLines = wrapText(ctx, pt, ptTextWidth);
        ctx.fillText(ptLines[0] || pt, leftX + 14 + bulletSize + 14, ptY);
      }

      ptY += isLandscape ? 44 : (isMasterclass ? 58 : 54);
    });

    ctx.restore();
    currentY += ptCardH + (isLandscape ? 12 : 18);
  }

  // 6. Bottom Row: Executive Masterclass Presenter Card OR CTA Button
  if (isMasterclass) {
    const presH = isLandscape ? 78 : 96;
    const presY = cardBottomY - presH;
    drawMasterclassPresenterCard({
      ctx,
      x: leftX,
      y: presY,
      width: leftColWidth,
      height: presH,
      brand,
      post,
      accentColor,
      isLandscape
    });
  } else {
    // 5.5 Topic & AI-Related Feature Highlight Card (fills vertical empty space with headline-related AI visuals)
    const ctaBtnH = isLandscape ? 40 : 48;
    const ctaY = cardBottomY - ctaBtnH;
    const availableFeatureGap = (ctaY - 14) - currentY;

    if (availableFeatureGap >= 55) {
      const featureCardH = Math.min(availableFeatureGap, isLandscape ? 74 : 115);
      const featureCardY = currentY + Math.round((availableFeatureGap - featureCardH) / 2);

      drawTopicFeatureCard({
        ctx,
        x: leftX,
        y: featureCardY,
        width: leftColWidth,
        height: featureCardH,
        post,
        style,
        accentColor,
        isDark,
        iconType: post.iconType || 'auto',
        isLandscape,
      });
    }

    // Standard CTA Button + Website URL
    const rawCta = post.cta || brand?.defaultCta || "Transform Your Business Today →";
    const ctaTextClean = rawCta.replace(/[→\->]+$/, '').trim();

    ctx.save();
    ctx.font = `700 ${isLandscape ? 13 : 15}px "Plus Jakarta Sans", sans-serif`;
    const ctaMetrics = ctx.measureText(ctaTextClean);
    const arrowBadgeSize = isLandscape ? 22 : 26;
    const ctaPaddingH = isLandscape ? 16 : 22;
    const maxCtaWidth = leftColWidth * 0.65;
    const ctaWidth = Math.min(maxCtaWidth, ctaMetrics.width + (ctaPaddingH * 2) + arrowBadgeSize + 8);

    const ctaGrad = ctx.createLinearGradient(leftX, ctaY, leftX + ctaWidth, ctaY);
    ctaGrad.addColorStop(0, ctaBg);
    ctaGrad.addColorStop(1, secondaryAccent || ctaBg);

    drawRoundRect(ctx, leftX, ctaY, ctaWidth, ctaBtnH, ctaBtnH / 2);
    ctx.fillStyle = ctaGrad;
    ctx.shadowColor = isDark ? `${ctaBg}80` : 'rgba(0,0,0,0.18)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 3;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = ctaText;
    ctx.textBaseline = 'middle';
    const ctaMidY = ctaY + ctaBtnH / 2;
    ctx.fillText(ctaTextClean, leftX + ctaPaddingH, ctaMidY);

    const badgeX = leftX + ctaWidth - ctaPaddingH / 2 - arrowBadgeSize / 2;
    drawCtaArrowBadge(ctx, badgeX, ctaMidY, arrowBadgeSize / 2, 'rgba(255, 255, 255, 0.25)', '#FFFFFF');
    ctx.restore();

    // Website URL (Aligned beside the CTA button)
    const websiteUrl = brand?.websiteUrl || 'www.infinitetechai.com';
    ctx.save();
    ctx.font = `600 ${isLandscape ? 12 : 13}px "Plus Jakarta Sans", sans-serif`;
    const urlColor = isHiringWhite ? '#008080' : (isHiringTeal ? '#FFFFFF' : textSecondary);
    ctx.fillStyle = urlColor;
    ctx.textBaseline = 'middle';
    const urlMetrics = ctx.measureText(websiteUrl);
    const urlX = leftX + leftColWidth - urlMetrics.width - 20;

    if (urlX > leftX + ctaWidth + 14) {
      drawGlobeIcon(ctx, urlX, ctaMidY, 14, urlColor);
      ctx.fillText(websiteUrl, urlX + 14, ctaMidY);
    }
    ctx.restore();
  }

  return canvas;
}
