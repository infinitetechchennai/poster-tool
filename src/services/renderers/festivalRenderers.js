/**
 * 10 Distinct Festival & Celebration Poster Renderers in Clean White & Teal (#008080)
 * 
 * Aesthetic:
 * - Crisp White (#FFFFFF) & Soft Light Teal (#F0FDFA) background base (NO default photos)
 * - Festive celebration highlights: Gold (#D97706), Amber (#F59E0B), Crimson (#DC2626), and Infinitetech Teal (#008080)
 * - Big, bold 2-tone colorful festive typography (Deep Slate #0F172A + Vibrant Teal & Gold)
 * - Zero empty white space: Every single festival poster fills the canvas from header to footer with high-value festive content.
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

  // 2. Top Branding Bar in White & Teal
  const { contentTopY } = renderStandardTopBar({
    ctx,
    width,
    height,
    brand,
    logoImg,
    style,
    padX,
    padY,
    isLandscape
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
  const cx = width / 2;
  const maxW = width - (padX * 2);
  let curY = contentTopY + 12;

  // Ornate Diya Lamp in Gold & Teal
  drawDiyaOilLamp(ctx, cx, curY + 48, isLandscape ? 74 : 96, GOLD_ACCENT);
  drawSparkleIcon(ctx, cx - 160, curY + 36, 26, GOLD_ACCENT);
  drawSparkleIcon(ctx, cx + 160, curY + 36, 26, GOLD_ACCENT);
  curY += isLandscape ? 104 : 130;

  // Bold Headline
  ctx.save();
  ctx.font = `900 ${isLandscape ? 44 : 58}px "Outfit", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  wrapText(ctx, headline, maxW).slice(0, 2).forEach((l, idx) => {
    ctx.fillStyle = idx === 0 ? TEXT_DARK : TEAL_PRIMARY;
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 50 : 66;
  });
  ctx.restore();

  // Subtitle
  curY += 8;
  ctx.font = `600 ${isLandscape ? 16 : 22}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'center';
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 30;
  });
  curY += 20;

  // 3 Blessing Cards
  const cardW = Math.round((maxW - 24) / 3);
  const cardH = 92;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 14, borderCol: 'rgba(217, 119, 6, 0.35)' });

    drawSparkleIcon(ctx, cardX + 22, curY + 30, 20, GOLD_ACCENT);

    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.fillText(item, cardX + 50, curY + 34);

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText('Divine Festive Blessing', cardX + 50, curY + 62);
  });
  curY += cardH + 28;

  // Bottom Festive Greeting Card (Fills down to footerY)
  const remH = footerY - curY - 14;
  if (remH > 70) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: remH, radius: 16 });

    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText('🪔  MAY THE FESTIVAL OF LIGHTS ILLUMINATE YOUR BUSINESS JOURNEY', cx, curY + remH * 0.38);

    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText('Wishing you and your teams boundless innovation, prosperity, and joyful shared triumphs.', cx, curY + remH * 0.70);
    ctx.textAlign = 'left';
  }
}

/**
 * FESTIVAL-02: New Year 2027 Fireworks & Milestones
 */
async function renderNewYearTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
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

  const nyGrad = ctx.createLinearGradient(cx - 140, curY, cx + 140, curY + 90);
  nyGrad.addColorStop(0, TEAL_PRIMARY);
  nyGrad.addColorStop(1, TEAL_LIGHT);
  ctx.fillStyle = nyGrad;
  ctx.fillText('2027', cx, curY);
  ctx.restore();
  curY += isLandscape ? 82 : 108;

  // Headline
  ctx.font = `900 ${isLandscape ? 40 : 54}px "Outfit", sans-serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'center';
  wrapText(ctx, headline, maxW).slice(0, 2).forEach(l => {
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 48 : 62;
  });

  // Tagline
  curY += 8;
  ctx.font = `600 ${isLandscape ? 16 : 22}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 30;
  });
  curY += 20;

  // 3 Milestone Cards
  const cardW = Math.round((maxW - 24) / 3);
  const cardH = 92;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 14 });

    drawCheckmarkIcon(ctx, cardX + 20, curY + 30, 22, TEAL_PRIMARY);

    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.fillText(item, cardX + 50, curY + 34);

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText('Core 2027 Milestone', cardX + 50, curY + 62);
  });
  curY += cardH + 28;

  // Bottom Corporate Vision Card
  const remH = footerY - curY - 14;
  if (remH > 70) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: remH, radius: 16 });

    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText('🚀  STEPPING BOLDLY INTO A YEAR OF UNPRECEDENTED VELOCITY', cx, curY + remH * 0.38);

    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText('Empowering businesses worldwide with intelligent automated systems & visionary execution.', cx, curY + remH * 0.70);
    ctx.textAlign = 'left';
  }
}

