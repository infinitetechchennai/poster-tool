/**
 * 10 Distinct Festival & Celebration Poster Renderers in Clean White & Teal (#008080)
 * 
 * Aesthetic:
 * - Crisp White (#FFFFFF) & Soft Light Teal (#F0FDFA) background base (NO default photos)
 * - Festive celebration highlights: Gold (#D97706), Amber (#F59E0B), Crimson (#DC2626), and Infinitetech Teal (#008080)
 * - Big, bold 2-tone colorful festive typography (Deep Slate #0F172A + Vibrant Teal & Gold)
 * - Zero unwanted white box: When background photography is active, text floats transparently with pristine drop-shadow contrast.
 * - High-converting bottom CTA button (#008080) + Contact capsule
 * - 100% dynamic: immediately updates with text from the left editor
 */

import {
  drawRoundRect,
  wrapText,
  fitHeadline,
  drawSparkleIcon,
  drawCheckmarkIcon
} from '../../utils/textLayout.js';

import {
  renderPosterBackground,
  renderStandardTopBar,
  renderStandardBottomBar,
  drawWhiteTealCard,
  drawDiyaOilLamp,
  drawFireworksBurst,
  drawCrescentMoonAndLanterns
} from './sharedRendererUtils.js';

const TEAL_PRIMARY = '#008080';
const TEAL_LIGHT = '#00A2A2';
const TEAL_DARK = '#006666';
const TEAL_BG_TINT = '#F0FDFA';
const TEAL_BORDER = 'rgba(0, 128, 128, 0.22)';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#475569';
const GOLD_ACCENT = '#D97706';

// ── Shared Helper Functions for Floating Transparent Festive Typography ──

function renderFestiveHeadline(ctx, headline, cx, y, maxW, isLandscape, hasBg, font = '"Outfit", serif', accent = '#FBBF24') {
  ctx.save();
  ctx.font = `900 ${isLandscape ? 44 : 58}px ${font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.92)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 3;
  }
  let curY = y;
  wrapText(ctx, headline, maxW).slice(0, 2).forEach((l, idx) => {
    ctx.fillStyle = hasBg ? (idx === 0 ? '#FFFFFF' : accent) : (idx === 0 ? TEXT_DARK : TEAL_PRIMARY);
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 50 : 66;
  });
  ctx.restore();
  return curY;
}

function renderFestiveTagline(ctx, tagline, cx, y, maxW, isLandscape, hasBg) {
  ctx.save();
  ctx.font = `600 ${isLandscape ? 16 : 22}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = hasBg ? '#F1F5F9' : TEXT_MUTED;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 10;
  }
  let curY = y;
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 30;
  });
  ctx.restore();
  return curY;
}

function renderFestiveCards(ctx, items, subLabel, padX, curY, maxW, hasBg, iconType = 'sparkle', iconColor = GOLD_ACCENT) {
  const cardW = Math.round((maxW - 24) / 3);
  const cardH = 96;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));

    // 1. Draw modern floating glass card (respects cardOpacity & cardStyle)
    drawWhiteTealCard({
      ctx,
      x: cardX,
      y: curY,
      w: cardW,
      h: cardH,
      radius: 14,
      borderCol: hasBg ? 'rgba(251, 191, 36, 0.45)' : 'rgba(217, 119, 6, 0.35)'
    });

    // 2. Dedicated circular glass badge for the icon
    const iconBadgeSize = 28;
    const iconBadgeX = cardX + 12;
    const iconBadgeY = curY + 16;
    ctx.save();
    drawRoundRect(ctx, iconBadgeX, iconBadgeY, iconBadgeSize, iconBadgeSize, 8);
    ctx.fillStyle = hasBg ? 'rgba(251, 191, 36, 0.18)' : 'rgba(217, 119, 6, 0.10)';
    ctx.fill();
    ctx.strokeStyle = hasBg ? 'rgba(251, 191, 36, 0.50)' : 'rgba(217, 119, 6, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    if (iconType === 'sparkle') {
      drawSparkleIcon(ctx, iconBadgeX + 14, iconBadgeY + 14, 16, iconColor);
    } else {
      drawCheckmarkIcon(ctx, iconBadgeX + 14, iconBadgeY + 14, 16, iconColor);
    }
    ctx.restore();

    // 3. Strict Clipping & Multi-Line Text Wrapping (NEVER overflows or overlaps adjacent cards!)
    ctx.save();
    ctx.beginPath();
    drawRoundRect(ctx, cardX, curY, cardW, cardH, 14);
    ctx.clip();

    const textX = cardX + 48;
    const textMaxW = cardW - 56;

    ctx.font = '700 13.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 6;
    }

    const cleanItem = String(item).replace(/^[✓•\-\*]\s*/, '').trim();
    const lines = wrapText(ctx, cleanItem, textMaxW).slice(0, 2);
    if (lines.length === 1) {
      ctx.fillText(lines[0], textX, curY + 34);
    } else {
      ctx.fillText(lines[0], textX, curY + 26);
      ctx.fillText(lines[1], textX, curY + 44);
    }
    ctx.shadowBlur = 0;

    // Subtitle label
    ctx.font = '800 10.5px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? (iconColor || '#FBBF24') : TEAL_PRIMARY;
    ctx.fillText(subLabel.toUpperCase(), textX, curY + 74);
    ctx.restore();
  });
  return curY + cardH + 28;
}

