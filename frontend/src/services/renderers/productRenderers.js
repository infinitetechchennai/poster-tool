/**
 * 10 Distinct Agency-Grade Product Showcase Poster Renderers in Clean White & Teal (#008080)
 * 
 * Strict 1-to-1 Mapping to designTemplates.js & templateDefaultContent.js:
 * - product-01: Step Into Infinity (3D Smartphone on Cylindrical Pedestal)
 * - product-02: AI Recommendations Matter More (Balance Scale Matrix)
 * - product-03: Next-Gen Cloud Analytics Studio (SaaS Telemetry Dashboard)
 * - product-04: SkyPro AI Voice Calling Device (Hardware 3D Showcase)
 * - product-05: PostCraft AI Studio Version 2.0 (Changelog & Feature Release)
 * - product-06: Your Workstation Just Got A Brain (Copilot AI Workstation)
 * - product-07: The Modern Mobile First Experience (Dual Device & Floating Badges)
 * - product-08: Innovation Begins With One Touch (Cybernetic Core)
 * - product-09: Enterprise AI Security & Governance Suite (Enterprise Cloud Security)
 * - product-10: Simplicity Is The Ultimate Sophistication (Minimalist Product Hero)
 */

import {
  drawRoundRect,
  wrapText,
  fitHeadline,
  drawCheckmarkIcon,
  drawSparkleIcon,
  drawZapIcon,
  drawRocketIcon,
  drawShieldIcon
} from '../../utils/textLayout.js';

import {
  TEAL_PRIMARY,
  TEAL_DARK,
  TEAL_LIGHT,
  TEAL_BG_TINT,
  TEAL_BORDER,
  TEXT_DARK,
  TEXT_MUTED,
  renderPosterBackground,
  renderStandardTopBar,
  renderStandardBottomBar,
  drawPosterHeadline,
  drawPosterTagline,
  drawWhiteTealCard,
  drawFloatingGlossyBadge,
  drawFeaturePillsRow
} from './sharedRendererUtils.js';

