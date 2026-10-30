/**
 * 20 Distinct Agency-Grade Common & Business Insights Poster Renderers in Clean White & Teal (#008080)
 * 
 * Strict 1-to-1 Mapping to designTemplates.js and templateDefaultContent.js:
 * - common-01: Brand Voice Studio ("YOUR BRAND IS TALKING. IS ANYONE LISTENING?")
 * - common-02: Digital Experience Agency ("YOUR WEBSITE SHOULD DO MORE THAN LOOK GOOD")
 * - common-03: Executive Thought Leadership ("Fast Execution Beats Perfect Planning")
 * - common-04: Radial Tech Ecosystem ("The Modern AI Workplace Ecosystem")
 * - common-05: Industry Insights Report ("2027 Tech & AI Industry Trends Report")
 * - common-06: Problem vs Solution Split ("Stop Doing Things The Hard Way")
 * - common-07: 5-Step Strategic Guide ("5 Steps to Scale Social Brand Authority")
 * - common-08: Did You Know? Proven Data ("Did You Know? Visuals Outperform Plain Text 6x")
 * - common-09: Myth vs Reality ("Myth vs Reality in Social Marketing")
 * - common-10: Client Success Case Study ("How CloudFlow Grew MRR by 240% in 90 Days")
 * - common-11: System Architecture Blueprint ("Architecting Resilient Distributed Systems")
 * - common-12: Weekly Tech Digest ("Weekly Tech Pulse: Edition #48")
 * - common-13: Startup Growth Playbook ("The 3 Pillars of Scalable SaaS Growth")
 * - common-14: Zero-Trust Security Checklist ("Zero-Trust Cloud Security Checklist")
 * - common-15: Podcast & Webinar Spotlight ("Podcast Episode 42: The Future of Autonomous Coding")
 * - common-16: Book & Resource Recommendations ("Book of The Week: High Output Management")
 * - common-17: Bold Typography Statement ("SIMPLICITY IS THE ULTIMATE SPEED")
 * - common-18: Enterprise Checklist ("Is Your Business Ready For The AI Shift?")
 * - common-19: Conversion Funnel Matrix ("The Power of Automated Transformation")
 * - common-20: Vision & Mission Manifesto ("Our Mission: Empowering Creators Everywhere")
 */

import {
  drawRoundRect,
  wrapText,
  fitHeadline,
  drawCheckmarkIcon,
  drawSparkleIcon,
  drawZapIcon,
  drawRocketIcon,
  drawShieldIcon,
  drawUserAvatarIcon
} from '../../utils/textLayout.js';

import {
  TEAL_PRIMARY,
  TEAL_DARK,
  TEAL_LIGHT,
  TEAL_VIBRANT,
  TEAL_BG_TINT,
  TEAL_BORDER,
  TEXT_DARK,
  TEXT_MUTED,
  GOLD_ACCENT,
  renderPosterBackground,
  renderStandardTopBar,
  renderStandardBottomBar,
  drawPosterHeadline,
  drawWhiteTealCard,
  draw3dBookMockup,
  drawSpeedometerGauge,
  drawAudioSoundwave,
  drawFloatingGlossyBadge,
  drawFeaturePillsRow,
  drawVectorWebDashboard
} from './sharedRendererUtils.js';

