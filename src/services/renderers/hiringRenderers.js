/**
 * 10 Agency-Grade Hiring Poster Renderers in Clean White & Teal (#008080)
 * 
 * Directly inspired by the reference designs:
 * - hiring-01: Skillmount Perspective Split (diagonal velocity ribbon & warp mesh)
 * - hiring-02: AppX Fluid Wave (flowing curved wave, circular </> badge, tech stack pills)
 * - hiring-03: Codexaon Urgent Alert (megaphone badge, cloud tech chips, 2-col specs)
 * - hiring-04: Natdemy Clean Studio (brush script "We are", massive 2-tone HIRING, vacancy card)
 * - hiring-05: Howow Editorial Newspaper (folded magazine mockup with 2+ years badge)
 * - hiring-06: 4-Role Job Directory Board (2x2 multi-position openings)
 * - hiring-07: VIP Boarding Pass Ticket (perforated flight pass with barcode)
 * - hiring-08: Remote First Global Nomad (world timezone coverage & remote perks)
 * - hiring-09: Developer Terminal IDE (traffic lights & syntax-highlighted code)
 * - hiring-10: Executive Leadership Spotlight (gold laurel & executive criteria)
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

  // 1. Clean White & Light Teal Background (NO default photos)
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
    // AppX Style: Signature Fluid Wave + Circular Badge + Tech Stack Row
    await renderHiringAppXFluid({ ctx, width, height, post, style, role, exp, loc, salary, employmentType, techStack, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'hiring-03') {
    // Codexaon Style: Urgent Hiring Alert with Megaphone & Cloud Chips
    await renderHiringCodexaonAlert({ ctx, width, height, post, style, role, exp, loc, salary, qualification, techStack, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'hiring-04') {
    // Natdemy Style: Brush Script "We are" + Massive 2-Tone HIRING + Vacancy Card
    await renderHiringNatdemyStudio({ ctx, width, height, post, style, role, exp, loc, salary, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'hiring-05') {
    // Howow Style: Folded Newspaper / Magazine Cover
    await renderHiringMagazine({ ctx, width, height, post, style, role, exp, loc, salary, techStack, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'hiring-06') {
    // 4-Role Job Directory Board
    await renderHiringDirectoryGrid({ ctx, width, height, post, style, role, exp, loc, salary, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'hiring-07') {
    // VIP Boarding Pass Ticket
    await renderHiringBoardingPass({ ctx, width, height, post, style, role, exp, loc, salary, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'hiring-08') {
    // Remote First Global Nomad
    await renderHiringGlobalNomad({ ctx, width, height, post, style, role, exp, loc, salary, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'hiring-09') {
    // Developer Terminal IDE
    await renderHiringTerminalIDE({ ctx, width, height, post, style, role, exp, loc, salary, techStack, padX, contentTopY, footerY, isLandscape });
  } else if (id === 'hiring-10') {
    // Executive Sales & Growth Leadership
    await renderHiringExecutiveLeadership({ ctx, width, height, post, style, role, exp, loc, salary, qualification, padX, contentTopY, footerY, isLandscape });
  } else {
    // hiring-01 & default: Skillmount Perspective Split (diagonal velocity ribbon & warp mesh)
    await renderHiringSkillmountSplit({ ctx, width, height, post, style, role, exp, loc, salary, qualification, padX, contentTopY, footerY, isLandscape });
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
 * Reference: hiring 4.jpg
 */