/**
 * FESTIVAL-03: Eid Mubarak Crescent & Lanterns
 */
async function renderEidTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const cx = width / 2;
  const maxW = width - (padX * 2);
  let curY = contentTopY + 10;

  drawCrescentMoonAndLanterns(ctx, cx, curY + 54, 76, TEAL_PRIMARY);
  curY += 126;

  ctx.font = `900 ${isLandscape ? 44 : 56}px "Outfit", serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  wrapText(ctx, headline, maxW).slice(0, 2).forEach((l, idx) => {
    ctx.fillStyle = idx === 0 ? TEXT_DARK : TEAL_PRIMARY;
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 50 : 64;
  });

  curY += 8;
  ctx.font = `600 ${isLandscape ? 16 : 22}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 30;
  });
  curY += 20;

  const cardW = Math.round((maxW - 24) / 3);
  const cardH = 92;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 14 });
    drawSparkleIcon(ctx, cardX + 20, curY + 30, 20, TEAL_PRIMARY);
    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.fillText(item, cardX + 48, curY + 34);

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText('Peace & Prosperity', cardX + 48, curY + 62);
  });
  curY += cardH + 28;

  const remH = footerY - curY - 14;
  if (remH > 70) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: remH, radius: 16 });
    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText('🌙  EID MUBARAK — WISHING YOU HARMONY, SUCCESS & JOY', cx, curY + remH * 0.38);

    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText('May the blessings of this holy celebration bring peace and shared triumphs to your entire family.', cx, curY + remH * 0.70);
    ctx.textAlign = 'left';
  }
}

/**
 * FESTIVAL-04: Christmas & Season Greetings
 */
async function renderChristmasTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const cx = width / 2;
  const maxW = width - (padX * 2);
  let curY = contentTopY + 14;

  drawSparkleIcon(ctx, cx, curY + 32, 44, GOLD_ACCENT);
  curY += 76;

  ctx.font = `900 ${isLandscape ? 44 : 56}px "Outfit", serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  wrapText(ctx, headline, maxW).slice(0, 2).forEach((l, idx) => {
    ctx.fillStyle = idx === 0 ? TEXT_DARK : TEAL_PRIMARY;
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 48 : 64;
  });

  curY += 8;
  ctx.font = `600 ${isLandscape ? 16 : 22}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 30;
  });
  curY += 20;

  const cardW = Math.round((maxW - 24) / 3);
  const cardH = 92;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 14 });
    drawCheckmarkIcon(ctx, cardX + 20, curY + 30, 20, TEAL_PRIMARY);
    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.fillText(item, cardX + 48, curY + 34);

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText('Holiday Wish & Joy', cardX + 48, curY + 62);
  });
  curY += cardH + 28;

  const remH = footerY - curY - 14;
  if (remH > 70) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: remH, radius: 16 });
    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText('🎄  WARMEST SEASON GREETINGS & PROSPEROUS NEW YEAR', cx, curY + remH * 0.38);

    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText('Grateful for our incredible clients, partners, and teams making this year extraordinary.', cx, curY + remH * 0.70);
    ctx.textAlign = 'left';
  }
}

/**
 * FESTIVAL-05: Mega Festive Sale 50% Off Commercial Banner
 */
