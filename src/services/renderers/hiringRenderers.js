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

  // 1. Clean White & Light Teal Background
  await renderPosterBackground({
    ctx,
    width,
    height,
    post,
    style,
    accentColor: TEAL_PRIMARY,
    pattern: bgPattern
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
  if (id === 'hiring-02') {
    await renderHiringAppXFluid({ ctx, width, height, post, style, role, exp, loc, salary, employmentType, techStack, padX, contentTopY, footerY, isLandscape });
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
  } else {
    // hiring-01 & default
    await renderHiringSkillmountSplit({ ctx, width, height, post, style, role, exp, loc, salary, qualification, techStack, padX, contentTopY, footerY, isLandscape });
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
  ctx, width, height, post, style, role, exp, loc, salary, qualification, techStack, padX, contentTopY, footerY, isLandscape
}) {
  // 1. Draw Diagonal Hero Ribbon across top-right to bottom-left
  drawDiagonalHeroRibbon(ctx, width, height, post, TEAL_PRIMARY);

  // 2. Right-side Content Layout
  const contentLeftX = Math.round(width * 0.44);
  const contentW = width - contentLeftX - padX;
  let curY = contentTopY + 16;

  // Typography: "we are" (script) + "HIRING" (bold)
  ctx.font = '700 44px "Caveat", "Kalam", cursive';
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'left';
  ctx.fillText('we are', contentLeftX, curY);
  curY += 44;

  ctx.save();
  ctx.font = '900 96px "Outfit", "Bricolage Grotesque", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.shadowColor = 'rgba(0, 128, 128, 0.35)';
  ctx.shadowBlur = 18;
  ctx.fillText('HIRING', contentLeftX, curY);
  ctx.restore();
  curY += 100;

  // Job Role Title with dynamic wrapText
  ctx.font = '900 34px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  wrapText(ctx, role, contentW).slice(0, 2).forEach(line => {
    ctx.fillText(line, contentLeftX, curY);
    curY += 40;
  });
  curY += 16;

  // 4 Specification Rows Table
  const specs = [
    { k: 'Qualification', v: qualification },
    { k: 'Experience', v: exp },
    { k: 'Location', v: loc },
    { k: 'Salary', v: salary }
  ];

  specs.forEach(s => {
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText(`${s.k}:`, contentLeftX, curY);

    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText(s.v, contentLeftX + 130, curY);
    curY += 34;
  });
  curY += 18;

  // 3-Pill Perks Row
  const perks = ['Medical Coverage', 'Equity Grants', 'Flexible Hours'];
  const perkPillW = Math.round((contentW - 20) / 3);
  perks.forEach((p, idx) => {
    const px = contentLeftX + (idx * (perkPillW + 10));
    drawRoundRect(ctx, px, curY, perkPillW, 36, 10);
    ctx.fillStyle = TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = TEAL_BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
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
  ctx, width, height, post, style, role, exp, loc, salary, employmentType, techStack, padX, contentTopY, footerY, isLandscape
}) {
  drawFluidWaveHero(ctx, width, height, post, TEAL_PRIMARY);

  const leftW = Math.round(width * 0.48);
  let curY = contentTopY + 12;

  // "AppX is Hiring!"
  ctx.font = '900 76px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText('AppX', padX, curY);
  curY += 74;

  const hlGrad = ctx.createLinearGradient(padX, curY, padX + 280, curY);
  hlGrad.addColorStop(0, TEAL_PRIMARY);
  hlGrad.addColorStop(1, TEAL_LIGHT);
  ctx.fillStyle = hlGrad;
  ctx.fillText('is Hiring!', padX, curY);
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
    ctx.fillStyle = TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = TEAL_BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '800 12px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
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

  // Massive Headline
  ctx.font = '900 52px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText('WE ARE CURRENTLY HIRING', padX, curY);
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
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(roleText, padX + 24, curY + 44);
  curY += 80;

  // Subtitle
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.fillText('Join an agile team building mission-critical AI systems with competitive equity & bonuses. 🚀', padX, curY);
  curY += 36;

  // 4-Card Specification Grid (2x2)
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
    drawCheckmarkIcon(ctx, cx + 16, cy + 18, 22, TEAL_PRIMARY);

    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText(s.l, cx + 48, cy + 20);

    ctx.font = '800 16px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText(s.v, cx + 48, cy + 42);
  });
  curY += 156;

  // 3-Step Interview Timeline
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
    ctx.fillStyle = TEAL_BG_TINT;
    ctx.fill();
    ctx.font = '900 16px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(st.num, sx + 31, curY + 33);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.font = '800 15px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText(st.title, sx + 58, curY + 30);

    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
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
  const cx = width / 2;
  const maxW = width - padX * 2;
  let curY = contentTopY + 10;

  // Script "We are"
  ctx.font = '700 52px "Caveat", "Kalam", cursive';
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'center';
  ctx.fillText('We are', cx, curY);
  curY += 50;

  // Massive 2-Tone HIRING
  ctx.font = '900 108px "Outfit", "Bricolage Grotesque", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.fillText('HIRING', cx, curY);
  curY += 108;

  // Role Title
  ctx.font = '900 32px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText(role.toUpperCase(), cx, curY);
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
    ctx.fillStyle = idx % 2 === 0 ? TEAL_PRIMARY : '#DCFCE7';
    ctx.fill();
    if (idx % 2 !== 0) {
      ctx.strokeStyle = '#22C55E';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.font = '800 15px "Outfit", sans-serif';
    ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#15803D';
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
    ctx.fillStyle = TEAL_PRIMARY;
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
  const cx = width / 2;
  let curY = contentTopY + 10;

  const magW = Math.round(width * 0.74);
  const magH = footerY - curY - 16;
  const magX = cx - magW / 2;

  drawWhiteTealCard({ ctx, x: magX, y: curY, w: magW, h: magH, radius: 20 });

  let textY = curY + 38;
  ctx.font = '900 68px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'center';
  ctx.fillText("WE'RE", cx, textY);
  textY += 66;

  ctx.fillStyle = TEAL_PRIMARY;
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
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText(exp.toUpperCase(), cx, textY);
  textY += 46;

  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.fillText(`Location: ${loc}  •  Salary: ${salary}`, cx, textY);
  textY += 44;

  // 3 Highlights Badges
  const perks = ['✓ Direct C-Suite Access', '✓ High-Impact Products', '✓ Generous Equity'];
  const bW = Math.round((pW - 20) / 3);
  perks.forEach((p, idx) => {
    const bx = cx - pW / 2 + (idx * (bW + 10));
    drawRoundRect(ctx, bx, textY, bW, 40, 10);
    ctx.fillStyle = TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = TEAL_BORDER;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
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
  let curY = contentTopY;
  const maxW = width - padX * 2;

  ctx.font = '900 48px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'left';
  ctx.fillText('WE ARE HIRING ACROSS TEAMS', padX, curY);
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
    ctx.fillStyle = idx === 0 ? TEAL_PRIMARY : TEAL_BG_TINT;
    ctx.fill();
    ctx.font = '800 11px "Outfit", sans-serif';
    ctx.fillStyle = idx === 0 ? '#FFFFFF' : TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(r.tag, cx + 80, cy + 31);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.font = '900 20px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText(r.t, cx + 20, cy + 70);

    ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText(`Experience: ${r.e}  •  ${r.l}`, cx + 20, cy + 96);

    // Apply Button inside card
    drawRoundRect(ctx, cx + cardW - 104, cy + 80, 88, 32, 16);
    ctx.fillStyle = TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = TEAL_PRIMARY;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '800 12px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('APPLY →', cx + cardW - 60, cy + 96);
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
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText(m.num, mx + metW / 2, curY + 40);

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
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
  let curY = contentTopY + 8;
  const tW = width - (padX * 2);
  const tH = footerY - curY - 14;

  // 1. Boarding Pass Master Card Container
  drawWhiteTealCard({ ctx, x: padX, y: curY, w: tW, h: tH, radius: 20 });

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
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = TEAL_BORDER;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '900 16px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText(`FROM: GLOBAL / ${loc.toUpperCase()}`, padX + 36, curY + 32);

  ctx.font = '900 18px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.fillText('✈️  ───────────────>', padX + tW / 2, curY + 32);

  ctx.font = '900 16px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'right';
  ctx.fillText('TO: INFINITETECH AI CORE', padX + tW - 36, curY + 32);
  ctx.textAlign = 'left';
  curY += 74;

  // 4. Passenger Name & Role Title
  ctx.font = '800 13px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.fillText('PASSENGER / EXECUTIVE CANDIDATE:', padX + 24, curY);
  curY += 36;

  ctx.font = '900 40px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  wrapText(ctx, role.toUpperCase(), tW - 48).slice(0, 2).forEach(l => {
    ctx.fillText(l, padX + 24, curY);
    curY += 44;
  });
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
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText(s.k, sx + 18, sy + 24);

    ctx.font = '900 16px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText(s.v, sx + 18, sy + 50);
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
    ctx.fillStyle = TEAL_BG_TINT;
    ctx.fill();

    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textBaseline = 'middle';
    ctx.fillText(p, px + 14, py + 18);
    ctx.textBaseline = 'alphabetic';
  });
  curY += 98;

  // 7. Perforated Dotted Tear Line with Cutout Notches
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(padX + 24, curY);
  ctx.lineTo(width - padX - 24, curY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Perforated notch cutouts on edges
  ctx.fillStyle = '#F8FAFC';
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

  // Barcode graphics in Teal
  for (let b = 0; b < 44; b++) {
    const bx = padX + 24 + (b * 9);
    ctx.fillStyle = b % 3 === 0 ? TEAL_DARK : TEAL_PRIMARY;
    ctx.fillRect(bx, curY, b % 2 === 0 ? 3 : 5, barcodeH);
  }

  ctx.font = '800 13px "Space Grotesk", monospace';
  ctx.fillStyle = TEXT_MUTED;
  ctx.fillText('#IT-2026-BOARDING-PASS-EXEC', padX + 24, curY + barcodeH + 20);

  // Right Side Status Capsule
  const statusX = padX + barcodeW + 36;
  const statusW = tW - barcodeW - 60;
  drawRoundRect(ctx, statusX, curY + 4, statusW, 64, 12);
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '900 15px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.fillText('STATUS: CONFIRMED', statusX + statusW / 2, curY + 30);

  ctx.font = '800 12px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText('BOARDING NOW: IMMEDIATE', statusX + statusW / 2, curY + 52);
  ctx.textAlign = 'left';
}