export async function renderProductTemplate({
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

  const headline = (post?.headline || post?.productName || post?.topic || 'Next-Gen Autonomous Product').trim();
  const tagline = (post?.tagline || post?.subheadline || post?.description || 'Next-generation intelligence and operational velocity for modern teams.').trim();
  const features = (post?.features || post?.keyPoints || ['Sub-second inference', 'Zero data leakage', 'Plug-and-play APIs', 'Autonomous agentic workflows']).slice(0, 4);

  const bgPattern = id === 'product-04' || id === 'product-08' ? 'warp-mesh' : 'dots';

  // 1. Clean White & Soft Light Teal Background (with subtle topic photo scrim if available)
  await renderPosterBackground({
    ctx,
    width,
    height,
    post,
    style,
    accentColor: TEAL_PRIMARY,
    pattern: bgPattern,
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

  // 3. Layout Dispatcher based on template ID (All 10 distinct layouts)
  if (id === 'product-01') {
    await renderProductPedestalPhone({ ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape, topicImg });
  } else if (id === 'product-02') {
    await renderProductBalanceScale({ ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape, topicImg });
  } else if (id === 'product-03') {
    await renderProductDashboard({ ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape, topicImg });
  } else if (id === 'product-04') {
    await renderProductHardwareGadget({ ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape, topicImg });
  } else if (id === 'product-05') {
    await renderProductChangelog({ ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape, topicImg });
  } else if (id === 'product-06') {
    await renderProductCopilotWorkstation({ ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape, topicImg });
  } else if (id === 'product-07') {
    await renderProductMobileApp({ ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape, topicImg });
  } else if (id === 'product-08') {
    await renderProductCyberneticCore({ ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape, topicImg });
  } else if (id === 'product-09') {
    await renderProductSecuritySuite({ ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape, topicImg });
  } else {
    // product-10 & default: Minimalist Product Hero
    await renderProductMinimalHero({ ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape, topicImg });
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
 * PRODUCT-01: Step Into Infinity (3D Smartphone on Cylindrical Pedestal)
 */
async function renderProductPedestalPhone({
  ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape, topicImg
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  const cx = width / 2;
  const maxW = width - padX * 2;
  let curY = contentTopY;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'FLAGSHIP LAUNCH',
    headline: headline || 'Step Into Infinity Today',
    x: cx,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    align: 'center',
    isLandscape
  });
  curY = hlInfo.bottomY + 12;

  curY = drawPosterTagline(ctx, tagline, cx, curY, maxW - 40, 'center', isLandscape ? 17 : 22);
  curY += 12;

  // 3D Smartphone on Pedestal
  const phoneW = 200;
  const phoneH = 340;
  const phoneX = cx - phoneW / 2;
  const phoneY = curY + 10;

  // Cylindrical Pedestal Base
  const pedW = 340;
  const pedH = 64;
  const pedX = cx - pedW / 2;
  const pedY = phoneY + phoneH - 36;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, pedY + 28, pedW / 2, pedH / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 128, 128, 0.16)';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx, pedY, pedW / 2, pedH / 2, 0, 0, Math.PI * 2);
  const pedGrad = ctx.createLinearGradient(cx - pedW / 2, pedY, cx + pedW / 2, pedY);
  pedGrad.addColorStop(0, '#FFFFFF');
  pedGrad.addColorStop(0.5, '#CCFBF1');
  pedGrad.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = pedGrad;
  ctx.shadowColor = 'rgba(0, 128, 128, 0.22)';
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Smartphone Body
  drawRoundRect(ctx, phoneX, phoneY, phoneW, phoneH, 24);
  ctx.fillStyle = '#0F172A';
  ctx.shadowColor = 'rgba(0, 128, 128, 0.35)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Screen
  drawRoundRect(ctx, phoneX + 8, phoneY + 8, phoneW - 16, phoneH - 16, 18);
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fill();

  // Camera Island Notch
  drawRoundRect(ctx, cx - 28, phoneY + 14, 56, 14, 7);
  ctx.fillStyle = '#0F172A';
  ctx.fill();

  const heroImg = (post?.uploadedImage && typeof post.uploadedImage === 'object' && post.uploadedImage.width)
    ? post.uploadedImage
    : (topicImg && topicImg.width ? topicImg : null);

  if (heroImg) {
    ctx.save();
    ctx.beginPath();
    drawRoundRect(ctx, phoneX + 8, phoneY + 8, phoneW - 16, phoneH - 16, 18);
    ctx.clip();
    const img = heroImg;
    const scale = Math.max((phoneW - 16) / img.width, (phoneH - 16) / img.height);
    const iw = img.width * scale;
    const ih = img.height * scale;
    ctx.drawImage(img, phoneX + 8 + (phoneW - 16 - iw) / 2, phoneY + 8 + (phoneH - 16 - ih) / 2, iw, ih);
    ctx.restore();
  } else {
    // Vector UI Screen Content
    ctx.font = '900 16px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText('⚡ 10x Velocity', cx, phoneY + 70);

    drawRoundRect(ctx, cx - 70, phoneY + 100, 140, 60, 10);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = TEAL_BORDER;
    ctx.stroke();

    ctx.font = '800 24px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText('+284%', cx, phoneY + 130);

    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.fillText('Verified Conversion', cx, phoneY + 148);
  }
  ctx.restore();

  // Floating Badges on Left & Right
  drawFloatingGlossyBadge(ctx, phoneX - 60, phoneY + 90, 72, '🚀', TEAL_PRIMARY, '#FFFFFF');
  drawFloatingGlossyBadge(ctx, phoneX + phoneW + 60, phoneY + 180, 72, '⚡', TEAL_PRIMARY, '#FFFFFF');

  // 3 Feature Highlight Cards below pedestal (fills to footerY)
  const belowY = pedY + pedH + 36;
  const remH = footerY - belowY - 14;
  if (remH > 50) {
    const featItems = (features && features.length > 0) ? features.slice(0, 3) : [
      'Zero-Latency Sync',
      'End-to-End Encryption',
      'Cross-Platform Ecosystem'
    ];
    const featW = Math.round((width - padX * 2 - 24) / 3);
    featItems.forEach((f, idx) => {
      const fx = padX + (idx * (featW + 12));
      drawWhiteTealCard({ ctx, x: fx, y: belowY, w: featW, h: remH, radius: 14 });

      ctx.font = '900 16px "Outfit", sans-serif';
      ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
      ctx.textAlign = 'center';
      ctx.fillText(f, fx + featW / 2, belowY + remH * 0.44);

      ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_MUTED;
      ctx.fillText('Enterprise Ready Tier', fx + featW / 2, belowY + remH * 0.74);
    });
    ctx.textAlign = 'left';
  }
}

/**
 * PRODUCT-02: Balance Scale Matrix (AI Recommendations Matter More)
 */
async function renderProductBalanceScale({
  ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'RANKING MATRIX 2027',
    headline: headline || 'AI Recommendations Matter More.',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  curY = drawPosterTagline(ctx, tagline, padX, curY, maxW, 'left', isLandscape ? 17 : 22);
  curY += 16;

  // Comparison Matrix (Traditional Search vs AI Recommendations)
  const colW = Math.round((maxW - 24) / 2);
  const colH = footerY - curY - 20;

  // Left Column: Traditional Search
  drawWhiteTealCard({ ctx, x: padX, y: curY, w: colW, h: colH, radius: 18 });

  ctx.font = '900 22px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_MUTED;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 6;
  }
  ctx.fillText('🔍  TRADITIONAL SEARCH', padX + 24, curY + 24);
  ctx.shadowBlur = 0;

  const leftItems = ['Keyword link matching', 'High ad-clutter & drop-off', 'Zero intent reasoning', 'Declining CTR across web'];
  let y1 = curY + 76;
  leftItems.forEach(item => {
    drawRoundRect(ctx, padX + 20, y1, colW - 40, 48, 10);
    ctx.fillStyle = hasBg ? 'rgba(255, 255, 255, 0.08)' : '#F8FAFC';
    ctx.fill();
    ctx.strokeStyle = hasBg ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 128, 128, 0.1)';
    ctx.stroke();

    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_DARK;
    ctx.textBaseline = 'middle';
    ctx.fillText(item, padX + 36, y1 + 24);
    y1 += 60;
  });

  // Right Column: AI Engine Recommendations
  const rightX = padX + colW + 24;
  drawRoundRect(ctx, rightX, curY, colW, colH, 18);
  ctx.fillStyle = hasBg ? 'rgba(0, 128, 128, 0.45)' : TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = '900 22px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#5EEAD4' : TEAL_PRIMARY;
  ctx.textBaseline = 'top';
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 6;
  }
  ctx.fillText('⚡  AI AGENT RECOMMENDATIONS', rightX + 24, curY + 24);
  ctx.shadowBlur = 0;

  const rightItems = (features && features.length > 0) ? features : [
    'Synthesized semantic citations',
    '8.4x higher conversion direct to checkout',
    'Personalized real-time context answers',
    'High-converting brand authority placement'
  ];
  let y2 = curY + 76;
  rightItems.forEach(item => {
    drawRoundRect(ctx, rightX + 20, y2, colW - 40, 48, 10);
    ctx.fillStyle = hasBg ? 'rgba(15, 23, 42, 0.65)' : '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = hasBg ? '#2DD4BF' : TEAL_BORDER;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEAL_PRIMARY;
    ctx.textBaseline = 'middle';
    ctx.fillText(`✓  ${item}`, rightX + 36, y2 + 24);
    y2 += 60;
  });
}

/**
 * PRODUCT-03: Next-Gen Cloud Analytics Studio (SaaS Telemetry Dashboard)
 */
async function renderProductDashboard({
  ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'CLOUD ANALYTICS STUDIO',
    headline: headline || 'Next-Gen Cloud Analytics Studio',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  curY = drawPosterTagline(ctx, tagline, padX, curY, maxW, 'left', isLandscape ? 17 : 22);
  curY += 16;

  curY = drawFeaturePillsRow(ctx, padX, curY, features, maxW);

  // Vector Web Dashboard Mockup in Center
  const dashH = footerY - curY - 20;
  if (dashH > 160) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: dashH, radius: 18 });

    // Inner Telemetry Grid
    const innerW = maxW - 40;
    const innerH = dashH - 40;
    const colW = Math.round((innerW - 24) / 3);

    const kpis = [
      { t: 'Sub-Second Latency', v: '42ms', b: '⚡ Fast' },
      { t: 'Active Agent Fleet', v: '1,420', b: '🤖 Autonomous' },
      { t: 'Data Throughput', v: '99.99%', b: '🔒 High SLA' }
    ];

    kpis.forEach((k, i) => {
      const kx = padX + 20 + (i * (colW + 12));
      drawRoundRect(ctx, kx, curY + 20, colW, 96, 12);
      ctx.fillStyle = i === 0 ? TEAL_PRIMARY : (hasBg ? 'rgba(0, 128, 128, 0.40)' : TEAL_BG_TINT);
      ctx.fill();
      if (hasBg) {
        ctx.strokeStyle = i === 0 ? '#2DD4BF' : 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = i === 0 ? '#CCFBF1' : (hasBg ? '#CBD5E1' : TEXT_MUTED);
      ctx.textAlign = 'left';
      ctx.fillText(k.t, kx + 18, curY + 44);

      ctx.font = '900 36px "Outfit", sans-serif';
      ctx.fillStyle = i === 0 ? '#FFFFFF' : (hasBg ? '#FFFFFF' : TEAL_PRIMARY);
      if (hasBg) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
        ctx.shadowBlur = 8;
      }
      ctx.fillText(k.v, kx + 18, curY + 84);
      ctx.shadowBlur = 0;
    });
  }
}

