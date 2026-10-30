/**
 * 10 Distinct Festival & Celebration Poster Renderers in Clean White & Teal (#008080)
 * 
 * Aesthetic:
 * - Crisp White (#FFFFFF) & Soft Light Teal (#F0FDFA) background base (NO default photos)
 * - Festive celebration highlights: Gold (#D97706), Amber (#F59E0B), Crimson (#DC2626), and Infinitetech Teal (#008080)
 * - User uploaded image fits into the celebration/event container when provided
 * - Top branding: Logo pill + Category badge in #008080
 * - Big, bold 2-tone colorful festive typography (Deep Slate #0F172A + Vibrant Teal & Gold)
 * - Structured white & light teal celebration cards
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

  // 1. Clean White & Soft Light Teal Background (NO default photo loading!)
  await renderPosterBackground({
    ctx,
    width,
    height,
    post,
    style,
    accentColor: TEAL_PRIMARY
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
    // New Year 2027 Fireworks & Milestone Celebration
    await renderNewYearTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'festival-03') {
    // Eid Mubarak Crescent & Lanterns in White & Teal
    await renderEidTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'festival-04') {
    // Christmas & Season Greetings
    await renderChristmasTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'festival-05') {
    // Mega Festive Sale 50% Off Commercial Banner
    await renderMegaSaleTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'festival-06') {
    // National Freedom & Innovation Pride
    await renderFreedomTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'festival-07') {
    // Holi Vibrant Colors Splash in White & Teal
    await renderHoliTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'festival-08') {
    // Cyber Holiday Deals & Digital Sprint
    await renderCyberWeekTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'festival-09') {
    // Thanksgiving & Gratitude Showcase
    await renderGratitudeTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'festival-10') {
    // Milestone Anniversary & Founders Celebration
    await renderAnniversaryTeal({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else {
    // festival-01 & default: Diwali Golden Lights & Blessings
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
 * FESTIVAL-01: Diwali Golden Lights & Blessings in White & Teal
 */
async function renderDiwaliTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const cx = width / 2;
  let curY = contentTopY + (isLandscape ? 6 : 14);

  // Ornate Diya Lamp in Gold & Teal
  drawDiyaOilLamp(ctx, cx, curY + 44, isLandscape ? 70 : 84, GOLD_ACCENT);
  curY += isLandscape ? 96 : 116;

  // Festive Sparkles flanking the lamp
  drawSparkleIcon(ctx, cx - 130, curY - 50, 22, GOLD_ACCENT);
  drawSparkleIcon(ctx, cx + 130, curY - 50, 22, GOLD_ACCENT);

  // Bold 2-Tone Headline (Deep Slate + Golden Teal)
  ctx.save();
  ctx.font = `900 ${isLandscape ? 38 : 46}px "Outfit", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const lines = wrapText(ctx, headline, width - (padX * 2)).slice(0, 2);
  lines.forEach((l, idx) => {
    if (idx === 0) {
      ctx.fillStyle = TEXT_DARK;
    } else {
      const grad = ctx.createLinearGradient(padX, curY, width - padX, curY);
      grad.addColorStop(0, GOLD_ACCENT);
      grad.addColorStop(1, TEAL_PRIMARY);
      ctx.fillStyle = grad;
    }
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 44 : 54;
  });
  ctx.restore();

  curY += 10;
  // Subtitle / Warm wishes
  ctx.font = `600 ${isLandscape ? 13 : 15}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'center';
  wrapText(ctx, tagline, width - (padX * 2.5)).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 22;
  });

  curY += 16;
  // 3 White & Teal Blessing Cards
  const cardW = Math.round((width - (padX * 2) - 24) / 3);
  const cardH = isLandscape ? 58 : 68;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 12, borderCol: 'rgba(217, 119, 6, 0.3)' });

    drawSparkleIcon(ctx, cardX + 18, curY + cardH / 2, 14, GOLD_ACCENT);

    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item, cardX + 34, curY + cardH / 2);
  });
}

/**
 * FESTIVAL-02: New Year 2027 Fireworks & Milestones
 */