async function renderMegaSaleTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const maxW = width - (padX * 2);
  let curY = contentTopY;

  drawRoundRect(ctx, padX, curY, maxW, 46, 12);
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.font = '900 16px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡ MEGA FESTIVE SALE — EXCLUSIVE ENTERPRISE OFFER', width / 2, curY + 23);

  curY += 62;
  // Giant 50% OFF Callout
  ctx.save();
  ctx.font = `900 ${isLandscape ? 76 : 100}px "Outfit", sans-serif`;
  const saleGrad = ctx.createLinearGradient(width / 2 - 160, curY, width / 2 + 160, curY + 90);
  saleGrad.addColorStop(0, '#EF4444');
  saleGrad.addColorStop(0.5, TEAL_PRIMARY);
  saleGrad.addColorStop(1, TEAL_LIGHT);
  ctx.fillStyle = saleGrad;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('50% OFF', width / 2, curY);
  ctx.restore();
  curY += isLandscape ? 84 : 110;

  ctx.font = `900 ${isLandscape ? 40 : 50}px "Outfit", sans-serif`;
  ctx.fillStyle = TEXT_DARK;
  wrapText(ctx, headline, maxW).slice(0, 2).forEach(l => {
    ctx.fillText(l, width / 2, curY);
    curY += isLandscape ? 46 : 58;
  });

  curY += 8;
  ctx.font = `600 ${isLandscape ? 16 : 22}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, width / 2, curY);
    curY += 30;
  });
  curY += 20;

  const cardW = Math.round((maxW - 24) / 3);
  const cardH = 92;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 14 });
    drawCheckmarkIcon(ctx, cardX + 20, curY + 30, 20, TEAL_PRIMARY);
    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.fillText(item, cardX + 48, curY + 34);

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText('Included in Sale', cardX + 48, curY + 62);
  });
  curY += cardH + 28;

  const remH = footerY - curY - 14;
  if (remH > 70) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: remH, radius: 16 });
    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText('🏷️  USE VOUCHER CODE: FESTIVE2026 FOR INSTANT 50% CREDITS', width / 2, curY + remH * 0.38);

    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText('Priority activation · Dedicated engineering support · Zero setup fees · Enterprise SLA', width / 2, curY + remH * 0.70);
    ctx.textAlign = 'left';
  }
}

/**
 * FESTIVAL-06: National Freedom & Innovation Pride
 */
async function renderFreedomTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const cx = width / 2;
  const maxW = width - (padX * 2);
  let curY = contentTopY + 16;

  drawSparkleIcon(ctx, cx, curY + 28, 38, TEAL_PRIMARY);
  curY += 70;

  ctx.font = `900 ${isLandscape ? 44 : 56}px "Outfit", serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  wrapText(ctx, headline, maxW).slice(0, 2).forEach((l, idx) => {
    ctx.fillStyle = idx === 0 ? TEXT_DARK : TEAL_PRIMARY;
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 50 : 64;
  });

  curY += 8;
  ctx.font = `600 ${isLandscape ? 16 : 22}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 30;
  });
  curY += 20;

  const cardW = Math.round((maxW - 24) / 3);
  const cardH = 92;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 14 });
    drawCheckmarkIcon(ctx, cardX + 20, curY + 30, 20, TEAL_PRIMARY);
    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.fillText(item, cardX + 48, curY + 34);

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText('National Milestone', cardX + 48, curY + 62);
  });
  curY += cardH + 28;

  const remH = footerY - curY - 14;
  if (remH > 70) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: remH, radius: 16 });
    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText('🇮🇳  HONORING THE SPIRIT OF FREEDOM, INNOVATION & RESILIENCE', cx, curY + remH * 0.38);

    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText('Committed to building world-class technology that champions progress, unity, and self-reliance.', cx, curY + remH * 0.70);
    ctx.textAlign = 'left';
  }
}

/**
 * FESTIVAL-07: Holi Vibrant Colors Splash
 */
async function renderHoliTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
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

  ctx.font = `900 ${isLandscape ? 44 : 58}px "Outfit", sans-serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  wrapText(ctx, headline, maxW).slice(0, 2).forEach((l, idx) => {
    ctx.fillStyle = idx === 0 ? TEXT_DARK : TEAL_PRIMARY;
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 50 : 64;
  });

  curY += 8;
  ctx.font = `600 ${isLandscape ? 16 : 22}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 30;
  });
  curY += 20;

  const cardW = Math.round((maxW - 24) / 3);
  const cardH = 92;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 14 });
    drawSparkleIcon(ctx, cardX + 20, curY + 30, 20, TEAL_PRIMARY);
    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.fillText(item, cardX + 48, curY + 34);

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText('Celebration Color', cardX + 48, curY + 62);
  });
  curY += cardH + 28;

  const remH = footerY - curY - 14;
  if (remH > 70) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: remH, radius: 16 });
    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText('🎨  CELEBRATING VIBRANT PARTNERSHIPS, UNITY & CREATIVITY', cx, curY + remH * 0.38);

    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText('May your business journey be painted with boundless breakthroughs and joyful collaboration.', cx, curY + remH * 0.70);
    ctx.textAlign = 'left';
  }
}

/**
 * FESTIVAL-08: Cyber Holiday Deals
 */
async function renderCyberWeekTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const cx = width / 2;
  const maxW = width - (padX * 2);
  let curY = contentTopY;

  drawRoundRect(ctx, padX, curY, maxW, 46, 12);
  ctx.fillStyle = '#0F172A';
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.font = '900 16px "Space Grotesk", monospace';
  ctx.fillStyle = '#2DD4BF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('// CYBER SPRINT 2026: MAXIMUM CONVERSION UNLOCKED', cx, curY + 23);
  curY += 64;

  ctx.font = `900 ${isLandscape ? 44 : 58}px "Outfit", sans-serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textBaseline = 'top';

  wrapText(ctx, headline, maxW).slice(0, 2).forEach(l => {
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 50 : 64;
  });

  curY += 8;
  ctx.font = `600 ${isLandscape ? 16 : 22}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 30;
  });
  curY += 20;

  const cardW = Math.round((maxW - 24) / 3);
  const cardH = 92;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 14 });
    drawCheckmarkIcon(ctx, cardX + 20, curY + 30, 20, TEAL_PRIMARY);
    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.fillText(item, cardX + 48, curY + 34);

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText('Cyber Tier Benefit', cardX + 48, curY + 62);
  });
  curY += cardH + 28;

  const remH = footerY - curY - 14;
  if (remH > 70) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: remH, radius: 16 });
    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText('⚡  LOCK IN TIER-1 INFRASTRUCTURE PRICING BEFORE CAPACITY EXPIRES', cx, curY + remH * 0.38);

    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText('Sub-second latency guarantees · 99.99% uptime SLAs · Seamless multi-cloud redundancy', cx, curY + remH * 0.70);
    ctx.textAlign = 'left';
  }
}

/**
 * FESTIVAL-09: Thanksgiving & Gratitude Showcase
 */
async function renderGratitudeTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const cx = width / 2;
  const maxW = width - (padX * 2);
  let curY = contentTopY + 16;

  drawSparkleIcon(ctx, cx, curY + 28, 38, TEAL_PRIMARY);
  curY += 70;

  ctx.font = `900 ${isLandscape ? 44 : 56}px "Outfit", serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  wrapText(ctx, headline, maxW).slice(0, 2).forEach((l, idx) => {
    ctx.fillStyle = idx === 0 ? TEXT_DARK : TEAL_PRIMARY;
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 50 : 64;
  });

  curY += 8;
  ctx.font = `600 ${isLandscape ? 16 : 22}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 30;
  });
  curY += 20;

  const cardW = Math.round((maxW - 24) / 3);
  const cardH = 92;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 14 });
    drawCheckmarkIcon(ctx, cardX + 20, curY + 30, 20, TEAL_PRIMARY);
    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.fillText(item, cardX + 48, curY + 34);

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText('Gratitude & Loyalty', cardX + 48, curY + 62);
  });
  curY += cardH + 28;

  const remH = footerY - curY - 14;
  if (remH > 70) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: remH, radius: 16 });
    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText('🍁  PROFOUND GRATITUDE TO OUR VALUED CLIENTS & PARTNERS', cx, curY + remH * 0.38);

    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText('Thank you for trusting our team to power your most ambitious digital transformations.', cx, curY + remH * 0.70);
    ctx.textAlign = 'left';
  }
}

/**
 * FESTIVAL-10: Milestone Anniversary & Founders Celebration
 */
async function renderAnniversaryTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const cx = width / 2;
  const maxW = width - (padX * 2);
  let curY = contentTopY + 16;

  drawSparkleIcon(ctx, cx, curY + 28, 40, GOLD_ACCENT);
  curY += 72;

  ctx.font = `900 ${isLandscape ? 44 : 58}px "Outfit", sans-serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  wrapText(ctx, headline, maxW).slice(0, 2).forEach((l, idx) => {
    ctx.fillStyle = idx === 0 ? TEXT_DARK : TEAL_PRIMARY;
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 50 : 64;
  });

  curY += 8;
  ctx.font = `600 ${isLandscape ? 16 : 22}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 30;
  });
  curY += 20;

  const cardW = Math.round((maxW - 24) / 3);
  const cardH = 92;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 14 });
    drawCheckmarkIcon(ctx, cardX + 20, curY + 30, 20, TEAL_PRIMARY);
    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.fillText(item, cardX + 48, curY + 34);

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText('Corporate Milestone', cardX + 48, curY + 62);
  });
  curY += cardH + 28;

  const remH = footerY - curY - 14;
  if (remH > 70) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: remH, radius: 16 });
    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText('🏆  HONORING FOUNDING VALUES OF CRAFTSMANSHIP & CLIENT SUCCESS', cx, curY + remH * 0.38);

    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText('Here is to another milestone year of innovation, high standards, and empowering world-class teams.', cx, curY + remH * 0.70);
    ctx.textAlign = 'left';
  }
}