/**
 * PRODUCT-04: Hardware & Gadget 3D Showcase (SkyPro AI Voice Calling Device)
 */
async function renderProductHardwareGadget({
  ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'HARDWARE INNOVATION',
    headline: headline || 'SkyPro AI Voice Calling Device',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  curY = drawPosterTagline(ctx, tagline, padX, curY, maxW, 'left', isLandscape ? 17 : 22);
  curY += 16;

  // Circular Pedestal & Device Frame
  const cardH = footerY - curY - 20;
  drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: cardH, radius: 20 });

  const heroImg = (post?.uploadedImage && typeof post.uploadedImage === 'object' && post.uploadedImage.width)
    ? post.uploadedImage
    : (topicImg && topicImg.width ? topicImg : null);

  if (heroImg) {
    ctx.save();
    ctx.beginPath();
    drawRoundRect(ctx, padX + 12, curY + 12, maxW - 24, cardH - 24, 16);
    ctx.clip();
    const img = heroImg;
    const scale = Math.max((maxW - 24) / img.width, (cardH - 24) / img.height);
    const iw = img.width * scale;
    const ih = img.height * scale;
    ctx.drawImage(img, padX + 12 + (maxW - 24 - iw) / 2, curY + 12 + (cardH - 24 - ih) / 2, iw, ih);
    ctx.restore();
  } else {
    // Vector Smart Gadget Representation
    const cx = width / 2;
    const cy = curY + cardH * 0.46;

    // Glowing Halo Rings
    for (let r = 80; r <= 160; r += 40) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 128, 128, ${0.35 - (r / 500)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Central Smart Orb Device
    ctx.beginPath();
    ctx.arc(cx, cy, 64, 0, Math.PI * 2);
    const orbGrad = ctx.createLinearGradient(cx - 64, cy - 64, cx + 64, cy + 64);
    orbGrad.addColorStop(0, TEAL_LIGHT);
    orbGrad.addColorStop(1, TEAL_PRIMARY);
    ctx.fillStyle = orbGrad;
    ctx.shadowColor = 'rgba(0, 128, 128, 0.40)';
    ctx.shadowBlur = 24;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = '900 24px "Outfit", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VOICE AI', cx, cy);

    ctx.font = '800 18px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
      ctx.shadowBlur = 6;
    }
    ctx.fillText('Noise-Canceling Dual Microphones · Instant Neural Sync', cx, curY + cardH - 36);
    ctx.shadowBlur = 0;
  }
}