async function renderHiringSkillmountSplit({
  ctx, width, height, post, style, role, exp, loc, salary, qualification, padX, contentTopY, footerY, isLandscape
}) {
  // 1. Draw Diagonal Hero Ribbon across top-right to bottom-left
  drawDiagonalHeroRibbon(ctx, width, height, post, TEAL_PRIMARY);

  // 2. Right-side Content Layout
  const contentLeftX = Math.round(width * 0.44);
  const contentW = width - contentLeftX - padX;
  let curY = contentTopY + 20;

  // Typography: "we are" (lowercase script) + "HIRING" (massive 96px bold)
  ctx.font = '700 48px "Caveat", "Kalam", cursive';
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'left';
  ctx.fillText('we are', contentLeftX, curY);
  curY += 46;

  ctx.save();
  ctx.font = '900 100px "Outfit", "Bricolage Grotesque", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.shadowColor = 'rgba(0, 128, 128, 0.35)';
  ctx.shadowBlur = 18;
  ctx.fillText('HIRING', contentLeftX, curY);
  ctx.restore();
  curY += 106;

  // Job Role Title with dynamic wrapText (never clips or overflows)
  ctx.font = '900 34px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  wrapText(ctx, role, contentW).slice(0, 2).forEach(line => {
    ctx.fillText(line, contentLeftX, curY);
    curY += 42;
  });

  // Little accent dot under the role
  ctx.beginPath();
  ctx.arc(contentLeftX + 6, curY + 6, 5, 0, Math.PI * 2);
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.fill();
  curY += 26;

  // Specification Table (Qualification, Experience, Industry, Salary, Location)
  const specs = [
    { k: 'Qualification', v: qualification },
    { k: 'Experience', v: exp },
    { k: 'Location', v: loc },
    { k: 'Salary', v: salary }
  ];

  specs.forEach(s => {
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText(`${s.k}:`, contentLeftX, curY);

    ctx.font = '900 22px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText(s.v, contentLeftX + 140, curY);
    curY += 38;
  });
}

/**
 * HIRING-02: AppX Style Fluid Wave
 * Reference: hiring 2.jpg
 */
async function renderHiringAppXFluid({
  ctx, width, height, post, style, role, exp, loc, salary, employmentType, techStack, padX, contentTopY, footerY, isLandscape
}) {
  // 1. Right side fluid wave shape with 3D </> badge
  drawFluidWaveHero(ctx, width, height, post, TEAL_PRIMARY);

  // 2. Left side content
  const leftW = Math.round(width * 0.48);
  let curY = contentTopY + 10;

  // Headline: "AppX is Hiring!"
  ctx.font = '900 78px "Outfit", "Bricolage Grotesque", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText('AppX', padX, curY);
  curY += 76;

  // Vibrant gradient "is Hiring!" with celebratory sparks
  const hlGrad = ctx.createLinearGradient(padX, curY, padX + 280, curY);
  hlGrad.addColorStop(0, TEAL_PRIMARY);
  hlGrad.addColorStop(1, TEAL_LIGHT);
  ctx.fillStyle = hlGrad;
  ctx.fillText('is Hiring!', padX, curY);

  // Festive sparks \|/ next to the exclamation mark
  const sparkX = padX + ctx.measureText('is Hiring!').width + 12;
  const sparkY = curY + 10;
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sparkX, sparkY);
  ctx.lineTo(sparkX + 10, sparkY - 14);
  ctx.moveTo(sparkX + 8, sparkY + 6);
  ctx.lineTo(sparkX + 22, sparkY + 6);
  ctx.moveTo(sparkX + 6, sparkY + 16);
  ctx.lineTo(sparkX + 16, sparkY + 28);
  ctx.stroke();
  curY += 92;

  // Role Pill Badge in solid Teal
  ctx.font = '900 20px "Outfit", sans-serif';
  const roleTextW = ctx.measureText(role).width;
  const pillW = Math.min(leftW, roleTextW + 48);
  const pillH = 46;

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
  curY += pillH + 28;

  // 3 Specification Rows (Experience, Mode, Employment) with clean dividers
  const rowH = 48;
  drawSpecificationRow(ctx, padX, curY, leftW - 20, rowH, 'briefcase', 'Experience:', exp);
  curY += rowH + 12;
  drawSpecificationRow(ctx, padX, curY, leftW - 20, rowH, 'target', 'Mode:', loc);
  curY += rowH + 12;
  drawSpecificationRow(ctx, padX, curY, leftW - 20, rowH, 'clock', 'Employment:', employmentType);
  curY += rowH + 24;

  // Bottom Floating Tech Stack Pills Capsule
  drawTechStackPillsRow(ctx, padX, curY, width - (padX * 2) - 80, 52, techStack);
}

/**
 * HIRING-03: Codexaon Urgent Alert with Megaphone
 * Reference: hiring 3.jpg
 */
