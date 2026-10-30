/**
 * Topic Image Intelligence & Visual Engine for PostCraft AI
 * Maps post topics and headlines to high-resolution, royalty-free curated visuals,
 * and provides procedural fallback graphics with zero external dependencies.
 */

import { drawRoundRect } from './textLayout.js';

export const TOPIC_IMAGE_PRESETS = [
  {
    id: 'festival-diwali',
    label: 'Diwali Festival of Lights',
    category: 'Festivals & Celebrations',
    tag: '🪔 FESTIVAL OF LIGHTS',
    url: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1200&q=80',
    keywords: ['diwali', 'deepavali', 'deepawali', 'diwaly', 'diya', 'festival of lights', 'rangoli']
  },
  {
    id: 'festive-celebration',
    label: 'Festive Celebrations & Greetings',
    category: 'Festivals & Celebrations',
    tag: '✨ CELEBRATIONS & GREETINGS',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    keywords: ['festival', 'festive', 'celebration', 'celebrate', 'wishes', 'greeting', 'greetings', 'holiday', 'new year', 'christmas', 'xmas', 'eid']
  },
  {
    id: 'hiring-careers',
    label: 'Careers & Team Hiring',
    category: 'Careers & Hiring',
    tag: '💼 WE ARE HIRING',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    keywords: ['hiring', 'hire', 'career', 'careers', 'job', 'vacancy', 'recruitment', 'walk-in', 'join our team', 'openings', 'we are hiring']
  },
  {
    id: 'ai-core',
    label: 'AI Neural Core',
    category: 'AI & Machine Learning',
    tag: '✨ AI & NEURAL ARCHITECTURE',
    url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    keywords: ['artificial intelligence', 'ai', 'neural', 'machine learning', 'deep learning', 'algorithm', 'model', 'llm', 'gpt', 'genai', 'generative', 'ai advantage']
  },
  {
    id: 'ai-cloud',
    label: 'AI Cloud & Datacenter',
    category: 'Cloud & AI',
    tag: '☁️ AI CLOUD & INFRASTRUCTURE',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    keywords: ['ai cloud', 'cloud ai', 'cloud', 'datacenter', 'server', 'devops', 'kubernetes', 'aws', 'azure', 'docker', 'infrastructure']
  },
  {
    id: 'ai-gaming',
    label: 'AI Gaming & Virtual Worlds',
    category: 'Gaming & Metaverse',
    tag: '🎮 AI GAMING & WORLDS',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    keywords: ['ai gaming', 'gaming', 'game', 'gamer', 'metaverse', 'virtual world', 'npc', 'esports', 'unreal', 'unity']
  },
  {
    id: 'ai-marketing',
    label: 'AI Marketing & Digital Strategy',
    category: 'Marketing & AI',
    tag: '📈 AI MARKETING & GROWTH',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    keywords: ['ai marketing', 'marketing', 'campaign', 'conversion', 'leads', 'ads', 'sales', 'funnel']
  },
  {
    id: 'ai-robot',
    label: 'Robotics & Automation',
    category: 'Automation',
    tag: '🤖 SMART AUTOMATION',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80',
    keywords: ['automation', 'robot', 'robotic', 'automate', 'autonomous', 'workflow', 'efficiency', 'bot']
  },
  {
    id: 'cloud-infra',
    label: 'Cloud Datacenter',
    category: 'Cloud & Infrastructure',
    tag: '☁️ CLOUD INFRASTRUCTURE',
    url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80',
    keywords: ['cloud', 'datacenter', 'server', 'devops', 'kubernetes', 'aws', 'azure', 'docker', 'infrastructure', 'hosting', 'compute']
  },
  {
    id: 'cyber-vault',
    label: 'Cybersecurity Shield',
    category: 'Cybersecurity',
    tag: '🛡️ SECURITY & TRUST',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80',
    keywords: ['cyber', 'security', 'cybersecurity', 'zero-trust', 'threat', 'hack', 'firewall', 'encryption', 'privacy', 'compliance', 'protect']
  },
  {
    id: 'growth-team',
    label: 'Business Growth',
    category: 'Growth & Startups',
    tag: '🚀 STRATEGIC GROWTH',
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
    keywords: ['growth', 'marketing', 'scale', 'startup', 'sales', 'acquisition', 'retention', 'revenue', 'customer', 'business', 'churn']
  },
  {
    id: 'data-analytics',
    label: 'Data Analytics & BI',
    category: 'Data & Analytics',
    tag: '📊 DATA INTELLIGENCE',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
    keywords: ['data', 'analytic', 'bi', 'metric', 'finance', 'financial', 'kpi', 'dashboard', 'predictive', 'statistics', 'charts']
  },
  {
    id: 'team-leadership',
    label: 'Leadership & Workplace',
    category: 'Leadership',
    tag: '👥 TEAM LEADERSHIP',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    keywords: ['leadership', 'manager', 'executive', 'workplace']
  },
  {
    id: 'career-hiring',
    label: 'Careers & Hiring',
    category: 'Careers & Hiring',
    tag: '🤝 WE ARE HIRING',
    url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80',
    keywords: ['hiring', 'career', 'job', 'vacancy', 'opening', 'recruit', 'recruitment', 'talent', 'join our team', 'internship', 'fellowship', 'apply now']
  },
  {
    id: 'interview-workspace',
    label: 'Executive Interview & Drive',
    category: 'Careers & Hiring',
    tag: '💼 TALENT & CAREERS',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80',
    keywords: ['executive search', 'walk-in', 'referral', 'interviews', 'candidate', 'open positions']
  },
  {
    id: 'medical-biotech',
    label: 'Healthcare & Biotech',
    category: 'Healthcare',
    tag: '🧬 HEALTHCARE & SCIENCE',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
    keywords: ['health', 'healthcare', 'medical', 'medicine', 'biotech', 'patient', 'hospital', 'clinical', 'pharma']
  },
  {
    id: 'green-sustainability',
    label: 'Clean Tech & Future',
    category: 'Sustainability',
    tag: '🌱 GREEN COMPUTING',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
    keywords: ['sustain', 'green', 'clean', 'eco', 'earth', 'energy', 'carbon', 'environment', 'future']
  },
  {
    id: 'tech-circuit',
    label: 'Next-Gen Technology',
    category: 'Technology',
    tag: '⚡ NEXT-GEN TECH',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    keywords: ['tech', 'software', 'hardware', 'code', 'engineer', 'developer', 'digital', 'api', 'platform']
  }
];