/**
 * PRODUCT-05: PostCraft AI Studio Version 2.0 (Changelog & Feature Release)
 */
async function renderProductChangelog({
  ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'RELEASE 2.0 ANNOUNCEMENT',
    headline: headline || 'PostCraft AI Studio Version 2.0',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  curY = drawPosterTagline(ctx, tagline, padX, curY, maxW, 'left', isLandscape ? 17 : 22);
  curY += 16;

  // 3 Feature Changelog Cards
  const logs = [
    { tag: 'NEW FEATURE', title: '50 Curated Multi-Layout Social Posters', desc: 'Dedicated hiring, product, festival, and knowledge renderers.' },
    { tag: 'PERFORMANCE', title: 'Sub-Second HTML5 Canvas Vector Math', desc: 'Zero monthly cloud image subscription fees or external API lag.' },
    { tag: 'BRAND CONSISTENCY', title: 'Infinitetech Teal & Clean White Identity', desc: 'Unified branding guidelines with dynamic text auto-fitting.' }
  ];

  const logH = 88;
  logs.forEach(l => {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: logH, radius: 14 });

    drawRoundRect(ctx, padX + 18, curY + 16, 130, 28, 8);
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.fill();

    ctx.font = '800 12px "Outfit", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(l.tag, padX + 83, curY + 30);

    ctx.font = '900 22px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
      ctx.shadowBlur = 6;
    }
    ctx.textAlign = 'left';
    ctx.fillText(l.title, padX + 166, curY + 30);
    ctx.shadowBlur = 0;

    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_MUTED;
    ctx.fillText(l.desc, padX + 18, curY + 64);

    curY += logH + 14;
  });

  // Bottom Performance Metrics Strip (fills to footerY)
  const remH = footerY - curY - 14;
  if (remH > 50) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: remH, radius: 14 });
    const metrics = [
      { v: '50+', l: 'Bespoke Templates' },
      { v: '< 1s', l: 'Canvas Vector Math' },
      { v: '100%', l: 'Spelling Accuracy' }
    ];
    const mW = Math.round(maxW / 3);
    metrics.forEach((m, idx) => {
      const mx = padX + (idx * mW);
      ctx.font = '900 24px "Outfit", sans-serif';
      ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
      ctx.textAlign = 'center';
      ctx.fillText(m.v, mx + mW / 2, curY + remH * 0.44);

      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_MUTED;
      ctx.fillText(m.l, mx + mW / 2, curY + remH * 0.76);
    });
    ctx.textAlign = 'left';
  }
}

