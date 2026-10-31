/**
 * Shared Canvas Utilities for Professional White & Teal (#008080) Posters
 * 
 * Inspired by high-converting agency marketing graphics:
 * - Fluid bezier wave ribbons with clipping masks
 * - Dynamic diagonal velocity bands
 * - 3D device showcases & pedestals
 * - Big, bold, colorful display typography (70px - 105px)
 * - Dot matrix grids & perspective warp meshes
 * - Circular icon specification rows & floating glossy badges
 * - Clickable-looking Call To Action buttons + contact capsules
 */

import {
  drawRoundRect,
  wrapText,
  fitHeadline,
  drawCtaArrowBadge,
  drawCheckmarkIcon,
  drawGlobeIcon,
  drawBriefcaseIcon,
  drawTargetIcon,
  drawZapIcon,
  drawSparkleIcon,
  drawClockIcon
} from '../../utils/textLayout.js';

export const TEAL_PRIMARY = '#008080';
export const TEAL_DARK = '#004D4D';
export const TEAL_LIGHT = '#00A2A2';
export const TEAL_VIBRANT = '#14B8A6';
export const TEAL_BG_TINT = '#F0FDFA';
export const TEAL_BG_LIGHT = '#E6F4F4';
export const TEAL_BORDER = 'rgba(0, 128, 128, 0.22)';
export const TEXT_DARK = '#0F172A';
export const TEXT_MUTED = '#475569';
export const GOLD_ACCENT = '#D97706';

/**
 * 1. Poster Background with Optional Dot Matrix or Warp Mesh
 */
