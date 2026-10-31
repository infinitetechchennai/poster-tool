/**
 * Utility functions for Canvas text wrapping, scaling, and geometric drawing
 */

/**
 * Safely draw a rounded rectangle on Canvas (supporting all browser versions)
 */
export function drawRoundRect(ctx, x, y, width, height, radius) {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  // Fallback implementation
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    radius = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...radius };
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
}

/**
 * Wraps text into lines that fit within maxWidth on a Canvas context.
 * Returns array of line strings.
 */
export function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Automatically fits a headline by reducing font size until it fits within maxLines and maxHeight.
 */
export function fitHeadline(ctx, text, maxWidth, maxHeight, maxLines = 3, initialFontSize = 74, minFontSize = 36, fontFamily = '"Outfit", "Plus Jakarta Sans", sans-serif') {
  let fontSize = initialFontSize;
  let lines = [];
  let lineHeight = Math.round(fontSize * 1.18);

  while (fontSize >= minFontSize) {
    ctx.font = `800 ${fontSize}px ${fontFamily}`;
    lines = wrapText(ctx, text, maxWidth);
    lineHeight = Math.round(fontSize * 1.18);
    const totalHeight = lines.length * lineHeight;

    if (lines.length <= maxLines && totalHeight <= maxHeight) {
      break;
    }
    fontSize -= 2;
  }

  return {
    fontSize,
    lines,
    lineHeight,
    totalHeight: lines.length * lineHeight
  };
}

/**
 * Wraps and clamps description text to fit available height
 */
export function wrapDescription(ctx, text, maxWidth, maxHeight, fontSize = 24, lineHeight = 36, fontFamily = 'Inter, sans-serif') {
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  const rawLines = wrapText(ctx, text, maxWidth);
  const maxPossibleLines = Math.floor(maxHeight / lineHeight);
  
  if (rawLines.length <= maxPossibleLines) {
    return { lines: rawLines, fontSize, lineHeight, totalHeight: rawLines.length * lineHeight };
  }

  // If too long, truncate with ellipsis
  const trimmed = rawLines.slice(0, maxPossibleLines);
  if (trimmed.length > 0) {
    let last = trimmed[trimmed.length - 1];
    while (ctx.measureText(last + '...').width > maxWidth && last.length > 0) {
      last = last.slice(0, -1);
    }
    trimmed[trimmed.length - 1] = last.trim() + '...';
  }

  return {
    lines: trimmed,
    fontSize,
    lineHeight,
    totalHeight: trimmed.length * lineHeight
  };
}

/**
 * Draws a modern 4-pointed micro sparkle icon
 */
export function drawSparkleIcon(ctx, x, y, size = 16, color = '#38bdf8') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  const r = size / 2;
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a modern micro zap/lightning icon
 */
export function drawZapIcon(ctx, x, y, size = 16, color = '#fbbf24') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  const s = size * 0.5;
  ctx.moveTo(x + s * 0.1, y - s);
  ctx.lineTo(x - s * 0.65, y + s * 0.1);
  ctx.lineTo(x - s * 0.05, y + s * 0.1);
  ctx.lineTo(x - s * 0.2, y + s);
  ctx.lineTo(x + s * 0.65, y - s * 0.1);
  ctx.lineTo(x + s * 0.05, y - s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a modern premium bullet badge for supporting key points
 */
export function drawModernBulletBadge(ctx, x, y, size = 26, accentColor = '#3b82f6', isDark = true) {
  ctx.save();
  
  // Outer soft translucent ring
  ctx.fillStyle = isDark ? `${accentColor}26` : `${accentColor}18`;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Inner solid accent circle
  const innerR = Math.round(size * 0.36);
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(x, y, innerR, 0, Math.PI * 2);
  ctx.fill();

  // Crisp checkmark tick inside
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - innerR * 0.5, y);
  ctx.lineTo(x - innerR * 0.1, y + innerR * 0.45);
  ctx.lineTo(x + innerR * 0.55, y - innerR * 0.4);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws an arrow badge container inside CTA button
 */
export function drawCtaArrowBadge(ctx, x, y, radius = 14, circleBg = 'rgba(255, 255, 255, 0.22)', arrowColor = '#FFFFFF') {
  ctx.save();
  ctx.fillStyle = circleBg;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = arrowColor;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  const s = radius * 0.45;
  ctx.moveTo(x - s * 0.8, y);
  ctx.lineTo(x + s * 0.8, y);
  ctx.moveTo(x + s * 0.1, y - s * 0.7);
  ctx.lineTo(x + s * 0.8, y);
  ctx.lineTo(x + s * 0.1, y + s * 0.7);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a clean checkmark icon on canvas
 */
export function drawCheckmarkIcon(ctx, x, y, size, color = '#2563eb', bgColor = 'rgba(37, 99, 235, 0.15)') {
  ctx.save();
  // Draw circle background
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw check tick
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.12);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  const radius = size / 2;
  ctx.moveTo(x - radius * 0.45, y + radius * 0.05);
  ctx.lineTo(x - radius * 0.1, y + radius * 0.4);
  ctx.lineTo(x + radius * 0.45, y - radius * 0.35);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws an arrow right icon
 */
export function drawArrowRight(ctx, x, y, size, color = '#ffffff') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.15);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y);
  ctx.lineTo(x + size * 0.35, y);
  ctx.moveTo(x + size * 0.1, y - size * 0.35);
  ctx.lineTo(x + size * 0.4, y);
  ctx.lineTo(x + size * 0.1, y + size * 0.35);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a globe / web icon
 */
export function drawGlobeIcon(ctx, x, y, size, color = '#94a3b8') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y, size / 4, size / 2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size / 2, y);
  ctx.lineTo(x + size / 2, y);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a clean modern cloud icon
 */
export function drawCloudIcon(ctx, x, y, size = 20, color = '#38bdf8') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.1);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size * 0.45;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.6, y + s * 0.35);
  ctx.lineTo(x + s * 0.6, y + s * 0.35);
  ctx.arc(x + s * 0.5, y + s * 0.05, s * 0.35, Math.PI * 0.5, Math.PI * 1.7, true);
  ctx.arc(x + s * 0.15, y - s * 0.3, s * 0.42, Math.PI * 1.9, Math.PI * 1.2, true);
  ctx.arc(x - s * 0.35, y - s * 0.15, s * 0.42, Math.PI * 1.3, Math.PI * 0.8, true);
  ctx.arc(x - s * 0.6, y + s * 0.08, s * 0.32, Math.PI * 0.9, Math.PI * 0.5, true);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a clean modern rocket/launch icon
 */
export function drawRocketIcon(ctx, x, y, size = 20, color = '#38bdf8') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.1);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size * 0.5;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.6, y - s * 0.6);
  ctx.quadraticCurveTo(x + s * 0.1, y - s * 0.75, x - s * 0.35, y - s * 0.1);
  ctx.lineTo(x - s * 0.65, y + s * 0.1);
  ctx.lineTo(x - s * 0.45, y + s * 0.45);
  ctx.lineTo(x - s * 0.1, y + s * 0.65);
  ctx.lineTo(x + s * 0.1, y + s * 0.35);
  ctx.quadraticCurveTo(x + s * 0.75, y - s * 0.1, x + s * 0.6, y - s * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.35, y + s * 0.35);
  ctx.lineTo(x - s * 0.65, y + s * 0.65);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a clean modern security shield icon
 */
export function drawShieldIcon(ctx, x, y, size = 20, color = '#38bdf8') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.1);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size * 0.5;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.8);
  ctx.lineTo(x + s * 0.65, y - s * 0.4);
  ctx.lineTo(x + s * 0.65, y + s * 0.05);
  ctx.quadraticCurveTo(x + s * 0.5, y + s * 0.7, x, y + s * 0.9);
  ctx.quadraticCurveTo(x - s * 0.5, y + s * 0.7, x - s * 0.65, y + s * 0.05);
  ctx.lineTo(x - s * 0.65, y - s * 0.4);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a clean modern 3-bar chart icon
 */