/**
 * PRODUCT-06: Copilot AI Workstation
 * "Your Workstation Just Got A Brain"
 */
async function renderProductCopilotWorkstation({
  ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape, topicImg
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'AUTONOMOUS WORKSTATION',
    headline: headline || 'Your Workstation Just Got A Brain',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  curY = drawPosterTagline(ctx, tagline, padX, curY, maxW, 'left', isLandscape ? 17 : 22);
  curY += 16;

  // 4 Feature Pills
  curY = drawFeaturePillsRow(ctx, padX, curY, features, maxW);

  // Big Terminal / Workstation Preview
  const boxH = footerY - curY - 20;
  drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: boxH, radius: 18 });

  ctx.font = '900 24px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  ctx.fillText('Autonomous Engineering & Growth Copilot', padX + 24, curY + 32);

  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 6;
  }
  ctx.fillText('Equipped with deep codebase synthesis, automated test runners, and real-time execution.', padX + 24, curY + 68);
  ctx.shadowBlur = 0;
}

/**
 * PRODUCT-07: The Modern Mobile First Experience
 */
async function renderProductMobileApp({
  ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'MOBILE FIRST EXPERIENCE',
    headline: headline || 'The Modern Mobile First Experience',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  curY = drawPosterTagline(ctx, tagline, padX, curY, maxW, 'left', isLandscape ? 17 : 22);
  curY += 16;

  // 3 Feature Cards
  const colW = Math.round((maxW - 36) / 3);
  const colH = footerY - curY - 20;

  const cards = [
    { icon: '📱', t: 'Responsive Canvas', d: 'Pixel-perfect rendering across square, portrait, and banner.' },
    { icon: '⚡', t: 'Sub-Second Export', d: 'Download uncompressed PNG or copy direct to clipboard.' },
    { icon: '🎯', t: 'High-Converting CTAs', d: 'Engineered for maximum click-through on LinkedIn and X.' }
  ];

  cards.forEach((c, idx) => {
    const cx = padX + (idx * (colW + 18));
    drawWhiteTealCard({ ctx, x: cx, y: curY, w: colW, h: colH, radius: 18 });

    ctx.font = '36px sans-serif';
    ctx.fillText(c.icon, cx + 22, curY + 44);

    ctx.font = '900 22px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
      ctx.shadowBlur = 6;
    }
    ctx.fillText(c.t, cx + 22, curY + 96);
    ctx.shadowBlur = 0;

    ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_MUTED;
    let dy = curY + 130;
    wrapText(ctx, c.d, colW - 44).forEach(l => {
      ctx.fillText(l, cx + 22, dy);
      dy += 24;
    });
  });
}