async function renderNewYearTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  drawFireworksBurst(ctx, width * 0.18, contentTopY + 50, 48, TEAL_PRIMARY);
  drawFireworksBurst(ctx, width * 0.82, contentTopY + 44, 52, GOLD_ACCENT);

  const cx = width / 2;
  let curY = contentTopY + (isLandscape ? 8 : 16);

  // Big 2027 Badge in Teal
  ctx.save();
  ctx.font = `900 ${isLandscape ? 68 : 84}px "Outfit", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const nyGrad = ctx.createLinearGradient(cx - 120, curY, cx + 120, curY + 80);
  nyGrad.addColorStop(0, TEAL_PRIMARY);
  nyGrad.addColorStop(1, TEAL_LIGHT);
  ctx.fillStyle = nyGrad;
  ctx.fillText('2027', cx, curY);
  ctx.restore();

  curY += isLandscape ? 74 : 94;

  ctx.font = `900 ${isLandscape ? 36 : 44}px "Outfit", sans-serif`;
  ctx.fillStyle = TEXT_DARK;
  wrapText(ctx, headline, width - (padX * 2)).slice(0, 2).forEach(l => {
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 42 : 50;
  });

  curY += 8;
  ctx.font = `500 ${isLandscape ? 13 : 15}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, width - (padX * 2.5)).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 22;
  });

  curY += 16;
  // 3 Milestone Cards in White & Teal
  const cardW = Math.round((width - (padX * 2) - 24) / 3);
  const cardH = isLandscape ? 58 : 66;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 12 });

    drawCheckmarkIcon(ctx, cardX + 16, curY + cardH / 2, 16, TEAL_PRIMARY);

    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item, cardX + 34, curY + cardH / 2);
  });
}

/**
 * FESTIVAL-03: Eid Mubarak Crescent & Lanterns in White & Teal
 */
async function renderEidTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const cx = width / 2;
  let curY = contentTopY + 10;

  drawCrescentMoonAndLanterns(ctx, cx, curY + 48, 64, TEAL_PRIMARY);
  curY += 114;

  ctx.font = `900 ${isLandscape ? 40 : 48}px "Outfit", serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  wrapText(ctx, headline, width - (padX * 2)).slice(0, 2).forEach((l, idx) => {
    ctx.fillStyle = idx === 0 ? TEXT_DARK : TEAL_PRIMARY;
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 46 : 54;
  });

  curY += 10;
  ctx.font = `500 ${isLandscape ? 13 : 15}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, width - (padX * 2.5)).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 22;
  });

  curY += 16;
  const cardW = Math.round((width - (padX * 2) - 24) / 3);
  const cardH = isLandscape ? 56 : 64;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 12 });
    drawSparkleIcon(ctx, cardX + 18, curY + cardH / 2, 14, TEAL_PRIMARY);
    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item, cardX + 34, curY + cardH / 2);
  });
}

/**
 * FESTIVAL-04: Christmas & Season Greetings
 */
async function renderChristmasTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const cx = width / 2;
  let curY = contentTopY + 14;

  // Geometric Holiday Star in Gold & Teal
  drawSparkleIcon(ctx, cx, curY + 28, 38, GOLD_ACCENT);
  curY += 68;

  ctx.font = `900 ${isLandscape ? 40 : 48}px "Outfit", serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  wrapText(ctx, headline, width - (padX * 2)).slice(0, 2).forEach((l, idx) => {
    ctx.fillStyle = idx === 0 ? TEXT_DARK : TEAL_PRIMARY;
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 44 : 52;
  });

  curY += 10;
  ctx.font = `500 ${isLandscape ? 13 : 15}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, width - (padX * 2.5)).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 22;
  });

  curY += 18;
  const cardW = Math.round((width - (padX * 2) - 24) / 3);
  const cardH = isLandscape ? 56 : 64;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 12 });
    drawCheckmarkIcon(ctx, cardX + 16, curY + cardH / 2, 16, TEAL_PRIMARY);
    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item, cardX + 34, curY + cardH / 2);
  });
}

/**
 * FESTIVAL-05: Mega Festive Sale 50% Off Commercial Banner
 */