export async function renderCommonTemplate({
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

  const headline = (post?.headline || post?.topic || 'Transforming Business Through Intelligent Design').trim();
  const tagline = (post?.tagline || post?.subheadline || post?.description || 'Actionable strategies, operational leverage, and measurable ROI for modern leaders.').trim();
  const items = (post?.keyPoints || post?.deliverables || ['Strategic alignment & clarity', 'Operational velocity at scale', 'Measurable ROI & leverage', 'Enterprise-grade governance']).slice(0, 4);

  // Background pattern per template
  const bgPattern = id === 'common-07' || id === 'common-11' ? 'warp-mesh' : 'dots';

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

  // 3. Layout Dispatcher based on template ID (All 20 distinct layouts mapped 1:1)
  if (id === 'common-01') {
    await renderCommonBrandVoice({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-02') {
    await renderCommonDigitalAgency({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-03') {
    await renderCommonThoughtLeadership({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-04') {
    await renderCommonRadialEcosystem({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-05') {
    await renderCommonIndustryReport({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-06') {
    await renderCommonProblemSolution({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-07') {
    await renderCommonRoadmap({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-08') {
    await renderCommonDidYouKnow({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-09') {
    await renderCommonMythVsReality({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-10') {
    await renderCommonCaseStudy({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-11') {
    await renderCommonArchitectureBlueprint({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-12') {
    await renderCommonWeeklyDigest({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-13') {
    await renderCommonGrowthPlaybook({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-14') {
    await renderCommonSecurityTrust({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-15') {
    await renderCommonPodcastSpotlight({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-16') {
    await renderCommonBookRecommendations({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-17') {
    await renderCommonBoldStatement({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-18') {
    await renderCommonEnterpriseChecklist({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'common-19') {
    await renderCommonFunnelMatrix({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
  } else {
    // common-20 & fallback: Vision 2030 Strategic Manifesto
    await renderCommonVisionManifesto({ ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape });
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
 * COMMON-01: Brand Voice Studio
 * "YOUR BRAND IS TALKING. IS ANYONE LISTENING?"
 */
async function renderCommonBrandVoice({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  // 1. Massive 2-Tone Headline
  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'STRATEGIC BRAND VOICE',
    headline: headline || 'YOUR BRAND IS TALKING. IS ANYONE LISTENING?',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 58 : 78,
    minFs: 42,
    maxLines: 3,
    isLandscape
  });
  curY = hlInfo.bottomY + 16;

  // 2. Subheadline Tagline
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(line => {
    ctx.fillText(line, padX, curY);
    curY += 34;
  });
  curY += 24;

  // 3. 3 Feature Pills Row
  curY = drawFeaturePillsRow(ctx, padX, curY, items, maxW);

  // 4. Center Audio Soundwave & Visual Branding Radar Card
  const cardH = footerY - curY - 24;
  if (cardH > 140) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: cardH, radius: 18 });

    // Soundwave visualizer in center
    const waveCy = curY + cardH * 0.44;
    drawAudioSoundwave(ctx, width / 2, waveCy, Math.min(540, maxW - 60), 68, TEAL_PRIMARY);

    ctx.font = '800 20px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Autonomous Voice & Visual Consistency Matrix', width / 2, curY + cardH - 36);
  }
}

/**
 * COMMON-02: Digital Experience Agency
 * "YOUR WEBSITE SHOULD DO MORE THAN LOOK GOOD"
 */
async function renderCommonDigitalAgency({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  // 1. Massive 2-Tone Display Headline
  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'HIGH-CONVERTING UX & WEB',
    headline: headline || 'YOUR WEBSITE SHOULD DO MORE THAN LOOK GOOD',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 56 : 76,
    minFs: 42,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  // 2. Subheadline Tagline
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(line => {
    ctx.fillText(line, padX, curY);
    curY += 32;
  });
  curY += 20;

  // 3. 3 Feature Badges Row
  const pillBadges = (items && items.length > 0) ? items : [
    'Turn visitors into leads',
    'Better UX & clear messaging',
    'Strategic CTAs that convert'
  ];
  curY = drawFeaturePillsRow(ctx, padX, curY, pillBadges, maxW);

  // 4. Vector High-Conversion Website Dashboard Mockup
  const dashH = footerY - curY - 20;
  if (dashH > 160) {
    drawVectorWebDashboard(ctx, padX, curY, maxW, dashH);
  }
}

/**
 * COMMON-03: Executive Thought Leadership
 * "Fast Execution Beats Perfect Planning"
 */
async function renderCommonThoughtLeadership({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  const maxW = width - padX * 2;
  let curY = contentTopY + 10;

  // Giant 130px Stylized Quotation Mark in Teal
  ctx.font = '900 130px "Outfit", serif';
  ctx.fillStyle = 'rgba(0, 128, 128, 0.22)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('“', padX - 10, curY - 30);
  curY += 60;

  // Massive Italic Executive Quote Headline
  ctx.font = `900 italic ${isLandscape ? 48 : 66}px "Outfit", "Bricolage Grotesque", sans-serif`;
  ctx.fillStyle = TEXT_DARK;
  const quoteLines = wrapText(ctx, headline || 'Fast Execution Beats Perfect Planning', maxW);
  quoteLines.forEach((line, idx) => {
    if (idx === quoteLines.length - 1) {
      ctx.fillStyle = TEAL_PRIMARY;
    }
    ctx.fillText(line, padX, curY);
    curY += (isLandscape ? 56 : 74);
  });
  curY += 24;

  // Tagline / Context
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, maxW).slice(0, 3).forEach(line => {
    ctx.fillText(line, padX, curY);
    curY += 34;
  });
  curY += 32;

  // Executive Endorsement Pill Card
  const authorCardH = 92;
  drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: authorCardH, radius: 20 });
  drawUserAvatarIcon(ctx, padX + 24, curY + 20, 52, TEAL_PRIMARY);

  ctx.font = '900 24px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText('Executive Strategy & Leadership', padX + 94, curY + 24);

  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.fillText('Infinitetech AI Insights · Published Weekly', padX + 94, curY + 54);

  // 3 Action Principles / Core Takeaways filling to footerY
  curY += authorCardH + 20;
  const remH = footerY - curY - 14;
  if (remH > 60) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: remH, radius: 16 });
    const principles = (items && items.length > 0) ? items.slice(0, 3) : [
      'Speed as a Competitive Moat',
      'Continuous Iteration Over Stagnation',
      'Customer-Centric Decision Velocity'
    ];
    const pW = Math.round((maxW - 32) / 3);
    principles.forEach((p, idx) => {
      const px = padX + 16 + (idx * (pW + 8));
      drawRoundRect(ctx, px, curY + 14, pW, remH - 28, 12);
      ctx.fillStyle = TEAL_BG_TINT;
      ctx.fill();

      ctx.font = '900 16px "Outfit", sans-serif';
      ctx.fillStyle = TEAL_PRIMARY;
      ctx.textAlign = 'center';
      ctx.fillText(`0${idx + 1}`, px + pW / 2, curY + remH * 0.40);

      ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = TEXT_DARK;
      ctx.fillText(p, px + pW / 2, curY + remH * 0.70);
    });
    ctx.textAlign = 'left';
  }
}

/**
 * COMMON-04: Radial Tech Ecosystem
 * "The Modern AI Workplace Ecosystem"
 */
async function renderCommonRadialEcosystem({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'ECOSYSTEM ARCHITECTURE',
    headline: headline || 'The Modern AI Workplace Ecosystem',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 54 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(line => {
    ctx.fillText(line, padX, curY);
    curY += 32;
  });
  curY += 28;

  // Central AI Node + 4 Connected Orbital Nodes in Vector
  const hubW = maxW;
  const hubH = footerY - curY - 20;
  drawWhiteTealCard({ ctx, x: padX, y: curY, w: hubW, h: hubH, radius: 20 });

  const cx = padX + hubW / 2;
  const cy = curY + hubH / 2;
  const orbRadius = Math.min(hubW * 0.36, hubH * 0.36);

  // Central AI Core Node
  ctx.beginPath();
  ctx.arc(cx, cy, 54, 0, Math.PI * 2);
  const coreGrad = ctx.createLinearGradient(cx - 54, cy - 54, cx + 54, cy + 54);
  coreGrad.addColorStop(0, TEAL_LIGHT);
  coreGrad.addColorStop(1, TEAL_PRIMARY);
  ctx.fillStyle = coreGrad;
  ctx.shadowColor = 'rgba(0, 128, 128, 0.35)';
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.font = '900 22px "Outfit", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI CORE', cx, cy);

  // 4 Orbiting Nodes connected by dashed lines
  const nodes = [
    { title: 'Data Engine', desc: 'Real-time retrieval' },
    { title: 'Automation', desc: 'Agentic workflows' },
    { title: 'Security', desc: 'Zero-trust guardrails' },
    { title: 'Scale', desc: 'Sub-second latency' }
  ];

  nodes.forEach((n, idx) => {
    const angle = (idx * (Math.PI / 2)) - (Math.PI / 4);
    const nx = cx + Math.cos(angle) * orbRadius;
    const ny = cy + Math.sin(angle) * orbRadius;

    // Connecting line
    ctx.strokeStyle = 'rgba(0, 128, 128, 0.28)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.stroke();
    ctx.setLineDash([]);

    // Node Squircle Card
    const nCardW = 180;
    const nCardH = 68;
    drawRoundRect(ctx, nx - nCardW / 2, ny - nCardH / 2, nCardW, nCardH, 14);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 128, 128, 0.12)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = TEAL_BORDER;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText(n.title, nx, ny - 10);

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.fillText(n.desc, nx, ny + 12);
  });
}

/**
 * COMMON-05: Industry Insights Report
 * "2027 Tech & AI Industry Trends Report"
 */
async function renderCommonIndustryReport({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'TRENDS & BENCHMARKS 2027',
    headline: headline || '2027 Tech & AI Industry Trends Report',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 54 : 74,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'left';
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(line => {
    ctx.fillText(line, padX, curY);
    curY += 32;
  });
  curY += 30;

  // 3 Massive Stat Metric Cards (Filled, Zero Empty Space)
  const cardW = Math.round((maxW - 36) / 3);
  const cardH = Math.min(230, footerY - curY - 20);

  const stats = [
    { num: '+280%', label: 'Revenue Acceleration', desc: 'Teams automating visual pipelines experience 2.8x higher throughput.' },
    { num: '3.2x', label: 'Velocity Multiplier', desc: 'From weeks of manual design iterations to real-time agentic synthesis.' },
    { num: '99.4%', label: 'Executive Adoption', desc: 'Enterprises prioritizing AI governance report near-zero compliance incidents.' }
  ];

  stats.forEach((st, idx) => {
    const cardX = padX + (idx * (cardW + 18));
    drawWhiteTealCard({ ctx, x: cardX, y: curY, w: cardW, h: cardH, radius: 18 });

    // Number header in Teal Gradient
    ctx.font = '900 52px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(st.num, cardX + 22, curY + 22);

    // Label
    ctx.font = '900 22px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText(st.label, cardX + 22, curY + 84);

    // Description
    ctx.font = '500 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    let descY = curY + 120;
    wrapText(ctx, st.desc, cardW - 44).slice(0, 3).forEach(line => {
      ctx.fillText(line, cardX + 22, descY);
      descY += 24;
    });
  });
}

/**
 * COMMON-06: Problem vs Solution Split
 * "Stop Doing Things The Hard Way"
 */
async function renderCommonProblemSolution({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'STRATEGIC COMPARISON',
    headline: headline || 'Stop Doing Things The Hard Way',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 54 : 74,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'left';
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(line => {
    ctx.fillText(line, padX, curY);
    curY += 32;
  });
  curY += 24;

  // Split Columns: Left Red/Manual vs Right Teal/AI
  const colW = Math.round((maxW - 24) / 2);
  const colH = footerY - curY - 20;

  // Left: The Old Way (Warning Red Tint)
  const leftX = padX;
  drawRoundRect(ctx, leftX, curY, colW, colH, 18);
  ctx.fillStyle = '#FFF1F2';
  ctx.fill();
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.28)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '900 24px "Outfit", sans-serif';
  ctx.fillStyle = '#E11D48';
  ctx.fillText('❌  The Old Manual Way', leftX + 24, curY + 24);

  const oldPoints = [
    'Days waiting for agency revisions',
    'Inconsistent brand typography & styles',
    'Bottlenecks in creative marketing cycles',
    'High overhead with zero automation'
  ];
  let pY1 = curY + 76;
  oldPoints.forEach(pt => {
    drawRoundRect(ctx, leftX + 20, pY1, colW - 40, 52, 10);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textBaseline = 'middle';
    ctx.fillText(pt, leftX + 36, pY1 + 26);
    pY1 += 66;
  });

  // Right: The Agentic AI Way (Vibrant Teal Tint)
  const rightX = padX + colW + 24;
  drawRoundRect(ctx, rightX, curY, colW, colH, 18);
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.font = '900 24px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textBaseline = 'top';
  ctx.fillText('✅  The Infinitetech AI Way', rightX + 24, curY + 24);

  const newPoints = (items && items.length > 0) ? items : [
    'Sub-second poster generation on canvas',
    'Guaranteed brand voice & font consistency',
    'Instant bulk synthesis across channels',
    '10x higher marketing velocity & conversion'
  ];
  let pY2 = curY + 76;
  newPoints.forEach(pt => {
    drawRoundRect(ctx, rightX + 20, pY2, colW - 40, 52, 10);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 128, 128, 0.12)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = TEAL_BORDER;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textBaseline = 'middle';
    ctx.fillText(`✓  ${pt}`, rightX + 36, pY2 + 26);
    pY2 += 66;
  });
}

/**
 * COMMON-07: 5-Step Strategic Guide
 * "5 Steps to Scale Social Brand Authority"
 */
async function renderCommonRoadmap({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'EXECUTIVE FRAMEWORK',
    headline: headline || '5 Steps to Scale Social Brand Authority',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 12;

  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'left';
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(line => {
    ctx.fillText(line, padX, curY);
    curY += 30;
  });
  curY += 24;

  // 5 Step Connected Horizontal Capsules
  const steps = [
    { num: '01', title: 'Brand Blueprint Audit', desc: 'Formalize typography, core hex codes, and messaging hierarchy.' },
    { num: '02', title: 'Content Engine Synthesis', desc: 'Deploy autonomous agentic models to draft high-converting copy.' },
    { num: '03', title: 'Dynamic Layout Matrix', desc: 'Automate vector canvas generation with zero visual distortion.' },
    { num: '04', title: 'Multi-Channel Distribution', desc: 'Schedule auto-posts to LinkedIn, X, and Instagram in 1 click.' },
    { num: '05', title: 'Feedback & Compounding', desc: 'Measure audience engagement to iteratively refine messaging.' }
  ];

  const stepH = 64;
  steps.forEach((st, idx) => {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: stepH, radius: 14 });

    // Step Number Badge
    drawRoundRect(ctx, padX + 16, curY + 12, 48, 40, 10);
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.fill();

    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(st.num, padX + 40, curY + 32);

    // Title & Description
    ctx.font = '900 22px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.fillText(st.title, padX + 80, curY + 22);

    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText(st.desc, padX + 80, curY + 44);

    curY += stepH + 12;
  });
}

/**
 * COMMON-08: Did You Know? Proven Data
 * "Did You Know? Visuals Outperform Plain Text 6x"
 */
async function renderCommonDidYouKnow({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY + 10;
  const maxW = width - padX * 2;

  // Provocative Pill
  drawRoundRect(ctx, padX, curY, 240, 42, 21);
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.font = '900 18px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💡  PROVEN RESEARCH', padX + 120, curY + 21);
  curY += 64;

  // Headline
  ctx.font = '900 58px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  wrapText(ctx, headline || 'Did You Know? Visuals Outperform Plain Text', maxW).forEach(line => {
    ctx.fillText(line, padX, curY);
    curY += 66;
  });
  curY += 24;

  // Huge 110px Stat Card with Insight Box
  const cardH = footerY - curY - 20;
  drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: cardH, radius: 20 });

  ctx.font = '900 110px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.fillText('6x', padX + 40, curY + 36);

  ctx.font = '900 32px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText('Higher Conversion & Retention', padX + 220, curY + 48);

  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  let dY = curY + 98;
  wrapText(ctx, tagline || 'Audiences process visual graphics 60,000 times faster than text. High-fidelity agency posters consistently drive higher CTR and engagement.', maxW - 260).forEach(l => {
    ctx.fillText(l, padX + 220, dY);
    dY += 32;
  });

  // 3 Complementary Research Metrics inside card
  const subY = curY + cardH - 100;
  if (subY > dY + 16) {
    const researchBadges = (items && items.length > 0) ? items.slice(0, 3) : [
      '60,000x Faster Processing',
      '82% Increased Recall',
      '4.2x Organic Shares'
    ];
    const bW = Math.round((maxW - 64) / 3);
    researchBadges.forEach((rb, idx) => {
      const bx = padX + 24 + (idx * (bW + 8));
      drawRoundRect(ctx, bx, subY, bW, 76, 12);
      ctx.fillStyle = TEAL_BG_TINT;
      ctx.fill();
      ctx.strokeStyle = TEAL_BORDER;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '900 16px "Outfit", sans-serif';
      ctx.fillStyle = TEAL_PRIMARY;
      ctx.textAlign = 'center';
      ctx.fillText(rb, bx + bW / 2, subY + 32);

      ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = TEXT_MUTED;
      ctx.fillText('Empirically Verified', bx + bW / 2, subY + 56);
    });
    ctx.textAlign = 'left';
  }
}

/**
 * COMMON-09: Myth vs Reality
 * "Myth vs Reality in Social Marketing"
 */
async function renderCommonMythVsReality({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'DEBUNKING THE MYTHS',
    headline: headline || 'Myth vs Reality in Social Marketing',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 54 : 74,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 16;

  // 2 Prominent Balanced Cards (Myth vs Reality)
  const cardW = maxW;
  const cardH = Math.round((footerY - curY - 24) / 2);

  // Myth Card (Warning style)
  drawRoundRect(ctx, padX, curY, cardW, cardH, 18);
  ctx.fillStyle = '#FFF1F2';
  ctx.fill();
  ctx.strokeStyle = '#F43F5E';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '900 24px "Outfit", sans-serif';
  ctx.fillStyle = '#E11D48';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('🔴  THE COMMON MYTH', padX + 24, curY + 22);

  ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText('"You need a massive creative team and weeks of time to produce agency-level graphics."', padX + 24, curY + 60);

  // Reality Card (Teal Success style)
  const rY = curY + cardH + 18;
  drawRoundRect(ctx, padX, rY, cardW, cardH, 18);
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = '900 24px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.fillText('🟢  THE PROVEN REALITY', padX + 24, rY + 22);

  ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText('With Infinitetech AI, 1 person can synthesize 50 bespoke brand posters in under 60 seconds.', padX + 24, rY + 60);
}

/**
 * COMMON-10: Client Success Case Study
 * "How CloudFlow Grew MRR by 240% in 90 Days"
 */
async function renderCommonCaseStudy({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'VERIFIED CLIENT IMPACT',
    headline: headline || 'How CloudFlow Grew MRR by 240% in 90 Days',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 16;

  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'left';
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(line => {
    ctx.fillText(line, padX, curY);
    curY += 32;
  });
  curY += 24;

  // 3 Metric Pills
  const metrics = [
    { label: 'MRR Growth', val: '+240%' },
    { label: 'Organic Inbound', val: '4.8x' },
    { label: 'CAC Reduction', val: '-42%' }
  ];
  const metW = Math.round((maxW - 36) / 3);
  metrics.forEach((m, i) => {
    const mx = padX + (i * (metW + 18));
    drawWhiteTealCard({ ctx, x: mx, y: curY, w: metW, h: 96, radius: 14 });

    ctx.font = '900 36px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText(m.val, mx + metW / 2, curY + 16);

    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText(m.label, mx + metW / 2, curY + 62);
  });
  curY += 120;

  // Client Quote Box
  const qH = footerY - curY - 20;
  if (qH > 90) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: qH, radius: 16 });
    ctx.font = 'italic 700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.fillText('“Infinitetech transformed our entire marketing workflow. The results speak for themselves.”', padX + 30, curY + 28);

    ctx.font = '800 18px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.fillText('— Alex Morgan, VP Marketing at CloudFlow', padX + 30, curY + 66);
  }
}

/**
 * COMMON-11: System Architecture Blueprint
 * "Architecting Resilient Distributed Systems"
 */
async function renderCommonArchitectureBlueprint({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'ENTERPRISE TECH BLUEPRINT',
    headline: headline || 'Architecting Resilient Distributed Systems',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'left';
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(line => {
    ctx.fillText(line, padX, curY);
    curY += 32;
  });
  curY += 24;

  // 4 Flow Architecture Nodes in Blueprint Style
  const flowNodes = [
    { title: 'API Gateway', tech: 'Envoy / Kong', desc: 'Zero-trust SSL termination & rate limiting' },
    { title: 'Event Bus', tech: 'Apache Kafka', desc: 'Decoupled pub-sub with ordering guarantee' },
    { title: 'AI Inference', tech: 'Triton Server', desc: 'Sub-second model execution on GPU clusters' },
    { title: 'Persistent Store', tech: 'PostgreSQL & S3', desc: 'Multi-region replication with 99.999% SLA' }
  ];

  const nodeH = 68;
  flowNodes.forEach((n, idx) => {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: nodeH, radius: 14 });

    // Step index
    drawRoundRect(ctx, padX + 16, curY + 14, 40, 40, 10);
    ctx.fillStyle = TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = TEAL_PRIMARY;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`0${idx + 1}`, padX + 36, curY + 34);

    // Title & Tech Chip
    ctx.font = '900 22px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.fillText(n.title, padX + 74, curY + 22);

    ctx.font = '700 14px monospace';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.fillText(`[ ${n.tech} ]`, padX + 240, curY + 22);

    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText(n.desc, padX + 74, curY + 46);

    curY += nodeH + 12;
  });
}

/**
 * COMMON-12: Weekly Tech Digest
 * "Weekly Tech Pulse: Edition #48"
 */
async function renderCommonWeeklyDigest({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'WEEKLY INTELLIGENCE BRIEFING',
    headline: headline || 'Weekly Tech Pulse: Edition #48',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'left';
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(line => {
    ctx.fillText(line, padX, curY);
    curY += 32;
  });
  curY += 24;

  // 3 Structured News Cards
  const news = [
    { cat: 'AGENTIC WORKFLOWS', title: 'Why autonomous coding agents are surpassing traditional copilots.', date: 'Issue #48' },
    { cat: 'ENTERPRISE LLMS', title: 'Small language models achieve parity with frontier models on fine-tuned domains.', date: 'Oct 2026' },
    { cat: 'DESIGN AUTOMATION', title: 'HTML5 canvas vector rendering unlocks zero-cloud-cost social production.', date: 'Deep Dive' }
  ];

  const cardH = 86;
  news.forEach(n => {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: cardH, radius: 14 });

    ctx.font = '900 14px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.fillText(n.cat, padX + 22, curY + 20);

    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.textAlign = 'right';
    ctx.fillText(n.date, padX + maxW - 22, curY + 20);

    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.fillText(n.title, padX + 22, curY + 50);

    curY += cardH + 14;
  });

  // Bottom Executive Editorial Note Strip (fills to footerY)
  const remH = footerY - curY - 14;
  if (remH > 50) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: remH, radius: 14 });
    const pills = ['48 Editions Published', '25,000+ Tech Subscribers', '100% Free Weekly Access'];
    const pW = Math.round(maxW / 3);
    pills.forEach((p, idx) => {
      const px = padX + (idx * pW);
      ctx.font = '900 16px "Outfit", sans-serif';
      ctx.fillStyle = TEAL_PRIMARY;
      ctx.textAlign = 'center';
      ctx.fillText(p, px + pW / 2, curY + remH * 0.44);

      ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = TEXT_MUTED;
      ctx.fillText('Verified Executive Intelligence', px + pW / 2, curY + remH * 0.74);
    });
    ctx.textAlign = 'left';
  }
}

/**
 * COMMON-13: Startup Growth Playbook
 * "The 3 Pillars of Scalable SaaS Growth"
 */
async function renderCommonGrowthPlaybook({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'STRATEGIC PLAYBOOK',
    headline: headline || 'The 3 Pillars of Scalable SaaS Growth',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'left';
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(line => {
    ctx.fillText(line, padX, curY);
    curY += 32;
  });
  curY += 24;

  // 3 Pillar Cards Side-by-Side
  const colW = Math.round((maxW - 36) / 3);
  const colH = footerY - curY - 20;

  const pillars = [
    { num: 'PILLAR 01', title: 'First-Party Data', desc: 'Build an owned audience and unified data graph immune to third-party cookies.' },
    { num: 'PILLAR 02', title: 'Operational Velocity', desc: 'Automate content and design generation so your team ships daily, not monthly.' },
    { num: 'PILLAR 03', title: 'Compounding Retention', desc: 'Deliver undeniable product value and automated workflows that create high switching costs.' }
  ];

  pillars.forEach((p, idx) => {
    const cx = padX + (idx * (colW + 18));
    drawWhiteTealCard({ ctx, x: cx, y: curY, w: colW, h: colH, radius: 18 });

    ctx.font = '900 16px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.fillText(p.num, cx + 20, curY + 24);

    ctx.font = '900 24px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText(p.title, cx + 20, curY + 56);

    ctx.font = '500 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    let py = curY + 98;
    wrapText(ctx, p.desc, colW - 40).forEach(l => {
      ctx.fillText(l, cx + 20, py);
      py += 26;
    });
  });
}

/**
 * COMMON-14: Security & Compliance Trust Matrix
 * "Zero-Trust Cloud Security Checklist"
 */
async function renderCommonSecurityTrust({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'SECURITY & GOVERNANCE',
    headline: headline || 'Zero-Trust Cloud Security Checklist',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'left';
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(line => {
    ctx.fillText(line, padX, curY);
    curY += 32;
  });
  curY += 28;

  // 4 Security Certifications Grid (2 x 2)
  const bW = Math.round((maxW - 20) / 2);
  const bH = 110;

  const badges = [
    { title: 'SOC 2 Type II Certified', desc: 'Rigorous annual audits for enterprise trust & governance.' },
    { title: 'ISO 27001 Certified', desc: 'Global benchmark for information security management.' },
    { title: 'GDPR & CCPA Compliant', desc: 'Total data sovereignty and strict zero-logging policies.' },
    { title: 'HIPAA Guardrails Ready', desc: 'Encrypted at rest and in transit with dedicated KMS.' }
  ];

  badges.forEach((b, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const bx = padX + (col * (bW + 20));
    const by = curY + (row * (bH + 20));

    drawWhiteTealCard({ ctx, x: bx, y: by, w: bW, h: bH, radius: 16 });
    drawShieldIcon(ctx, bx + 22, by + 26, 32, TEAL_PRIMARY);

    ctx.font = '900 22px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText(b.title, bx + 68, by + 28);

    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    let dy = by + 58;
    wrapText(ctx, b.desc, bW - 88).slice(0, 2).forEach(l => {
      ctx.fillText(l, bx + 68, dy);
      dy += 22;
    });
  });
}

/**
 * COMMON-15: Podcast Spotlight
 * "Podcast Episode 42: The Future of Autonomous Coding"
 */
async function renderCommonPodcastSpotlight({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'FEATURED PODCAST EPISODE',
    headline: headline || 'Podcast Episode 42: The Future of Autonomous Coding',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'left';
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(line => {
    ctx.fillText(line, padX, curY);
    curY += 32;
  });
  curY += 24;

  // Soundwave Visualization Card
  const soundCardH = footerY - curY - 20;
  drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: soundCardH, radius: 20 });

  // Speaker Badge
  drawRoundRect(ctx, padX + 24, curY + 24, 220, 36, 18);
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fill();
  ctx.font = '800 15px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.fillText('🎙️  STREAMING EVERYWHERE', padX + 134, curY + 42);

  // Big Soundwave bars in center
  const waveCy = curY + soundCardH * 0.50;
  drawAudioSoundwave(ctx, width / 2, waveCy, Math.min(600, maxW - 60), 84, TEAL_PRIMARY);

  ctx.font = '900 24px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'center';
  ctx.fillText('Listen on Spotify · Apple Podcasts · YouTube Music', width / 2, curY + soundCardH - 36);
}

/**
 * COMMON-16: Book & Resource Recommendations
 * "Book of The Week: High Output Management"
 */
async function renderCommonBookRecommendations({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  // 1. Headline
  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'EXECUTIVE READING LIST',
    headline: headline || 'Book of The Week: High Output Management',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 50 : 70,
    minFs: 36,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 12;

  // 2. Subtitle
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'left';
  wrapText(ctx, tagline || "Andy Grove's timeless masterpiece on operational leverage and team leadership.", maxW).slice(0, 2).forEach(l => {
    ctx.fillText(l, padX, curY);
    curY += 30;
  });
  curY += 24;

  // 3. Left Side: 3D Book Mockup | Right Side: 3 Structured Takeaway Cards
  const bookW = Math.round(width * (isLandscape ? 0.28 : 0.32));
  const bookH = footerY - curY - 16;
  draw3dBookMockup(ctx, padX, curY, bookW, bookH, headline, 'Andy Grove', 5, post?.uploadedImage, TEAL_PRIMARY);

  // Right Side: 3 Compact, Well-Proportioned Takeaway Cards (ZERO EMPTY SPACE!)
  const rightX = padX + bookW + 28;
  const rightW = width - rightX - padX;
  const cardH = 92;

  const takeaways = (items && items.length > 0) ? items.slice(0, 3) : [
    'Managerial Leverage: Output is the output of the units under your supervision.',
    'Early Warning Indicators: Design operational metrics that signal shifts early.',
    'Objective Assessment: Gauge performance strictly through tangible output.'
  ];

  takeaways.forEach((item, idx) => {
    const cy = curY + (idx * (cardH + 16));
    drawWhiteTealCard({ ctx, x: rightX, y: cy, w: rightW, h: cardH, radius: 16 });

    // Step number circle badge
    drawRoundRect(ctx, rightX + 16, cy + 18, 44, 44, 12);
    ctx.fillStyle = TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = TEAL_PRIMARY;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`0${idx + 1}`, rightX + 38, cy + 40);

    // Takeaway text
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const cleanItem = String(item).replace(/^[✓•\-\*]\s*/, '').trim();
    let textY = cy + 22;
    wrapText(ctx, cleanItem, rightW - 84).slice(0, 2).forEach(l => {
      ctx.fillText(l, rightX + 74, textY);
      textY += 26;
    });
  });
}

/**
 * COMMON-17: Bold Typography Statement
 * "SIMPLICITY IS THE ULTIMATE SPEED"
 */
async function renderCommonBoldStatement({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY + 10;
  const maxW = width - padX * 2;

  // Massive 92px Display Typography
  ctx.font = `900 ${isLandscape ? 64 : 88}px "Outfit", "Bricolage Grotesque", sans-serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const lines = wrapText(ctx, headline || 'SIMPLICITY IS THE ULTIMATE SPEED', maxW);
  lines.forEach((l, i) => {
    if (i === lines.length - 1) {
      ctx.fillStyle = TEAL_PRIMARY;
    }
    ctx.fillText(l, padX, curY);
    curY += (isLandscape ? 70 : 96);
  });
  curY += 20;

  // Tagline
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(l => {
    ctx.fillText(l, padX, curY);
    curY += 34;
  });
  curY += 32;

  // 4 Core Flywheel Nodes
  const nodes = ['1. Streamline Workflows', '2. Automate Production', '3. Compound Velocity', '4. Scale ROI'];
  const cardW = Math.round((maxW - 18) / 2);
  const cardH = 78;

  nodes.forEach((node, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cx = padX + (col * (cardW + 18));
    const cy = curY + (row * (cardH + 16));

    drawWhiteTealCard({ ctx, x: cx, y: cy, w: cardW, h: cardH, radius: 14 });

    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.fillText(node, cx + 20, cy + 18);

    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText(items[idx] || 'Autonomous execution across all channels.', cx + 20, cy + 44);
  });
}

/**
 * COMMON-18: Enterprise Checklist & AI Readiness
 * "Is Your Business Ready For The AI Shift?"
 */
async function renderCommonEnterpriseChecklist({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  // 1. Headline
  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'READINESS ASSESSMENT',
    headline: headline || 'Is Your Business Ready For The AI Shift?',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 50 : 68,
    minFs: 36,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 12;

  // 2. Tagline
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'left';
  wrapText(ctx, tagline || '4 essential readiness questions every executive must answer today.', maxW).slice(0, 2).forEach(l => {
    ctx.fillText(l, padX, curY);
    curY += 30;
  });
  curY += 24;

  // 3. Left Side: 4 Checklist Cards | Right Side: AI Readiness Speedometer Gauge
  const leftW = Math.round(width * (isLandscape ? 0.52 : 0.55));
  const cardH = 68;

  const questions = (items && items.length > 0) ? items.slice(0, 4) : [
    '1. Are your knowledge silos unified for retrieval?',
    '2. Have you automated repetitive visual & content tasks?',
    '3. Is customer support responsive within sub-second SLAs?',
    '4. Are your developers equipped with autonomous agentic tools?'
  ];

  questions.forEach(q => {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: leftW, h: cardH, radius: 14 });

    // Glowing checkbox badge
    drawRoundRect(ctx, padX + 16, curY + 16, 36, 36, 10);
    ctx.fillStyle = TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = TEAL_PRIMARY;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    drawCheckmarkIcon(ctx, padX + 24, curY + 24, 20, TEAL_PRIMARY);

    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(q, padX + 66, curY + cardH / 2);

    curY += cardH + 14;
  });

  // Right Side: Vector AI Readiness Speedometer (or user photo if uploaded)
  const rightX = padX + leftW + 28;
  const rightW = width - rightX - padX;
  const gaugeBoxH = footerY - (contentTopY + hlInfo.totalHeight + 36);

  drawWhiteTealCard({ ctx, x: rightX, y: contentTopY + hlInfo.totalHeight + 36, w: rightW, h: gaugeBoxH, radius: 20 });

  if (post?.uploadedImage && typeof post.uploadedImage === 'object' && post.uploadedImage.width) {
    ctx.save();
    ctx.beginPath();
    drawRoundRect(ctx, rightX + 8, contentTopY + hlInfo.totalHeight + 44, rightW - 16, gaugeBoxH - 16, 16);
    ctx.clip();
    const img = post.uploadedImage;
    const scale = Math.max((rightW - 16) / img.width, (gaugeBoxH - 16) / img.height);
    const iw = img.width * scale;
    const ih = img.height * scale;
    ctx.drawImage(img, rightX + 8 + (rightW - 16 - iw) / 2, contentTopY + hlInfo.totalHeight + 44 + (gaugeBoxH - 16 - ih) / 2, iw, ih);
    ctx.restore();
  } else {
    const gaugeCx = rightX + rightW / 2;
    const gaugeCy = contentTopY + hlInfo.totalHeight + 36 + gaugeBoxH * 0.46;
    drawSpeedometerGauge(ctx, gaugeCx, gaugeCy, 100, 94, 'AI READINESS INDEX');

    ctx.font = '800 18px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText('ENTERPRISE MATURITY: GRADE A', gaugeCx, contentTopY + hlInfo.totalHeight + gaugeBoxH - 24);
  }
}

/**
 * COMMON-19: Conversion Funnel Matrix
 * "The Power of Automated Transformation"
 */
async function renderCommonFunnelMatrix({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'CONVERSION FUNNEL MATRIX',
    headline: headline || 'The Power of Automated Transformation',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 14;

  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'left';
  wrapText(ctx, tagline, maxW).slice(0, 2).forEach(line => {
    ctx.fillText(line, padX, curY);
    curY += 32;
  });
  curY += 24;

  // 4 Tapered Funnel Stages
  const stages = [
    { name: '1. AWARENESS', metric: '100% Top of Funnel', desc: 'Social posters with bold display typography capture attention.' },
    { name: '2. ENGAGEMENT', metric: '48% Click-Through', desc: 'Clear value propositions and feature badges establish trust.' },
    { name: '3. CONVERSION', metric: '24% Lead Capture', desc: 'Prominent high-contrast Call To Action triggers direct actions.' },
    { name: '4. RETENTION', metric: '88% Compounding ROI', desc: 'Ongoing automated workflows build loyal brand advocates.' }
  ];

  const stageH = 68;
  stages.forEach((st, idx) => {
    const taper = idx * 24;
    const sW = maxW - taper * 2;
    const sx = padX + taper;

    drawWhiteTealCard({ ctx, x: sx, y: curY, w: sW, h: stageH, radius: 14 });

    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'left';
    ctx.fillText(st.name, sx + 22, curY + 22);

    ctx.font = '800 16px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'right';
    ctx.fillText(st.metric, sx + sW - 22, curY + 22);

    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.textAlign = 'left';
    ctx.fillText(st.desc, sx + 22, curY + 46);

    curY += stageH + 12;
  });
}

/**
 * COMMON-20 & DEFAULT: Vision 2030 Strategic Manifesto
 * "Our Mission: Empowering Creators Everywhere"
 */
async function renderCommonVisionManifesto({
  ctx, width, height, post, style, headline, tagline, items, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  const hlInfo = drawPosterHeadline(ctx, {
    kicker: 'VISION & MANIFESTO 2030',
    headline: headline || 'Our Mission: Empowering Creators Everywhere',
    x: padX,
    y: curY,
    maxW,
    initialFs: isLandscape ? 52 : 72,
    minFs: 38,
    maxLines: 2,
    isLandscape
  });
  curY = hlInfo.bottomY + 16;

  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.textAlign = 'left';
  wrapText(ctx, tagline || 'We believe extraordinary technology should feel invisible, effortless, and accessible to every builder on earth.', maxW).slice(0, 2).forEach(line => {
    ctx.fillText(line, padX, curY);
    curY += 34;
  });
  curY += 28;

  // 3 Manifesto Pillar Cards
  const pillars = (items && items.length > 0) ? items.slice(0, 3) : [
    'Autonomous Execution: Eliminating repetitive friction from creative engineering.',
    'Privacy First & Local Compute: Zero monthly subscriptions or server lock-in.',
    'Compounding Leverage: Giving modern founders the capability of an enterprise.'
  ];

  const pillH = 88;
  pillars.forEach((p, idx) => {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: pillH, radius: 16 });

    drawRoundRect(ctx, padX + 18, curY + 18, 44, 44, 12);
    ctx.fillStyle = TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = TEAL_PRIMARY;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`0${idx + 1}`, padX + 40, curY + 40);

    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const cleanP = String(p).replace(/^[✓•\-\*]\s*/, '').trim();
    let textY = curY + 22;
    wrapText(ctx, cleanP, maxW - 88).slice(0, 2).forEach(l => {
      ctx.fillText(l, padX + 78, textY);
      textY += 26;
    });

    curY += pillH + 16;
  });
}