/**
 * PRODUCT-08: Innovation Begins With One Touch (Cybernetic Core)
 */
async function renderProductCyberneticCore({
  ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'TOUCH OF INNOVATION',
    headline: headline || 'Innovation Begins With One Touch',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  curY = drawPosterTagline(ctx, tagline, padX, curY, maxW, 'left', isLandscape ? 17 : 22);
  curY += 16;

  // Center Touch Glass Card
  const boxH = footerY - curY - 20;
  drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: boxH, radius: 20 });

  const cx = width / 2;
  const cy = curY + boxH * 0.44;

  // Pulsing Touch Rings
  for (let r = 40; r <= 140; r += 32) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 128, 128, ${0.40 - (r / 400)})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Central Touch Point
  ctx.beginPath();
  ctx.arc(cx, cy, 26, 0, Math.PI * 2);
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.shadowColor = TEAL_PRIMARY;
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.font = '900 22px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 8;
  }
  ctx.textAlign = 'center';
  ctx.fillText('ONE-CLICK SYNTHESIS ACROSS ALL 50 TEMPLATES', cx, curY + boxH - 36);
  ctx.shadowBlur = 0;
}

/**
 * PRODUCT-09: Enterprise AI Security & Governance Suite
 */
async function renderProductSecuritySuite({
  ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'ENTERPRISE SUITE',
    headline: headline || 'Enterprise AI Security & Governance Suite',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  curY = drawPosterTagline(ctx, tagline, padX, curY, maxW, 'left', isLandscape ? 17 : 22);
  curY += 16;

  // 4 Security Badges Grid
  const bW = Math.round((maxW - 20) / 2);
  const bH = 100;

  const suites = [
    { title: 'Zero Data Retention', desc: 'Outputs exist strictly on your local browser canvas.' },
    { title: 'Enterprise SSO & RBAC', desc: 'Role-based access control with Okta & Azure AD.' },
    { title: 'Prompt Injection Defense', desc: 'Real-time heuristic shields against jailbreak attacks.' },
    { title: 'Dedicated KMS Encryption', desc: 'Custom customer-managed encryption keys in transit.' }
  ];

  suites.forEach((s, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const sx = padX + (col * (bW + 20));
    const sy = curY + (row * (bH + 18));

    drawWhiteTealCard({ ctx, x: sx, y: sy, w: bW, h: bH, radius: 16 });
    drawShieldIcon(ctx, sx + 22, sy + 24, 28, hasBg ? '#2DD4BF' : TEAL_PRIMARY);

    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
      ctx.shadowBlur = 6;
    }
    ctx.fillText(s.title, sx + 64, sy + 26);
    ctx.shadowBlur = 0;

    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_MUTED;
    let dy = sy + 54;
    wrapText(ctx, s.desc, bW - 84).slice(0, 2).forEach(l => {
      ctx.fillText(l, sx + 64, dy);
      dy += 22;
    });
  });

  // Bottom Compliance & Trust Strip (fills to footerY)
  curY += (bH * 2) + 36;
  const remH = footerY - curY - 14;
  if (remH > 50) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: remH, radius: 14 });
    const certs = [
      { t: 'SOC 2 TYPE II', d: 'Independently Audited' },
      { t: 'ISO 27001', d: 'Global Infosec Standard' },
      { t: 'HIPAA & GDPR', d: 'Zero-Leakage Guarantee' }
    ];
    const cW = Math.round(maxW / 3);
    certs.forEach((c, idx) => {
      const cx = padX + (idx * cW);
      ctx.font = '900 18px "Outfit", sans-serif';
      ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
      ctx.textAlign = 'center';
      ctx.fillText(c.t, cx + cW / 2, curY + remH * 0.42);

      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_MUTED;
      ctx.fillText(c.d, cx + cW / 2, curY + remH * 0.74);
    });
    ctx.textAlign = 'left';
  }
}