export function drawChartIcon(ctx, x, y, size = 20, color = '#38bdf8') {
  ctx.save();
  ctx.fillStyle = color;
  const s = size * 0.5;
  const barW = Math.max(3, s * 0.28);
  drawRoundRect(ctx, x - s * 0.75, y + s * 0.05, barW, s * 0.65, 2);
  ctx.fill();
  drawRoundRect(ctx, x - s * 0.2, y - s * 0.35, barW, s * 1.05, 2);
  ctx.fill();
  drawRoundRect(ctx, x + s * 0.35, y - s * 0.75, barW, s * 1.45, 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a clean modern target icon
 */
export function drawTargetIcon(ctx, x, y, size = 20, color = '#38bdf8') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.8, size * 0.1);
  ctx.beginPath();
  ctx.arc(x, y, size * 0.45, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, size * 0.24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a clean modern innovation lightbulb icon
 */
export function drawLightbulbIcon(ctx, x, y, size = 20, color = '#38bdf8') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.1);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size * 0.5;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.2, s * 0.5, Math.PI * 0.75, Math.PI * 0.25, false);
  ctx.lineTo(x + s * 0.22, y + s * 0.5);
  ctx.lineTo(x - s * 0.22, y + s * 0.5);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.16, y + s * 0.7);
  ctx.lineTo(x + s * 0.16, y + s * 0.7);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a clean 3-tier database cylinder stack icon
 */
export function drawDatabaseIcon(ctx, x, y, size = 20, color = '#ffffff') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.8, size * 0.1);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size * 0.5;
  const rw = s * 0.72;
  const rh = s * 0.28;

  // Top cylinder ellipse
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.45, rw, rh, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Middle layer arc
  ctx.beginPath();
  ctx.ellipse(x, y, rw, rh, 0, 0, Math.PI);
  ctx.stroke();

  // Bottom layer arc
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.45, rw, rh, 0, 0, Math.PI);
  ctx.stroke();

  // Left and Right connecting vertical lines
  ctx.beginPath();
  ctx.moveTo(x - rw, y - s * 0.45);
  ctx.lineTo(x - rw, y + s * 0.45);
  ctx.moveTo(x + rw, y - s * 0.45);
  ctx.lineTo(x + rw, y + s * 0.45);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a clean precision gear / pipelines icon
 */
export function drawGearIcon(ctx, x, y, size = 20, color = '#ffffff') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.8, size * 0.1);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size * 0.42;

  // Outer circle
  ctx.beginPath();
  ctx.arc(x, y, s * 0.72, 0, Math.PI * 2);
  ctx.stroke();

  // Inner center hole
  ctx.beginPath();
  ctx.arc(x, y, s * 0.3, 0, Math.PI * 2);
  ctx.stroke();

  // 6 Cog teeth
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(x + cos * (s * 0.72), y + sin * (s * 0.72));
    ctx.lineTo(x + cos * (s * 1.05), y + sin * (s * 1.05));
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draws a clean executive briefcase / skills icon
 */
export function drawBriefcaseIcon(ctx, x, y, size = 20, color = '#ffffff') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.8, size * 0.09);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size * 0.45;

  // Main case body
  drawRoundRect(ctx, x - s * 0.8, y - s * 0.35, s * 1.6, s * 1.1, 3);
  ctx.stroke();

  // Top handle
  ctx.beginPath();
  ctx.moveTo(x - s * 0.35, y - s * 0.35);
  ctx.lineTo(x - s * 0.35, y - s * 0.72);
  ctx.lineTo(x + s * 0.35, y - s * 0.72);
  ctx.lineTo(x + s * 0.35, y - s * 0.35);
  ctx.stroke();

  // Horizontal seam line
  ctx.beginPath();
  ctx.moveTo(x - s * 0.8, y + s * 0.15);
  ctx.lineTo(x + s * 0.8, y + s * 0.15);
  ctx.stroke();

  // Center clasp
  ctx.fillStyle = color;
  ctx.fillRect(x - s * 0.12, y + s * 0.05, s * 0.24, s * 0.2);

  ctx.restore();
}

/**
 * Draws a clean calendar date icon
 */