async function renderMegaSaleTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;

  // Urgent Festive Ribbon Badge in Teal
  drawRoundRect(ctx, padX, curY, width - (padX * 2), 40, 10);
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.font = '900 14px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡ MEGA FESTIVE SALE — EXCLUSIVE LIMITED-TIME DEALS', width / 2, curY + 20);

  curY += 54;
  // Giant 50% OFF Callout in Teal & Coral
  ctx.save();
  ctx.font = `900 ${isLandscape ? 72 : 88}px "Outfit", sans-serif`;
  const saleGrad = ctx.createLinearGradient(width / 2 - 140, curY, width / 2 + 140, curY + 80);
  saleGrad.addColorStop(0, '#EF4444');
  saleGrad.addColorStop(0.5, TEAL_PRIMARY);
  saleGrad.addColorStop(1, TEAL_LIGHT);
  ctx.fillStyle = saleGrad;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('50% OFF', width / 2, curY);
  ctx.restore();

  curY += isLandscape ? 76 : 94;

  ctx.font = `900 ${isLandscape ? 36 : 42}px "Outfit", sans-serif`;
  ctx.fillStyle = TEXT_DARK;
  wrapText(ctx, headline, width - (padX * 2)).slice(0, 2).forEach(l => {
    ctx.fillText(l, width / 2, curY);
    curY += isLandscape ? 40 : 48;
  });

  curY += 8;
  ctx.font = `500 ${isLandscape ? 13 : 15}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, width - (padX * 2.5)).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, width / 2, curY);
    curY += 22;
  });

  curY += 16;
  const cardW = Math.round((width - (padX * 2) - 24) / 3);
  const cardH = isLandscape ? 54 : 62;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 12 });
    drawCheckmarkIcon(ctx, cardX + 16, curY + cardH / 2, 16, TEAL_PRIMARY);
    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item, cardX + 34, curY + cardH / 2);
  });
}

/**
 * FESTIVAL-06: Thanksgiving & Gratitude Showcase
 */
async function renderGratitudeTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const cx = width / 2;
  let curY = contentTopY + 16;

  // Laurel / Gratitude Heart in Teal
  drawSparkleIcon(ctx, cx, curY + 20, 32, TEAL_PRIMARY);
  curY += 56;

  ctx.font = `900 ${isLandscape ? 38 : 46}px "Outfit", serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  wrapText(ctx, headline, width - (padX * 2)).slice(0, 2).forEach((l, idx) => {
    ctx.fillStyle = idx === 0 ? TEXT_DARK : TEAL_PRIMARY;
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 44 : 52;
  });

  curY += 10;
  ctx.font = `500 ${isLandscape ? 13 : 15}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, width - (padX * 2.5)).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 22;
  });

  curY += 18;
  const cardW = Math.round((width - (padX * 2) - 24) / 3);
  const cardH = isLandscape ? 56 : 64;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 12 });
    drawCheckmarkIcon(ctx, cardX + 16, curY + cardH / 2, 16, TEAL_PRIMARY);
    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item, cardX + 34, curY + cardH / 2);
  });
}

/**
 * FESTIVAL-07: Holi Vibrant Colors Splash in White & Teal
 */
async function renderHoliTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const cx = width / 2;
  let curY = contentTopY + 20;

  // Festive Color Splash Dots in Teal, Cyan, Gold
  const splashColors = [TEAL_PRIMARY, TEAL_LIGHT, '#F59E0B', '#EC4899', '#8B5CF6'];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const sx = cx + Math.cos(angle) * 70;
    const sy = curY + 28 + Math.sin(angle) * 22;
    ctx.beginPath();
    ctx.arc(sx, sy, 7, 0, Math.PI * 2);
    ctx.fillStyle = splashColors[i % splashColors.length];
    ctx.fill();
  }
  curY += 56;

  ctx.save();
  ctx.font = `900 ${isLandscape ? 40 : 48}px "Outfit", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const holiGrad = ctx.createLinearGradient(padX, curY, width - padX, curY);
  holiGrad.addColorStop(0, TEAL_PRIMARY);
  holiGrad.addColorStop(0.5, '#F59E0B');
  holiGrad.addColorStop(1, TEAL_LIGHT);
  ctx.fillStyle = holiGrad;

  wrapText(ctx, headline, width - (padX * 2)).slice(0, 2).forEach(l => {
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 44 : 52;
  });
  ctx.restore();

  curY += 10;
  ctx.font = `500 ${isLandscape ? 13 : 15}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, width - (padX * 2.5)).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 22;
  });

  curY += 18;
  const cardW = Math.round((width - (padX * 2) - 24) / 3);
  const cardH = isLandscape ? 56 : 64;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 12 });
    drawSparkleIcon(ctx, cardX + 16, curY + cardH / 2, 14, splashColors[idx % splashColors.length]);
    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item, cardX + 34, curY + cardH / 2);
  });
}

/**
 * FESTIVAL-08: Cyber Holiday Sprint & Tech Deals
 */
async function renderCyberWeekTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY + 10;

  drawRoundRect(ctx, width / 2 - 130, curY, 260, 38, 19);
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.fill();

  ctx.font = '900 14px "Outfit", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡ CYBER HOLIDAY SPRINT', width / 2, curY + 19);

  curY += 56;
  ctx.font = `900 ${isLandscape ? 42 : 52}px "Outfit", sans-serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textBaseline = 'top';

  wrapText(ctx, headline, width - (padX * 2)).slice(0, 2).forEach((l, idx) => {
    ctx.fillStyle = idx === 0 ? TEXT_DARK : TEAL_PRIMARY;
    ctx.fillText(l, width / 2, curY);
    curY += isLandscape ? 44 : 54;
  });

  curY += 8;
  ctx.font = `500 ${isLandscape ? 13 : 15}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, width - (padX * 2.5)).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, width / 2, curY);
    curY += 22;
  });

  curY += 18;
  const cardW = Math.round((width - (padX * 2) - 24) / 3);
  const cardH = isLandscape ? 56 : 64;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 12 });
    drawCheckmarkIcon(ctx, cardX + 16, curY + cardH / 2, 16, TEAL_PRIMARY);
    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item, cardX + 34, curY + cardH / 2);
  });
}

/**
 * FESTIVAL-09: National Freedom & Innovation Pride
 */
async function renderFreedomTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const cx = width / 2;
  let curY = contentTopY + 16;

  // National emblem tri-color pill in Saffron, White & Teal
  drawRoundRect(ctx, cx - 70, curY, 140, 28, 14);
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.font = '900 12px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PROUD & UNITED', cx, curY + 14);

  curY += 46;
  ctx.font = `900 ${isLandscape ? 40 : 48}px "Outfit", serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textBaseline = 'top';

  wrapText(ctx, headline, width - (padX * 2)).slice(0, 2).forEach((l, idx) => {
    ctx.fillStyle = idx === 0 ? TEXT_DARK : TEAL_PRIMARY;
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 44 : 52;
  });

  curY += 10;
  ctx.font = `500 ${isLandscape ? 13 : 15}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, width - (padX * 2.5)).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 22;
  });

  curY += 18;
  const cardW = Math.round((width - (padX * 2) - 24) / 3);
  const cardH = isLandscape ? 56 : 64;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 12 });
    drawCheckmarkIcon(ctx, cardX + 16, curY + cardH / 2, 16, TEAL_PRIMARY);
    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item, cardX + 34, curY + cardH / 2);
  });
}

/**
 * FESTIVAL-10: Milestone Anniversary & Founders Celebration
 */
async function renderAnniversaryTeal({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const cx = width / 2;
  let curY = contentTopY + 12;

  // Medallion in Gold & Teal
  ctx.beginPath();
  ctx.arc(cx, curY + 28, 28, 0, Math.PI * 2);
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = GOLD_ACCENT;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = '900 16px "Outfit", sans-serif';
  ctx.fillStyle = GOLD_ACCENT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('10★', cx, curY + 28);

  curY += 68;
  ctx.font = `900 ${isLandscape ? 40 : 48}px "Outfit", serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textBaseline = 'top';

  wrapText(ctx, headline, width - (padX * 2)).slice(0, 2).forEach((l, idx) => {
    ctx.fillStyle = idx === 0 ? TEXT_DARK : TEAL_PRIMARY;
    ctx.fillText(l, cx, curY);
    curY += isLandscape ? 44 : 52;
  });

  curY += 10;
  ctx.font = `500 ${isLandscape ? 13 : 15}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, width - (padX * 2.5)).slice(0, 2).forEach(tl => {
    ctx.fillText(tl, cx, curY);
    curY += 22;
  });

  curY += 18;
  const cardW = Math.round((width - (padX * 2) - 24) / 3);
  const cardH = isLandscape ? 56 : 64;

  items.slice(0, 3).forEach((item, idx) => {
    const cardX = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 12 });
    drawCheckmarkIcon(ctx, cardX + 16, curY + cardH / 2, 16, TEAL_PRIMARY);
    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item, cardX + 34, curY + cardH / 2);
  });
}