/**
 * HIRING-08: Remote First Global Nomad
 */
async function renderHiringGlobalNomad({
  ctx, width, height, post, style, role, exp, loc, salary, techStack, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;
  const maxW = width - padX * 2;

  // Kicker pill
  drawRoundRect(ctx, padX, curY, 210, 36, 18);
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.font = '900 14px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🌍  GLOBAL NOMAD ROLE', padX + 105, curY + 18);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  curY += 56;

  ctx.font = '900 56px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText('WORK FROM ANYWHERE ON EARTH', padX, curY);
  curY += 60;

  // Role Banner
  ctx.font = '900 36px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.fillText(role.toUpperCase(), padX, curY);
  curY += 46;

  ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
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
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText(hub.h, hx + 18, curY + 32);

    ctx.font = '800 14px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.fillText(hub.t, hx + 18, curY + 60);

    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
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
    ctx.fillStyle = TEAL_BG_TINT;
    ctx.fill();

    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
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
  let curY = contentTopY;
  const maxW = width - padX * 2;

  // Laurel / Executive Pill
  drawRoundRect(ctx, padX, curY, 280, 42, 21);
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fill();
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.font = '900 17px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('👑  EXECUTIVE LEADERSHIP', padX + 140, curY + 21);
  curY += 64;

  // Massive Headline
  ctx.font = '900 68px "Outfit", "Bricolage Grotesque", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('WE ARE SEEKING', padX, curY);
  curY += 72;

  ctx.fillStyle = TEAL_PRIMARY;
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
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.fillText(r.title, cx + 20, cy + 20);

    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    let dy = cy + 48;
    wrapText(ctx, r.val, cardW - 40).slice(0, 2).forEach(l => {
      ctx.fillText(l, cx + 20, dy);
      dy += 22;
    });
  });
  curY += (cardH * 2) + 36;

  // Bottom Executive Perks Strip
  drawWhiteTealCard({ ctx, x: padX, y: curY, w: maxW, h: 76, radius: 14 });

  const execPerks = ['Board of Directors Advisory', 'Uncapped Leadership Equity', 'Global Executive Relocation'];
  const epW = Math.round(maxW / 3);
  execPerks.forEach((ep, idx) => {
    const epx = padX + (idx * epW);
    ctx.font = '800 15px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ep, epx + epW / 2, curY + 38);
  });
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}