/**
 * PRODUCT-10 & DEFAULT: Minimalist Product Hero
 * "Simplicity Is The Ultimate Sophistication"
 */
async function renderProductMinimalHero({
  ctx, width, height, post, style, headline, tagline, features, padX, contentTopY, footerY, isLandscape, topicImg
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  const cx = width / 2;
  let curY = contentTopY + 20;

  // Massive Minimalist Headline
  ctx.font = `900 ${isLandscape ? 60 : 82}px "Outfit", sans-serif`;
  ctx.textAlign = 'center';

  const lines = wrapText(ctx, headline || 'Simplicity Is The Ultimate Sophistication', width - padX * 2);
  lines.forEach((l, i) => {
    if (i === lines.length - 1) {
      ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
    } else {
      ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
    }
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 12;
    }
    ctx.fillText(l, cx, curY);
    ctx.shadowBlur = 0;
    curY += (isLandscape ? 66 : 90);
  });
  curY += 24;

  curY = drawPosterTagline(ctx, tagline, cx, curY, width - padX * 2, 'center', isLandscape ? 18 : 24);
  curY += 24;

  // Minimal Hero Card in Center
  const heroW = width - padX * 2;
  const heroH = footerY - curY - 20;
  drawWhiteTealCard({ ctx, x: padX, y: curY, w: heroW, h: heroH, radius: 20 });

  const heroImg = (post?.uploadedImage && typeof post.uploadedImage === 'object' && post.uploadedImage.width)
    ? post.uploadedImage
    : (topicImg && topicImg.width ? topicImg : null);

  if (heroImg) {
    ctx.save();
    ctx.beginPath();
    drawRoundRect(ctx, padX + 12, curY + 12, heroW - 24, heroH - 24, 16);
    ctx.clip();
    const img = heroImg;
    const scale = Math.max((heroW - 24) / img.width, (heroH - 24) / img.height);
    const iw = img.width * scale;
    const ih = img.height * scale;
    ctx.drawImage(img, padX + 12 + (heroW - 24 - iw) / 2, curY + 12 + (heroH - 24 - ih) / 2, iw, ih);
    ctx.restore();
  } else {
    // Vector Product Feature Points inside card
    const colW = Math.round((heroW - 36) / 3);
    const feats = (features && features.length > 0) ? features.slice(0, 3) : ['Zero Configuration', 'Instant Live Preview', 'Local Data Privacy'];

    feats.forEach((f, idx) => {
      const fx = padX + 18 + (idx * (colW + 12));
      drawRoundRect(ctx, fx, curY + 24, colW, heroH - 48, 14);
      ctx.fillStyle = hasBg ? 'rgba(0, 128, 128, 0.35)' : TEAL_BG_TINT;
      ctx.fill();
      if (hasBg) {
        ctx.strokeStyle = '#2DD4BF';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      drawCheckmarkIcon(ctx, fx + 24, curY + 54, 28, hasBg ? '#2DD4BF' : TEAL_PRIMARY);

      ctx.font = '900 22px "Outfit", sans-serif';
      ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
      if (hasBg) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
        ctx.shadowBlur = 6;
      }
      ctx.textAlign = 'left';
      ctx.fillText(f, fx + 64, curY + 60);
      ctx.shadowBlur = 0;

      ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_MUTED;
      ctx.fillText('Engineered for scale & precision.', fx + 64, curY + 92);
    });
  }
}
