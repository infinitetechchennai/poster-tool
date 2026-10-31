/**
 * Dedicated Multi-Layout Canvas Renderers for 10 Hiring & Recruitment Templates
 * 
 * Guaranteed:
 * - 100% Bespoke, full-bleed layouts for every single hiring template (hiring-01 to hiring-10).
 * - ZERO empty white space: Every single poster fills the canvas from header to footer with high-value content.
 * - Real-time dynamic updates: Keystrokes in role, experience, location, salary update immediately.
 * - High-contrast corporate White & Infinitetech Teal (#008080) aesthetic.
 */

import {
  drawRoundRect,
  wrapText,
  fitHeadline,
  drawCheckmarkIcon,
  drawBriefcaseIcon,
  drawTargetIcon,
  drawZapIcon,
  drawSparkleIcon,
  drawClockIcon
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
  drawFluidWaveHero,
  drawDiagonalHeroRibbon,
  drawSpecificationRow,
  drawTechStackPillsRow,
  drawWhiteTealCard
} from './sharedRendererUtils.js';

export async function renderHiringTemplate({
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

  const role = (post?.role || post?.headline || 'Senior DevOps & Cloud Architect').trim();
  const exp = (post?.experience || '3 - 5 Years').trim();
  const loc = (post?.location || 'Bengaluru / Hybrid').trim();
  const salary = (post?.salary || 'Best in Industry + Equity').trim();
  const qualification = (post?.qualification || 'Graduate / B.Tech').trim();
  const employmentType = (post?.employmentType || 'Full-Time').trim();
  const techStack = (post?.techStack || ['AWS', 'Kubernetes', 'Docker', 'Terraform']).slice(0, 4);

  // Background pattern per template
  const bgPattern = id === 'hiring-01' ? 'warp-mesh' : 'dots';

  // 1. Clean White Background
  // For hiring-11 to hiring-15, remaining space (canvas, top bar, bottom bar) MUST be pure white
  // The detail image is clipped strictly inside the "hiring detail" chamber!
  const isHiringWithDetailImage = (id >= 'hiring-11' && id <= 'hiring-15');
  await renderPosterBackground({
    ctx,
    width,
    height,
    post: isHiringWithDetailImage ? { ...post, uploadedImage: null } : post,
    style,
    accentColor: TEAL_PRIMARY,
    pattern: bgPattern,
    topicImg: isHiringWithDetailImage ? null : topicImg
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
  if (id === 'hiring-02') {
    await renderHiringAppXFluid({ ctx, width, height, post, style, role, exp, loc, salary, employmentType, techStack, padX, contentTopY, footerY, isLandscape, topicImg });
  } else if (id === 'hiring-03') {
    await renderHiringCodexaonAlert({ ctx, width, height, post, style, role, exp, loc, salary, qualification, techStack, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'hiring-04') {
    await renderHiringNatdemyStudio({ ctx, width, height, post, style, role, exp, loc, salary, qualification, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'hiring-05') {
    await renderHiringMagazine({ ctx, width, height, post, style, role, exp, loc, salary, techStack, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'hiring-06') {
    await renderHiringDirectoryGrid({ ctx, width, height, post, style, role, exp, loc, salary, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'hiring-07') {
    await renderHiringBoardingPass({ ctx, width, height, post, style, role, exp, loc, salary, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'hiring-08') {
    await renderHiringGlobalNomad({ ctx, width, height, post, style, role, exp, loc, salary, techStack, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'hiring-09') {
    await renderHiringTerminalIDE({ ctx, width, height, post, style, role, exp, loc, salary, techStack, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'hiring-10') {
    await renderHiringExecutiveLeadership({ ctx, width, height, post, style, role, exp, loc, salary, qualification, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'hiring-11') {
    await renderHiringScallopCloud({ ctx, width, height, post, style, role, exp, loc, salary, qualification, employmentType, techStack, padX, contentTopY, footerY, isLandscape, topicImg });
  } else if (id === 'hiring-12') {
    await renderHiringDiagonalSCurve({ ctx, width, height, post, style, role, exp, loc, salary, qualification, employmentType, techStack, padX, contentTopY, footerY, isLandscape, topicImg });
  } else if (id === 'hiring-13') {
    await renderHiringMountainCanopy({ ctx, width, height, post, style, role, exp, loc, salary, qualification, employmentType, techStack, padX, contentTopY, footerY, isLandscape, topicImg });
  } else if (id === 'hiring-14') {
    await renderHiringUpwardArc({ ctx, width, height, post, style, role, exp, loc, salary, qualification, employmentType, techStack, padX, contentTopY, footerY, isLandscape, topicImg });
  } else if (id === 'hiring-15') {
    await renderHiringSteppedShelf({ ctx, width, height, post, style, role, exp, loc, salary, qualification, employmentType, techStack, padX, contentTopY, footerY, isLandscape, topicImg });
  } else {
    // hiring-01 & default
    await renderHiringSkillmountSplit({ ctx, width, height, post, style, role, exp, loc, salary, qualification, techStack, padX, contentTopY, footerY, isLandscape, topicImg });
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
 * HIRING-01: Skillmount Perspective Split (Diagonal Velocity Ribbon)
 */
async function renderHiringSkillmountSplit({
  ctx, width, height, post, style, role, exp, loc, salary, qualification, techStack, padX, contentTopY, footerY, isLandscape, topicImg
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);

  // 1. Draw Diagonal Hero Ribbon across top-right to bottom-left
  drawDiagonalHeroRibbon(ctx, width, height, post, TEAL_PRIMARY, topicImg);

  // 2. Right-side Content Layout
  const contentLeftX = Math.round(width * 0.44);
  const contentW = width - contentLeftX - padX;
  let curY = contentTopY + 16;

  // Typography: "we are" (script) + "HIRING" (bold)
  // Executive Typography
  ctx.font = '800 14px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  ctx.textAlign = 'left';
  ctx.fillText('WE ARE RECRUITING // CAREER LAUNCHPAD', contentLeftX, curY);
  curY += 28;

  ctx.save();
  ctx.font = '900 84px "Bricolage Grotesque", "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEAL_PRIMARY;
  ctx.shadowColor = hasBg ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 128, 128, 0.35)';
  ctx.shadowBlur = 18;
  ctx.fillText('HIRING', contentLeftX, curY + 64);
  ctx.restore();
  curY += 92;

  // Job Role Title with dynamic wrapText
  ctx.font = '900 34px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 10;
  }
  wrapText(ctx, role, contentW).slice(0, 2).forEach(line => {
    ctx.fillText(line, contentLeftX, curY);
    curY += 40;
  });
  ctx.shadowBlur = 0;
  curY += 16;

  // 4 Specification Rows Table
  const specs = [
    { k: 'Qualification', v: qualification },
    { k: 'Experience', v: exp },
    { k: 'Location', v: loc },
    { k: 'Salary', v: salary }
  ];

  specs.forEach(s => {
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = hasBg ? '#2DD4BF' : TEXT_MUTED;
    ctx.fillText(`${s.k}:`, contentLeftX, curY);

    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
      ctx.shadowBlur = 6;
    }
    ctx.fillText(s.v, contentLeftX + 130, curY);
    ctx.shadowBlur = 0;
    curY += 34;
  });
  curY += 18;

  // 3-Pill Perks Row
  const perks = ['Medical Coverage', 'Equity Grants', 'Flexible Hours'];
  const perkPillW = Math.round((contentW - 20) / 3);
  perks.forEach((p, idx) => {
    const px = contentLeftX + (idx * (perkPillW + 10));
    drawRoundRect(ctx, px, curY, perkPillW, 36, 10);
    ctx.fillStyle = hasBg ? 'rgba(0, 128, 128, 0.40)' : TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = hasBg ? '#2DD4BF' : TEAL_BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p, px + perkPillW / 2, curY + 18);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  });
  curY += 56;

  // Tech Stack Pills Row
  drawTechStackPillsRow(ctx, contentLeftX, curY, contentW, 46, techStack);
}

/**
 * HIRING-02: AppX Style Fluid Wave
 */
async function renderHiringAppXFluid({
  ctx, width, height, post, style, role, exp, loc, salary, employmentType, techStack, padX, contentTopY, footerY, isLandscape, topicImg
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  drawFluidWaveHero(ctx, width, height, post, TEAL_PRIMARY, topicImg);

  const leftW = Math.round(width * 0.48);
  let curY = contentTopY + 12;

  // "AppX is Hiring!"
  ctx.font = '900 76px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 12;
  }
  ctx.fillText('AppX', padX, curY);
  ctx.shadowBlur = 0;
  curY += 74;

  const hlGrad = ctx.createLinearGradient(padX, curY, padX + 280, curY);
  hlGrad.addColorStop(0, hasBg ? '#2DD4BF' : TEAL_PRIMARY);
  hlGrad.addColorStop(1, hasBg ? '#5EEAD4' : TEAL_LIGHT);
  ctx.fillStyle = hlGrad;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 12;
  }
  ctx.fillText('is Hiring!', padX, curY);
  ctx.shadowBlur = 0;
  curY += 86;

  // Role Pill Badge
  ctx.font = '900 22px "Outfit", sans-serif';
  const roleTextW = ctx.measureText(role).width;
  const pillW = Math.min(leftW, roleTextW + 48);
  const pillH = 48;

  drawRoundRect(ctx, padX, curY, pillW, pillH, 12);
  const pillGrad = ctx.createLinearGradient(padX, curY, padX + pillW, curY + pillH);
  pillGrad.addColorStop(0, TEAL_PRIMARY);
  pillGrad.addColorStop(1, TEAL_DARK);
  ctx.fillStyle = pillGrad;
  ctx.shadowColor = 'rgba(0, 128, 128, 0.3)';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(role, padX + 22, curY + pillH / 2);
  ctx.textBaseline = 'alphabetic';
  curY += pillH + 26;

  // 3 Specification Rows
  const rowH = 46;
  drawSpecificationRow(ctx, padX, curY, leftW - 20, rowH, 'briefcase', 'Experience:', exp);
  curY += rowH + 10;
  drawSpecificationRow(ctx, padX, curY, leftW - 20, rowH, 'target', 'Mode:', loc);
  curY += rowH + 10;
  drawSpecificationRow(ctx, padX, curY, leftW - 20, rowH, 'clock', 'Employment:', employmentType);
  curY += rowH + 20;

  // Candidate Perks Capsule
  const perks = ['Global Co-working', 'Health & Wellness', 'Fast Career Track'];
  const pW = Math.round((leftW - 30) / 3);
  perks.forEach((p, idx) => {
    const px = padX + (idx * (pW + 10));
    drawRoundRect(ctx, px, curY, pW, 36, 10);
    ctx.fillStyle = hasBg ? 'rgba(0, 128, 128, 0.40)' : TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = hasBg ? '#2DD4BF' : TEAL_BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '800 12px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p, px + pW / 2, curY + 18);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  });
  curY += 54;

  // Tech Stack Row
  drawTechStackPillsRow(ctx, padX, curY, width - (padX * 2) - 80, 50, techStack);
}

/**
 * HIRING-03: Codexaon Urgent Alert with Megaphone
 */
async function renderHiringCodexaonAlert({
  ctx, width, height, post, style, role, exp, loc, salary, qualification, techStack, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  let curY = contentTopY;
  const maxW = width - padX * 2;

  // Megaphone Badge
  drawRoundRect(ctx, padX, curY, 210, 42, 10);
  ctx.fillStyle = '#FEF08A';
  ctx.fill();
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '900 16px "Outfit", sans-serif';
  ctx.fillStyle = '#854D0E';
  ctx.fillText('📢  HIRING ALERT', padX + 20, curY + 26);
  curY += 56;

  // Massive Headline (High contrast on background photos)
  ctx.font = '900 52px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 2;
  }
  ctx.fillText('WE ARE CURRENTLY HIRING', padX, curY);
  ctx.shadowBlur = 0;
  curY += 60;

  // Role Capsule
  const roleText = `${role.toUpperCase()}!`;
  ctx.font = '900 42px "Outfit", sans-serif';
  const rW = ctx.measureText(roleText).width + 48;
  drawRoundRect(ctx, padX, curY, Math.min(maxW, rW), 62, 14);
  const rGrad = ctx.createLinearGradient(padX, curY, padX + rW, curY + 62);
  rGrad.addColorStop(0, TEAL_PRIMARY);
  rGrad.addColorStop(1, TEAL_LIGHT);
  ctx.fillStyle = rGrad;
  ctx.shadowColor = 'rgba(0, 128, 128, 0.35)';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(roleText, padX + 24, curY + 44);
  curY += 80;

  // Subtitle (Luminous light slate on background photo)
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = hasBg ? '#F1F5F9' : TEXT_MUTED;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 1;
  }
  ctx.fillText('Join an agile team building mission-critical AI systems with competitive equity & bonuses. 🚀', padX, curY);
  ctx.shadowBlur = 0;
  curY += 36;

  // 4-Card Specification Grid (2x2) with Frosted Contrast Glass
  const cardW = Math.round((maxW - 20) / 2);
  const specs = [
    { l: 'Role Scope', v: role },
    { l: 'Location', v: loc },
    { l: 'Experience', v: exp },
    { l: 'Eligibility', v: qualification }
  ];

  specs.forEach((s, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cx = padX + (col * (cardW + 20));
    const cy = curY + (row * 68);

    drawWhiteTealCard({ ctx, x: cx, y: cy, w: cardW, h: 58, radius: 12 });
    drawCheckmarkIcon(ctx, cx + 16, cy + 18, 22, hasBg ? '#2DD4BF' : TEAL_PRIMARY);

    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = hasBg ? '#2DD4BF' : TEXT_MUTED;
    ctx.fillText(s.l, cx + 48, cy + 20);

    ctx.font = '800 16px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
      ctx.shadowBlur = 6;
    }
    ctx.fillText(s.v, cx + 48, cy + 42);
    ctx.shadowBlur = 0;
  });
  curY += 156;

  // 3-Step Interview Timeline (Crystal-clear white & cyan)
  const steps = [
    { num: '01', title: 'Introductory Screen', desc: '30m chat with lead' },
    { num: '02', title: 'Technical Deep-Dive', desc: 'System design & coding' },
    { num: '03', title: 'Formal Offer', desc: 'Fast turnaround in 48h' }
  ];
  const stepW = Math.round((maxW - 30) / 3);
  steps.forEach((st, idx) => {
    const sx = padX + (idx * (stepW + 15));
    drawWhiteTealCard({ ctx, x: sx, y: curY, w: stepW, h: 72, radius: 12 });

    drawRoundRect(ctx, sx + 12, curY + 14, 38, 38, 10);
    ctx.fillStyle = hasBg ? 'rgba(0, 128, 128, 0.40)' : TEAL_BG_TINT;
    ctx.fill();
    if (hasBg) {
      ctx.strokeStyle = '#2DD4BF';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.font = '900 16px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(st.num, sx + 31, curY + 33);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.font = '800 15px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
      ctx.shadowBlur = 6;
    }
    ctx.fillText(st.title, sx + 58, curY + 30);
    ctx.shadowBlur = 0;

    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_MUTED;
    ctx.fillText(st.desc, sx + 58, curY + 52);
  });
  curY += 92;

  // Tech Chips Row
  drawTechStackPillsRow(ctx, padX, curY, maxW, 50, techStack);
}

/**
 * HIRING-04: Natdemy Studio
 */
async function renderHiringNatdemyStudio({
  ctx, width, height, post, style, role, exp, loc, salary, qualification, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  const cx = width / 2;
  const maxW = width - padX * 2;
  let curY = contentTopY + 10;

  // Script "We are"
  ctx.font = '700 52px "Caveat", "Kalam", cursive';
  ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  ctx.textAlign = 'center';
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 10;
  }
  ctx.fillText('We are', cx, curY);
  ctx.shadowBlur = 0;
  curY += 50;

  // Massive 2-Tone HIRING
  ctx.font = '900 108px "Outfit", "Bricolage Grotesque", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEAL_PRIMARY;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 16;
  }
  ctx.fillText('HIRING', cx, curY);
  ctx.shadowBlur = 0;
  curY += 108;

  // Role Title
  ctx.font = '900 32px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#2DD4BF' : TEXT_DARK;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 8;
  }
  ctx.fillText(role.toUpperCase(), cx, curY);
  ctx.shadowBlur = 0;
  curY += 46;

  // Center Vacancy Card
  const cardW = 240;
  const cardH = 120;
  drawRoundRect(ctx, cx - cardW / 2, curY, cardW, cardH, 16);
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.shadowColor = 'rgba(0, 128, 128, 0.35)';
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.font = '900 68px "Outfit", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('3', cx, curY + 66);

  ctx.font = '800 14px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fillText('OPEN VACANCIES', cx, curY + 100);
  curY += cardH + 34;

  // 4 Specs Badges (2x2 grid)
  const specW = Math.round((maxW - 20) / 2);
  const specs = [
    { l: 'Experience', v: exp },
    { l: 'Location', v: loc },
    { l: 'Eligibility', v: qualification },
    { l: 'Compensation', v: salary }
  ];

  specs.forEach((s, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const sx = padX + (col * (specW + 20));
    const sy = curY + (row * 56);

    drawRoundRect(ctx, sx, sy, specW, 46, 12);
    ctx.fillStyle = idx % 2 === 0 ? TEAL_PRIMARY : (hasBg ? 'rgba(15, 23, 42, 0.65)' : '#DCFCE7');
    ctx.fill();
    ctx.strokeStyle = idx % 2 === 0 ? '#2DD4BF' : (hasBg ? 'rgba(255, 255, 255, 0.25)' : '#22C55E');
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = '800 15px "Outfit", sans-serif';
    ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : (hasBg ? '#FFFFFF' : '#15803D');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${s.l}: ${s.v}`, sx + specW / 2, sy + 23);
    ctx.textBaseline = 'alphabetic';
  });
  curY += 130;

  // 3 Key Perks Pills
  const perks = ['100% Remote Options', 'Annual Training Budget', 'Health Insurance'];
  const perkW = Math.round((maxW - 30) / 3);
  perks.forEach((p, idx) => {
    const px = padX + (idx * (perkW + 15));
    drawWhiteTealCard({ ctx, x: px, y: curY, w: perkW, h: 44, radius: 12 });

    ctx.font = '800 14px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p, px + perkW / 2, curY + 22);
    ctx.textBaseline = 'alphabetic';
  });
}

/**
 * HIRING-05: Howow Editorial Magazine
 */
async function renderHiringMagazine({
  ctx, width, height, post, style, role, exp, loc, salary, techStack, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  const cx = width / 2;
  let curY = contentTopY + 10;

  const magW = Math.round(width * 0.74);
  const magH = footerY - curY - 16;
  const magX = cx - magW / 2;

  drawWhiteTealCard({ ctx, x: magX, y: curY, w: magW, h: magH, radius: 20 });

  let textY = curY + 38;
  ctx.font = '900 68px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 10;
  }
  ctx.textAlign = 'center';
  ctx.fillText("WE'RE", cx, textY);
  ctx.shadowBlur = 0;
  textY += 66;

  ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  ctx.fillText('HIRING', cx, textY);
  textY += 80;

  // Role Pill
  const pW = magW - 64;
  drawRoundRect(ctx, cx - pW / 2, textY, pW, 52, 12);
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.fill();

  ctx.font = '900 22px "Outfit", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(role.toUpperCase(), cx, textY + 34);
  textY += 76;

  // Large Experience Callout
  ctx.font = '900 52px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 8;
  }
  ctx.fillText(exp.toUpperCase(), cx, textY);
  ctx.shadowBlur = 0;
  textY += 46;

  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_MUTED;
  ctx.fillText(`Location: ${loc}  •  Salary: ${salary}`, cx, textY);
  textY += 44;

  // 3 Highlights Badges
  const perks = ['✓ Direct C-Suite Access', '✓ High-Impact Products', '✓ Generous Equity'];
  const bW = Math.round((pW - 20) / 3);
  perks.forEach((p, idx) => {
    const bx = cx - pW / 2 + (idx * (bW + 10));
    drawRoundRect(ctx, bx, textY, bW, 40, 10);
    ctx.fillStyle = hasBg ? 'rgba(0, 128, 128, 0.35)' : TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = hasBg ? '#2DD4BF' : TEAL_BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p, bx + bW / 2, textY + 20);
    ctx.textBaseline = 'alphabetic';
  });
  textY += 62;

  // Tech Platforms Row
  drawTechStackPillsRow(ctx, magX + 24, textY, magW - 48, 48, techStack);
}

/**
 * HIRING-06: 4-Role Job Directory Grid
 */
async function renderHiringDirectoryGrid({
  ctx, width, height, post, style, role, exp, loc, salary, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  let curY = contentTopY;
  const maxW = width - padX * 2;

  ctx.font = '900 48px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 10;
  }
  ctx.textAlign = 'left';
  ctx.fillText('WE ARE HIRING ACROSS TEAMS', padX, curY);
  ctx.shadowBlur = 0;
  curY += 56;

  const roles = [
    { t: role, e: exp, l: loc, tag: 'HIGH PRIORITY' },
    { t: 'Full-Stack AI Engineer', e: '2 - 4 Years', l: 'Remote / Global', tag: 'ENGINEERING' },
    { t: 'Senior Product Designer', e: '3 - 6 Years', l: 'Hybrid / BLR', tag: 'DESIGN' },
    { t: 'Growth Marketing Lead', e: '4 - 7 Years', l: 'Bengaluru HQ', tag: 'GROWTH' }
  ];

  const cardW = Math.round((maxW - 20) / 2);
  const cardH = 130;

  roles.forEach((r, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cx = padX + (col * (cardW + 20));
    const cy = curY + (row * (cardH + 18));

    drawWhiteTealCard({ ctx, x: cx, y: cy, w: cardW, h: cardH, radius: 16 });

    // Category Badge
    drawRoundRect(ctx, cx + 20, cy + 18, 120, 26, 6);
    ctx.fillStyle = idx === 0 ? TEAL_PRIMARY : (hasBg ? 'rgba(0, 128, 128, 0.40)' : TEAL_BG_TINT);
    ctx.fill();
    ctx.font = '800 11px "Outfit", sans-serif';
    ctx.fillStyle = idx === 0 ? '#FFFFFF' : (hasBg ? '#2DD4BF' : TEAL_PRIMARY);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(r.tag, cx + 80, cy + 31);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
      ctx.shadowBlur = 6;
    }
    ctx.fillText(r.t, cx + 20, cy + 70);
    ctx.shadowBlur = 0;

    ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_MUTED;
    ctx.fillText(`Experience: ${r.e}  •  ${r.l}`, cx + 20, cy + 96);

    // Apply Button inside card
    drawRoundRect(ctx, cx + cardW - 104, cy + 80, 88, 32, 16);
    ctx.fillStyle = hasBg ? 'rgba(0, 128, 128, 0.40)' : TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '800 12px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('APPLY ➔', cx + cardW - 60, cy + 96);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  });
  curY += (cardH * 2) + 48;

  // Why Join Infinitetech Strip
  drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: 90, radius: 16 });

  const metrics = [
    { num: '4.9 ★', label: 'Glassdoor Rating' },
    { num: '100%', label: 'Equity Grants' },
    { num: 'Zero', label: 'Red Tape / Bureaucracy' }
  ];
  const metW = Math.round(maxW / 3);
  metrics.forEach((m, idx) => {
    const mx = padX + (idx * metW);
    ctx.font = '900 24px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText(m.num, mx + metW / 2, curY + 40);

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_MUTED;
    ctx.fillText(m.label, mx + metW / 2, curY + 66);
  });
}

/**
 * HIRING-07: VIP Boarding Pass Ticket
 * Reference: Complete Airline Flight Ticket Architecture
 */
async function renderHiringBoardingPass({
  ctx, width, height, post, style, role, exp, loc, salary, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  let curY = contentTopY + 8;
  const tW = width - (padX * 2);
  const tH = footerY - curY - 14;

  // 1. Boarding Pass Master Card Container - NO white box in image mode!
  if (!hasBg) {
    drawWhiteTealCard({ ctx, x: padX, y: curY, w: tW, h: tH, radius: 20 });
  } else {
    drawRoundRect(ctx, padX, curY, tW, tH, 20);
    ctx.strokeStyle = 'rgba(20, 184, 166, 0.40)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // 2. Top Pass Header in Solid Teal
  drawRoundRect(ctx, padX, curY, tW, 58, 20);
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.fill();

  ctx.font = '900 20px "Outfit", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText('✈️  CAREER BOARDING PASS — FIRST CLASS PRIORITY', padX + 24, curY + 36);

  ctx.font = '900 16px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.textAlign = 'right';
  ctx.fillText('FLIGHT: IT-2026  •  GATE 01', padX + tW - 24, curY + 36);
  ctx.textAlign = 'left';
  curY += 76;

  // 3. Airport Flight Route Banner (Origin ➔ Destination)
  drawRoundRect(ctx, padX + 20, curY, tW - 40, 52, 12);
  ctx.fillStyle = hasBg ? 'rgba(15, 23, 42, 0.35)' : TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = hasBg ? 'rgba(255, 255, 255, 0.22)' : TEAL_BORDER;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '900 16px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
  ctx.fillText(`FROM: GLOBAL / ${loc.toUpperCase()}`, padX + 36, curY + 32);

  ctx.font = '900 18px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.fillText('✈️  ───────────────>', padX + tW / 2, curY + 32);

  ctx.font = '900 16px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
  ctx.textAlign = 'right';
  ctx.fillText('TO: INFINITETECH AI CORE', padX + tW - 36, curY + 32);
  ctx.textAlign = 'left';
  curY += 74;

  // 4. Passenger Name & Role Title
  ctx.font = '800 13px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_MUTED;
  ctx.fillText('PASSENGER / EXECUTIVE CANDIDATE:', padX + 24, curY);
  curY += 36;

  ctx.save();
  ctx.font = '900 40px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.88)';
    ctx.shadowBlur = 10;
  }
  wrapText(ctx, role.toUpperCase(), tW - 48).slice(0, 2).forEach(l => {
    ctx.fillText(l, padX + 24, curY);
    curY += 44;
  });
  ctx.restore();
  curY += 14;

  // 5. 4 Flight Specifications Cards (2x2 Grid)
  const specW = Math.round((tW - 48 - 16) / 2);
  const specH = 74;
  const flightSpecs = [
    { k: 'SEAT / LEVEL', v: 'Executive Leadership (L6+)' },
    { k: 'EXPERIENCE REQUIRED', v: exp },
    { k: 'LOCATION / MODE', v: loc },
    { k: 'COMPENSATION TIER', v: salary }
  ];

  flightSpecs.forEach((s, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const sx = padX + 24 + (col * (specW + 16));
    const sy = curY + (row * (specH + 12));

    drawWhiteTealCard({ ctx, x: sx, y: sy, w: specW, h: specH, radius: 12 });

    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_MUTED;
    ctx.fillText(s.k, sx + 18, sy + 24);

    ctx.save();
    ctx.font = '900 16px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 6;
    }
    ctx.fillText(s.v, sx + 18, sy + 50);
    ctx.restore();
  });
  curY += (specH * 2) + 30;

  // 6. In-Flight Mission Perks (4 Bullets)
  const perks = [
    '✓ Direct Architecture Ownership of Core AI',
    '✓ Executive Medical & Wellness Coverage',
    '✓ Mentorship & Leadership of 15+ Engineers',
    '✓ Generous Equity Stock Grants & Bonuses'
  ];
  const perkCardW = Math.round((tW - 48 - 16) / 2);
  perks.forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const px = padX + 24 + (col * (perkCardW + 16));
    const py = curY + (row * 42);

    drawRoundRect(ctx, px, py, perkCardW, 36, 8);
    ctx.fillStyle = hasBg ? 'rgba(15, 23, 42, 0.35)' : TEAL_BG_TINT;
    ctx.fill();
    if (hasBg) {
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.40)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.save();
    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEAL_PRIMARY;
    ctx.textBaseline = 'middle';
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 6;
    }
    ctx.fillText(p, px + 14, py + 18);
    ctx.restore();
    ctx.textBaseline = 'alphabetic';
  });
  curY += 98;

  // 7. Perforated Dotted Tear Line with Cutout Notches
  ctx.strokeStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(padX + 24, curY);
  ctx.lineTo(width - padX - 24, curY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Perforated notch cutouts on edges
  ctx.fillStyle = hasBg ? 'rgba(15, 23, 42, 0.70)' : '#F8FAFC';
  ctx.beginPath();
  ctx.arc(padX, curY, 18, -Math.PI / 2, Math.PI / 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(padX + tW, curY, 18, Math.PI / 2, -Math.PI / 2);
  ctx.fill();

  curY += 28;

  // 8. Bottom Ticket Stub: Realistic Barcode + Status
  const barcodeW = Math.round(tW * 0.52);
  const barcodeH = 50;

  // Barcode graphics
  for (let b = 0; b < 44; b++) {
    const bx = padX + 24 + (b * 9);
    ctx.fillStyle = hasBg
      ? (b % 3 === 0 ? '#2DD4BF' : '#FFFFFF')
      : (b % 3 === 0 ? TEAL_DARK : TEAL_PRIMARY);
    ctx.fillRect(bx, curY, b % 2 === 0 ? 3 : 5, barcodeH);
  }

  ctx.font = '800 13px "Space Grotesk", monospace';
  ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_MUTED;
  ctx.fillText('#IT-2026-BOARDING-PASS-EXEC', padX + 24, curY + barcodeH + 20);

  // Right Side Status Capsule
  const statusX = padX + barcodeW + 36;
  const statusW = tW - barcodeW - 60;
  drawRoundRect(ctx, statusX, curY + 4, statusW, 64, 12);
  ctx.fillStyle = hasBg ? 'rgba(0, 128, 128, 0.35)' : TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '900 15px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.fillText('STATUS: CONFIRMED', statusX + statusW / 2, curY + 30);

  ctx.font = '800 12px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
  ctx.fillText('BOARDING NOW: IMMEDIATE', statusX + statusW / 2, curY + 52);
  ctx.textAlign = 'left';
}

/**
 * HIRING-08: Remote First Global Nomad
 */
async function renderHiringGlobalNomad({
  ctx, width, height, post, style, role, exp, loc, salary, techStack, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  let curY = contentTopY;
  const maxW = width - padX * 2;

  // Kicker pill
  drawRoundRect(ctx, padX, curY, 210, 36, 18);
  ctx.fillStyle = hasBg ? 'rgba(0, 128, 128, 0.40)' : TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.font = '900 14px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🌍  GLOBAL NOMAD ROLE', padX + 105, curY + 18);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  curY += 56;

  ctx.font = '900 56px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 10;
  }
  ctx.fillText('WORK FROM ANYWHERE ON EARTH', padX, curY);
  ctx.shadowBlur = 0;
  curY += 60;

  // Role Banner
  ctx.font = '900 36px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 8;
  }
  ctx.fillText(role.toUpperCase(), padX, curY);
  ctx.shadowBlur = 0;
  curY += 46;

  ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_MUTED;
  ctx.fillText(`Experience: ${exp}  •  Compensation: ${salary}  •  100% Async Freedom`, padX, curY);
  curY += 40;

  // 3 Global Hub Cards
  const hubs = [
    { h: '🌏 APAC Zone', t: 'Flexible Working Hours', sub: 'Local co-working stipend' },
    { h: '🌍 EMEA Zone', t: 'Asynchronous Workflow', sub: 'Zero mandatory daily calls' },
    { h: '🌎 Americas Zone', t: 'Hardware & Desk Setup', sub: '$3,000 yearly tech budget' }
  ];

  const hubW = Math.round((maxW - 24) / 3);
  hubs.forEach((hub, idx) => {
    const hx = padX + (idx * (hubW + 12));
    drawWhiteTealCard({ ctx, x: hx, y: curY, w: hubW, h: 104, radius: 14 });

    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
      ctx.shadowBlur = 6;
    }
    ctx.fillText(hub.h, hx + 18, curY + 32);
    ctx.shadowBlur = 0;

    ctx.font = '800 14px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
    ctx.fillText(hub.t, hx + 18, curY + 60);

    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = hasBg ? '#CBD5E1' : TEXT_MUTED;
    ctx.fillText(hub.sub, hx + 18, curY + 84);
  });
  curY += 128;

  // 4 Remote Perks Badges (2x2 grid)
  const perkW = Math.round((maxW - 16) / 2);
  const perks = [
    '✓ Annual Global All-Hands Company Retreat',
    '✓ Comprehensive Global Health & Dental Coverage',
    '✓ Parental Leave & Unlimited Paid Time Off',
    '✓ Competitive US-Benchmarked Equity Stock'
  ];

  perks.forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const px = padX + (col * (perkW + 16));
    const py = curY + (row * 44);

    drawRoundRect(ctx, px, py, perkW, 36, 10);
    ctx.fillStyle = hasBg ? 'rgba(0, 128, 128, 0.40)' : TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = hasBg ? '#2DD4BF' : TEAL_BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEAL_PRIMARY;
    ctx.textBaseline = 'middle';
    ctx.fillText(p, px + 14, py + 18);
    ctx.textBaseline = 'alphabetic';
  });
  curY += 104;

  // Tech Stack Row
  drawTechStackPillsRow(ctx, padX, curY, maxW, 50, techStack);
}

/**
 * HIRING-09: Developer Terminal IDE
 */
async function renderHiringTerminalIDE({
  ctx, width, height, post, style, role, exp, loc, salary, techStack, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const termW = width - (padX * 2);
  const termH = footerY - curY - 16;

  // Terminal window container
  drawRoundRect(ctx, padX, curY, termW, termH, 16);
  ctx.fillStyle = '#0F172A';
  ctx.fill();
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Traffic lights
  ctx.beginPath();
  ctx.arc(padX + 24, curY + 24, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#EF4444';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(padX + 46, curY + 24, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(padX + 68, curY + 24, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#22C55E';
  ctx.fill();

  ctx.font = '600 13px "Space Grotesk", monospace';
  ctx.fillStyle = '#64748B';
  ctx.textAlign = 'right';
  ctx.fillText('bash — infinitetech-careers.sh — 80x24', padX + termW - 24, curY + 28);
  ctx.textAlign = 'left';

  curY += 66;

  ctx.font = '700 20px "Space Grotesk", monospace';
  ctx.fillStyle = '#2DD4BF';
  ctx.fillText('visitor@infinitetech:~$ ./search-open-roles.sh --level="Principal"', padX + 28, curY);
  curY += 36;

  ctx.fillStyle = '#38BDF8';
  ctx.fillText('[✓] 1 HIGH-PRIORITY OPENING FOUND:', padX + 28, curY);
  curY += 34;

  ctx.fillStyle = '#94A3B8';
  ctx.fillText('const highImpactRole = {', padX + 28, curY);
  curY += 32;

  const codeLines = [
    { k: 'title', v: `"${role}"` },
    { k: 'experience', v: `"${exp}"` },
    { k: 'workMode', v: `"${loc}"` },
    { k: 'compensation', v: `"${salary}"` },
    { k: 'techStack', v: `[${techStack.map(t => `"${t}"`).join(', ')}]` },
    { k: 'fastTrackInterview', v: 'true' }
  ];

  codeLines.forEach(l => {
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText(`  ${l.k}: `, padX + 48, curY);
    const kwW = ctx.measureText(`  ${l.k}: `).width;
    ctx.fillStyle = '#FDE047';
    ctx.fillText(l.v, padX + 48 + kwW, curY);
    curY += 30;
  });

  ctx.fillStyle = '#94A3B8';
  ctx.fillText('};', padX + 28, curY);
  curY += 40;

  // 3 Terminal Perks Badges
  const termPerks = [
    '✓ Top-Spec Apple M3 Max / Linux Hardware',
    '✓ Fast 48h Hiring Decision Turnaround',
    '✓ Direct Architecture Ownership & Equity'
  ];

  termPerks.forEach(tp => {
    drawRoundRect(ctx, padX + 28, curY, termW - 56, 36, 8);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '600 14px "Space Grotesk", monospace';
    ctx.fillStyle = '#34D399';
    ctx.textBaseline = 'middle';
    ctx.fillText(tp, padX + 44, curY + 18);
    ctx.textBaseline = 'alphabetic';
    curY += 44;
  });
  curY += 12;

  ctx.font = '700 20px "Space Grotesk", monospace';
  ctx.fillStyle = '#2DD4BF';
  ctx.fillText('>>> READY TO EXECUTE? Connect below to schedule screening ▋', padX + 28, curY);
}

/**
 * HIRING-10: Executive Leadership & Sales Spotlight
 */
async function renderHiringExecutiveLeadership({
  ctx, width, height, post, style, role, exp, loc, salary, qualification, padX, contentTopY, footerY, isLandscape
}) {
  const hasBg = Boolean(ctx.__hasBackgroundImage);
  let curY = contentTopY;
  const maxW = width - padX * 2;

  // Laurel / Executive Pill
  drawRoundRect(ctx, padX, curY, 280, 42, 21);
  ctx.fillStyle = hasBg ? 'rgba(0, 128, 128, 0.40)' : TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.font = '900 17px "Outfit", sans-serif';
  ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('👑  EXECUTIVE LEADERSHIP', padX + 140, curY + 21);
  curY += 64;

  // Massive Headline
  ctx.font = '900 68px "Outfit", "Bricolage Grotesque", sans-serif';
  ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
  if (hasBg) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
    ctx.shadowBlur = 10;
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('WE ARE SEEKING', padX, curY);
  ctx.shadowBlur = 0;
  curY += 72;

  ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
  wrapText(ctx, role.toUpperCase(), maxW).slice(0, 2).forEach(l => {
    ctx.fillText(l, padX, curY);
    curY += 74;
  });
  curY += 16;

  // 4 Executive Requirement Cards
  const reqs = [
    { title: 'Executive Scope', val: 'Drive cross-functional team scale & high-velocity output.' },
    { title: 'Track Record', val: `${exp} proven excellence in engineering or sales leadership.` },
    { title: 'Location & Mode', val: `${loc} with executive travel & equity incentives.` },
    { title: 'Target Compensation', val: `${salary} + generous equity & leadership bonus.` }
  ];

  const cardW = Math.round((maxW - 20) / 2);
  const cardH = 92;

  reqs.forEach((r, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cx = padX + (col * (cardW + 20));
    const cy = curY + (row * (cardH + 16));

    drawWhiteTealCard({ ctx, x: cx, y: cy, w: cardW, h: cardH, radius: 14 });

    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#2DD4BF' : TEAL_PRIMARY;
    ctx.fillText(r.title, cx + 20, cy + 20);

    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEXT_DARK;
    if (hasBg) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
      ctx.shadowBlur = 6;
    }
    let dy = cy + 48;
    wrapText(ctx, r.val, cardW - 40).slice(0, 2).forEach(l => {
      ctx.fillText(l, cx + 20, dy);
      dy += 22;
    });
    ctx.shadowBlur = 0;
  });
  curY += (cardH * 2) + 36;

  // Bottom Executive Perks Strip
  drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: 76, radius: 14 });

  const execPerks = ['Board of Directors Advisory', 'Uncapped Leadership Equity', 'Global Executive Relocation'];
  const epW = Math.round(maxW / 3);
  execPerks.forEach((ep, idx) => {
    const epx = padX + (idx * epW);
    ctx.font = '800 15px "Outfit", sans-serif';
    ctx.fillStyle = hasBg ? '#FFFFFF' : TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ep, epx + epW / 2, curY + 38);
  });
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

/**
 * Helper to draw and clip an image strictly inside a polygon chamber
 */
function drawClippedDetailImage(ctx, img, bboxX, bboxY, bboxW, bboxH, clipPathFn, scrimAlpha = 0.44) {
  if (!img || !img.width) return;
  ctx.save();
  ctx.beginPath();
  clipPathFn();
  ctx.clip();

  const scale = Math.max(bboxW / img.width, bboxH / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = bboxX + (bboxW - dw) / 2;
  const dy = bboxY + (bboxH - dw) / 2;

  ctx.drawImage(img, dx, dy, dw, dh);

  if (scrimAlpha > 0) {
    ctx.fillStyle = `rgba(15, 23, 42, ${scrimAlpha})`;
    ctx.fill();
  }
  ctx.restore();
}

/**
 * HIRING-11: Scallop Cloud Wave Split
 * Modern Executive Typography & Front Design:
 * - Top-Left: Solid White Role Chamber with ultra-clean geometric typography (NO cursive)
 * - Right & Bottom: Photo Image Detail Chamber with frosted specular glass cards
 */
async function renderHiringScallopCloud({
  ctx, width, height, post, style, role, exp, loc, salary, qualification, employmentType, techStack, padX, contentTopY, footerY, isLandscape, topicImg
}) {
  const maxW = width - padX * 2;
  const availH = footerY - contentTopY;

  const cloudW = Math.round(width * (isLandscape ? 0.46 : 0.50));
  const cloudH = Math.round(availH * (isLandscape ? 0.74 : 0.60));
  const cloudBottomY = contentTopY + cloudH;

  // Path definition for Top-Left Scallop Cloud with smooth, architectural curves
  const pathScallopRole = () => {
    ctx.moveTo(padX - 8, contentTopY - 10);
    ctx.lineTo(padX + cloudW, contentTopY - 10);

    const p1x = padX + cloudW;
    const p1y = contentTopY - 10;
    const p2x = padX + cloudW * 0.92;
    const p2y = contentTopY + cloudH * 0.30;
    const p3x = padX + cloudW * 0.72;
    const p3y = contentTopY + cloudH * 0.64;
    const p4x = padX + cloudW * 0.38;
    const p4y = cloudBottomY;
    const p5x = padX - 8;
    const p5y = cloudBottomY;

    ctx.bezierCurveTo(p1x + 12, contentTopY + cloudH * 0.12, p2x + 18, p2y - 18, p2x, p2y);
    ctx.bezierCurveTo(p2x - 12, p2y + 36, p3x + 24, p3y - 12, p3x, p3y);
    ctx.bezierCurveTo(p3x - 18, p3y + 36, p4x + 24, p4y + 8, p4x, p4y);
    ctx.lineTo(p5x, p5y);
    ctx.closePath();
  };

  // 1. HIRING DETAIL: IMAGE BACKGROUND (Right & Bottom Area)
  const detailImg = topicImg || (post?.uploadedImage && post.uploadedImage.width ? post.uploadedImage : null);
  if (detailImg && detailImg.width) {
    drawClippedDetailImage(
      ctx,
      detailImg,
      padX - 8,
      contentTopY - 10,
      width - padX * 2 + 16,
      availH + 20,
      () => {
        drawRoundRect(ctx, padX - 8, contentTopY - 10, width - padX * 2 + 16, availH + 20, 18);
      },
      0.46
    );
  } else {
    ctx.save();
    drawRoundRect(ctx, padX - 8, contentTopY - 10, width - padX * 2 + 16, availH + 20, 18);
    const grad = ctx.createLinearGradient(padX, contentTopY, width - padX, footerY);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(1, '#1E293B');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  // 2. HIRING ROLE: SOLID PURE WHITE BACKGROUND
  ctx.save();
  ctx.beginPath();
  pathScallopRole();
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Modern dual rim border
  ctx.strokeStyle = 'rgba(0, 128, 128, 0.40)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // 3. Content inside Top-Left Scallop (EXECUTIVE MODERN TYPOGRAPHY ON WHITE)
  let roleCurY = contentTopY + 18;
  const roleBoxW = cloudW - 36;

  // Executive Kicker Capsule
  ctx.save();
  const kickerH = 28;
  const kickerW = Math.min(210, roleBoxW);
  drawRoundRect(ctx, padX + 16, roleCurY, kickerW, kickerH, 8);
  ctx.fillStyle = 'rgba(0, 128, 128, 0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 128, 128, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  drawBriefcaseIcon(ctx, padX + 30, roleCurY + 14, 14, TEAL_PRIMARY);

  ctx.font = '800 11.5px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('WE ARE HIRING', padX + 44, roleCurY + 14);
  ctx.restore();
  roleCurY += kickerH + 18;

  // Executive Over-title
  ctx.save();
  ctx.font = '800 12.5px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('OFFICIAL RECRUITMENT DRIVE', padX + 16, roleCurY);
  ctx.restore();
  roleCurY += 22;

  // Giant Job Role Title in ultra-bold geometric font (Bricolage Grotesque / Outfit)
  ctx.save();
  const roleFs = isLandscape ? 30 : 36;
  const roleLh = isLandscape ? 36 : 42;
  ctx.font = `900 ${roleFs}px "Bricolage Grotesque", "Outfit", sans-serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const roleLines = wrapText(ctx, role, roleBoxW).slice(0, 3);
  roleLines.forEach((line) => {
    ctx.fillText(line, padX + 16, roleCurY);
    roleCurY += roleLh;
  });
  ctx.restore();
  roleCurY += 14;

  // Level & Work Mode Pills inside white scallop
  const subPills = [exp, employmentType];
  let subPx = padX + 16;
  subPills.forEach((p) => {
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    const pw = ctx.measureText(p).width + 22;
    drawRoundRect(ctx, subPx, roleCurY, pw, 28, 7);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = TEXT_DARK;
    ctx.textBaseline = 'middle';
    ctx.fillText(p, subPx + 11, roleCurY + 14);
    subPx += pw + 8;
  });

  // 4. Content inside Right & Bottom ("hiring detail" - HIGH-CONTRAST ON IMAGE)
  const rightStartX = padX + cloudW + (isLandscape ? 18 : 22);
  const rightW = width - rightStartX - padX;

  let rCurY = contentTopY + 10;
  // Role Tagline / Mission over image
  if (post?.tagline) {
    ctx.save();
    ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 8;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const tagLines = wrapText(ctx, post.tagline, rightW).slice(0, 2);
    tagLines.forEach((tl) => {
      ctx.fillText(tl, rightStartX, rCurY);
      rCurY += 20;
    });
    ctx.restore();
    rCurY += 14;
  }

  // Right-side 2 Spec Cards (Salary & Location) in frosted glass
  const topSpecCards = [
    { label: 'COMPENSATION', val: salary, icon: 'zap' },
    { label: 'WORK LOCATION', val: loc, icon: 'target' }
  ];
  const topCardH = isLandscape ? 68 : 76;
  topSpecCards.forEach((sc, idx) => {
    const cy = rCurY + (idx * (topCardH + 10));
    drawWhiteTealCard({ ctx, x: rightStartX, y: cy, w: rightW, h: topCardH, radius: 12, hasBg: true });

    const icx = rightStartX + 20;
    const icy = cy + topCardH / 2;
    if (sc.icon === 'zap') drawZapIcon(ctx, icx, icy, 16, '#2DD4BF');
    else drawTargetIcon(ctx, icx, icy, 16, '#2DD4BF');

    ctx.font = '800 11px "Outfit", sans-serif';
    ctx.fillStyle = '#2DD4BF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(sc.label, rightStartX + 42, cy + 14);

    ctx.font = '800 14.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(sc.val, rightStartX + 42, cy + 34);
  });

  // Lower Span Area: Requirements Checklist + Tech Stack over image
  const bottomStartY = Math.max(cloudBottomY + 16, rCurY + (topSpecCards.length * (topCardH + 10)) + 16);
  let bCurY = bottomStartY;
  const fullW = width - padX * 2;

  const reqList = (Array.isArray(post?.keyPoints) && post.keyPoints.length > 0)
    ? post.keyPoints.slice(0, 3)
    : [
      'Solid knowledge of modern technologies and frameworks.',
      'Build scalable and high-performance applications.',
      'Work collaboratively in a cross-functional team.'
    ];

  const reqCardH = Math.min(136, footerY - bCurY - (isLandscape ? 90 : 110));
  if (reqCardH > 80) {
    drawWhiteTealCard({ ctx, x: padX, y: bCurY, w: fullW, h: reqCardH, radius: 14, hasBg: true });

    ctx.font = '800 12px "Outfit", sans-serif';
    ctx.fillStyle = '#2DD4BF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('KEY ROLE RESPONSIBILITIES & CRITERIA', padX + 16, bCurY + 14);

    const itemLineH = 24;
    reqList.forEach((req, idx) => {
      const iy = bCurY + 38 + (idx * itemLineH);
      if (iy + 16 < bCurY + reqCardH) {
        drawCheckmarkIcon(ctx, padX + 24, iy + 6, 12, '#2DD4BF');
        ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'middle';
        const cleanReq = String(req).replace(/^[✓•\-\*]\s*/, '').trim();
        const shortReq = wrapText(ctx, cleanReq, fullW - 54)[0] || cleanReq;
        ctx.fillText(shortReq, padX + 38, iy + 6);
      }
    });

    bCurY += reqCardH + 12;
  }

  // Tech Stack Pills Row over image
  if (footerY - bCurY > 40) {
    drawTechStackPillsRow(ctx, padX, bCurY, fullW, 38, techStack);
  }
}

/**
 * HIRING-12: Diagonal S-Curve Stream
 * Modern Executive Typography & Front Design:
 * - Upper-Right: Solid White Role Chamber with clean geometric bold headlines (NO cursive)
 * - Lower-Left: Photo Image Detail Chamber with frosted specular glass specs & checklist
 */
async function renderHiringDiagonalSCurve({
  ctx, width, height, post, style, role, exp, loc, salary, qualification, employmentType, techStack, padX, contentTopY, footerY, isLandscape, topicImg
}) {
  const maxW = width - padX * 2;
  const availH = footerY - contentTopY;

  const sx1 = Math.round(width * 0.36);
  const sy1 = contentTopY - 10;
  const sx2 = Math.round(width * 0.72);
  const sy2 = footerY + 10;

  // Path for Lower-Left Chamber ("h detail" - IMAGE)
  const pathDetailChamber = () => {
    ctx.moveTo(padX - 8, sy1);
    ctx.lineTo(sx1, sy1);
    ctx.bezierCurveTo(
      width * 0.38, contentTopY + availH * 0.32,
      width * 0.65, contentTopY + availH * 0.68,
      sx2, sy2
    );
    ctx.lineTo(padX - 8, sy2);
    ctx.closePath();
  };

  // Path for Upper-Right Chamber ("hiring role" - WHITE)
  const pathRoleChamber = () => {
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(width - padX + 8, sy1);
    ctx.lineTo(width - padX + 8, sy2);
    ctx.lineTo(sx2, sy2);
    ctx.bezierCurveTo(
      width * 0.65, contentTopY + availH * 0.68,
      width * 0.38, contentTopY + availH * 0.32,
      sx1, sy1
    );
    ctx.closePath();
  };

  // 1. HIRING DETAIL: IMAGE BACKGROUND (Lower-Left Chamber)
  const detailImg = topicImg || (post?.uploadedImage && post.uploadedImage.width ? post.uploadedImage : null);
  if (detailImg && detailImg.width) {
    drawClippedDetailImage(
      ctx,
      detailImg,
      padX - 8,
      sy1,
      sx2 - padX + 16,
      availH + 20,
      pathDetailChamber,
      0.46
    );
  } else {
    ctx.save();
    ctx.beginPath();
    pathDetailChamber();
    const grad = ctx.createLinearGradient(padX, sy1, sx2, sy2);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(1, '#1E293B');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  // 2. HIRING ROLE: SOLID PURE WHITE BACKGROUND (Upper-Right Chamber)
  ctx.save();
  ctx.beginPath();
  pathRoleChamber();
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = -4;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Glowing S-curve divider stroke
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.bezierCurveTo(
    width * 0.38, contentTopY + availH * 0.32,
    width * 0.65, contentTopY + availH * 0.68,
    sx2, sy2
  );
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 3. Upper-Right Chamber Content (EXECUTIVE MODERN TYPOGRAPHY ON WHITE)
  const roleStartX = Math.round(width * (isLandscape ? 0.44 : 0.48));
  const roleW = width - roleStartX - padX;
  let roleY = contentTopY + 20;

  // Executive Kicker Capsule
  ctx.save();
  ctx.font = '800 11.5px "Outfit", sans-serif';
  const roleBadgeW = Math.min(220, roleW);
  drawRoundRect(ctx, roleStartX, roleY, roleBadgeW, 28, 8);
  ctx.fillStyle = 'rgba(0, 128, 128, 0.08)';
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡ IMMEDIATE RECRUITMENT', roleStartX + roleBadgeW / 2, roleY + 14);
  ctx.restore();
  roleY += 40;

  // Main Display "WE ARE HIRING" in Ultra-Bold Grotesque (NO cursive!)
  ctx.save();
  ctx.font = `900 ${isLandscape ? 48 : 58}px "Bricolage Grotesque", "Outfit", sans-serif`;
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('WE ARE', roleStartX, roleY);
  roleY += isLandscape ? 46 : 56;

  ctx.fillStyle = TEXT_DARK;
  ctx.fillText('HIRING', roleStartX, roleY);
  ctx.restore();
  roleY += (isLandscape ? 52 : 64);

  // Job Role Title
  ctx.save();
  const rFs = isLandscape ? 28 : 34;
  const rLh = isLandscape ? 34 : 40;
  ctx.font = `900 ${rFs}px "Outfit", sans-serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const rLines = wrapText(ctx, role, roleW).slice(0, 2);
  rLines.forEach((l) => {
    ctx.fillText(l, roleStartX, roleY);
    roleY += rLh;
  });
  ctx.restore();
  roleY += 12;

  // Mission Tagline
  if (post?.tagline) {
    ctx.save();
    ctx.font = '600 13.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const tagLines = wrapText(ctx, post.tagline, roleW).slice(0, 2);
    tagLines.forEach((tl) => {
      ctx.fillText(tl, roleStartX, roleY);
      roleY += 19;
    });
    ctx.restore();
  }

  // 4. Lower-Left Chamber Content ("h detail" - HIGH CONTRAST ON IMAGE)
  const leftW = Math.round(width * (isLandscape ? 0.36 : 0.40));
  let dCurY = contentTopY + 14;

  const specs = [
    { label: 'QUALIFICATION', val: qualification },
    { label: 'EXPERIENCE', val: exp },
    { label: 'LOCATION', val: loc },
    { label: 'COMPENSATION', val: salary }
  ];

  const cardH = isLandscape ? 58 : 66;
  specs.forEach((s) => {
    drawWhiteTealCard({ ctx, x: padX, y: dCurY, w: leftW, h: cardH, radius: 10, hasBg: true });

    ctx.font = '800 11px "Outfit", sans-serif';
    ctx.fillStyle = '#2DD4BF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(s.label, padX + 16, dCurY + 12);

    ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(s.val, padX + 16, dCurY + 32);

    dCurY += cardH + 10;
  });

  // Requirements Box over image
  dCurY += 6;
  const reqH = Math.min(130, footerY - dCurY - 48);
  if (reqH > 70) {
    drawWhiteTealCard({ ctx, x: padX, y: dCurY, w: maxW, h: reqH, radius: 14, hasBg: true });

    ctx.font = '800 12px "Outfit", sans-serif';
    ctx.fillStyle = '#2DD4BF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('CRITICAL REQUIREMENTS & EXPECTATIONS', padX + 18, dCurY + 14);

    const pts = (post?.keyPoints || ['Proven track record in high-impact engineering', 'Clear communicator with high autonomy', 'Passion for AI velocity']).slice(0, 3);
    pts.forEach((p, pIdx) => {
      const py = dCurY + 38 + (pIdx * 24);
      if (py + 16 < dCurY + reqH) {
        drawCheckmarkIcon(ctx, padX + 26, py + 4, 12, '#2DD4BF');
        ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'middle';
        const cleanPt = String(p).replace(/^[✓•\-\*]\s*/, '').trim();
        ctx.fillText(cleanPt, padX + 42, py + 4);
      }
    });

    dCurY += reqH + 12;
  }

  // Tech stack pills row
  if (footerY - dCurY > 38) {
    drawTechStackPillsRow(ctx, padX, dCurY, maxW, 36, techStack);
  }
}

/**
 * HIRING-13: Mountain Canopy Summit
 * Modern Executive Typography & Front Design:
 * - Upper Summit: Solid White Role Chamber with prominent centered typography
 * - Lower Canopy: Photo Image Detail Chamber with structured 2-column frosted glass cards
 */
async function renderHiringMountainCanopy({
  ctx, width, height, post, style, role, exp, loc, salary, qualification, employmentType, techStack, padX, contentTopY, footerY, isLandscape, topicImg
}) {
  const maxW = width - padX * 2;
  const availH = footerY - contentTopY;

  const peakX = width * 0.50;
  const peakY = contentTopY + Math.round(availH * (isLandscape ? 0.36 : 0.30));
  const leftRidgeY = contentTopY + Math.round(availH * (isLandscape ? 0.54 : 0.48));
  const rightRidgeY = contentTopY + Math.round(availH * (isLandscape ? 0.58 : 0.52));

  // Path for Lower Canopy ("h d" - IMAGE)
  const pathCanopyChamber = () => {
    ctx.moveTo(padX - 10, leftRidgeY);
    ctx.quadraticCurveTo(width * 0.28, peakY + 10, peakX, peakY);
    ctx.quadraticCurveTo(width * 0.72, peakY + 10, width - padX + 10, rightRidgeY);
    ctx.lineTo(width - padX + 10, footerY + 10);
    ctx.lineTo(padX - 10, footerY + 10);
    ctx.closePath();
  };

  // Path for Upper Summit ("hiring role" - WHITE)
  const pathSummitChamber = () => {
    ctx.moveTo(padX - 10, contentTopY - 10);
    ctx.lineTo(width - padX + 10, contentTopY - 10);
    ctx.lineTo(width - padX + 10, rightRidgeY);
    ctx.quadraticCurveTo(width * 0.72, peakY + 10, peakX, peakY);
    ctx.quadraticCurveTo(width * 0.28, peakY + 10, padX - 10, leftRidgeY);
    ctx.closePath();
  };

  // 1. HIRING DETAIL: IMAGE BACKGROUND (Lower Canopy under mountain)
  const detailImg = topicImg || (post?.uploadedImage && post.uploadedImage.width ? post.uploadedImage : null);
  if (detailImg && detailImg.width) {
    drawClippedDetailImage(
      ctx,
      detailImg,
      padX - 10,
      peakY,
      width - padX * 2 + 20,
      footerY - peakY + 10,
      pathCanopyChamber,
      0.46
    );
  } else {
    ctx.save();
    ctx.beginPath();
    pathCanopyChamber();
    const grad = ctx.createLinearGradient(peakX, peakY, peakX, footerY);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(1, '#1E293B');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  // 2. HIRING ROLE: SOLID PURE WHITE BACKGROUND (Upper Summit Section)
  ctx.save();
  ctx.beginPath();
  pathSummitChamber();
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Mountain Ridge Stroke
  ctx.beginPath();
  ctx.moveTo(padX - 10, leftRidgeY);
  ctx.quadraticCurveTo(width * 0.28, peakY + 10, peakX, peakY);
  ctx.quadraticCurveTo(width * 0.72, peakY + 10, width - padX + 10, rightRidgeY);
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.restore();

  // 3. Summit Section Above Ridge (EXECUTIVE MODERN TYPOGRAPHY ON WHITE)
  let sCurY = contentTopY + 14;

  // Header Pill
  ctx.save();
  const summitBadgeW = 240;
  const sbx = (width - summitBadgeW) / 2;
  drawRoundRect(ctx, sbx, sCurY, summitBadgeW, 28, 8);
  ctx.fillStyle = 'rgba(0, 128, 128, 0.08)';
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.font = '800 11.5px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🌟 CAREER LAUNCHPAD // 2026', width / 2, sCurY + 14);
  ctx.restore();
  sCurY += 38;

  // Headline: "WE ARE HIRING" Kicker
  ctx.save();
  ctx.font = '800 14px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('JOIN OUR CORE ENGINEERING TEAM', width / 2, sCurY);
  ctx.restore();
  sCurY += 22;

  // Giant Job Role Title in rich dark slate
  ctx.save();
  const titleFs = isLandscape ? 34 : 42;
  const titleLh = isLandscape ? 38 : 46;
  ctx.font = `900 ${titleFs}px "Bricolage Grotesque", "Outfit", sans-serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const roleLines = wrapText(ctx, role, maxW - 40).slice(0, 2);
  roleLines.forEach((l) => {
    ctx.fillText(l, width / 2, sCurY);
    sCurY += titleLh;
  });
  ctx.restore();
  sCurY += 8;

  // Quick Highlights Row under title
  const topPills = [exp, loc, salary];
  const tpW = Math.round((maxW - 30) / 3);
  topPills.forEach((p, idx) => {
    const px = padX + (idx * (tpW + 15));
    drawRoundRect(ctx, px, sCurY, tpW, 30, 8);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p, px + tpW / 2, sCurY + 15);
  });

  // 4. Lower Canopy Section Below Ridge ("h d" - HIGH CONTRAST ON IMAGE)
  const canopyStartY = peakY + 44;
  let cCurY = canopyStartY;

  const colGap = 16;
  const colW = Math.round((maxW - colGap) / 2);
  const leftColX = padX;
  const rightColX = padX + colW + colGap;

  const colCardH = Math.min(230, footerY - cCurY - 48);

  // Left Column: Key Deliverables (Frosted Glass over Image)
  drawWhiteTealCard({ ctx, x: leftColX, y: cCurY, w: colW, h: colCardH, radius: 14, hasBg: true });

  ctx.font = '800 12px "Outfit", sans-serif';
  ctx.fillStyle = '#2DD4BF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('CORE RESPONSIBILITIES & DELIVERABLES', leftColX + 18, cCurY + 16);

  const deliverables = (post?.keyPoints || [
    'Architect resilient production cloud systems',
    'Automate CI/CD pipelines with sub-second feedback',
    'Empower team through mentorship & design reviews',
    'Optimize latency & infrastructure cost efficiency'
  ]).slice(0, 4);

  deliverables.forEach((d, idx) => {
    const dy = cCurY + 44 + (idx * 34);
    if (dy + 20 < cCurY + colCardH) {
      drawCheckmarkIcon(ctx, leftColX + 26, dy + 6, 12, '#2DD4BF');
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textBaseline = 'middle';
      const cleanD = String(d).replace(/^[✓•\-\*]\s*/, '').trim();
      const wrapD = wrapText(ctx, cleanD, colW - 54)[0] || cleanD;
      ctx.fillText(wrapD, leftColX + 42, dy + 6);
    }
  });

  // Right Column: Specifications & Perks (Frosted Glass over Image)
  drawWhiteTealCard({ ctx, x: rightColX, y: cCurY, w: colW, h: colCardH, radius: 14, hasBg: true });

  ctx.font = '800 12px "Outfit", sans-serif';
  ctx.fillStyle = '#2DD4BF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('ROLE SPECIFICATIONS & PERKS', rightColX + 18, cCurY + 16);

  const rightSpecs = [
    { label: 'Qualification', val: qualification },
    { label: 'Employment', val: employmentType },
    { label: 'Package', val: salary }
  ];

  rightSpecs.forEach((rs, idx) => {
    const rsy = cCurY + 44 + (idx * 36);
    if (rsy + 20 < cCurY + colCardH) {
      ctx.font = '700 11.5px "Outfit", sans-serif';
      ctx.fillStyle = '#2DD4BF';
      ctx.textBaseline = 'top';
      ctx.fillText(rs.label.toUpperCase(), rightColX + 20, rsy);

      ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(rs.val, rightColX + 20, rsy + 16);
    }
  });

  // Bottom Tech Stack row
  cCurY += colCardH + 12;
  if (footerY - cCurY > 36) {
    drawTechStackPillsRow(ctx, padX, cCurY, maxW, 36, techStack);
  }
}

/**
 * HIRING-14: Upward Dynamic Arc Slash
 * Modern Executive Typography & Front Design:
 * - Left Arc: Solid White Role Chamber with bold structured typography
 * - Right Chamber: Photo Image Detail Chamber with 2x2 specs and checklist
 */
async function renderHiringUpwardArc({
  ctx, width, height, post, style, role, exp, loc, salary, qualification, employmentType, techStack, padX, contentTopY, footerY, isLandscape, topicImg
}) {
  const maxW = width - padX * 2;
  const availH = footerY - contentTopY;

  const arcStartX = padX - 10;
  const arcStartY = footerY + 10;
  const arcEndX = Math.round(width * (isLandscape ? 0.38 : 0.44));
  const arcEndY = contentTopY - 10;

  // Path for Left Arc ("hiring R" - WHITE)
  const pathRoleArc = () => {
    ctx.moveTo(arcStartX, arcEndY);
    ctx.lineTo(arcEndX, arcEndY);
    ctx.quadraticCurveTo(width * 0.16, contentTopY + availH * 0.45, arcStartX, arcStartY);
    ctx.closePath();
  };

  // Path for Right Chamber ("h d" - IMAGE)
  const pathDetailChamber = () => {
    ctx.moveTo(arcEndX, arcEndY);
    ctx.lineTo(width - padX + 10, arcEndY);
    ctx.lineTo(width - padX + 10, arcStartY);
    ctx.lineTo(arcStartX, arcStartY);
    ctx.quadraticCurveTo(width * 0.16, contentTopY + availH * 0.45, arcEndX, arcEndY);
    ctx.closePath();
  };

  // 1. HIRING DETAIL: IMAGE BACKGROUND (Right Expansive Chamber)
  const detailImg = topicImg || (post?.uploadedImage && post.uploadedImage.width ? post.uploadedImage : null);
  if (detailImg && detailImg.width) {
    drawClippedDetailImage(
      ctx,
      detailImg,
      arcStartX,
      arcEndY,
      width - padX * 2 + 20,
      availH + 20,
      pathDetailChamber,
      0.46
    );
  } else {
    ctx.save();
    ctx.beginPath();
    pathDetailChamber();
    const grad = ctx.createLinearGradient(arcEndX, arcEndY, width - padX, arcStartY);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(1, '#1E293B');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  // 2. HIRING ROLE: SOLID PURE WHITE BACKGROUND (Left Arc Chamber)
  ctx.save();
  ctx.beginPath();
  pathRoleArc();
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 4;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Glowing arc curve divider
  ctx.beginPath();
  ctx.moveTo(arcEndX, arcEndY);
  ctx.quadraticCurveTo(width * 0.16, contentTopY + availH * 0.45, arcStartX, arcStartY);
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.restore();

  // 3. Left Arc Chamber Content (EXECUTIVE MODERN TYPOGRAPHY ON WHITE)
  const leftW = Math.round(width * (isLandscape ? 0.34 : 0.38));
  let lCurY = contentTopY + 18;

  // Kicker pill
  ctx.save();
  const arcBadgeW = Math.min(190, leftW - 20);
  drawRoundRect(ctx, padX + 10, lCurY, arcBadgeW, 28, 8);
  ctx.fillStyle = 'rgba(0, 128, 128, 0.08)';
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.font = '800 11.5px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WE ARE HIRING', padX + 10 + arcBadgeW / 2, lCurY + 14);
  ctx.restore();
  lCurY += 40;

  // Over-title
  ctx.save();
  ctx.font = '800 12px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('OPEN POSITION', padX + 10, lCurY);
  ctx.restore();
  lCurY += 20;

  // Big Role Headline in dark slate
  ctx.save();
  const arcFs = isLandscape ? 28 : 34;
  const arcLh = isLandscape ? 34 : 40;
  ctx.font = `900 ${arcFs}px "Bricolage Grotesque", "Outfit", sans-serif`;
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const rLines = wrapText(ctx, role, leftW - 24).slice(0, 3);
  rLines.forEach((l) => {
    ctx.fillText(l, padX + 10, lCurY);
    lCurY += arcLh;
  });
  ctx.restore();
  lCurY += 14;

  // Role Meta Badges inside White Arc Chamber
  const leftPills = [exp, employmentType, salary];
  leftPills.forEach((p) => {
    drawRoundRect(ctx, padX + 10, lCurY, leftW - 30, 32, 8);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '700 12.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(p, padX + 22, lCurY + 16);
    lCurY += 40;
  });

  // 4. Right Expansive Chamber Content ("h d" - HIGH CONTRAST ON IMAGE)
  const rightStartX = padX + leftW + (isLandscape ? 24 : 30);
  const rightW = width - rightStartX - padX;
  let rCurY = contentTopY + 12;

  // Tagline
  if (post?.tagline) {
    ctx.save();
    ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 8;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const tagLines = wrapText(ctx, post.tagline, rightW).slice(0, 2);
    tagLines.forEach((tl) => {
      ctx.fillText(tl, rightStartX, rCurY);
      rCurY += 20;
    });
    ctx.restore();
    rCurY += 12;
  }

  // 2 Spec Cards (Qualification & Location) in frosted glass
  const specPairW = Math.round((rightW - 12) / 2);
  const specH = isLandscape ? 64 : 70;
  const specCards = [
    { label: 'QUALIFICATION', val: qualification },
    { label: 'WORK LOCATION', val: loc }
  ];

  specCards.forEach((sc, idx) => {
    const scx = rightStartX + (idx * (specPairW + 12));
    drawWhiteTealCard({ ctx, x: scx, y: rCurY, w: specPairW, h: specH, radius: 12, hasBg: true });

    ctx.font = '800 11px "Outfit", sans-serif';
    ctx.fillStyle = '#2DD4BF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(sc.label, scx + 16, rCurY + 12);

    ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(sc.val, scx + 16, rCurY + 32);
  });
  rCurY += specH + 14;

  // Candidate Requirements Box in frosted glass
  const reqCardH = Math.min(150, footerY - rCurY - 48);
  if (reqCardH > 80) {
    drawWhiteTealCard({ ctx, x: rightStartX, y: rCurY, w: rightW, h: reqCardH, radius: 14, hasBg: true });

    ctx.font = '800 12px "Outfit", sans-serif';
    ctx.fillStyle = '#2DD4BF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('CORE QUALIFICATIONS & EXPERIENCE', rightStartX + 18, rCurY + 14);

    const pts = (post?.keyPoints || [
      'Proven expertise in architecting robust software systems',
      'Demonstrated fluency in core frameworks and vector tools',
      'High-velocity problem solver with extreme ownership'
    ]).slice(0, 3);

    pts.forEach((pt, idx) => {
      const py = rCurY + 40 + (idx * 26);
      if (py + 16 < rCurY + reqCardH) {
        drawCheckmarkIcon(ctx, rightStartX + 26, py + 4, 12, '#2DD4BF');
        ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'middle';
        const cleanPt = String(pt).replace(/^[✓•\-\*]\s*/, '').trim();
        const shortPt = wrapText(ctx, cleanPt, rightW - 54)[0] || cleanPt;
        ctx.fillText(shortPt, rightStartX + 42, py + 4);
      }
    });

    rCurY += reqCardH + 12;
  }

  // Tech stack pills row
  if (footerY - rCurY > 38) {
    drawTechStackPillsRow(ctx, rightStartX, rCurY, rightW, 36, techStack);
  }
}

/**
 * HIRING-15: Stepped Shelf Podium
 * Modern Executive Typography & Front Design:
 * - Right: Solid White Role Chamber with high-impact headline (NO cursive)
 * - Left: Photo Image Detail Chamber with stacked specifications & perks
 */
async function renderHiringSteppedShelf({
  ctx, width, height, post, style, role, exp, loc, salary, qualification, employmentType, techStack, padX, contentTopY, footerY, isLandscape, topicImg
}) {
  const maxW = width - padX * 2;
  const availH = footerY - contentTopY;

  const stepX = Math.round(width * (isLandscape ? 0.36 : 0.40));
  const topShelfY = contentTopY + Math.round(availH * 0.16);
  const bottomShelfY = footerY - Math.round(availH * 0.16);

  // Path for Left Chamber ("h d" - IMAGE)
  const pathDetailShelf = () => {
    ctx.moveTo(padX - 8, contentTopY - 10);
    ctx.lineTo(stepX, contentTopY - 10);
    ctx.lineTo(stepX, bottomShelfY);
    ctx.lineTo(width - padX + 8, bottomShelfY);
    ctx.lineTo(width - padX + 8, footerY + 10);
    ctx.lineTo(padX - 8, footerY + 10);
    ctx.closePath();
  };

  // Path for Right Chamber ("h R" - WHITE)
  const pathRoleChamber = () => {
    ctx.moveTo(stepX, contentTopY - 10);
    ctx.lineTo(width - padX + 8, contentTopY - 10);
    ctx.lineTo(width - padX + 8, bottomShelfY);
    ctx.lineTo(stepX, bottomShelfY);
    ctx.closePath();
  };

  // 1. HIRING DETAIL: IMAGE BACKGROUND (Left Chamber & Bottom Shelf)
  const detailImg = topicImg || (post?.uploadedImage && post.uploadedImage.width ? post.uploadedImage : null);
  if (detailImg && detailImg.width) {
    drawClippedDetailImage(
      ctx,
      detailImg,
      padX - 8,
      contentTopY - 10,
      width - padX * 2 + 16,
      availH + 20,
      pathDetailShelf,
      0.46
    );
  } else {
    ctx.save();
    ctx.beginPath();
    pathDetailShelf();
    const grad = ctx.createLinearGradient(padX, contentTopY, stepX, footerY);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(1, '#1E293B');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  // 2. HIRING ROLE: SOLID PURE WHITE BACKGROUND (Right Chamber)
  ctx.save();
  ctx.beginPath();
  pathRoleChamber();
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = -4;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Stepped dividing contour
  ctx.beginPath();
  ctx.moveTo(stepX, contentTopY - 10);
  ctx.lineTo(stepX, bottomShelfY);
  ctx.lineTo(width - padX + 8, bottomShelfY);
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 3. Right Chamber Content (EXECUTIVE MODERN TYPOGRAPHY ON WHITE)
  const rightStartX = stepX + (isLandscape ? 20 : 26);
  const rightW = width - rightStartX - padX;
  let rCurY = contentTopY + 20;

  // Announcement Pill
  ctx.save();
  const annW = Math.min(230, rightW);
  drawRoundRect(ctx, rightStartX, rCurY, annW, 28, 8);
  ctx.fillStyle = 'rgba(0, 128, 128, 0.08)';
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.font = '800 11.5px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🚀 EXECUTIVE HIRING DRIVE', rightStartX + annW / 2, rCurY + 14);
  ctx.restore();
  rCurY += 40;

  // Display "WE ARE HIRING" in Ultra-Bold Grotesque (NO cursive!)
  ctx.save();
  ctx.font = `900 ${isLandscape ? 38 : 46}px "Bricolage Grotesque", "Outfit", sans-serif`;
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('WE ARE HIRING', rightStartX, rCurY);
  rCurY += isLandscape ? 42 : 50;

  // Large Job Role Title in dark slate
  ctx.fillStyle = TEXT_DARK;
  const roleFs = isLandscape ? 30 : 36;
  const roleLh = isLandscape ? 36 : 42;
  ctx.font = `900 ${roleFs}px "Outfit", sans-serif`;
  const roleLines = wrapText(ctx, role, rightW).slice(0, 3);
  roleLines.forEach((l) => {
    ctx.fillText(l, rightStartX, rCurY);
    rCurY += roleLh;
  });
  ctx.restore();
  rCurY += 14;

  // Right Key Highlights Checklist Card
  const rightCardH = Math.min(140, bottomShelfY - rCurY - 12);
  if (rightCardH > 80) {
    drawWhiteTealCard({ ctx, x: rightStartX, y: rCurY, w: rightW, h: rightCardH, radius: 14, hasBg: false });

    ctx.font = '800 12px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('WHAT YOU WILL LEAD & BUILD', rightStartX + 18, rCurY + 14);

    const pts = (post?.keyPoints || [
      'Spearhead enterprise multi-agent platform architecture',
      'Drive high-concurrency real-time delivery',
      'Accelerate developer velocity and engineering craft'
    ]).slice(0, 3);

    pts.forEach((p, idx) => {
      const py = rCurY + 40 + (idx * 26);
      if (py + 16 < rCurY + rightCardH) {
        drawCheckmarkIcon(ctx, rightStartX + 26, py + 4, 12, TEAL_PRIMARY);
        ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = TEXT_DARK;
        ctx.textBaseline = 'middle';
        const cleanP = String(p).replace(/^[✓•\-\*]\s*/, '').trim();
        const shortP = wrapText(ctx, cleanP, rightW - 54)[0] || cleanP;
        ctx.fillText(shortP, rightStartX + 42, py + 4);
      }
    });

    rCurY += rightCardH + 12;
  }

  // 4. Left Chamber Content ("h d" - HIGH CONTRAST ON IMAGE)
  const leftW = stepX - padX - 16;
  let lCurY = contentTopY + 14;

  ctx.save();
  ctx.font = '800 12px "Outfit", sans-serif';
  ctx.fillStyle = '#2DD4BF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('HIRING SPECIFICATIONS', padX, lCurY);
  ctx.restore();
  lCurY += 28;

  const leftSpecs = [
    { label: 'QUALIFICATION', val: qualification },
    { label: 'EXPERIENCE', val: exp },
    { label: 'LOCATION', val: loc },
    { label: 'SALARY / PACKAGE', val: salary }
  ];

  const specCardH = isLandscape ? 58 : 64;
  leftSpecs.forEach((ls) => {
    drawWhiteTealCard({ ctx, x: padX, y: lCurY, w: leftW, h: specCardH, radius: 10, hasBg: true });

    ctx.font = '800 11px "Outfit", sans-serif';
    ctx.fillStyle = '#2DD4BF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(ls.label, padX + 14, lCurY + 10);

    ctx.font = '800 13.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(ls.val, padX + 14, lCurY + 28);

    lCurY += specCardH + 10;
  });

  // Left Tech Stack Stack
  lCurY += 6;
  if (bottomShelfY - lCurY > 40) {
    drawTechStackPillsRow(ctx, padX, lCurY, leftW, 36, techStack.slice(0, 3));
  }

  // Bottom Shelf Perks Strip over image
  const botY = bottomShelfY + 12;
  const botH = footerY - botY;
  if (botH > 32) {
    drawWhiteTealCard({ ctx, x: padX, y: botY, w: maxW, h: botH, radius: 12, hasBg: true });
    const bPerks = ['Medical Coverage', 'Annual Bonus', 'Relocation Support'];
    const bpW = Math.round(maxW / 3);
    bPerks.forEach((bp, idx) => {
      ctx.font = '800 13px "Outfit", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bp, padX + (idx * bpW) + bpW / 2, botY + botH / 2);
    });
  }
}