async function renderHiringCodexaonAlert({
  ctx, width, height, post, style, role, exp, loc, salary, qualification, techStack, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;

  // Tilted 3D Megaphone Badge
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

  // Massive Headline: "CODEXAON IS HIRING" + Role Pill
  ctx.font = '900 52px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText('WE ARE CURRENTLY HIRING', padX, curY);
  curY += 60;

  // Vibrant Blue/Teal Role Capsule
  const roleText = `${role.toUpperCase()}!`;
  ctx.font = '900 44px "Outfit", sans-serif';
  const rW = ctx.measureText(roleText).width + 48;
  drawRoundRect(ctx, padX, curY, Math.min(width - (padX * 2), rW), 62, 14);
  const rGrad = ctx.createLinearGradient(padX, curY, padX + rW, curY + 62);
  rGrad.addColorStop(0, TEAL_PRIMARY);
  rGrad.addColorStop(1, TEAL_LIGHT);
  ctx.fillStyle = rGrad;
  ctx.shadowColor = 'rgba(0, 128, 128, 0.35)';
  ctx.shadowBlur = 16;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(roleText, padX + 24, curY + 44);
  curY += 80;

  // Subtitle capsule
  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = TEXT_MUTED;
  ctx.fillText('Looking to start your career in modern AI & Cloud? This opportunity is for you! 🚀', padX, curY);
  curY += 36;

  // 2-Column Specifications Card Grid
  const cardW = Math.round((width - (padX * 2) - 20) / 2);
  const specs = [
    { l: 'Role', v: role, icon: 'target' },
    { l: 'Location', v: loc, icon: 'target' },
    { l: 'Experience', v: exp, icon: 'briefcase' },
    { l: 'Eligibility', v: qualification, icon: 'clock' }
  ];

  specs.forEach((s, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cx = padX + (col * (cardW + 20));
    const cy = curY + (row * 64);

    drawWhiteTealCard({ ctx, x: cx, y: cy, w: cardW, h: 56, radius: 12 });
    drawCheckmarkIcon(ctx, cx + 16, cy + 18, 20, TEAL_PRIMARY);

    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText(s.l, cx + 46, cy + 18);

    ctx.font = '800 15px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText(s.v, cx + 46, cy + 38);
  });

  curY += 150;
  // Cloud Tech Chips (AWS, Docker, Kubernetes, CI/CD)
  drawTechStackPillsRow(ctx, padX, curY, width - (padX * 2), 50, techStack);
}

/**
 * HIRING-04: Natdemy Studio
 * Reference: hiring 5.jpg
 */
async function renderHiringNatdemyStudio({
  ctx, width, height, post, style, role, exp, loc, salary, padX, contentTopY, footerY, isLandscape
}) {
  const cx = width / 2;
  let curY = contentTopY + 10;

  // Script "We are" in brush cursive
  ctx.font = '700 52px "Caveat", "Kalam", cursive';
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'center';
  ctx.fillText('We are', cx, curY);
  curY += 50;

  // Massive 2-Tone HIRING in 105px bold
  ctx.font = '900 105px "Outfit", "Bricolage Grotesque", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.fillText('HIRING', cx, curY);
  curY += 108;

  // Role Title
  ctx.font = '900 28px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText(role.toUpperCase(), cx, curY);
  curY += 44;

  // Center Vacancy Card in Purple/Teal
  const cardW = 200;
  const cardH = 140;
  drawRoundRect(ctx, cx - cardW / 2, curY, cardW, cardH, 16);
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.shadowColor = 'rgba(0, 128, 128, 0.35)';
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.font = '900 72px "Outfit", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('3', cx, curY + 70);

  ctx.font = '800 14px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_BG_TINT;
  ctx.fillText('OPEN VACANCIES', cx, curY + 112);
  curY += cardH + 34;

  // Bottom Specification Badges
  const badgeW = 240;
  drawRoundRect(ctx, cx - badgeW - 10, curY, badgeW, 44, 22);
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.fill();
  ctx.font = '800 14px "Outfit", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`Experience: ${exp}`, cx - badgeW / 2 - 10, curY + 22);

  drawRoundRect(ctx, cx + 10, curY, badgeW, 44, 22);
  ctx.fillStyle = '#DCFCE7';
  ctx.fill();
  ctx.strokeStyle = '#22C55E';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#15803D';
  ctx.fillText('Freshers can also apply', cx + badgeW / 2 + 10, curY + 22);
}

/**
 * HIRING-05: Howow Editorial Magazine
 * Reference: hiring 6.jpg
 */
async function renderHiringMagazine({
  ctx, width, height, post, style, role, exp, loc, salary, techStack, padX, contentTopY, footerY, isLandscape
}) {
  const cx = width / 2;
  let curY = contentTopY + 10;

  // Realistic Folded Magazine Card
  const magW = Math.round(width * 0.72);
  const magH = footerY - curY - 30;
  const magX = cx - magW / 2;

  drawWhiteTealCard({ ctx, x: magX, y: curY, w: magW, h: magH, radius: 18 });

  let textY = curY + 36;
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
  ctx.fillText(role.toUpperCase(), cx, textY + 26);
  textY += 80;

  // Large Experience Callout (e.g. "2+ YEARS")
  ctx.font = '900 58px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText(exp.toUpperCase(), cx, textY);
  textY += 56;

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

  ctx.font = '900 48px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.textAlign = 'left';
  ctx.fillText('WE ARE HIRING ACROSS TEAMS', padX, curY);
  curY += 58;

  const roles = [
    { t: role, e: exp, l: loc },
    { t: 'Full-Stack AI Engineer', e: '2 - 4 Years', l: 'Remote' },
    { t: 'Senior Product Designer', e: '3 - 6 Years', l: 'Hybrid' },
    { t: 'Growth Marketing Lead', e: '4 - 7 Years', l: 'Bengaluru' }
  ];

  const cardW = Math.round((width - (padX * 2) - 20) / 2);
  const cardH = 110;

  roles.forEach((r, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cx = padX + (col * (cardW + 20));
    const cy = curY + (row * (cardH + 18));

    drawWhiteTealCard({ ctx, x: cx, y: cy, w: cardW, h: cardH, radius: 14 });

    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText(r.t, cx + 20, cy + 30);

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText(`Exp: ${r.e}  •  ${r.l}`, cx + 20, cy + 58);

    // Apply Button inside card
    drawRoundRect(ctx, cx + cardW - 100, cy + 68, 80, 28, 14);
    ctx.fillStyle = TEAL_BG_TINT;
    ctx.fill();
    ctx.strokeStyle = TEAL_PRIMARY;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '800 11px "Outfit", sans-serif';
    ctx.fillStyle = TEAL_PRIMARY;
    ctx.textAlign = 'center';
    ctx.fillText('APPLY →', cx + cardW - 60, cy + 82);
    ctx.textAlign = 'left';
  });
}

/**
 * HIRING-07: VIP Boarding Pass Ticket
 */
async function renderHiringBoardingPass({
  ctx, width, height, post, style, role, exp, loc, salary, padX, contentTopY, footerY, isLandscape
}) {
  const cx = width / 2;
  let curY = contentTopY + 10;

  // Boarding pass ticket container
  const tW = width - (padX * 2);
  const tH = footerY - curY - 20;

  drawWhiteTealCard({ ctx, x: padX, y: curY, w: tW, h: tH, radius: 20 });

  // Top Pass Header in Teal
  drawRoundRect(ctx, padX, curY, tW, 58, 20);
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.fill();

  ctx.font = '900 20px "Outfit", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('✈️  CAREER BOARDING PASS — FIRST CLASS OPPORTUNITY', padX + 24, curY + 36);

  curY += 88;
  ctx.font = '900 44px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText(role.toUpperCase(), padX + 24, curY);
  curY += 50;

  // Passenger & Flight Details
  const details = [
    { k: 'DESTINATION', v: 'Infinitetech Core Team' },
    { k: 'EXPERIENCE', v: exp },
    { k: 'LOCATION', v: loc },
    { k: 'SEAT / STATUS', v: 'Full-Time Priority' }
  ];

  details.forEach((d, idx) => {
    const dx = padX + 24 + (idx * 230);
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText(d.k, dx, curY);

    ctx.font = '900 15px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText(d.v, dx, curY + 22);
  });

  curY += 70;
  // Perforated dotted line
  ctx.strokeStyle = TEAL_PRIMARY;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(padX + 20, curY);
  ctx.lineTo(width - padX - 20, curY);
  ctx.stroke();
  ctx.setLineDash([]);

  curY += 30;
  // Barcode graphics in Teal
  for (let b = 0; b < 48; b++) {
    const bx = padX + 30 + (b * 12);
    ctx.fillStyle = b % 3 === 0 ? TEAL_DARK : TEAL_PRIMARY;
    ctx.fillRect(bx, curY, b % 2 === 0 ? 3 : 6, 36);
  }
}

/**
 * HIRING-08: Remote First Global Nomad
 */
async function renderHiringGlobalNomad({
  ctx, width, height, post, style, role, exp, loc, salary, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;

  ctx.font = '900 48px "Outfit", sans-serif';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText('WORK FROM ANYWHERE ON EARTH', padX, curY);
  curY += 56;

  ctx.font = '900 32px "Outfit", sans-serif';
  ctx.fillStyle = TEAL_PRIMARY;
  ctx.fillText(role, padX, curY);
  curY += 46;

  // 3 Global Hub Cards
  const hubs = [
    { h: '🌏 APAC Zone', t: 'Flexible Working Hours' },
    { h: '🌍 EMEA Zone', t: 'Asynchronous Workflow' },
    { h: '🌎 Americas Zone', t: 'Full Home-Office Stipend' }
  ];

  const cardW = Math.round((width - (padX * 2) - 24) / 3);
  hubs.forEach((hub, idx) => {
    const hx = padX + (idx * (cardW + 12));
    drawWhiteTealCard({ ctx, x: hx, y: curY, w: cardW, h: 100, radius: 14 });

    ctx.font = '900 17px "Outfit", sans-serif';
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText(hub.h, hx + 18, curY + 32);

    ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText(hub.t, hx + 18, curY + 62);
  });
}

/**
 * HIRING-09: Developer Terminal IDE
 */
async function renderHiringTerminalIDE({
  ctx, width, height, post, style, role, exp, loc, salary, techStack, padX, contentTopY, footerY, isLandscape
}) {
  let curY = contentTopY;

  const termW = width - (padX * 2);
  const termH = footerY - curY - 20;

  // Terminal window container
  drawRoundRect(ctx, padX, curY, termW, termH, 16);
  ctx.fillStyle = '#0F172A';
  ctx.fill();

  // Traffic lights
  ctx.beginPath();
  ctx.arc(padX + 24, curY + 22, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#EF4444';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(padX + 44, curY + 22, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(padX + 64, curY + 22, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#22C55E';
  ctx.fill();

  curY += 56;
  ctx.font = '700 20px "Space Grotesk", monospace';
  ctx.fillStyle = '#2DD4BF';
  ctx.fillText('// Join Infinitetech AI Core Engineering', padX + 28, curY);
  curY += 36;

  ctx.fillStyle = '#94A3B8';
  ctx.fillText('const opportunity = {', padX + 28, curY);
  curY += 32;

  ctx.fillStyle = '#F8FAFC';
  ctx.fillText(`  role: "${role}",`, padX + 48, curY);
  curY += 30;
  ctx.fillText(`  experience: "${exp}",`, padX + 48, curY);
  curY += 30;
  ctx.fillText(`  workMode: "${loc}",`, padX + 48, curY);
  curY += 30;
  ctx.fillText(`  compensation: "${salary}",`, padX + 48, curY);
  curY += 30;
  ctx.fillText(`  techStack: [${techStack.map(t => `"${t}"`).join(', ')}]`, padX + 48, curY);
  curY += 32;

  ctx.fillStyle = '#94A3B8';
  ctx.fillText('};', padX + 28, curY);
  curY += 36;

  ctx.fillStyle = '#2DD4BF';
  ctx.fillText('opportunity.apply(); // Sub-second response', padX + 28, curY);
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
}