function renderFestiveBottomBanner(ctx, cx, curY, padX, maxW, remH, title, subtitle, hasBg, titleColor = '#FBBF24') {
  if (remH <= 70) return;
  // In white corporate mode, draw crisp card container.
  // In image mode: NO LIGHT WHITE BOX! Text floats with transparent background and rich drop shadows!
  if (!hasBg) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: remH, radius: 16 });
  }

  ctx.save();
  ctx.font = '900 21px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? titleColor : TEAL_PRIMARY;
  ctx.textAlign = 'center';
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 2;
  }
  ctx.fillText(title, cx, curY + remH * 0.38);

  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 8;
  }
  ctx.fillText(subtitle, cx, curY + remH * 0.70);
  ctx.restore();
}

// ── Master Festival Template Dispatcher ──

export async function renderFestivalTemplate({
  id,
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
  const padX = Math.round(width * (isLandscape ? 0.05 : 0.055));
  const padY = Math.round(height * (isLandscape ? 0.045 : 0.04));

  const headline = (post?.headline || post?.topic || 'Happy Diwali & Prosperous New Year').trim();
  const tagline = (post?.tagline || post?.subheadline || post?.description || 'May this festive season bring boundless prosperity, good health, and joyful success.').trim();
  const items = (post?.keyPoints || post?.deliverables || ['Prosperity & Wealth', 'Health & Happiness', 'Limitless Innovation']).slice(0, 3);

  // 1. Clean White & Soft Light Teal Background (with authentic festive photo atmosphere from images_AI)
  await renderPosterBackground({
    ctx,
    width,
    height,
    post,
    style,
    accentColor: TEAL_PRIMARY,
    topicImg
  });

  // 2. Top Branding Bar in White & Teal (Wavy Header matching User Sketch)
  const { contentTopY } = renderStandardTopBar({
    ctx,
    width,
    height,
    post,
    brand,
    logoImg,
    style,
    padX,
    padY,
    isLandscape,
    accentColor: TEAL_PRIMARY
  });

  const footerY = height - padY - (isLandscape ? 80 : 96);

  // 3. Layout Dispatcher based on template ID
  if (id === 'festival-02') {
    await renderNewYearTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'festival-03') {
    await renderEidTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'festival-04') {
    await renderChristmasTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'festival-05') {
    await renderMegaSaleTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'festival-06') {
    await renderFreedomTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'festival-07') {
    await renderHoliTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'festival-08') {
    await renderCyberWeekTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'festival-09') {
    await renderGratitudeTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'festival-10') {
    await renderAnniversaryTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else {
    // festival-01 & default: Diwali Golden Lights
    await renderDiwaliTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  }

  // 4. Bottom Call To Action & Contact Capsule
  renderStandardBottomBar({
    ctx,
    width,
    height,
    post,
    brand,
    style,
    padX,
    footerY,
    bottomH: isLandscape ? 80 : 96,
    isLandscape,
    accentColor: TEAL_PRIMARY
  });
}

/**
 * FESTIVAL-01: Diwali Golden Lights & Blessings
 */
async function renderDiwaliTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  const cx = width / 2;
  const maxW = width - (padX * 2);
  let curY = contentTopY + 12;

  // Ornate Diya Lamp in Gold & Teal
  drawDiyaOilLamp(ctx, cx, curY + 48, isLandscape ? 74 : 96, GOLD_ACCENT);
  drawSparkleIcon(ctx, cx - 160, curY + 36, 26, GOLD_ACCENT);
  drawSparkleIcon(ctx, cx + 160, curY + 36, 26, GOLD_ACCENT);
  curY += isLandscape ? 104 : 130;

  // Bold Headline & Tagline (Floating Transparent Typography)
  curY = renderFestiveHeadline(ctx, headline, cx, curY, maxW, isLandscape, hasBg, '"Outfit", serif', '#FBBF24');
  curY = renderFestiveTagline(ctx, tagline, cx, curY + 8, maxW, isLandscape, hasBg);
  curY = renderFestiveCards(ctx, items, 'Divine Festive Blessing', padX, curY + 20, maxW, hasBg, 'sparkle', GOLD_ACCENT);

  // Bottom Festive Greeting - Floating typography (NO LIGHT WHITE BOX!)
  renderFestiveBottomBanner(
    ctx, cx, curY, padX, maxW, footerY - curY - 14,
    '🪔  MAY THE FESTIVAL OF LIGHTS ILLUMINATE YOUR BUSINESS JOURNEY',
    'Wishing you and your teams boundless innovation, prosperity, and joyful shared triumphs.',
    hasBg, '#FBBF24'
  );
}

/**
 * FESTIVAL-02: New Year 2027 Fireworks & Milestones
 */
async function renderNewYearTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  drawFireworksBurst(ctx, width * 0.16, contentTopY + 54, 52, TEAL_PRIMARY);
  drawFireworksBurst(ctx, width * 0.84, contentTopY + 48, 56, GOLD_ACCENT);

  const cx = width / 2;
  const maxW = width - (padX * 2);
  let curY = contentTopY + 12;

  // Big 2027 Badge
  ctx.save();
  ctx.font = `900 ${isLandscape ? 72 : 96}px "Outfit", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 16;
  }
  const nyGrad = ctx.createLinearGradient(cx - 140, curY, cx + 140, curY + 90);
  nyGrad.addColorStop(0, hasBg ? '#2DD4BF' : TEAL_PRIMARY);
  nyGrad.addColorStop(1, hasBg ? '#5EEAD4' : TEAL_LIGHT);
  ctx.fillStyle = nyGrad;
  ctx.fillText('2027', cx, curY);
  ctx.restore();
  curY += isLandscape ? 82 : 108;

  curY = renderFestiveHeadline(ctx, headline, cx, curY, maxW, isLandscape, hasBg, '"Outfit", sans-serif', '#2DD4BF');
  curY = renderFestiveTagline(ctx, tagline, cx, curY + 8, maxW, isLandscape, hasBg);
  curY = renderFestiveCards(ctx, items, 'Core 2027 Milestone', padX, curY + 20, maxW, hasBg, 'checkmark', hasBg ? '#2DD4BF' : TEAL_PRIMARY);

  renderFestiveBottomBanner(
    ctx, cx, curY, padX, maxW, footerY - curY - 14,
    '🚀  STEPPING BOLDLY INTO A YEAR OF UNPRECEDENTED VELOCITY',
    'Empowering businesses worldwide with intelligent automated systems & visionary execution.',
    hasBg, '#2DD4BF'
  );
}

/**
 * FESTIVAL-03: Eid Mubarak Crescent & Lanterns
 */
async function renderEidTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  const cx = width / 2;
  const maxW = width - (padX * 2);
  let curY = contentTopY + 10;

  drawCrescentMoonAndLanterns(ctx, cx, curY + 54, 76, hasBg ? '#2DD4BF' : TEAL_PRIMARY);
  curY += 126;

  curY = renderFestiveHeadline(ctx, headline, cx, curY, maxW, isLandscape, hasBg, '"Outfit", serif', '#FBBF24');
  curY = renderFestiveTagline(ctx, tagline, cx, curY + 8, maxW, isLandscape, hasBg);
  curY = renderFestiveCards(ctx, items, 'Peace & Prosperity', padX, curY + 20, maxW, hasBg, 'sparkle', GOLD_ACCENT);

  renderFestiveBottomBanner(
    ctx, cx, curY, padX, maxW, footerY - curY - 14,
    '🌙  EID MUBARAK — WISHING YOU HARMONY, SUCCESS & JOY',
    'May the blessings of this holy celebration bring peace and shared triumphs to your entire family.',
    hasBg, '#FBBF24'
  );
}

/**
 * FESTIVAL-04: Christmas & Season Greetings
 */
async function renderChristmasTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  const cx = width / 2;
  const maxW = width - (padX * 2);
  let curY = contentTopY + 14;

  drawSparkleIcon(ctx, cx, curY + 32, 44, GOLD_ACCENT);
  curY += 76;

  curY = renderFestiveHeadline(ctx, headline, cx, curY, maxW, isLandscape, hasBg, '"Outfit", serif', '#FBBF24');
  curY = renderFestiveTagline(ctx, tagline, cx, curY + 8, maxW, isLandscape, hasBg);
  curY = renderFestiveCards(ctx, items, 'Holiday Wish & Joy', padX, curY + 20, maxW, hasBg, 'checkmark', GOLD_ACCENT);

  renderFestiveBottomBanner(
    ctx, cx, curY, padX, maxW, footerY - curY - 14,
    '🎄  WARMEST SEASON GREETINGS & PROSPEROUS NEW YEAR',
    'Grateful for our incredible clients, partners, and teams making this year extraordinary.',
    hasBg, '#FBBF24'
  );
}

/**
 * FESTIVAL-05: Mega Festive Sale 50% Off Commercial Banner
 */
async function renderMegaSaleTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  const maxW = width - (padX * 2);
  let curY = contentTopY;

  drawRoundRect(ctx, padX, curY, maxW, 46, 12);
  ctx.fillStyle = hasBg ? 'rgba(0, 128, 128, 0.40)' : TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.font = '900 16px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡ MEGA FESTIVE SALE — EXCLUSIVE ENTERPRISE OFFER', width / 2, curY + 23);

  curY += 62;
  // Giant 50% OFF Callout
  ctx.save();
  ctx.font = `900 ${isLandscape ? 76 : 100}px "Outfit", sans-serif`;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 16;
  }
  const saleGrad = ctx.createLinearGradient(width / 2 - 160, curY, width / 2 + 160, curY + 90);
  saleGrad.addColorStop(0, '#EF4444');
  saleGrad.addColorStop(0.5, hasBg ? '#2DD4BF' : TEAL_PRIMARY);
  saleGrad.addColorStop(1, hasBg ? '#5EEAD4' : TEAL_LIGHT);
  ctx.fillStyle = saleGrad;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('50% OFF', width / 2, curY);
  ctx.restore();
  curY += isLandscape ? 84 : 110;

  curY = renderFestiveHeadline(ctx, headline, width / 2, curY, maxW, isLandscape, hasBg, '"Outfit", sans-serif', '#2DD4BF');
  curY = renderFestiveTagline(ctx, tagline, width / 2, curY + 8, maxW, isLandscape, hasBg);
  curY = renderFestiveCards(ctx, items, 'Included in Sale', padX, curY + 20, maxW, hasBg, 'checkmark', hasBg ? '#2DD4BF' : TEAL_PRIMARY);

  renderFestiveBottomBanner(
    ctx, width / 2, curY, padX, maxW, footerY - curY - 14,
    '🏷️  USE VOUCHER CODE: FESTIVE2026 FOR INSTANT 50% CREDITS',
    'Priority activation · Dedicated engineering support · Zero setup fees · Enterprise SLA',
    hasBg, '#2DD4BF'
  );
}

/**
 * FESTIVAL-06: National Freedom & Innovation Pride
 */
async function renderFreedomTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  const cx = width / 2;
  const maxW = width - (padX * 2);
  let curY = contentTopY + 16;

  drawSparkleIcon(ctx, cx, curY + 28, 38, hasBg ? '#FBBF24' : TEAL_PRIMARY);
  curY += 70;

  curY = renderFestiveHeadline(ctx, headline, cx, curY, maxW, isLandscape, hasBg, '"Outfit", serif', '#FBBF24');
  curY = renderFestiveTagline(ctx, tagline, cx, curY + 8, maxW, isLandscape, hasBg);
  curY = renderFestiveCards(ctx, items, 'National Milestone', padX, curY + 20, maxW, hasBg, 'checkmark', GOLD_ACCENT);

  renderFestiveBottomBanner(
    ctx, cx, curY, padX, maxW, footerY - curY - 14,
    '🇮🇳  HONORING THE SPIRIT OF FREEDOM, INNOVATION & RESILIENCE',
    'Committed to building world-class technology that champions progress, unity, and self-reliance.',
    hasBg, '#FBBF24'
  );
}

/**
 * FESTIVAL-07: Holi Vibrant Colors Splash
 */
async function renderHoliTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  const cx = width / 2;
  const maxW = width - (padX * 2);
  let curY = contentTopY + 20;

  const splashColors = [TEAL_PRIMARY, TEAL_LIGHT, '#F59E0B', '#EC4899', '#8B5CF6'];
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI * 2) / 10;
    const sx = cx + Math.cos(angle) * 85;
    const sy = curY + 32 + Math.sin(angle) * 26;
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI * 2);
    ctx.fillStyle = splashColors[i % splashColors.length];
    ctx.fill();
  }
  curY += 68;

  curY = renderFestiveHeadline(ctx, headline, cx, curY, maxW, isLandscape, hasBg, '"Outfit", sans-serif', '#EC4899');
  curY = renderFestiveTagline(ctx, tagline, cx, curY + 8, maxW, isLandscape, hasBg);
  curY = renderFestiveCards(ctx, items, 'Celebration Color', padX, curY + 20, maxW, hasBg, 'sparkle', '#F59E0B');

  renderFestiveBottomBanner(
    ctx, cx, curY, padX, maxW, footerY - curY - 14,
    '🎨  CELEBRATING VIBRANT PARTNERSHIPS, UNITY & CREATIVITY',
    'May your business journey be painted with boundless breakthroughs and joyful collaboration.',
    hasBg, '#EC4899'
  );
}

/**
 * FESTIVAL-08: Cyber Holiday Deals
 */
async function renderCyberWeekTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  const cx = width / 2;
  const maxW = width - (padX * 2);
  let curY = contentTopY;

  drawRoundRect(ctx, padX, curY, maxW, 46, 12);
  ctx.fillStyle = '#0F172A';
  ctx.fill();
  ctx.strokeStyle = '#2DD4BF';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.font = '900 16px "Space Grotesk", monospace';
  ctx.fillStyle = '#2DD4BF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('// CYBER SPRINT 2026: MAXIMUM CONVERSION UNLOCKED', cx, curY + 23);
  curY += 64;

  curY = renderFestiveHeadline(ctx, headline, cx, curY, maxW, isLandscape, hasBg, '"Space Grotesk", sans-serif', '#2DD4BF');
  curY = renderFestiveTagline(ctx, tagline, cx, curY + 8, maxW, isLandscape, hasBg);
  curY = renderFestiveCards(ctx, items, 'Cyber Tier Benefit', padX, curY + 20, maxW, hasBg, 'checkmark', '#2DD4BF');

  renderFestiveBottomBanner(
    ctx, cx, curY, padX, maxW, footerY - curY - 14,
    '⚡  LOCK IN TIER-1 INFRASTRUCTURE PRICING BEFORE CAPACITY EXPIRES',
    'Sub-second latency guarantees · 99.99% uptime SLAs · Seamless multi-cloud redundancy',
    hasBg, '#2DD4BF'
  );
}

/**
 * FESTIVAL-09: Thanksgiving & Gratitude Showcase
 */
async function renderGratitudeTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  const cx = width / 2;
  const maxW = width - (padX * 2);
  let curY = contentTopY + 16;

  drawSparkleIcon(ctx, cx, curY + 28, 38, hasBg ? '#FBBF24' : TEAL_PRIMARY);
  curY += 70;

  curY = renderFestiveHeadline(ctx, headline, cx, curY, maxW, isLandscape, hasBg, '"Outfit", serif', '#FBBF24');
  curY = renderFestiveTagline(ctx, tagline, cx, curY + 8, maxW, isLandscape, hasBg);
  curY = renderFestiveCards(ctx, items, 'Gratitude & Loyalty', padX, curY + 20, maxW, hasBg, 'sparkle', GOLD_ACCENT);

  renderFestiveBottomBanner(
    ctx, cx, curY, padX, maxW, footerY - curY - 14,
    '🍁  PROFOUND GRATITUDE TO OUR VALUED CLIENTS & PARTNERS',
    'Thank you for trusting our team to power your most ambitious digital transformations.',
    hasBg, '#FBBF24'
  );
}

/**
 * FESTIVAL-10: Milestone Anniversary & Founders Celebration
 */
async function renderAnniversaryTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  const cx = width / 2;
  const maxW = width - (padX * 2);
  let curY = contentTopY + 16;

  drawSparkleIcon(ctx, cx, curY + 28, 40, GOLD_ACCENT);
  curY += 72;

  curY = renderFestiveHeadline(ctx, headline, cx, curY, maxW, isLandscape, hasBg, '"Outfit", sans-serif', '#FBBF24');
  curY = renderFestiveTagline(ctx, tagline, cx, curY + 8, maxW, isLandscape, hasBg);
  curY = renderFestiveCards(ctx, items, 'Corporate Milestone', padX, curY + 20, maxW, hasBg, 'checkmark', GOLD_ACCENT);

  renderFestiveBottomBanner(
    ctx, cx, curY, padX, maxW, footerY - curY - 14,
    '🏆  HONORING FOUNDING VALUES OF CRAFTSMANSHIP & CLIENT SUCCESS',
    'Here is to another milestone year of innovation, high standards, and empowering world-class teams.',
    hasBg, '#FBBF24'
  );
}
