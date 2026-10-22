import type { Rect } from '@/lib/roam';

/** Anything inside these is decoration, or the duck itself — not text the duck must keep clear of. */
const IGNORED = '[data-roaming-duck], [aria-hidden="true"], [hidden], [data-duck-ignore], script, style, noscript';
/** Controls are avoided as a whole, not just their label. */
const CONTROLS = 'button, a[href], input, select, textarea, summary, [role="radio"], [role="tab"]';

/**
 * Where the readable parts of the page are right now, in viewport pixels: the real line boxes of every
 * visible piece of text, plus the boxes of buttons, links and inputs. Only what is (nearly) on screen.
 */
export function collectObstacles(vw: number, vh: number, pad = 200): Rect[] {
  const out: Rect[] = [];
  const visible = (r: { left: number; right: number; top: number; bottom: number; width: number; height: number }) =>
    r.width > 0 && r.height > 0 && r.right > -pad && r.left < vw + pad && r.bottom > -pad && r.top < vh + pad;
  const push = (r: DOMRect) => {
    if (visible(r)) out.push({ l: r.left, t: r.top, r: r.right, b: r.bottom });
  };

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent || parent.closest(IGNORED)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    range.selectNodeContents(n);
    for (const r of Array.from(range.getClientRects())) push(r);
  }
  range.detach();

  document.querySelectorAll(CONTROLS).forEach((el) => {
    if (!el.closest(IGNORED)) push(el.getBoundingClientRect());
  });
  return out;
}