/**
 * Returns the most relevant image preset and URL based on topic and headline
 */
function keywordMatches(text, keyword) {
  const kw = (keyword || '').trim().toLowerCase();
  if (!kw) return false;
  if (kw.includes(' ')) {
    return text.includes(kw);
  }
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i');
  return regex.test(text);
}

export function getTopicRelatedImage(topic = '', headline = '', category = '', customImageUrl = '') {
  if (customImageUrl && customImageUrl.trim()) {
    return {
      id: 'custom',
      label: 'Custom Image',
      tag: '🖼️ FEATURED VISUAL',
      url: customImageUrl.trim()
    };
  }

  const query = `${topic} ${headline} ${category}`.toLowerCase();

  // 1. Check for specific multi-word phrases first (e.g. "ai cloud", "ai marketing", "data engineering")
  for (const preset of TOPIC_IMAGE_PRESETS) {
    for (const kw of preset.keywords) {
      if (kw.includes(' ') && keywordMatches(query, kw)) {
        return preset;
      }
    }
  }

  // 2. Check for single-word keywords with strict word boundaries
  for (const preset of TOPIC_IMAGE_PRESETS) {
    for (const kw of preset.keywords) {
      if (!kw.includes(' ') && keywordMatches(query, kw)) {
        return preset;
      }
    }
  }

  // Default to AI Core or Circuit
  return TOPIC_IMAGE_PRESETS[0];
}

/**
 * Draws an image with object-fit: cover inside a rounded rectangle with gradient overlay
 */
export function drawCoverImage(ctx, img, x, y, width, height, radius = 20, isDark = true, accentColor = '#3b82f6') {
  ctx.save();

  // 1. Clip to rounded rectangle
  drawRoundRect(ctx, x, y, width, height, radius);
  ctx.clip();

  if (img && img.width > 0 && img.height > 0) {
    // 2. Object-fit cover calculation with true optical center alignment
    const imgRatio = img.width / img.height;
    const targetRatio = width / height;

    let renderW, renderH, offsetX, offsetY;

    if (imgRatio > targetRatio) {
      renderH = height;
      renderW = height * imgRatio;
      offsetX = x - (renderW - width) / 2;
      offsetY = y;
    } else {
      renderW = width;
      renderH = width / imgRatio;
      offsetX = x;
      offsetY = y - (renderH - height) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

    // 3. Subtle gradient overlay to blend smoothly with post
    const grad = ctx.createLinearGradient(x, y, x, y + height);
    if (isDark) {
      grad.addColorStop(0, 'rgba(10, 15, 30, 0.08)');
      grad.addColorStop(0.7, 'rgba(10, 15, 30, 0.20)');
      grad.addColorStop(1, 'rgba(10, 15, 30, 0.55)');
    } else {
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
      grad.addColorStop(0.7, 'rgba(240, 244, 250, 0.15)');
      grad.addColorStop(1, 'rgba(230, 238, 248, 0.45)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, width, height);

    // Subtle colored edge tint
    const tintGrad = ctx.createLinearGradient(x, y + height - 80, x, y + height);
    tintGrad.addColorStop(0, 'transparent');
    tintGrad.addColorStop(1, `${accentColor}28`);
    ctx.fillStyle = tintGrad;
    ctx.fillRect(x, y + height - 80, width, 80);

  } else {
    // Fallback: draw rich procedural generative art if image not loaded
    drawProceduralArt(ctx, x, y, width, height, accentColor, isDark);
  }

  ctx.restore();

  // 4. Draw outer border rim
  ctx.save();
  drawRoundRect(ctx, x, y, width, height, radius);
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner subtle glow border
  drawRoundRect(ctx, x + 1, y + 1, width - 2, height - 2, radius - 1);
  ctx.strokeStyle = `${accentColor}35`;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

/**
 * High-aesthetic procedural art when offline or loading
 */
function drawProceduralArt(ctx, x, y, width, height, accentColor, isDark) {
  // Deep gradient background
  const bg = ctx.createLinearGradient(x, y, x + width, y + height);
  bg.addColorStop(0, isDark ? '#0f172a' : '#f1f5f9');
  bg.addColorStop(1, isDark ? '#1e1b4b' : '#e2e8f0');
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, width, height);

  // Geometric glowing grid
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
  ctx.lineWidth = 1;
  const step = 40;
  for (let gx = x; gx <= x + width; gx += step) {
    ctx.beginPath();
    ctx.moveTo(gx, y);
    ctx.lineTo(gx, y + height);
    ctx.stroke();
  }
  for (let gy = y; gy <= y + height; gy += step) {
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + width, gy);
    ctx.stroke();
  }

  // Glowing center orbs
  const cx = x + width / 2;
  const cy = y + height / 2;

  const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.45);
  glow.addColorStop(0, `${accentColor}66`);
  glow.addColorStop(0.6, `${accentColor}20`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, width * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Futuristic orbital rings
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.min(width, height) * 0.28, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `${accentColor}88`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, width * 0.35, height * 0.18, Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();
}