export async function renderPosterBackground({
  ctx,
  width,
  height,
  post,
  style,
  accentColor = TEAL_PRIMARY,
  pattern = 'dots',
  topicImg = null
}) {
  ctx.save();

  // Resolve photo from user upload OR matched local images_AI folder
  const bgImg = (post?.uploadedImage && typeof post.uploadedImage === 'object' && post.uploadedImage.width)
    ? post.uploadedImage
    : (topicImg && topicImg.width && post?.showBackgroundImage !== false)
      ? topicImg
      : null;

  if (bgImg && bgImg.width > 0) {
    ctx.__hasBackgroundImage = true;
    ctx.__cardOpacity = typeof post?.cardOpacity === 'number' ? post.cardOpacity : 0.0;
    ctx.__cardStyle = post?.cardStyle || (post?.cardOpacity > 0.05 ? 'glass' : 'minimal');
    ctx.__bgOverlayOpacity = post?.bgOverlayOpacity ?? 0.38;

    const scale = Math.max(width / bgImg.width, height / bgImg.height);
    const dw = bgImg.width * scale;
    const dh = bgImg.height * scale;
    const dx = (width - dw) / 2;
    const dy = (height - dh) / 2;
    ctx.drawImage(bgImg, dx, dy, dw, dh);

    // Dynamic Translucent Scrim - keeps background photo vivid and provides pristine contrast for floating typography!
    const baseAlpha = post?.bgOverlayOpacity ?? 0.38;
    const scrim = ctx.createLinearGradient(0, 0, 0, height);
    scrim.addColorStop(0, `rgba(15, 23, 42, ${baseAlpha * 0.45})`);
    scrim.addColorStop(0.4, `rgba(15, 23, 42, ${baseAlpha * 0.65})`);
    scrim.addColorStop(0.8, `rgba(15, 23, 42, ${baseAlpha * 0.88})`);
    scrim.addColorStop(1, `rgba(15, 23, 42, ${Math.min(0.92, baseAlpha * 1.20)})`);
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
    return;
  }

  // Base Clean White Canvas
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Soft Ambient Light Teal Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#FFFFFF');
  bgGrad.addColorStop(0.70, '#FFFFFF');
  bgGrad.addColorStop(1, TEAL_BG_TINT);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Architectural Background Elements based on pattern
  if (pattern === 'dots' || pattern === 'default') {
    // Dot Matrix Pattern in Top-Right and Bottom-Left
    drawDotMatrix(ctx, width * 0.60, 36, 220, 120, 28, 2.8, 'rgba(0, 128, 128, 0.16)');
    drawDotMatrix(ctx, 40, height - 180, 160, 90, 26, 2.5, 'rgba(0, 128, 128, 0.12)');
  } else if (pattern === 'warp-mesh') {
    // Dynamic Perspective Warp Mesh Grid
    drawWarpMesh(ctx, width, height, 'rgba(0, 128, 128, 0.08)');
  } else {
    // Subtle architectural grid
    ctx.strokeStyle = 'rgba(0, 128, 128, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 54;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  }

  // Soft Radial Glow in Top-Right
  const radGlow = ctx.createRadialGradient(width * 0.85, height * 0.15, 20, width * 0.85, height * 0.15, width * 0.50);
  radGlow.addColorStop(0, 'rgba(0, 128, 128, 0.10)');
  radGlow.addColorStop(0.7, 'rgba(0, 162, 162, 0.03)');
  radGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = radGlow;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
}

/**
 * Dot Matrix Grid (seen in modern marketing posters)
 */
export function drawDotMatrix(ctx, x, y, w, h, spacing = 24, dotR = 2.5, color = 'rgba(0, 128, 128, 0.2)') {
  ctx.save();
  ctx.fillStyle = color;
  for (let px = x; px <= x + w; px += spacing) {
    for (let py = y; py <= y + h; py += spacing) {
      ctx.beginPath();
      ctx.arc(px, py, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * Perspective Warp Mesh Grid (seen in high-end tech posters like Skillmount)
 */
export function drawWarpMesh(ctx, width, height, color = 'rgba(0, 128, 128, 0.07)') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;

  const lines = 14;
  for (let i = 0; i <= lines; i++) {
    const y = (height / lines) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(width * 0.35, y + 25 * Math.sin(i), width * 0.65, y - 25 * Math.sin(i), width, y);
    ctx.stroke();
  }

  for (let i = 0; i <= lines; i++) {
    const x = (width / lines) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + 25 * Math.sin(i), height * 0.35, x - 25 * Math.sin(i), height * 0.65, x, height);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Helper: Draw a decorative hanging ornament at (x, y)
 * Types: 'lantern' | 'bulb' | 'star' | 'diya' | 'bell' | 'beads'
 * Matches the user's festive hand-drawn sketch of hanging lights & ornaments
 */
function drawHangingOrnament(ctx, x, y, type, primaryColor, glowColor, scale = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  if (type === 'lantern') {
    // 1. Festive Lantern / Pendant
    ctx.fillStyle = primaryColor;
    ctx.fillRect(-4, -2, 8, 3);

    const grad = ctx.createRadialGradient(0, 5, 1, 0, 5, 8);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.35, glowColor);
    grad.addColorStop(1, primaryColor);

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(6, 4);
    ctx.lineTo(4, 11);
    ctx.lineTo(0, 13);
    ctx.lineTo(-4, 11);
    ctx.lineTo(-6, 4);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Bottom droplet
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(0, 16, 2, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'bulb') {
    // 2. Glowing Fairy Light Bulb
    ctx.fillStyle = primaryColor;
    ctx.fillRect(-2.5, -2, 5, 3);

    const bulbGrad = ctx.createRadialGradient(-1, 3, 1, 0, 5, 7);
    bulbGrad.addColorStop(0, '#FFFFFF');
    bulbGrad.addColorStop(0.45, glowColor);
    bulbGrad.addColorStop(1, primaryColor);

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 9;
    ctx.fillStyle = bulbGrad;
    ctx.beginPath();
    ctx.arc(0, 5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Filament center
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-1, 3.5, 1.6, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'star') {
    // 3. 4-Point Diamond Sparkle Star
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8;
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.quadraticCurveTo(0, 0, 7, 0);
    ctx.quadraticCurveTo(0, 0, 0, 9);
    ctx.quadraticCurveTo(0, 0, -7, 0);
    ctx.quadraticCurveTo(0, 0, 0, -9);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'diya') {
    // 4. Festive Diya / Lamp bowl
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 5, 7, 3.5, 0, 0, Math.PI);
    ctx.fill();

    // Flame
    const flameGrad = ctx.createLinearGradient(0, 4, 0, -5);
    flameGrad.addColorStop(0, '#EF4444');
    flameGrad.addColorStop(0.4, glowColor);
    flameGrad.addColorStop(1, '#FFFFFF');

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8;
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.quadraticCurveTo(3, 1, 0, 4);
    ctx.quadraticCurveTo(-3, 1, 0, -5);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

  } else if (type === 'bell') {
    // 5. Festive Bell / Drop Pendant
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-2, -2, 4, 2);

    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(4, 2, 5, 8);
    ctx.lineTo(-5, 8);
    ctx.quadraticCurveTo(-4, 2, 0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(0, 11, 2, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // 6. Bead Cluster / Toran Motif
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(0, 2, 3, 0, Math.PI * 2);
    ctx.arc(0, 8, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(0, 14, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * 2. Top Branding Bar (Solid White Background across top + Undulating Wave Boundary + Logo & Category Pill)
 * 
 * Requirement:
 * - "top also like bottom okay see the second image"
 * - Full-width clean white header background (#FFFFFF) starting from top of canvas
 * - Bottom boundary of top bar follows an organic undulating wave curve matching user's sketch
 * - Rhythmic decorative hanging strings & ornaments (lights, lanterns, sparkles, diyas) matching user sketch
 * - Logo and category pill badge rendered crisply on the white header
 * - Returns contentTopY with ample clearance so headlines never collide
 */
export function renderStandardTopBar({
  ctx,
  width,
  height,
  post,
  brand,
  logoImg,
  style,
  padX,
  padY,
  isLandscape = false,
  accentColor = TEAL_PRIMARY
}) {
  ctx.save();

  const footerStyle = post?.footerStyle || 'lights'; // 'lights' (default) | 'wave' | 'straight'
  const headerY = padY;
  const headerH = isLandscape ? 48 : 62;

  // Wave parameters for rhythmic undulating curve across canvas width (matching bottom wave)
  const waveCycles = isLandscape ? 4.5 : 3.5;
  const waveAmp = isLandscape ? 8 : 12;
  const topWaveBaseY = headerY + headerH + (isLandscape ? 10 : 16);

  const getTopWaveY = (x) => {
    if (footerStyle === 'straight') return topWaveBaseY;
    return topWaveBaseY + Math.sin((x / width) * Math.PI * 2 * waveCycles) * waveAmp;
  };

  // 1. Fill Solid Clean White Header Background (#FFFFFF) from top of canvas to the wave curve
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(width, getTopWaveY(width));
  const step = 4;
  for (let x = width; x >= 0; x -= step) {
    ctx.lineTo(x, getTopWaveY(x));
  }
  ctx.closePath();
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.14)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 3;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // 2. Decorative Wave Divider Line on bottom edge of white header
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, getTopWaveY(0));
  for (let x = step; x <= width; x += step) {
    ctx.lineTo(x, getTopWaveY(x));
  }
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Delicate secondary echo line
  ctx.beginPath();
  ctx.moveTo(0, getTopWaveY(0) - 3);
  for (let x = step; x <= width; x += step) {
    ctx.lineTo(x, getTopWaveY(x) - 3);
  }
  ctx.strokeStyle = 'rgba(0, 128, 128, 0.20)';
  ctx.lineWidth = 1.0;
  ctx.stroke();
  ctx.restore();

  // 3. Hanging Strings & Decorative Ornaments (Matching user sketch & bottom bar)
  if (footerStyle === 'lights') {
    const isFestival = style?.category === 'festivals' ||
      (post?.headline || '').toLowerCase().includes('diwali') ||
      (post?.tagline || '').toLowerCase().includes('festival') ||
      (post?.theme || '').toLowerCase().includes('festive');

    const ornPrimary = isFestival ? '#D97706' : accentColor;
    const ornGlow = isFestival ? '#FBBF24' : '#2DD4BF';

    const numDrops = isLandscape ? 10 : 8;
    const topStringLenList = isLandscape
      ? [8, 14, 6, 12, 8, 16, 6, 12, 8, 14]
      : [12, 20, 10, 18, 14, 22, 10, 16];

    const ornamentTypes = ['bulb', 'star', 'lantern', 'bell', 'diya', 'star', 'bulb', 'beads'];
    const ornScale = isLandscape ? 0.62 : 0.80;

    for (let i = 0; i < numDrops; i++) {
      const dropX = width * (0.06 + (i * (0.88 / (numDrops - 1))));
      const dropStartY = getTopWaveY(dropX);
      const dropLen = topStringLenList[i % topStringLenList.length];
      const dropEndY = dropStartY + dropLen;

      // Anchor bead on the wave line
      ctx.fillStyle = ornPrimary;
      ctx.beginPath();
      ctx.arc(dropX, dropStartY, isLandscape ? 2.0 : 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Slender vertical hanging string
      ctx.strokeStyle = isFestival ? 'rgba(217, 119, 6, 0.45)' : 'rgba(0, 128, 128, 0.38)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(dropX, dropStartY);
      ctx.lineTo(dropX, dropEndY);
      ctx.stroke();

      // Draw hanging ornament
      const ornType = ornamentTypes[i % ornamentTypes.length];
      drawHangingOrnament(ctx, dropX, dropEndY, ornType, ornPrimary, ornGlow, ornScale);
    }
  }

  // 4. Company Logo (top-left on white header)
  if (logoImg && typeof logoImg === 'object' && logoImg.width) {
    const scale = Math.min((headerH - 8) / logoImg.height, 220 / logoImg.width);
    const lw = logoImg.width * scale;
    const lh = logoImg.height * scale;
    ctx.drawImage(logoImg, padX, headerY + (headerH - lh) / 2, lw, lh);
  } else {
    const compName = (brand?.companyName || 'INFINITETECH AI').toUpperCase();
    ctx.font = `900 ${isLandscape ? 17 : 22}px "Outfit", "Plus Jakarta Sans", sans-serif`;

    // Glowing Teal Status Dot
    ctx.beginPath();
    ctx.arc(padX + 10, headerY + headerH / 2, 6, 0, Math.PI * 2);
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.shadowColor = 'rgba(0, 128, 128, 0.40)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(compName, padX + 24, headerY + headerH / 2);
  }

  // 5. Category Pill Badge (top-right on white header)
  const category = (style?.category || 'general').toUpperCase();
  const badgeText = (style?.badge || (category === 'HIRING' ? "WE'RE HIRING" : category === 'PRODUCT' ? 'PRODUCT SHOWCASE' : category)).toUpperCase();
  ctx.font = `900 ${isLandscape ? 14 : 18}px "Outfit", sans-serif`;
  const pillW = ctx.measureText(badgeText).width + 36;
  const pillH = isLandscape ? 38 : 46;
  const pillY = headerY + (headerH - pillH) / 2;
  const pillX = width - padX - pillW;

  drawRoundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, pillX + pillW / 2, pillY + pillH / 2);

  ctx.restore();

  const contentTopY = topWaveBaseY + waveAmp + (isLandscape ? 22 : 36);
  return { headerH, contentTopY };
}

/**
 * 3. Bottom Footer Bar (Solid White Background across bottom + Dynamic Call To Action)
 * 
 * Requirement:
 * - "every templete bottom should be bg white and txt should be call to action okay that i want the call to action should be editable okay"
 * - "this bottom start link stright line see the scond image okay link that i want"
 * - Full-width clean white footer background (#FFFFFF) starting with an undulating wave curve
 * - Rhythmic decorative hanging strings & ornaments (lights, lanterns, sparkles, diyas) matching user sketch
 * - Prominent editable Call To Action (from post.cta / post.ctaText)
 * - Zero overlap: dynamic collision protection & 2-tier stacked mode for long CTAs
 */
export function renderStandardBottomBar({
  ctx,
  width,
  height,
  post,
  brand,
  style,
  padX,
  footerY,
  bottomH = 96,
  isLandscape = false,
  accentColor = TEAL_PRIMARY
}) {
  ctx.save();

  // 1. Resolve Editable Call to Action & Contact Details first
  let rawCta = (post?.cta || post?.ctaText || '').trim();
  if (!rawCta || rawCta.startsWith('#')) {
    rawCta = post?.cta || 'Apply Now';
  }
  const btnText = rawCta.toUpperCase();

  const rawWebsite = (post?.website || post?.websiteUrl || brand?.website || 'www.infinitetechai.com').replace(/^https?:\/\//, '');
  const rawPhone = (post?.phone || brand?.phone || '+91 99765 63210');
  const contactText = `${rawWebsite}   |   ${rawPhone}`;

  const availW = width - (padX * 2);

  // Layout mode check
  const isLongCta = btnText.length > 28 || (btnText.length > 20 && isLandscape);

  // 2. Footer Elevation & Wave Curve (Matching user's sketch)
  const footerStyle = post?.footerStyle || 'lights'; // 'lights' (default) | 'wave' | 'straight'
  const footerTop = Math.round(footerY - (isLandscape ? 14 : 22));
  const footerH = height - footerTop;

  const waveCycles = isLandscape ? 4.5 : 3.5;
  const waveAmp = isLandscape ? 10 : 15;
  const waveBaseY = footerTop;

  const getWaveY = (x) => {
    if (footerStyle === 'straight') return footerTop;
    return waveBaseY + Math.sin((x / width) * Math.PI * 2 * waveCycles) * waveAmp;
  };

  // 2a. Fill Solid Clean White Footer Background below the wave curve
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, getWaveY(0));
  const step = 4;
  for (let x = step; x <= width; x += step) {
    ctx.lineTo(x, getWaveY(x));
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.14)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = -3;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // 2b. Decorative Wave Divider Line on top of white footer
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, getWaveY(0));
  for (let x = step; x <= width; x += step) {
    ctx.lineTo(x, getWaveY(x));
  }
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Delicate secondary echo line
  ctx.beginPath();
  ctx.moveTo(0, getWaveY(0) + 3);
  for (let x = step; x <= width; x += step) {
    ctx.lineTo(x, getWaveY(x) + 3);
  }
  ctx.strokeStyle = 'rgba(0, 128, 128, 0.20)';
  ctx.lineWidth = 1.0;
  ctx.stroke();
  ctx.restore();

  // 2c. Hanging Strings & Decorative Ornaments (Matching user sketch)
  if (footerStyle === 'lights') {
    const isFestival = style?.category === 'festivals' ||
      (post?.headline || '').toLowerCase().includes('diwali') ||
      (post?.tagline || '').toLowerCase().includes('festival') ||
      (post?.theme || '').toLowerCase().includes('festive');

    const ornPrimary = isFestival ? '#D97706' : accentColor;
    const ornGlow = isFestival ? '#FBBF24' : '#2DD4BF';

    const numDrops = isLandscape ? 10 : 8;
    const stringLenList = isLandscape
      ? [12, 20, 10, 18, 14, 22, 10, 16, 12, 20]
      : [18, 30, 16, 28, 20, 32, 16, 26];

    const ornamentTypes = ['lantern', 'bulb', 'star', 'beads', 'diya', 'bell', 'star', 'lantern', 'bulb', 'beads'];

    // Safe ceiling so hanging ornaments never touch CTA buttons
    const ctaTopBoundary = isLongCta
      ? footerTop + (isLandscape ? 36 : 46)
      : footerTop + (isLandscape ? 42 : 52);
    const maxDropAllowed = ctaTopBoundary - (isLandscape ? 8 : 12);
    const ornScale = isLandscape ? 0.72 : 0.92;

    for (let i = 0; i < numDrops; i++) {
      const dropX = width * (0.06 + (i * (0.88 / (numDrops - 1))));
      const dropStartY = getWaveY(dropX);
      let dropLen = stringLenList[i % stringLenList.length];

      if (dropStartY + dropLen + 16 > maxDropAllowed) {
        dropLen = Math.max(6, maxDropAllowed - dropStartY - 16);
      }
      const dropEndY = dropStartY + dropLen;

      // Anchor bead on the wave line
      ctx.fillStyle = ornPrimary;
      ctx.beginPath();
      ctx.arc(dropX, dropStartY, isLandscape ? 2.2 : 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Slender vertical hanging string
      ctx.strokeStyle = isFestival ? 'rgba(217, 119, 6, 0.50)' : 'rgba(0, 128, 128, 0.42)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(dropX, dropStartY);
      ctx.lineTo(dropX, dropEndY);
      ctx.stroke();

      // Draw hanging ornament
      const ornType = ornamentTypes[i % ornamentTypes.length];
      drawHangingOrnament(ctx, dropX, dropEndY, ornType, ornPrimary, ornGlow, ornScale);
    }
  }

  // 3. Render Call to Action & Contact Info with Zero Collision
  if (isLongCta) {
    // ── STACKED 2-TIER FOOTER (Ideal for sentence-length CTAs) ──
    const tier1H = isLandscape ? 36 : 44;
    const tier1Y = footerTop + (isLandscape ? 36 : 46);

    // Call to Action Banner across width
    drawRoundRect(ctx, padX, tier1Y, availW, tier1H, tier1H / 2);
    const ctaGrad = ctx.createLinearGradient(padX, tier1Y, padX + availW, tier1Y + tier1H);
    ctaGrad.addColorStop(0, TEAL_PRIMARY);
    ctaGrad.addColorStop(1, TEAL_LIGHT);
    ctx.fillStyle = ctaGrad;
    ctx.shadowColor = 'rgba(0, 128, 128, 0.30)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 3;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Dynamically fit CTA text inside banner
    let ctaFs = isLandscape ? 15 : 18;
    ctx.font = `900 ${ctaFs}px "Outfit", sans-serif`;
    while (ctx.measureText(`👉   ${btnText}   ➔`).width > availW - 36 && ctaFs > 11) {
      ctaFs -= 1;
      ctx.font = `900 ${ctaFs}px "Outfit", sans-serif`;
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`👉   ${btnText}   ➔`, padX + availW / 2, tier1Y + tier1H / 2);

    // Tier 2: Clean contact info line below CTA banner on white background
    const tier2Y = tier1Y + tier1H + (isLandscape ? 12 : 16);
    ctx.font = `700 ${isLandscape ? 13 : 16}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🌐  ${rawWebsite}      •      📞  ${rawPhone}`, padX + availW / 2, tier2Y);

  } else {
    // ── SIDE-BY-SIDE FOOTER (For standard concise CTAs like "Apply Now", "Register Today") ──
    const ctaH = isLandscape ? 48 : 58;
    const barY = footerTop + (isLandscape ? 42 : 52);

    // Measure Contact Info Capsule first
    let contactFs = isLandscape ? 15 : 18;
    ctx.font = `700 ${contactFs}px "Plus Jakarta Sans", sans-serif`;
    let contactTextW = ctx.measureText(contactText).width;
    let contactW = contactTextW + 68;

    // Allocate CTA button width with collision protection
    const maxBtnW = availW - contactW - 24;

    let btnFs = isLandscape ? 16 : 21;
    ctx.font = `900 ${btnFs}px "Outfit", sans-serif`;
    let btnTextW = ctx.measureText(btnText).width;
    let calcBtnW = btnTextW + 72;

    // Scale down if needed so button never exceeds allocated boundary
    while (calcBtnW > maxBtnW && btnFs > 12) {
      btnFs -= 1;
      ctx.font = `900 ${btnFs}px "Outfit", sans-serif`;
      btnTextW = ctx.measureText(btnText).width;
      calcBtnW = btnTextW + 64;
    }

    const btnW = Math.max(isLandscape ? 180 : 210, Math.min(calcBtnW, maxBtnW));
    const btnX = padX;

    // 1. CTA Button in Infinitetech Teal Gradient on White Footer
    const ctaGrad = ctx.createLinearGradient(btnX, barY, btnX + btnW, barY + ctaH);
    ctaGrad.addColorStop(0, TEAL_PRIMARY);
    ctaGrad.addColorStop(1, TEAL_LIGHT);

    drawRoundRect(ctx, btnX, barY, btnW, ctaH, ctaH / 2);
    ctx.fillStyle = ctaGrad;
    ctx.shadowColor = 'rgba(0, 128, 128, 0.35)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = `900 ${btnFs}px "Outfit", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(btnText, btnX + 24, barY + ctaH / 2);
    drawCtaArrowBadge(ctx, btnX + btnW - 24, barY + ctaH / 2, 14, 'rgba(255,255,255,0.30)', '#FFFFFF');

    // 2. Contact Capsule on Right (on white background)
    const contactX = width - padX - contactW;
    drawRoundRect(ctx, contactX, barY, contactW, ctaH, ctaH / 2);
    ctx.fillStyle = TEAL_BG_TINT; // soft light teal tint on white
    ctx.fill();
    ctx.strokeStyle = TEAL_BORDER;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    drawGlobeIcon(ctx, contactX + 22, barY + (ctaH - 20) / 2, 20, TEAL_PRIMARY);

    ctx.font = `700 ${contactFs}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(contactText, contactX + 50, barY + ctaH / 2);
  }

  ctx.restore();
}

/**
 * 4. Master Poster Headline (Massive, Bold, Colorful, Dramatic)
 * Supports brush script kicker ("We are", "Special") + massive 2-tone main title (70px - 100px)
 */
export function drawPosterHeadline(ctx, {
  scriptAccent = '',
  kicker = '',
  headline = 'WE ARE HIRING',
  x = 60,
  y = 120,
  maxW = 550,
  initialFs = 78,
  minFs = 42,
  maxLines = 2,
  isLandscape = false,
  align = 'left'
}) {
  ctx.save();
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  let curY = y;

  // 1. Script Accent (e.g. "We are") in Caveat font
  if (scriptAccent) {
    ctx.font = `700 ${isLandscape ? 38 : 46}px "Caveat", "Kalam", cursive`;
    ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 10;
    }
    ctx.fillText(scriptAccent, x, curY);
    ctx.shadowBlur = 0;
    curY += isLandscape ? 38 : 48;
  } else if (kicker) {
    // Technical kicker badge / pill
    ctx.font = `900 ${isLandscape ? 13 : 15}px "Outfit", sans-serif`;
    const kw = ctx.measureText(kicker.toUpperCase()).width + 24;
    drawRoundRect(ctx, align === 'center' ? x - kw / 2 : x, curY, kw, 28, 14);
    ctx.fillStyle = hasBg ? 'rgba(0, 128, 128, 0.35)' : TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
    ctx.textAlign = align === 'center' ? 'center' : 'left';
    ctx.textBaseline = 'middle';
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 6;
    }
    ctx.fillText(kicker.toUpperCase(), align === 'center' ? x : x + 12, curY + 14);
    ctx.shadowBlur = 0;
    curY += 38;
  }

  // 2. Massive Main Headline with fitHeadline
  const hlFit = fitHeadline(ctx, headline, maxW, isLandscape ? 140 : 190, maxLines, initialFs, minFs, '"Outfit", "Bricolage Grotesque", sans-serif');

  ctx.font = `900 ${hlFit.fontSize}px "Outfit", "Bricolage Grotesque", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';

  hlFit.lines.forEach((line, idx) => {
    const lineY = curY + (idx * hlFit.lineHeight);

    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 2;
    }

    if (idx === 0) {
      // First line: pure white if background image, deep slate navy if clean white
      ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
      ctx.fillText(line, x, lineY);
    } else {
      // Accent line: vibrant cyan/teal gradient if background image, classic teal if clean white
      const lineGrad = ctx.createLinearGradient(x, lineY, x + maxW, lineY);
      lineGrad.addColorStop(0, hasBg ? '#2DD4BF' : TEAL_PRIMARY);
      lineGrad.addColorStop(1, hasBg ? '#5EEAD4' : TEAL_LIGHT);
      ctx.fillStyle = lineGrad;
      ctx.fillText(line, x, lineY);
    }
    ctx.shadowBlur = 0;
  });

  const totalHeight = (curY - y) + (hlFit.lines.length * hlFit.lineHeight);
  ctx.restore();

  return {
    totalHeight,
    bottomY: y + totalHeight,
    fontSize: hlFit.fontSize
  };
}

/**
 * 4b. Master Poster Tagline / Subtitle with High-Contrast Background Protection
 */
export function drawPosterTagline(ctx, tagline, x, y, maxW, align = 'left', fs = 22) {
  ctx.save();
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  ctx.font = `600 ${fs}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = hasBg ? '#F1F5F9' : TEXT_MUTED;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 1;
  }
  let curY = y;
  const lines = wrapText(ctx, tagline, maxW).slice(0, 2);
  lines.forEach(l => {
    ctx.fillText(l, x, curY);
    curY += fs + 10;
  });
  ctx.shadowBlur = 0;
  ctx.restore();
  return curY;
}

/**
 * 5. Signature Fluid Wave Ribbon (seen in AppX / hiring 2.jpg)
 * Draws a flowing curved wave down the right side with a clipping mask for photo / workspace
 */
export function drawFluidWaveHero(ctx, width, height, post, accentColor = TEAL_PRIMARY, topicImg = null) {
  ctx.save();
  const waveStartX = Math.round(width * 0.52);

  // Wave path
  ctx.beginPath();
  ctx.moveTo(waveStartX + 80, 0);
  ctx.bezierCurveTo(waveStartX - 40, height * 0.35, waveStartX - 80, height * 0.65, waveStartX + 20, height);
  ctx.lineTo(width, height);
  ctx.lineTo(width, 0);
  ctx.closePath();

  // Draw shadow
  ctx.shadowColor = 'rgba(0, 128, 128, 0.20)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = -8;
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Clip the right area inside the wave
  ctx.save();
  ctx.clip();

  // Wave gradient fill
  const waveGrad = ctx.createLinearGradient(waveStartX, 0, width, height);
  waveGrad.addColorStop(0, '#004D4D');
  waveGrad.addColorStop(0.5, TEAL_PRIMARY);
  waveGrad.addColorStop(1, '#002B2B');
  ctx.fillStyle = waveGrad;
  ctx.fillRect(waveStartX - 100, 0, width, height);

  // If user uploaded an image or topicImg available, draw it clipped inside the wave
  const waveImg = (post?.uploadedImage && typeof post.uploadedImage === 'object' && post.uploadedImage.width) ? post.uploadedImage : (post?.useImageInHero !== false && topicImg && topicImg.width ? topicImg : null);
  if (waveImg) {
    const img = waveImg;
    const waveW = width - waveStartX + 50;
    const scale = Math.max(waveW / img.width, height / img.height);
    const iw = img.width * scale;
    const ih = img.height * scale;
    ctx.drawImage(img, waveStartX - 50 + (waveW - iw) / 2, (height - ih) / 2, iw, ih);

    // Subtle dark teal overlay for contrast
    const ov = ctx.createLinearGradient(waveStartX, 0, width, 0);
    ov.addColorStop(0, 'rgba(0, 77, 77, 0.65)');
    ov.addColorStop(1, 'rgba(0, 77, 77, 0.25)');
    ctx.fillStyle = ov;
    ctx.fillRect(waveStartX - 100, 0, width, height);
  } else {
    // Beautiful vector architectural lines inside wave
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    for (let r = 80; r < 500; r += 50) {
      ctx.beginPath();
      ctx.arc(width * 0.85, height * 0.45, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Overlapping Circular Badge (e.g. </>) with triple layered glow rings
  const badgeCx = waveStartX - 10;
  const badgeCy = height * 0.46;
  const badgeR = 54;

  // Outer glowing ring
  ctx.beginPath();
  ctx.arc(badgeCx, badgeCy, badgeR + 12, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fill();

  // Inner white base
  ctx.beginPath();
  ctx.arc(badgeCx, badgeCy, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Teal core ring
  ctx.beginPath();
  ctx.arc(badgeCx, badgeCy, badgeR - 6, 0, Math.PI * 2);
  const ringGrad = ctx.createLinearGradient(badgeCx - badgeR, badgeCy - badgeR, badgeCx + badgeR, badgeCy + badgeR);
  ringGrad.addColorStop(0, TEAL_PRIMARY);
  ringGrad.addColorStop(1, TEAL_LIGHT);
  ctx.fillStyle = ringGrad;
  ctx.fill();

  // Icon symbol </> in white
  ctx.font = '900 28px "Outfit", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('</>', badgeCx, badgeCy);

  ctx.restore();
}

/**
 * 6. Signature Diagonal Cut Ribbon (seen in Skillmount / hiring 4.jpg)
 */
export function drawDiagonalHeroRibbon(ctx, width, height, post, accentColor = TEAL_PRIMARY, topicImg = null) {
  ctx.save();

  // Thick diagonal ribbon cutting across
  const p1 = { x: 0, y: height * 0.65 };
  const p2 = { x: width * 0.45, y: height * 0.42 };
  const p3 = { x: width, y: 0 };
  const p4 = { x: width, y: height * 0.18 };
  const p5 = { x: width * 0.45, y: height * 0.58 };
  const p6 = { x: 0, y: height * 0.82 };

  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.lineTo(p5.x, p5.y);
  ctx.lineTo(p6.x, p6.y);
  ctx.closePath();

  // 3D Shadow
  ctx.shadowColor = 'rgba(0, 128, 128, 0.28)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;

  const ribGrad = ctx.createLinearGradient(0, height * 0.8, width, 0);
  ribGrad.addColorStop(0, TEAL_PRIMARY);
  ribGrad.addColorStop(1, TEAL_LIGHT);
  ctx.fillStyle = ribGrad;
  ctx.fill();
  ctx.shadowBlur = 0;

  // If user uploaded an image or topicImg available, clip it into the diagonal band
  const ribbonImg = (post?.uploadedImage && typeof post.uploadedImage === 'object' && post.uploadedImage.width) ? post.uploadedImage : (post?.useImageInHero !== false && topicImg && topicImg.width ? topicImg : null);
  if (ribbonImg) {
    ctx.save();
    ctx.clip();
    const img = ribbonImg;
    const scale = Math.max(width / img.width, height / img.height);
    const iw = img.width * scale;
    const ih = img.height * scale;
    ctx.drawImage(img, (width - iw) / 2, (height - ih) / 2, iw, ih);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * 7. Specification Row (Icon Circle + Label + Bold Value + Divider)
 * Used in AppX, Codexaon, Skillmount, Devhive
 */
export function drawSpecificationRow(ctx, x, y, w, h = 64, iconType = 'briefcase', label = 'Experience:', value = '3 - 5 Years') {
  ctx.save();

  // Solid circular icon container
  const iconR = 26;
  const iconCx = x + iconR;
  const iconCy = y + h / 2;

  ctx.beginPath();
  ctx.arc(iconCx, iconCy, iconR, 0, Math.PI * 2);
  const icGrad = ctx.createLinearGradient(iconCx - iconR, iconCy - iconR, iconCx + iconR, iconCy + iconR);
  icGrad.addColorStop(0, TEAL_PRIMARY);
  icGrad.addColorStop(1, TEAL_DARK);
  ctx.fillStyle = icGrad;
  ctx.shadowColor = 'rgba(0, 128, 128, 0.28)';
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Render appropriate vector icon in white
  if (iconType === 'briefcase') {
    drawBriefcaseIcon(ctx, iconCx - 12, iconCy - 12, 24, '#FFFFFF');
  } else if (iconType === 'target') {
    drawTargetIcon(ctx, iconCx - 12, iconCy - 12, 24, '#FFFFFF');
  } else if (iconType === 'clock') {
    drawClockIcon(ctx, iconCx - 12, iconCy - 12, 24, '#FFFFFF');
  } else {
    drawCheckmarkIcon(ctx, iconCx - 12, iconCy - 12, 24, '#FFFFFF');
  }

  // Label & Value
  const textX = x + (iconR * 2) + 20;
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = hasBg ? '#E2E8F0' : TEXT_MUTED;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 6;
  }
  ctx.fillText(label, textX, y + 6);

  ctx.font = '900 24px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
  ctx.fillText(value, textX, y + 30);
  ctx.shadowBlur = 0;

  // Subtle divider line
  ctx.strokeStyle = hasBg ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 128, 128, 0.16)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(textX, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();

  ctx.restore();
}

/**
 * 8. 3D Floating Glossy Badge (e.g. </>, UI/UX, 🚀)
 */
export function drawFloatingGlossyBadge(ctx, cx, cy, size = 72, iconText = '</>', bgColor = TEAL_PRIMARY, iconColor = '#FFFFFF') {
  ctx.save();
  const half = size / 2;
  const r = size * 0.28;

  // 3D Drop Shadow
  ctx.shadowColor = 'rgba(0, 128, 128, 0.35)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;

  // Squircle base
  drawRoundRect(ctx, cx - half, cy - half, size, size, r);
  const bgGrad = ctx.createLinearGradient(cx - half, cy - half, cx + half, cy + half);
  bgGrad.addColorStop(0, TEAL_LIGHT);
  bgGrad.addColorStop(1, bgColor);
  ctx.fillStyle = bgGrad;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Glass shine highlight on top-left
  ctx.beginPath();
  ctx.ellipse(cx - half * 0.25, cy - half * 0.4, half * 0.55, half * 0.3, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fill();

  // Icon symbol / text
  ctx.font = `900 ${Math.round(size * 0.40)}px "Outfit", sans-serif`;
  ctx.fillStyle = iconColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(iconText, cx, cy + 2);

  ctx.restore();
}

/**
 * 9. Tech Stack Pills Floating Bar (seen in hiring 2.jpg)
 */
export function drawTechStackPillsRow(ctx, x, y, w, h = 60, items = ['React', 'Node.js', 'SQL', 'APIs']) {
  ctx.save();
  const hasBg = Boolean(ctx.__hasBackgroundImage);

  // Floating pill container - NO white box on images!
  drawRoundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = hasBg ? 'rgba(15, 23, 42, 0.40)' : '#FFFFFF';
  if (!hasBg) {
    ctx.shadowColor = 'rgba(0, 128, 128, 0.12)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
  }
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = hasBg ? 'rgba(255, 255, 255, 0.25)' : TEAL_BORDER;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Items separated by thin dividers
  const valid = items.slice(0, 4);
  const itemW = w / valid.length;

  valid.forEach((item, idx) => {
    const ix = x + (idx * itemW);
    const cx = ix + (itemW / 2);
    const cy = y + (h / 2);

    ctx.font = '800 18px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 6;
    }
    ctx.fillText(item, cx, cy);
    ctx.shadowBlur = 0;

    if (idx < valid.length - 1) {
      ctx.strokeStyle = hasBg ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 128, 128, 0.18)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(ix + itemW, y + 14);
      ctx.lineTo(ix + itemW, y + h - 14);
      ctx.stroke();
    }
  });

  ctx.restore();
}

/**
 * Feature Pills Row (e.g. [✓ Turn visitors into leads] [✓ Better UX & clear messaging] [✓ Strategic CTAs])
 */
export function drawFeaturePillsRow(ctx, x, y, pills = [], maxW = 1080) {
  ctx.save();
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  const valid = pills.slice(0, 3);
  if (valid.length === 0) {
    ctx.restore();
    return y;
  }

  const pillH = 46;
  let curX = x;

  valid.forEach((p) => {
    const clean = String(p).replace(/^[✓•\-\*]\s*/, '').trim();
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    const textW = ctx.measureText(clean).width;
    const pillW = textW + 68;

    if (curX + pillW > x + maxW) return;

    drawRoundRect(ctx, curX, y, pillW, pillH, pillH / 2);
    ctx.fillStyle = hasBg ? 'rgba(0, 128, 128, 0.35)' : TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    drawCheckmarkIcon(ctx, curX + 18, y + (pillH - 20) / 2, 20, hasBg ? '#2DD4BF' : TEAL_PRIMARY);

    ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 6;
    }
    ctx.fillText(clean, curX + 46, y + pillH / 2);
    ctx.shadowBlur = 0;

    curX += pillW + 16;
  });

  ctx.restore();
  return y + pillH + 20;
}

/**
 * Vector High-Conversion Website Dashboard Mockup
 */
export function drawVectorWebDashboard(ctx, x, y, w, h) {
  ctx.save();

  // Outer Browser Window Frame
  drawRoundRect(ctx, x, y, w, h, 18);
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 128, 128, 0.16)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = TEAL_BORDER;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Top Browser Title Bar
  const titleBarH = 44;
  drawRoundRect(ctx, x, y, w, titleBarH, 18);
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fill();

  // 3 Window Control Dots (red, amber, teal)
  const dots = ['#F43F5E', '#F59E0B', TEAL_PRIMARY];
  dots.forEach((col, i) => {
    ctx.beginPath();
    ctx.arc(x + 24 + (i * 18), y + titleBarH / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
  });

  // URL Bar in Browser
  const urlW = Math.round(w * 0.45);
  drawRoundRect(ctx, x + 90, y + 10, urlW, 24, 12);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 128, 128, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔒 https://www.infinitetechai.com/growth', x + 90 + urlW / 2, y + 22);

  // Dashboard Body Grid
  const bodyY = y + titleBarH + 16;
  const colW = Math.round((w - 56) / 3);

  // 3 Metric Stat Cards
  const stats = [
    { label: 'Conversion Lift', val: '+284%', badge: '🔥 Real ROI' },
    { label: 'Page Load Speed', val: '0.4s', badge: '⚡ Ultra Fast' },
    { label: 'Qualified Leads', val: '3.6x', badge: '📈 Scale' }
  ];

  stats.forEach((st, idx) => {
    const cardX = x + 16 + (idx * (colW + 12));
    drawRoundRect(ctx, cardX, bodyY, colW, 90, 12);
    ctx.fillStyle = idx === 0 ? TEAL_PRIMARY : '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = TEAL_BORDER;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = idx === 0 ? '#CCFBF1' : TEXT_MUTED;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(st.label, cardX + 16, bodyY + 14);

    ctx.font = '900 32px "Outfit", sans-serif';
    ctx.fillStyle = idx === 0 ? '#FFFFFF' : TEAL_PRIMARY;
    ctx.fillText(st.val, cardX + 16, bodyY + 36);

    ctx.font = '800 11px "Outfit", sans-serif';
    ctx.fillStyle = idx === 0 ? '#FFFFFF' : TEXT_DARK;
    ctx.textAlign = 'right';
    ctx.fillText(st.badge, cardX + colW - 14, bodyY + 16);
  });

  // Conversion Area Chart in lower half
  const chartY = bodyY + 104;
  const chartW = w - 32;
  const chartH = h - (chartY - y) - 16;

  if (chartH > 60) {
    drawRoundRect(ctx, x + 16, chartY, chartW, chartH, 12);
    ctx.fillStyle = TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = TEAL_BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Smooth Growth Curve
    ctx.beginPath();
    ctx.moveTo(x + 28, chartY + chartH - 20);
    ctx.bezierCurveTo(
      x + chartW * 0.35, chartY + chartH - 24,
      x + chartW * 0.60, chartY + 40,
      x + chartW - 28, chartY + 24
    );
    ctx.strokeStyle = TEAL_PRIMARY;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Chart Gradient Fill
    ctx.lineTo(x + chartW - 28, chartY + chartH - 10);
    ctx.lineTo(x + 28, chartY + chartH - 10);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, chartY, 0, chartY + chartH);
    fillGrad.addColorStop(0, 'rgba(0, 128, 128, 0.28)');
    fillGrad.addColorStop(1, 'rgba(0, 128, 128, 0.02)');
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Active Data Point Pulsing Dot
    ctx.beginPath();
    ctx.arc(x + chartW - 28, chartY + 24, 7, 0, Math.PI * 2);
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.shadowColor = TEAL_PRIMARY;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

/**
 * 10. Clean White / Light Teal Specification Card
 */
export function drawWhiteTealCard({
  ctx,
  x,
  y,
  w,
  h,
  radius = 14,
  borderCol = TEAL_BORDER,
  bgCol = '#FFFFFF'
}) {
  ctx.save();
  const hasBg = Boolean(ctx.__hasBackgroundImage);

  if (hasBg) {
    // When background photo is active:
    // Respects cardOpacity and cardStyle ('minimal' | 'glass' | 'glow')
    // Eliminates clunky dark slate boxes in favor of ultra-clean floating glass!
    const cardOpacity = typeof ctx.__cardOpacity === 'number' ? ctx.__cardOpacity : 0.0;
    const cardStyle = ctx.__cardStyle || (cardOpacity <= 0.05 ? 'minimal' : 'glass');

    drawRoundRect(ctx, x, y, w, h, radius);

    if (cardStyle === 'minimal' || cardOpacity <= 0.05) {
      // 1. Floating Minimal (No dark box! Ultra-sheer ambient shimmer where 100% of the photo glows through)
      const sheerGrad = ctx.createLinearGradient(x, y, x, y + h);
      sheerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      sheerGrad.addColorStop(1, 'rgba(255, 255, 255, 0.01)');
      ctx.fillStyle = sheerGrad;
      ctx.fill();

      // Delicate illuminated glass border
      const borderGrad = ctx.createLinearGradient(x, y, x + w, y + h);
      borderGrad.addColorStop(0, 'rgba(255, 255, 255, 0.50)');
      borderGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
      borderGrad.addColorStop(1, borderCol || 'rgba(45, 212, 191, 0.35)');
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();
      return;
    }

    if (cardStyle === 'glow') {
      // 2. Luminous Accent Glow
      const glowGrad = ctx.createLinearGradient(x, y, x, y + h);
      glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
      glowGrad.addColorStop(1, 'rgba(15, 23, 42, 0.28)');
      ctx.fillStyle = glowGrad;
      ctx.shadowColor = borderCol || 'rgba(251, 191, 36, 0.50)';
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = borderCol || 'rgba(251, 191, 36, 0.70)';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.restore();
      return;
    }

    // 3. Apple/Linear Specular Glassmorphism (Default when opacity > 0)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    const effAlpha = Math.max(0.18, cardOpacity);
    const glassGrad = ctx.createLinearGradient(x, y, x, y + h);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
    glassGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
    glassGrad.addColorStop(0.7, `rgba(15, 23, 42, ${effAlpha * 0.40})`);
    glassGrad.addColorStop(1, `rgba(15, 23, 42, ${effAlpha * 0.65})`);
    ctx.fillStyle = glassGrad;
    ctx.fill();
    ctx.shadowBlur = 0;

    const borderGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    borderGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    borderGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.20)');
    borderGrad.addColorStop(1, borderCol || 'rgba(45, 212, 191, 0.40)');
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    ctx.restore();
    return;
  }

  // When no background image is active (Clean Corporate White mode):
  drawRoundRect(ctx, x, y, w, h, radius);
  ctx.fillStyle = bgCol || '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 128, 128, 0.08)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = borderCol || TEAL_BORDER;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.restore();
}

/**
 * Frosted White & Teal Card (alias for drawWhiteTealCard)
 */
export function drawGlassCard({
  ctx,
  x,
  y,
  w,
  h,
  radius = 14,
  borderCol = TEAL_BORDER,
  bgCol = 'rgba(255, 255, 255, 0.95)'
}) {
  drawWhiteTealCard({ ctx, x, y, w, h, radius, borderCol, bgCol });
}

/**
 * 3D Hardcover Book Mockup in Clean White & Teal (for Common-15)
 */
export function draw3dBookMockup(
  ctx,
  x,
  y,
  w,
  h,
  title = 'High Output Management',
  author = 'Executive Strategy',
  rating = 5,
  userCoverImg = null,
  accentColor = TEAL_PRIMARY
) {
  ctx.save();
  const spineW = Math.round(w * 0.12);
  const coverW = w - spineW;

  // Realistic Soft Drop Shadow
  ctx.shadowColor = 'rgba(0, 128, 128, 0.22)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
  drawRoundRect(ctx, x + spineW + 8, y + 12, coverW, h, 10);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Pages Edge
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  drawRoundRect(ctx, x + spineW + coverW - 6, y + 8, 10, h - 16, 2);
  ctx.fill();
  ctx.stroke();

  // Book Spine
  const spineGrad = ctx.createLinearGradient(x, y, x + spineW, y);
  spineGrad.addColorStop(0, '#004D4D');
  spineGrad.addColorStop(0.7, TEAL_PRIMARY);
  spineGrad.addColorStop(1, '#006666');
  drawRoundRect(ctx, x, y, spineW, h, 6);
  ctx.fillStyle = spineGrad;
  ctx.fill();

  // Cover Front Face
  const coverX = x + spineW;
  const coverGrad = ctx.createLinearGradient(coverX, y, coverX + coverW, y + h);
  coverGrad.addColorStop(0, '#FFFFFF');
  coverGrad.addColorStop(1, '#F0FDFA');

  drawRoundRect(ctx, coverX, y, coverW, h, 8);
  ctx.fillStyle = coverGrad;
  ctx.fill();
  ctx.strokeStyle = TEAL_BORDER;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  if (userCoverImg && typeof userCoverImg === 'object' && userCoverImg.width) {
    ctx.save();
    ctx.beginPath();
    drawRoundRect(ctx, coverX + 4, y + 4, coverW - 8, h - 8, 6);
    ctx.clip();
    ctx.drawImage(userCoverImg, coverX + 4, y + 4, coverW - 8, h - 8);
    ctx.restore();
  } else {
    // Vector Cover Design
    drawRoundRect(ctx, coverX + 16, y + 24, coverW - 32, 34, 8);
    ctx.fillStyle = TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = TEAL_PRIMARY;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXECUTIVE READING LIST', coverX + coverW / 2, y + 41);

    ctx.font = '900 24px "Outfit", serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const lines = wrapText(ctx, title, coverW - 36).slice(0, 3);
    let titleY = y + 80;
    lines.forEach(l => {
      ctx.fillText(l, coverX + coverW / 2, titleY);
      titleY += 30;
    });

    const emblemY = titleY + 36;
    ctx.beginPath();
    ctx.arc(coverX + coverW / 2, emblemY, 28, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 128, 128, 0.08)';
    ctx.fill();
    ctx.strokeStyle = TEAL_PRIMARY;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.font = '700 20px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textBaseline = 'middle';
    ctx.fillText('★', coverX + coverW / 2, emblemY);

    const starY = emblemY + 48;
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#F59E0B';
    ctx.fillText('★★★★★', coverX + coverW / 2, starY);

    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText(author, coverX + coverW / 2, y + h - 38);
  }

  ctx.restore();
}

/**
 * Modern AI Readiness Speedometer Gauge
 */
export function drawSpeedometerGauge(ctx, cx, cy, radius = 100, percent = 94, label = 'AI READINESS INDEX') {
  ctx.save();
  const startAngle = Math.PI * 0.8;
  const endAngle = Math.PI * 2.2;
  const totalAngle = endAngle - startAngle;
  const activeAngle = startAngle + (totalAngle * (percent / 100));

  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(0, 128, 128, 0.12)';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.stroke();

  const grad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
  grad.addColorStop(0, TEAL_LIGHT);
  grad.addColorStop(1, TEAL_PRIMARY);
  ctx.strokeStyle = grad;
  ctx.shadowColor = 'rgba(0, 128, 128, 0.40)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, activeAngle);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.font = '900 52px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${percent}%`, cx, cy - 8);

  ctx.font = '900 16px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.fillText(label, cx, cy + 34);

  for (let i = 0; i <= 10; i++) {
    const tickAngle = startAngle + (totalAngle * (i / 10));
    const r1 = radius + 14;
    const r2 = radius + (i % 5 === 0 ? 24 : 18);
    const x1 = cx + Math.cos(tickAngle) * r1;
    const y1 = cy + Math.sin(tickAngle) * r1;
    const x2 = cx + Math.cos(tickAngle) * r2;
    const y2 = cy + Math.sin(tickAngle) * r2;

    ctx.lineWidth = i % 5 === 0 ? 2.5 : 1.2;
    ctx.strokeStyle = i % 5 === 0 ? TEAL_PRIMARY : 'rgba(0, 128, 128, 0.28)';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Soundwave audio visualizer bars in Teal
 */
export function drawAudioSoundwave(ctx, x, y, w, h, barCount = 18, color = TEAL_PRIMARY) {
  ctx.save();
  const barW = Math.max(3, Math.floor(w / (barCount * 1.6)));
  const gap = Math.floor((w - (barCount * barW)) / (barCount - 1));
  const heights = [0.3, 0.6, 0.9, 0.45, 0.75, 1.0, 0.55, 0.85, 0.4, 0.7, 0.95, 0.5, 0.8, 0.6, 0.35, 0.9, 0.65, 0.4];

  for (let i = 0; i < barCount; i++) {
    const bh = Math.max(6, Math.round(h * (heights[i % heights.length] || 0.5)));
    const bx = x + (i * (barW + gap));
    const by = y + (h - bh) / 2;

    drawRoundRect(ctx, bx, by, barW, bh, barW / 2);
    const bgGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
    bgGrad.addColorStop(0, TEAL_LIGHT);
    bgGrad.addColorStop(1, TEAL_PRIMARY);
    ctx.fillStyle = bgGrad;
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Diya Oil Lamp Vector in Gold & Teal
 */
export function drawDiyaOilLamp(ctx, cx, cy, size = 70, accentColor = '#D97706') {
  ctx.save();
  const glowRad = ctx.createRadialGradient(cx, cy - size * 0.45, 4, cx, cy - size * 0.45, size * 0.6);
  glowRad.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
  glowRad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
  glowRad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = glowRad;
  ctx.beginPath();
  ctx.arc(cx, cy - size * 0.45, size * 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.7);
  ctx.quadraticCurveTo(cx + size * 0.22, cy - size * 0.35, cx, cy - size * 0.15);
  ctx.quadraticCurveTo(cx - size * 0.22, cy - size * 0.35, cx, cy - size * 0.7);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.55);
  ctx.quadraticCurveTo(cx + size * 0.1, cy - size * 0.3, cx, cy - size * 0.18);
  ctx.quadraticCurveTo(cx - size * 0.1, cy - size * 0.3, cx, cy - size * 0.55);
  ctx.fillStyle = '#FEF08A';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx - size * 0.55, cy);
  ctx.quadraticCurveTo(cx, cy + size * 0.45, cx + size * 0.55, cy);
  ctx.quadraticCurveTo(cx + size * 0.45, cy - size * 0.08, cx, cy - size * 0.08);
  ctx.quadraticCurveTo(cx - size * 0.45, cy - size * 0.08, cx - size * 0.55, cy);
  const diyaGrad = ctx.createLinearGradient(cx - size * 0.5, cy, cx + size * 0.5, cy + size * 0.4);
  diyaGrad.addColorStop(0, '#B45309');
  diyaGrad.addColorStop(0.5, '#D97706');
  diyaGrad.addColorStop(1, '#92400E');
  ctx.fillStyle = diyaGrad;
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

/**
 * Fireworks Burst Vector
 */
export function drawFireworksBurst(ctx, cx, cy, radius = 45, color = TEAL_PRIMARY) {
  ctx.save();
  const sparks = 10;
  for (let i = 0; i < sparks; i++) {
    const angle = (i * (Math.PI * 2)) / sparks;
    const x1 = cx + Math.cos(angle) * (radius * 0.25);
    const y1 = cy + Math.sin(angle) * (radius * 0.25);
    const x2 = cx + Math.cos(angle) * radius;
    const y2 = cy + Math.sin(angle) * radius;

    ctx.strokeStyle = i % 2 === 0 ? color : '#D97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x2, y2, 3, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? color : '#F59E0B';
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Crescent Moon and Hanging Lanterns in Gold & Teal
 */
export function drawCrescentMoonAndLanterns(ctx, cx, cy, size = 60, color = TEAL_PRIMARY) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx + size * 0.2, cy - size * 0.08, size * 0.44, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  const lx = cx - size * 0.35;
  const ly = cy + size * 0.35;
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(lx, cy);
  ctx.lineTo(lx, ly);
  ctx.stroke();

  drawRoundRect(ctx, lx - 8, ly, 16, 22, 4);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(lx, ly + 11, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();
  ctx.restore();
}

/**
 * Calculate dynamic card height to evenly distribute remaining vertical space
 */
export function calculateDynamicCardHeight({
  availableH,
  itemCount = 3,
  gap = 14,
  minCardH = 64,
  maxCardH = 160
}) {
  const count = Math.max(1, itemCount);
  const totalGaps = gap * (count - 1);
  const idealH = Math.floor((availableH - totalGaps) / count);
  return Math.min(maxCardH, Math.max(minCardH, idealH));
}

/**
 * Draw a vertically distributed stack of dynamic cards that fills to footerY
 */
export function drawDynamicVerticalCards({
  ctx,
  items,
  x,
  startY,
  w,
  footerY,
  gap = 14,
  showIndex = true,
  icon = 'check',
  accentColor = TEAL_PRIMARY
}) {
  const count = Math.max(1, Math.min(items.length, 5));
  const availableH = footerY - startY - 14;
  const cardH = calculateDynamicCardHeight({ availableH, itemCount: count, gap });

  let curY = startY;
  items.slice(0, count).forEach((item, idx) => {
    drawWhiteTealCard({ ctx, x, y: curY, w, h: cardH, radius: 14 });

    const badgeSize = Math.min(42, Math.max(32, Math.floor(cardH * 0.45)));
    const badgeX = x + 18;
    const badgeY = curY + (cardH - badgeSize) / 2;

    drawRoundRect(ctx, badgeX, badgeY, badgeSize, badgeSize, 10);
    ctx.fillStyle = TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    if (showIndex) {
      ctx.font = '900 18px "Outfit", sans-serif';
      ctx.fillStyle = accentColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`0${idx + 1}`, badgeX + badgeSize / 2, badgeY + badgeSize / 2);
    } else {
      drawCheckmarkIcon(ctx, badgeX + badgeSize / 2, badgeY + badgeSize / 2, 20, accentColor);
    }

    const textX = badgeX + badgeSize + 16;
    const textW = w - (badgeSize + 52);
    const itemText = typeof item === 'string' ? item : (item.title || item.k || '');
    const subText = typeof item === 'object' ? (item.desc || item.v || '') : '';

    if (subText) {
      ctx.font = '900 19px "Outfit", sans-serif';
      ctx.fillStyle = TEXT_DARK;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(itemText, textX, curY + 16);

      ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = TEXT_MUTED;
      wrapText(ctx, subText, textW).slice(0, 2).forEach((l, li) => {
        ctx.fillText(l, textX, curY + 42 + (li * 20));
      });
    } else {
      ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = TEXT_DARK;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const lines = wrapText(ctx, itemText, textW);
      if (lines.length === 1) {
        ctx.fillText(lines[0], textX, curY + cardH / 2);
      } else {
        ctx.fillText(lines[0], textX, curY + cardH / 2 - 12);
        ctx.fillText(lines[1], textX, curY + cardH / 2 + 14);
      }
    }

    curY += cardH + gap;
  });

  return curY;
}