export function drawCalendarIcon(ctx, x, y, size = 20, color = '#ffffff') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.6, size * 0.09);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size * 0.45;

  // Calendar box
  drawRoundRect(ctx, x - s * 0.75, y - s * 0.6, s * 1.5, s * 1.3, 3);
  ctx.stroke();

  // Top header line
  ctx.beginPath();
  ctx.moveTo(x - s * 0.75, y - s * 0.2);
  ctx.lineTo(x + s * 0.75, y - s * 0.2);
  ctx.stroke();

  // Top rings/hangers
  ctx.beginPath();
  ctx.moveTo(x - s * 0.4, y - s * 0.6);
  ctx.lineTo(x - s * 0.4, y - s * 0.82);
  ctx.moveTo(x + s * 0.4, y - s * 0.6);
  ctx.lineTo(x + s * 0.4, y - s * 0.82);
  ctx.stroke();

  // Grid dots
  ctx.fillStyle = color;
  const dotR = Math.max(1.2, s * 0.1);
  [-0.35, 0, 0.35].forEach(dx => {
    [0.1, 0.4].forEach(dy => {
      ctx.beginPath();
      ctx.arc(x + dx * s, y + dy * s, dotR, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  ctx.restore();
}

/**
 * Draws a clean clock / time icon
 */
export function drawClockIcon(ctx, x, y, size = 20, color = '#ffffff') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.6, size * 0.09);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size * 0.45;

  // Outer circle
  ctx.beginPath();
  ctx.arc(x, y, s * 0.75, 0, Math.PI * 2);
  ctx.stroke();

  // Clock hands
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - s * 0.45);
  ctx.moveTo(x, y);
  ctx.lineTo(x + s * 0.35, y);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a user presenter avatar silhouette icon
 */
export function drawUserAvatarIcon(ctx, x, y, size = 24, color = '#ffffff') {
  ctx.save();
  ctx.fillStyle = color;
  const s = size * 0.45;

  // Head circle
  ctx.beginPath();
  ctx.arc(x, y - s * 0.32, s * 0.38, 0, Math.PI * 2);
  ctx.fill();

  // Shoulder curve
  ctx.beginPath();
  ctx.arc(x, y + s * 0.72, s * 0.68, Math.PI * 1.2, Math.PI * 1.8, false);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws an organic yellow/vibrant highlighter marker stroke behind punchlines (like "in 2026")
 */
export function drawMarkerHighlight(ctx, x, y, width, height = 18, color = '#FACC15') {
  ctx.save();
  ctx.fillStyle = color;
  drawRoundRect(ctx, x - 4, y - height * 0.42, width + 8, height, height / 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws the signature multi-colored 3D circular bullet badge from the Scaler Masterclass reference
 */
export function drawMultiColorCategoryBadge(ctx, x, y, size = 36, index = 0, topicText = '', isDark = true) {
  ctx.save();

  // Color sequence matching reference image:
  // 0: Orange (#FF7A00 -> #EA580C) - Database / Stack
  // 1: Royal Blue (#3B82F6 -> #1D4ED8) - Pipelines / Scale
  // 2: Purple (#A855F7 -> #6D28D9) - Analytics / Growth
  // 3: Green (#10B981 -> #047857) - Skills & Tools / Hiring
  // 4: Cyan (#06B6D4 -> #0E7490) - AI / Neural
  const BADGE_PRESETS = [
    { start: '#FF7A00', end: '#EA580C', shadow: 'rgba(234, 88, 12, 0.45)', icon: 'database' },
    { start: '#3B82F6', end: '#1D4ED8', shadow: 'rgba(37, 99, 235, 0.45)', icon: 'gear' },
    { start: '#A855F7', end: '#6D28D9', shadow: 'rgba(109, 40, 217, 0.45)', icon: 'chart' },
    { start: '#10B981', end: '#047857', shadow: 'rgba(16, 185, 129, 0.45)', icon: 'briefcase' },
    { start: '#06B6D4', end: '#0E7490', shadow: 'rgba(6, 182, 212, 0.45)', icon: 'ai' }
  ];

  const lower = topicText.toLowerCase();
  let selected = BADGE_PRESETS[index % BADGE_PRESETS.length];
  if (lower.includes('data') || lower.includes('database') || lower.includes('stack') || lower.includes('sql') || lower.includes('store')) {
    selected = BADGE_PRESETS[0];
  } else if (lower.includes('pipeline') || lower.includes('scale') || lower.includes('build') || lower.includes('gear') || lower.includes('infra')) {
    selected = BADGE_PRESETS[1];
  } else if (lower.includes('chart') || lower.includes('analytic') || lower.includes('salary') || lower.includes('trend') || lower.includes('growth')) {
    selected = BADGE_PRESETS[2];
  } else if (lower.includes('skill') || lower.includes('tool') || lower.includes('hiring') || lower.includes('career') || lower.includes('job')) {
    selected = BADGE_PRESETS[3];
  } else if (lower.includes('ai') || lower.includes('intel') || lower.includes('neural')) {
    selected = BADGE_PRESETS[4];
  }

  // 1. Soft matching drop shadow
  ctx.shadowColor = selected.shadow;
  ctx.shadowBlur = Math.round(size * 0.35);
  ctx.shadowOffsetY = Math.round(size * 0.12);

  // 2. 3D Gradient circle
  const r = size / 2;
  const grad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  grad.addColorStop(0, selected.start);
  grad.addColorStop(1, selected.end);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // 3. Inner gloss highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r - 1, 0, Math.PI * 2);
  ctx.stroke();

  // 4. Pure white vector icon
  const iconSize = Math.round(size * 0.52);
  switch (selected.icon) {
    case 'database':
      drawDatabaseIcon(ctx, x, y, iconSize, '#FFFFFF');
      break;
    case 'gear':
      drawGearIcon(ctx, x, y, iconSize, '#FFFFFF');
      break;
    case 'chart':
      drawChartIcon(ctx, x, y, iconSize, '#FFFFFF');
      break;
    case 'briefcase':
      drawBriefcaseIcon(ctx, x, y, iconSize, '#FFFFFF');
      break;
    case 'ai':
      drawAiChipIcon(ctx, x, y, iconSize, '#FFFFFF');
      break;
    default:
      drawCheckmarkIcon(ctx, x, y, iconSize, '#FFFFFF', 'transparent');
      break;
  }

  ctx.restore();
}

/**
 * Draws the dark executive Masterclass Presenter & Event info footer card
 */
export function drawMasterclassPresenterCard({
  ctx,
  x,
  y,
  width,
  height = 92,
  brand,
  post,
  accentColor = '#00A2A2',
  isLandscape = false
}) {
  ctx.save();

  const brandPrimary = brand?.primaryColor || accentColor || '#00A2A2';
  const brandSecondary = brand?.secondaryColor || '#0F172A';
  const website = brand?.websiteUrl || post?.websiteUrl || 'www.infinitetechai.com';

  // 1. Dark sapphire glassmorphic container with glowing border in brand color
  const radius = isLandscape ? 14 : 18;
  drawRoundRect(ctx, x, y, width, height, radius);

  const bgGrad = ctx.createLinearGradient(x, y, x + width, y + height);
  bgGrad.addColorStop(0, '#060E20');
  bgGrad.addColorStop(1, '#0C1B3B');
  ctx.fillStyle = bgGrad;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.40)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 6;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Glowing border with brand primary color accent
  ctx.strokeStyle = `${brandPrimary}66`;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  const centerY = y + height / 2;

  // 2. Avatar Circle on Left with brand gradient
  const avatarSize = isLandscape ? 40 : 50;
  const avatarPadX = isLandscape ? 16 : 22;
  const avatarX = x + avatarPadX + avatarSize / 2;
  const avatarY = centerY;

  const avGrad = ctx.createLinearGradient(avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarX + avatarSize / 2, avatarY + avatarSize / 2);
  avGrad.addColorStop(0, brandPrimary);
  avGrad.addColorStop(1, '#08253B');
  ctx.fillStyle = avGrad;
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2);
  ctx.fill();

  drawUserAvatarIcon(ctx, avatarX, avatarY, Math.round(avatarSize * 0.58), '#FFFFFF');

  // 3. Presenter Text & Credentials (Vertically Centered)
  const infoX = x + avatarPadX + avatarSize + (isLandscape ? 14 : 18);
  const speakerName = post?.presenterName || (brand?.companyName ? `by ${brand.companyName}` : 'by Infinitetech Ai');
  const speakerRole = post?.presenterRole || brand?.presenterRole || 'Head of AI & Growth Strategy';

  // Speaker name
  ctx.font = `700 ${isLandscape ? 14 : 18}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(speakerName, infoX, centerY - (isLandscape ? 2 : 4));

  // Role
  ctx.font = `500 ${isLandscape ? 11 : 13}px Inter, sans-serif`;
  ctx.fillStyle = '#94A3B8';
  ctx.textBaseline = 'top';
  ctx.fillText(speakerRole, infoX, centerY + (isLandscape ? 4 : 6));

  // 4. Vertical Divider Line
  ctx.font = `700 ${isLandscape ? 14 : 18}px "Plus Jakarta Sans", sans-serif`;
  const nameW = ctx.measureText(speakerName).width;
  ctx.font = `500 ${isLandscape ? 11 : 13}px Inter, sans-serif`;
  const roleW = ctx.measureText(speakerRole).width;
  const leftColRelW = (avatarPadX + avatarSize + (isLandscape ? 14 : 18)) + Math.max(nameW, roleW) + 36;
  const dividerX = x + Math.max(leftColRelW, width * 0.48);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(dividerX, y + 16);
  ctx.lineTo(dividerX, y + height - 16);
  ctx.stroke();

  // 5. Right Section: Brand Official Website (Vertically Centered)
  const schedX = dividerX + (isLandscape ? 18 : 28);
  const iconSize = isLandscape ? 18 : 22;

  drawGlobeIcon(ctx, schedX + iconSize / 2, centerY, iconSize, brandPrimary);

  ctx.font = `700 ${isLandscape ? 13 : 17}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'middle';
  ctx.fillText(website, schedX + iconSize + (isLandscape ? 10 : 14), centerY);

  ctx.restore();
}

/**
 * Draws floating ecosystem badges (AWS, Databricks, Spark, Airflow) with glowing conduits
 */
export function drawFloatingTechBadges(ctx, x, y, width, height, topic = '', isDark = true) {
  ctx.save();

  const BADGES = [
    { label: 'aws', iconType: 'aws', relX: 0.12, relY: 0.14, w: 76, h: 40, conduitColor: '#FF9900' },
    { label: 'Databricks', iconType: 'databricks', relX: 0.44, relY: 0.08, w: 106, h: 40, conduitColor: '#FF3621' },
    { label: 'Spark', iconType: 'spark', relX: 0.80, relY: 0.14, w: 82, h: 40, conduitColor: '#E25A1C' },
    { label: 'Apache Airflow', iconType: 'airflow', relX: 0.78, relY: 0.32, w: 120, h: 42, conduitColor: '#00C7D4' }
  ];

  BADGES.forEach(b => {
    const bx = x + width * b.relX - b.w / 2;
    const by = y + height * b.relY;

    // Glowing conduit wire leading down
    ctx.save();
    ctx.strokeStyle = b.conduitColor;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = b.conduitColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(bx + b.w / 2, by + b.h);
    ctx.lineTo(bx + b.w / 2, by + b.h + 20);
    ctx.lineTo(x + width * 0.5, y + height * 0.46);
    ctx.stroke();
    ctx.restore();

    // Floating White Badge Card
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    drawRoundRect(ctx, bx, by, b.w, b.h, 10);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Badge content text & brand mark
    ctx.font = `800 13px "Outfit", "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#0F172A';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    if (b.iconType === 'aws') {
      ctx.fillText('aws', bx + b.w / 2, by + b.h / 2 - 2);
      ctx.strokeStyle = '#FF9900';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bx + b.w / 2, by + b.h / 2 + 5, 12, Math.PI * 0.2, Math.PI * 0.8, false);
      ctx.stroke();
    } else if (b.iconType === 'databricks') {
      ctx.fillStyle = '#FF3621';
      ctx.fillRect(bx + 10, by + b.h / 2 - 6, 12, 12);
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.fillText('Databricks', bx + 26, by + b.h / 2);
    } else if (b.iconType === 'spark') {
      ctx.fillStyle = '#E25A1C';
      drawSparkleIcon(ctx, bx + 16, by + b.h / 2, 12, '#E25A1C');
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.fillText('Spark', bx + 28, by + b.h / 2);
    } else if (b.iconType === 'airflow') {
      const cx = bx + 16;
      const cy = by + b.h / 2;
      ctx.fillStyle = '#00C7D4';
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FF3621';
      ctx.beginPath();
      ctx.arc(cx + 3, cy - 3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.font = `700 11px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText('Apache', bx + 30, by + b.h / 2 - 6);
      ctx.font = `800 12px "Outfit", sans-serif`;
      ctx.fillText('Airflow', bx + 30, by + b.h / 2 + 7);
    }

    ctx.restore();
  });

  ctx.restore();
}

/**
 * Detects the most relevant icon from a topic name and category
 */
export function detectTopicIcon(topic = '', category = '') {
  const combined = `${topic} ${category}`.toLowerCase();
  if (combined.includes('hiring') || combined.includes('career') || combined.includes('job') || combined.includes('recruit') || combined.includes('talent') || combined.includes('opening') || combined.includes('vacancy') || combined.includes('internship') || combined.includes('fellowship')) return 'briefcase';
  if (combined.includes('cloud') || combined.includes('devops') || combined.includes('infra') || combined.includes('kubernetes') || combined.includes('server')) return 'cloud';
  if (combined.includes('secur') || combined.includes('cyber') || combined.includes('zero-trust') || combined.includes('privacy') || combined.includes('threat')) return 'shield';
  if (combined.includes('market') || combined.includes('growth') || combined.includes('scale') || combined.includes('sales') || combined.includes('lead')) return 'rocket';
  if (combined.includes('data') || combined.includes('analytic') || combined.includes('finan') || combined.includes('metric') || combined.includes('bi') || combined.includes('dashboard')) return 'chart';
  if (combined.includes('voice') || combined.includes('call') || combined.includes('speed') || combined.includes('fast') || combined.includes('zap') || combined.includes('quick')) return 'zap';
  if (combined.includes('target') || combined.includes('goal') || combined.includes('strategy') || combined.includes('retention') || combined.includes('churn')) return 'target';
  if (combined.includes('idea') || combined.includes('innovat') || combined.includes('culture') || combined.includes('leadership') || combined.includes('team')) return 'lightbulb';
  return 'sparkle';
}

/**
 * Draws a dedicated modern glowing topic icon badge
 */
export function drawTopicIconBadge(ctx, x, y, size = 44, iconType = 'sparkle', accentColor = '#3b82f6', isDark = true) {
  if (iconType === 'none') return;
  ctx.save();

  // 1. Soft radial glow
  const glow = ctx.createRadialGradient(x, y, 2, x, y, size * 0.85);
  glow.addColorStop(0, isDark ? `${accentColor}44` : `${accentColor}25`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // 2. Glass squircle container
  const boxX = x - size / 2;
  const boxY = y - size / 2;
  drawRoundRect(ctx, boxX, boxY, size, size, Math.round(size * 0.28));
  ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)';
  ctx.fill();
  ctx.strokeStyle = isDark ? `${accentColor}66` : `${accentColor}40`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3. Vector icon inside
  const innerIconSize = Math.round(size * 0.48);
  switch (iconType) {
    case 'cloud':
      drawCloudIcon(ctx, x, y, innerIconSize, accentColor);
      break;
    case 'zap':
    case 'voice':
      drawZapIcon(ctx, x, y, innerIconSize, accentColor);
      break;
    case 'shield':
    case 'security':
      drawShieldIcon(ctx, x, y, innerIconSize, accentColor);
      break;
    case 'rocket':
    case 'marketing':
      drawRocketIcon(ctx, x, y, innerIconSize, accentColor);
      break;
    case 'chart':
    case 'analytics':
    case 'finance':
      drawChartIcon(ctx, x, y, innerIconSize, accentColor);
      break;
    case 'target':
      drawTargetIcon(ctx, x, y, innerIconSize, accentColor);
      break;
    case 'lightbulb':
      drawLightbulbIcon(ctx, x, y, innerIconSize, accentColor);
      break;
    case 'ai':
      drawAiChipIcon(ctx, x, y, innerIconSize, accentColor);
      break;
    case 'briefcase':
    case 'hiring':
    case 'career':
      drawBriefcaseIcon(ctx, x, y, innerIconSize, accentColor);
      break;
    case 'sparkle':
    default:
      drawSparkleIcon(ctx, x, y, innerIconSize, accentColor);
      break;
  }

  ctx.restore();
}

/**
 * Draws a sleek modern AI Neural Chip / Microprocessor Icon
 */
export function drawAiChipIcon(ctx, x, y, size = 24, color = '#00a2a2') {
  ctx.save();
  const s = size * 0.5;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.8, size * 0.09);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Outer chip square
  drawRoundRect(ctx, x - s * 0.65, y - s * 0.65, s * 1.3, s * 1.3, 3);
  ctx.stroke();

  // Inner core square with subtle tint
  drawRoundRect(ctx, x - s * 0.32, y - s * 0.32, s * 0.64, s * 0.64, 2);
  ctx.fillStyle = `${color}28`;
  ctx.fill();
  ctx.stroke();

  // Central dot / core neuron
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, s * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Connector pins on 4 sides
  const pinLen = s * 0.22;
  // Top pins
  ctx.beginPath();
  ctx.moveTo(x - s * 0.32, y - s * 0.65);
  ctx.lineTo(x - s * 0.32, y - s * 0.65 - pinLen);
  ctx.moveTo(x + s * 0.32, y - s * 0.65);
  ctx.lineTo(x + s * 0.32, y - s * 0.65 - pinLen);
  // Bottom pins
  ctx.moveTo(x - s * 0.32, y + s * 0.65);
  ctx.lineTo(x - s * 0.32, y + s * 0.65 + pinLen);
  ctx.moveTo(x + s * 0.32, y + s * 0.65);
  ctx.lineTo(x + s * 0.32, y + s * 0.65 + pinLen);
  // Left pins
  ctx.moveTo(x - s * 0.65, y - s * 0.32);
  ctx.lineTo(x - s * 0.65 - pinLen, y - s * 0.32);
  ctx.moveTo(x - s * 0.65, y + s * 0.32);
  ctx.lineTo(x - s * 0.65 - pinLen, y + s * 0.32);
  // Right pins
  ctx.moveTo(x + s * 0.65, y - s * 0.32);
  ctx.lineTo(x + s * 0.65 + pinLen, y - s * 0.32);
  ctx.moveTo(x + s * 0.65, y + s * 0.32);
  ctx.lineTo(x + s * 0.65 + pinLen, y + s * 0.32);
  ctx.stroke();

  ctx.restore();
}

/**
 * Extracts rich, headline-aligned AI topic feature metadata
 */
export function getTopicFeatureDetails(topic = '', headline = '', category = '', iconType = 'auto') {
  const query = `${topic} ${headline} ${category}`.toLowerCase();

  let resolvedIcon = (iconType && iconType !== 'auto') ? iconType : null;
  if (!resolvedIcon) {
    if (query.includes('hiring') || query.includes('career') || query.includes('job') || query.includes('recruit') || query.includes('talent') || query.includes('opening') || query.includes('vacancy') || query.includes('internship') || query.includes('fellowship')) {
      resolvedIcon = 'briefcase';
    } else if (query.includes('cloud') || query.includes('devops') || query.includes('infra') || query.includes('server')) {
      resolvedIcon = 'cloud';
    } else if (query.includes('secur') || query.includes('cyber') || query.includes('privacy') || query.includes('zero-trust')) {
      resolvedIcon = 'shield';
    } else if (query.includes('grow') || query.includes('scale') || query.includes('market') || query.includes('sales')) {
      resolvedIcon = 'rocket';
    } else if (query.includes('data') || query.includes('analytic') || query.includes('metric') || query.includes('bi')) {
      resolvedIcon = 'chart';
    } else if (query.includes('speed') || query.includes('voice') || query.includes('zap') || query.includes('realtime') || query.includes('fast')) {
      resolvedIcon = 'zap';
    } else if (query.includes('target') || query.includes('strategy') || query.includes('goal') || query.includes('retention')) {
      resolvedIcon = 'target';
    } else if (query.includes('idea') || query.includes('innovat') || query.includes('future')) {
      resolvedIcon = 'lightbulb';
    } else {
      resolvedIcon = 'ai';
    }
  }

  const MAP = {
    briefcase: {
      badgeLabel: '🤝 WE ARE EXPANDING & HIRING',
      featureDescription: 'Competitive compensation, rapid growth paths & world-class team culture.',
      tags: ['Top 1% Talent', 'Remote / Hybrid', 'Full Benefits']
    },
    ai: {
      badgeLabel: '⚡ AI-POWERED ARCHITECTURE',
      featureDescription: 'Neural cognitive engine driving automated operational excellence.',
      tags: ['Neural Engine', 'Auto-Scale', '99.9% Precision']
    },
    cloud: {
      badgeLabel: '☁️ ELASTIC CLOUD PLATFORM',
      featureDescription: 'Distributed multi-region infrastructure designed for zero-downtime scale.',
      tags: ['Multi-Cloud', 'Kubernetes', 'Auto-Scaling']
    },
    shield: {
      badgeLabel: '🛡️ ZERO-TRUST CYBER SECURITY',
      featureDescription: 'Continuous verification and end-to-end encrypted compliance architecture.',
      tags: ['Zero-Trust', 'SOC2 Compliant', 'Real-time Defense']
    },
    rocket: {
      badgeLabel: '🚀 HIGH-VELOCITY GROWTH ENGINE',
      featureDescription: 'Modern growth frameworks accelerating customer acquisition & lifetime ROI.',
      tags: ['Growth Loops', 'Revenue Scale', 'High Velocity']
    },
    chart: {
      badgeLabel: '📊 REAL-TIME DATA INTELLIGENCE',
      featureDescription: 'Predictive analytics and metric telemetry turning data into revenue.',
      tags: ['Predictive BI', 'Live Telemetry', 'Actionable Insights']
    },
    zap: {
      badgeLabel: '⚡ ULTRA-LOW LATENCY SPEED',
      featureDescription: 'High-throughput microservices built for instantaneous execution.',
      tags: ['Sub-10ms', 'High Throughput', 'Instant Sync']
    },
    target: {
      badgeLabel: '🎯 STRATEGIC KPI ALIGNMENT',
      featureDescription: 'Target-driven roadmap aligning executive vision with measurable outcomes.',
      tags: ['KPI Tracking', 'Strategic Focus', 'Measurable ROI']
    },
    lightbulb: {
      badgeLabel: '💡 NEXT-GEN INNOVATION LAB',
      featureDescription: 'Forward-looking solutions unlocking transformative digital competitive advantage.',
      tags: ['Breakthrough Tech', 'Disruptive ROI', 'Future-Ready']
    },
    sparkle: {
      badgeLabel: '✨ NEXT-GEN INTELLIGENCE',
      featureDescription: 'State-of-the-art intelligent tools engineered for modern business scale.',
      tags: ['Smart Tools', 'Automated Scale', 'Enterprise Ready']
    }
  };

  const selected = MAP[resolvedIcon] || MAP.ai;

  return {
    icon: resolvedIcon,
    badgeLabel: selected.badgeLabel,
    featureDescription: selected.featureDescription,
    tags: selected.tags
  };
}

/**
 * Draws a dedicated modern AI Topic Feature Card in the lower text area of the post
 */
export function drawTopicFeatureCard({
  ctx,
  x,
  y,
  width,
  height,
  post,
  style,
  accentColor,
  isDark,
  iconType,
  isLandscape
}) {
  if (height < 45) return;

  const details = getTopicFeatureDetails(post.topic, post.headline, post.categoryName, iconType);
  if (details.icon === 'none') return;

  const isHiring = style?.id?.startsWith('hiring-');
  const isHiringWhite = isHiring && style.id.includes('white');
  const isHiringTeal = isHiring && style.id.includes('teal');

  ctx.save();

  // 1. Card container with glassmorphic border & subtle gradient fill
  const cardRadius = isLandscape ? 12 : 16;
  drawRoundRect(ctx, x, y, width, height, cardRadius);

  const cardGrad = ctx.createLinearGradient(x, y, x + width, y + height);
  if (isHiringWhite) {
    cardGrad.addColorStop(0, '#FFFFFF');
    cardGrad.addColorStop(1, '#FFFFFF');
  } else if (isHiringTeal) {
    cardGrad.addColorStop(0, '#0F172A');
    cardGrad.addColorStop(1, '#0B132B');
  } else if (isDark) {
    cardGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    cardGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
  } else {
    cardGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    cardGrad.addColorStop(1, 'rgba(245, 248, 252, 0.90)');
  }
  ctx.fillStyle = cardGrad;
  ctx.fill();

  ctx.strokeStyle = isHiringWhite ? 'rgba(0, 128, 128, 0.35)' : (isDark ? `${accentColor}35` : `${accentColor}25`);
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // 2. Icon Badge on the left
  const iconSize = isLandscape ? 38 : Math.min(52, Math.round(height * 0.58));
  const iconPadX = isLandscape ? 14 : 18;
  const iconCenterX = x + iconPadX + iconSize / 2;
  const iconCenterY = y + height / 2;

  const resolvedAccent = isHiringWhite ? '#008080' : (isHiringTeal ? '#FFFFFF' : accentColor);
  drawTopicIconBadge(ctx, iconCenterX, iconCenterY, iconSize, details.icon, resolvedAccent, isDark && !isHiringWhite);

  // 3. Content Text Area to the right of the icon
  const textX = x + iconPadX + iconSize + (isLandscape ? 12 : 16);
  const textAvailableW = width - (textX - x) - 16;

  if (height >= 80) {
    const line1Y = y + height * 0.32;
    const line2Y = y + height * 0.60;
    const line3Y = y + height * 0.84;

    // Line 1: Glowing Topic Badge Pill
    ctx.save();
    ctx.font = `700 11px "Plus Jakarta Sans", sans-serif`;
    const tagW = ctx.measureText(details.badgeLabel).width + 16;
    drawRoundRect(ctx, textX, line1Y - 10, tagW, 20, 6);
    ctx.fillStyle = isHiringWhite ? 'rgba(0, 128, 128, 0.08)' : (isDark ? `${accentColor}25` : `${accentColor}15`);
    ctx.fill();
    ctx.strokeStyle = isHiringWhite ? '#008080' : (isDark ? `${accentColor}55` : `${accentColor}35`);
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = resolvedAccent;
    ctx.textBaseline = 'middle';
    ctx.fillText(details.badgeLabel, textX + 8, line1Y);
    ctx.restore();

    // Line 2: Headline-aligned highlight
    ctx.save();
    ctx.font = `600 ${isLandscape ? 12 : 13}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = isHiringWhite ? '#008080' : (isHiringTeal ? '#FFFFFF' : style.textColor);
    ctx.textBaseline = 'middle';
    const cleanDesc = wrapText(ctx, details.featureDescription, textAvailableW)[0] || details.featureDescription;
    ctx.fillText(cleanDesc, textX, line2Y);
    ctx.restore();

    // Line 3: Micro feature tags
    if (height >= 105 && details.tags && details.tags.length > 0) {
      ctx.save();
      ctx.font = `500 10px Inter, sans-serif`;
      let pillX = textX;
      details.tags.forEach(tg => {
        const pW = ctx.measureText(tg).width + 14;
        if (pillX + pW <= x + width - 12) {
          drawRoundRect(ctx, pillX, line3Y - 8, pW, 16, 4);
          ctx.fillStyle = isHiringWhite ? 'rgba(0, 128, 128, 0.08)' : (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)');
          ctx.fill();
          ctx.strokeStyle = isHiringWhite ? 'rgba(0, 128, 128, 0.3)' : (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)');
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.fillStyle = isHiringWhite ? '#008080' : (isHiringTeal ? '#CBD5E1' : (isDark ? '#94A3B8' : '#475569'));
          ctx.textBaseline = 'middle';
          ctx.fillText(tg, pillX + 7, line3Y);
          pillX += pW + 6;
        }
      });
      ctx.restore();
    }
  } else {
    // Compact layout for tighter spaces
    ctx.save();
    ctx.font = `700 11px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = accentColor;
    ctx.textBaseline = 'middle';
    ctx.fillText(details.badgeLabel, textX, y + height * 0.38);

    ctx.font = `500 12px Inter, sans-serif`;
    ctx.fillStyle = style.textSecondary;
    ctx.textBaseline = 'middle';
    const cleanDesc = wrapText(ctx, details.featureDescription, textAvailableW)[0] || details.featureDescription;
    ctx.fillText(cleanDesc, textX, y + height * 0.68);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws a clean modern phone handset vector icon
 */
export function drawPhoneHandsetIcon(ctx, x, y, size = 20, color = '#00A2A2') {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.8, size * 0.09);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size * 0.44;

  ctx.beginPath();
  ctx.moveTo(-s * 0.55, -s * 0.35);
  ctx.bezierCurveTo(-s * 0.65, -s * 0.05, -s * 0.05, s * 0.65, s * 0.35, s * 0.55);
  ctx.stroke();

  // Earpiece
  ctx.beginPath();
  ctx.arc(-s * 0.48, -s * 0.45, s * 0.22, 0, Math.PI * 2);
  ctx.stroke();

  // Mouthpiece
  ctx.beginPath();
  ctx.arc(s * 0.45, s * 0.48, s * 0.22, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a clean stopwatch icon with top pusher
 */
export function drawStopwatchIcon(ctx, x, y, size = 20, color = '#00A2A2') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.8, size * 0.09);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size * 0.42;

  // Clock body
  ctx.beginPath();
  ctx.arc(x, y + s * 0.12, s * 0.72, 0, Math.PI * 2);
  ctx.stroke();

  // Top pusher
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.60);
  ctx.lineTo(x, y - s * 0.88);
  ctx.moveTo(x - s * 0.25, y - s * 0.88);
  ctx.lineTo(x + s * 0.25, y - s * 0.88);
  ctx.stroke();

  // Hands pointing 12 and 2
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.12);
  ctx.lineTo(x, y - s * 0.35);
  ctx.moveTo(x, y + s * 0.12);
  ctx.lineTo(x + s * 0.35, y - s * 0.05);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a rising growth bar chart icon with 3 bars
 */
export function drawGrowthBarChartIcon(ctx, x, y, size = 20, color = '#00A2A2') {
  ctx.save();
  ctx.fillStyle = color;
  const s = size * 0.42;
  const barW = Math.max(2.5, s * 0.32);

  // Bar 1 (Short)
  drawRoundRect(ctx, x - s * 0.75, y + s * 0.1, barW, s * 0.55, 1.5);
  ctx.fill();

  // Bar 2 (Medium)
  drawRoundRect(ctx, x - s * 0.16, y - s * 0.25, barW, s * 0.9, 1.5);
  ctx.fill();

  // Bar 3 (Tall)
  drawRoundRect(ctx, x + s * 0.42, y - s * 0.65, barW, s * 1.3, 1.5);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws crisp industry icons for the dark lower banner
 */
export function drawIndustryIcon(ctx, type, x, y, size = 16, color = '#00E5FF') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.4, size * 0.09);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size * 0.45;

  switch (type) {
    case 'retail':
      // Shopping Cart
      ctx.beginPath();
      ctx.moveTo(x - s * 0.8, y - s * 0.6);
      ctx.lineTo(x - s * 0.5, y - s * 0.6);
      ctx.lineTo(x - s * 0.2, y + s * 0.2);
      ctx.lineTo(x + s * 0.6, y + s * 0.2);
      ctx.lineTo(x + s * 0.8, y - s * 0.4);
      ctx.lineTo(x - s * 0.35, y - s * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x - s * 0.1, y + s * 0.6, s * 0.15, 0, Math.PI * 2);
      ctx.arc(x + s * 0.45, y + s * 0.6, s * 0.15, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'realestate':
      // Bank / Classical building
      ctx.beginPath();
      ctx.moveTo(x, y - s * 0.8);
      ctx.lineTo(x - s * 0.8, y - s * 0.3);
      ctx.lineTo(x + s * 0.8, y - s * 0.3);
      ctx.closePath();
      ctx.stroke();
      [-0.5, 0, 0.5].forEach(dx => {
        ctx.beginPath();
        ctx.moveTo(x + dx * s, y - s * 0.2);
        ctx.lineTo(x + dx * s, y + s * 0.5);
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.moveTo(x - s * 0.8, y + s * 0.6);
      ctx.lineTo(x + s * 0.8, y + s * 0.6);
      ctx.stroke();
      break;

    case 'healthcare':
      // Heart with pulse
      ctx.beginPath();
      ctx.moveTo(x, y + s * 0.7);
      ctx.bezierCurveTo(x - s * 0.9, y + s * 0.1, x - s * 0.9, y - s * 0.7, x, y - s * 0.2);
      ctx.bezierCurveTo(x + s * 0.9, y - s * 0.7, x + s * 0.9, y + s * 0.1, x, y + s * 0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - s * 0.35, y);
      ctx.lineTo(x + s * 0.35, y);
      ctx.moveTo(x, y - s * 0.35);
      ctx.lineTo(x, y + s * 0.35);
      ctx.stroke();
      break;

    case 'education':
      // Mortarboard Hat
      ctx.beginPath();
      ctx.moveTo(x, y - s * 0.5);
      ctx.lineTo(x + s * 0.85, y - s * 0.15);
      ctx.lineTo(x, y + s * 0.2);
      ctx.lineTo(x - s * 0.85, y - s * 0.15);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y + s * 0.1, s * 0.45, 0, Math.PI, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + s * 0.85, y - s * 0.15);
      ctx.lineTo(x + s * 0.85, y + s * 0.5);
      ctx.stroke();
      break;

    case 'finance':
      // Rupee Symbol ₹
      ctx.font = `700 ${Math.round(size * 0.95)}px "Inter", "Plus Jakarta Sans", sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText('₹', x, y);
      ctx.textAlign = 'left';
      break;

    case 'more':
    default:
      // Triple dots •••
      [-0.45, 0, 0.45].forEach(dx => {
        ctx.beginPath();
        ctx.arc(x + dx * s, y, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
  }
  ctx.restore();
}

/**
 * Draws the tilted handwritten marketing script note in top right
 */
export function drawScriptMarketingNote(ctx, x, y, line1 = 'Let AI Do', line2 = 'the Calling', line3 = 'For You!', color = '#0F172A') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.11); // natural hand-drawn slight tilt

  ctx.font = '700 25px "Caveat", "Kalam", cursive, sans-serif';
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(line1, 0, 0);
  ctx.fillText(line2, 0, 24);
  ctx.fillText(line3, 0, 48);

  // Handwritten dynamic curved underline swoosh
  ctx.strokeStyle = '#00A2A2';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-10, 56);
  ctx.quadraticCurveTo(45, 66, 88, 52);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws the cute 3D AI Robot avatar wearing a headset
 */
export function drawCuteAiRobotAvatar(ctx, cx, cy, size = 80) {
  ctx.save();
  const r = size / 2;

  // 1. Soft glowing aura around robot
  const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.3);
  glow.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
  ctx.fill();

  // 2. Headset band over head
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = Math.max(3, size * 0.06);
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.05, r * 0.85, Math.PI * 1.15, Math.PI * 1.85, false);
  ctx.stroke();

  // 3. Cute White Robot Head Pill
  drawRoundRect(ctx, cx - r * 0.72, cy - r * 0.55, r * 1.44, r * 1.15, r * 0.45);
  const headGrad = ctx.createLinearGradient(cx, cy - r * 0.55, cx, cy + r * 0.6);
  headGrad.addColorStop(0, '#FFFFFF');
  headGrad.addColorStop(1, '#E2E8F0');
  ctx.fillStyle = headGrad;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // 4. Black Glossy Visor Screen
  drawRoundRect(ctx, cx - r * 0.56, cy - r * 0.38, r * 1.12, r * 0.8, r * 0.32);
  ctx.fillStyle = '#061325';
  ctx.fill();

  // 5. Cute Cyan Glowing Eyes & Smile
  ctx.strokeStyle = '#00F0FF';
  ctx.fillStyle = '#00F0FF';
  ctx.lineWidth = Math.max(2.4, size * 0.045);
  ctx.lineCap = 'round';

  // Left Eye (Happy curved arc)
  ctx.beginPath();
  ctx.arc(cx - r * 0.25, cy - r * 0.05, r * 0.14, Math.PI * 1.1, Math.PI * 1.9, false);
  ctx.stroke();

  // Right Eye (Happy curved arc)
  ctx.beginPath();
  ctx.arc(cx + r * 0.25, cy - r * 0.05, r * 0.14, Math.PI * 1.1, Math.PI * 1.9, false);
  ctx.stroke();

  // Cute Smile
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.08, r * 0.12, Math.PI * 0.1, Math.PI * 0.9, false);
  ctx.stroke();

  // 6. Cyan Ear-cup Headphones
  // Left ear cup
  drawRoundRect(ctx, cx - r * 0.88, cy - r * 0.32, r * 0.22, r * 0.64, r * 0.1);
  ctx.fillStyle = '#0284C7';
  ctx.fill();
  // Right ear cup
  drawRoundRect(ctx, cx + r * 0.66, cy - r * 0.32, r * 0.22, r * 0.64, r * 0.1);
  ctx.fillStyle = '#0284C7';
  ctx.fill();

  // 7. Boom Microphone curved to mouth
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = Math.max(2, size * 0.04);
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy + r * 0.45, r * 0.45, Math.PI * 0.6, Math.PI * 1.1, false);
  ctx.stroke();
  // Mic head
  ctx.fillStyle = '#00F0FF';
  ctx.beginPath();
  ctx.arc(cx - r * 0.12, cy + r * 0.32, r * 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws dynamic audio soundwaves
 */
export function drawAudioSoundwave(ctx, cx, cy, width, height, color = '#00D2D2') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  const barCount = 26;
  const step = width / barCount;
  const startX = cx - width / 2;

  for (let i = 0; i < barCount; i++) {
    const x = startX + i * step;
    const normalized = Math.sin((i / barCount) * Math.PI);
    const waveH = Math.max(4, normalized * height * (0.4 + 0.6 * Math.sin(i * 1.25)));
    ctx.beginPath();
    ctx.moveTo(x, cy - waveH / 2);
    ctx.lineTo(x, cy + waveH / 2);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws the prominent AI Generated Hero Image Showcase directly in the right visual area
 * (Directly showcases the Pollinations AI + Groq generated visual with clean floating card aesthetics, no mobile phone)
 */
export function drawAiHeroImageShowcase(ctx, x, y, width, height, brandPrimary = '#00A2A2', post = {}, topicImg = null) {
  ctx.save();

  const pad = 6;
  const cardX = Math.round(x + pad);
  const cardY = Math.round(y + pad);
  const cardW = Math.round(width - pad * 2);
  const cardH = Math.round(height - pad * 2);
  const cardRadius = 24;

  const hasAiImage = topicImg && 
    (topicImg.complete !== false) && 
    ((topicImg.naturalWidth && topicImg.naturalWidth > 0) || (topicImg.width && topicImg.width > 0));

  // 1. Ambient Glow & Premium Floating Shadow behind the Hero Card
  ctx.save();
  ctx.shadowColor = 'rgba(0, 162, 162, 0.22)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;
  drawRoundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  // Secondary soft shadow for tactile depth
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  drawRoundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  if (hasAiImage) {
    // 2. Clip and Render the Real Pollinations AI Generated Image directly with exact object-fit: cover!
    ctx.save();
    drawRoundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
    ctx.clip();

    const imgNativeW = topicImg.naturalWidth || topicImg.width;
    const imgNativeH = topicImg.naturalHeight || topicImg.height;

    // True mathematical object-fit: cover with optical center alignment (no artificial margin slices)
    const imgAspect = imgNativeW / imgNativeH;
    const targetAspect = cardW / cardH;

    let sW, sH, sX, sY;
    if (imgAspect > targetAspect) {
      // Source image is wider than container: preserve full height, center horizontally
      sH = imgNativeH;
      sW = imgNativeH * targetAspect;
      sX = (imgNativeW - sW) / 2;
      sY = 0;
    } else {
      // Source image is taller than container: preserve full width, center vertically
      sW = imgNativeW;
      sH = imgNativeW / targetAspect;
      sX = 0;
      sY = (imgNativeH - sH) / 2;
    }

    ctx.drawImage(topicImg, sX, sY, sW, sH, cardX, cardY, cardW, cardH);

    // Subtle luxury sheen overlay (soft top light)
    const topSheen = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH * 0.3);
    topSheen.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    topSheen.addColorStop(1, 'transparent');
    ctx.fillStyle = topSheen;
    ctx.fillRect(cardX, cardY, cardW, cardH * 0.3);

    // Gentle bottom gradient vignette only behind bottom category tag (lowest 15% only)
    const bottomVignette = ctx.createLinearGradient(cardX, cardY + cardH * 0.85, cardX, cardY + cardH);
    bottomVignette.addColorStop(0, 'transparent');
    bottomVignette.addColorStop(1, 'rgba(15, 23, 42, 0.28)');
    ctx.fillStyle = bottomVignette;
    ctx.fillRect(cardX, cardY + cardH * 0.85, cardW, cardH * 0.15);

    ctx.restore(); // end image clip

    // 3. Sleek border around the hero image card
    ctx.save();
    const borderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    borderGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    borderGrad.addColorStop(0.5, 'rgba(0, 210, 210, 0.6)');
    borderGrad.addColorStop(1, 'rgba(0, 162, 162, 0.4)');
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 2;
    drawRoundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
    ctx.stroke();
    ctx.restore();

    // Optional Bottom Info Pill: Topic/Category Tag
    const tagText = post.categoryName || (post.topic ? post.topic.split(/[:\-,]/)[0] : 'Enterprise AI');
    if (tagText) {
      ctx.save();
      const cleanTag = tagText.length > 28 ? (tagText.slice(0, 26) + '...') : tagText;
      ctx.font = '600 11px "Inter", sans-serif';
      const tW = ctx.measureText(cleanTag).width + 22;
      const tH = 26;
      const tX = cardX + 16;
      const tY = cardY + cardH - tH - 16;

      drawRoundRect(ctx, tX, tY, tW, tH, 8);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#F8FAFC';
      ctx.textBaseline = 'middle';
      ctx.fillText(cleanTag, tX + 11, tY + tH / 2);
      ctx.restore();
    }

  } else {
    // 5. Elegant Placeholder while Pollinations AI synthesizes the image
    ctx.save();
    drawRoundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
    ctx.clip();

    const phGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    phGrad.addColorStop(0, '#0F172A');
    phGrad.addColorStop(0.5, '#1E293B');
    phGrad.addColorStop(1, '#0B192C');
    ctx.fillStyle = phGrad;
    ctx.fillRect(cardX, cardY, cardW, cardH);

    // Glowing cyber rings in center
    const cx = cardX + cardW / 2;
    const cy = cardY + cardH / 2 - 20;

    const radialGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 150);
    radialGlow.addColorStop(0, 'rgba(0, 240, 255, 0.28)');
    radialGlow.addColorStop(0.6, 'rgba(0, 162, 162, 0.08)');
    radialGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = radialGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 150, 0, Math.PI * 2);
    ctx.fill();

    // Concentric geometric tech rings
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 70, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 162, 162, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing AI core
    ctx.fillStyle = '#00F0FF';
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Status message
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('Synthesizing AI Visual...', cx, cy + 90);

    ctx.font = '500 12px "Inter", sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('Powered by Groq + Pollinations AI', cx, cy + 112);

    ctx.restore();

    // Sleek border for placeholder
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 2;
    drawRoundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Backward-compatibility alias for drawAiHeroImageShowcase
 */
export function draw3dPedestalWithSmartphone(ctx, x, y, width, height, brandPrimary = '#00A2A2', post = {}, topicImg = null) {
  drawAiHeroImageShowcase(ctx, x, y, width, height, brandPrimary, post, topicImg);
}

/**
 * Draws the 4-column floating feature cards row with mint circle badges
 */
export function drawFourInfinitetechFeatureCards(ctx, x, y, width, height, items = [], brandPrimary = '#00A2A2', isLandscape = false) {
  // Only render if user provided actual key points
  const validItems = (items || []).filter(it => it && String(it).trim().length > 0).slice(0, 4);
  if (validItems.length === 0) return;

  ctx.save();

  // 1. White floating card container with soft shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  drawRoundRect(ctx, x, y, width, height, 18);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.shadowColor = 'transparent';

  ctx.strokeStyle = 'rgba(0, 162, 162, 0.20)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Map strictly user key points (no hardcoded filler)
  const cols = validItems.map((item) => {
    const clean = String(item).replace(/^[✓•\-\*]\s*/, '').trim();
    const parts = clean.split(/[:\-,]/);
    const rawTitle = (parts[0]?.trim() || '').replace(/^\[|\]$/g, '').trim();
    const rawSub = (parts.slice(1).join(':')?.trim() || '').trim();
    return {
      title: rawTitle || clean.slice(0, 24),
      sub: rawSub
    };
  });

  const colCount = cols.length;
  const colW = width / colCount;

  cols.forEach((col, idx) => {
    const colCx = x + idx * colW + colW / 2;

    // Vertical hairline divider between columns
    if (idx > 0) {
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.85)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + idx * colW, y + 14);
      ctx.lineTo(x + idx * colW, y + height - 14);
      ctx.stroke();
    }

    // Title & Subtitle centered cleanly
    const titleSize = isLandscape ? 13 : 16;
    const subSize = isLandscape ? 10 : 12;
    const maxSubW = colW - (isLandscape ? 14 : 20);

    ctx.font = `500 ${subSize}px "Inter", "Plus Jakarta Sans", sans-serif`;
    const subLines = col.sub ? wrapText(ctx, col.sub, maxSubW) : [];

    const lineSpacing = isLandscape ? 14 : 17;
    const totalContentH = titleSize + (subLines.length > 0 ? (8 + subLines.length * lineSpacing) : 0);
    const startY = y + (height - totalContentH) / 2 + titleSize * 0.82;

    // Title
    ctx.font = `800 ${titleSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(col.title, colCx, startY);

    // Subtitle (if present)
    if (subLines.length > 0) {
      ctx.font = `500 ${subSize}px "Inter", "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = '#64748B';
      let subCurY = startY + 8;
      subLines.forEach(line => {
        subCurY += lineSpacing;
        ctx.fillText(line, colCx, subCurY);
      });
    }
    ctx.textAlign = 'left';
  });

  ctx.restore();
}

/**
 * Draws the organic dark wave banner across the lower section
 */
export function drawDarkWaveRibbon(ctx, x, y, width, height, brandPrimary = '#00A2A2', isLandscape = false, post = {}, brand = {}) {
  ctx.save();

  // Organic curved wave path
  ctx.beginPath();
  ctx.moveTo(x, y + 14);
  ctx.quadraticCurveTo(x + width * 0.40, y - 8, x + width, y + 10);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();

  const ribGrad = ctx.createLinearGradient(x, y, x + width, y + height);
  ribGrad.addColorStop(0, '#041922');
  ribGrad.addColorStop(0.5, '#072430');
  ribGrad.addColorStop(1, '#0C3242');
  ctx.fillStyle = ribGrad;
  ctx.fill();

  // Top subtle glowing edge line
  ctx.strokeStyle = `${brandPrimary}44`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, y + 14);
  ctx.quadraticCurveTo(x + width * 0.40, y - 8, x + width, y + 10);
  ctx.stroke();

  // Clean, non-hardcoded content from brand / post
  const midY = y + height / 2;
  const leftPad = isLandscape ? 20 : 28;

  // Left Section: Brand name / headline
  const brandName = brand?.companyName || '';
  if (brandName) {
    ctx.font = `800 ${isLandscape ? 12 : 15}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';
    ctx.fillText(brandName.toUpperCase(), x + leftPad, midY);
  }

  // Right Section: Tagline or CTA (if set)
  const rightText = brand?.tagline || post?.cta || '';
  if (rightText) {
    ctx.textAlign = 'right';
    ctx.font = `700 ${isLandscape ? 11 : 13}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#00F0FF';
    ctx.textBaseline = 'middle';
    ctx.fillText(rightText, x + width - leftPad, midY);
    ctx.textAlign = 'left';
  }

  ctx.restore();
}

/**
 * Draws the clean white footer bar with globe icon and website URL
 */
export function drawInfinitetechFooter(ctx, x, y, width, height, website = '', brandPrimary = '#00A2A2', isLandscape = false, brand = {}) {
  ctx.save();

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, width, height);

  const midY = y + height / 2;
  const pad = isLandscape ? 20 : 28;

  // Left: Globe Icon & Website URL (ONLY if website provided)
  const siteUrl = website ? website.replace(/^https?:\/\//, '') : (brand?.websiteUrl ? brand.websiteUrl.replace(/^https?:\/\//, '') : '');
  if (siteUrl) {
    drawGlobeIcon(ctx, x + pad + 10, midY, isLandscape ? 16 : 20, brandPrimary);
    ctx.font = `700 ${isLandscape ? 12 : 14}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#0F172A';
    ctx.textBaseline = 'middle';
    ctx.fillText(siteUrl, x + pad + (isLandscape ? 24 : 30), midY);
  }

  // Right: Brand Tagline or Company Name (ONLY if provided)
  const tagText = brand?.tagline || brand?.companyName || '';
  if (tagText) {
    ctx.font = `600 ${isLandscape ? 10 : 12}px "Plus Jakarta Sans", Inter, sans-serif`;
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(tagText, x + width - pad, midY);
    ctx.textAlign = 'left';
  }

  ctx.restore();
}

