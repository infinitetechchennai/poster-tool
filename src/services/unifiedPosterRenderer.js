/**
 * Dedicated Multi-Layout Canvas Renderer for 50 Core Professional Templates
 * 
 * Dispatcher for:
 * - 10 Hiring Templates (hiring-01 to hiring-10) -> renderHiringTemplate
 * - 10 Product Showcase Templates (product-01 to product-10) -> renderProductTemplate
 * - 10 Festival & Celebration Templates (festival-01 to festival-10) -> renderFestivalTemplate
 * - 20 Common & Business Insights Templates (common-01 to common-20) -> renderCommonTemplate
 * 
 * Guaranteed:
 * - Every single template has its OWN unique, bespoke visual identity.
 * - Dynamic background image handling: seamlessly fits uploaded images (cover/mockup),
 *   or renders complete high-end vector artwork if no image uploaded.
 * - Top: Brand logo + Category badge pill.
 * - Bottom: High-converting CTA + generously padded contact capsule (never clipped).
 * - 100% Dynamic Text: Keystrokes update in real-time with zero text collisions or empty boxes.
 */

import { renderHiringTemplate } from './renderers/hiringRenderers.js';
import { renderProductTemplate } from './renderers/productRenderers.js';
import { renderFestivalTemplate } from './renderers/festivalRenderers.js';
import { renderCommonTemplate } from './renderers/commonRenderers.js';

export async function renderUnifiedPoster(params) {
  const { style } = params;
  const styleId = (style?.id || '').toLowerCase();

  if (styleId.startsWith('hiring-')) {
    return renderHiringTemplate({ ...params, id: styleId });
  }

  if (styleId.startsWith('product-')) {
    return renderProductTemplate({ ...params, id: styleId });
  }

  if (styleId.startsWith('festival-')) {
    return renderFestivalTemplate({ ...params, id: styleId });
  }

  if (styleId.startsWith('common-')) {
    return renderCommonTemplate({ ...params, id: styleId });
  }

  // Fallback to Common Template
  return renderCommonTemplate({ ...params, id: 'common-01' });
}
