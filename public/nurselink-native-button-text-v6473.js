/* NurseLink Native Button Text Contrast v64.7.3
   Text color only. Never changes background, border, radius, shadow or transform.
*/
(() => {
  if (window.__NL_NATIVE_BUTTON_TEXT_V6473__) return;
  window.__NL_NATIVE_BUTTON_TEXT_V6473__ = true;

  const ATTR = 'data-nl6473-button-tone';
  const SELECTOR = [
    'button',
    'input[type="button"]',
    'input[type="submit"]',
    'input[type="reset"]',
    '[role="button"]',
    'a[href]'
  ].join(',');

  let mutationTimer = null;

  function parseRgb(value) {
    const m = String(value || '').match(
      /rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)(?:\s*[,/]\s*(\d+(?:\.\d+)?))?/i
    );
    if (!m) return null;
    return {
      r:+m[1], g:+m[2], b:+m[3],
      a:m[4] == null ? 1 : +m[4]
    };
  }

  function channel(v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }

  function luminance(c) {
    return .2126*channel(c.r)+.7152*channel(c.g)+.0722*channel(c.b);
  }

  function visible(el) {
    if (!el) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2;
  }

  function ownPaintedBackground(el) {
    const own = parseRgb(getComputedStyle(el).backgroundColor);
    if (own && own.a > .12) return own;

    // Some NurseLink CTAs paint the visible surface on a direct child.
    for (const child of el.children || []) {
      const c = parseRgb(getComputedStyle(child).backgroundColor);
      if (c && c.a > .12) return c;
    }
    return null;
  }

  function isButtonLike(el) {
    if (!visible(el)) return false;

    if (el.matches(
      'button,input[type="button"],input[type="submit"],input[type="reset"],[role="button"]'
    )) return true;

    // Plain anchors are treated as buttons only if they paint a visible surface.
    return el.tagName === 'A' && !!ownPaintedBackground(el);
  }

  function classify(el) {
    if (!el || !el.matches?.(SELECTOR) || !isButtonLike(el)) return;

    const bg = ownPaintedBackground(el);
    if (!bg) {
      el.removeAttribute(ATTR);
      return;
    }

    el.setAttribute(ATTR, luminance(bg) >= .60 ? 'light' : 'dark');
  }

  function classifyAfterPaint(el) {
    if (!el) return;
    requestAnimationFrame(() => {
      classify(el);
      requestAnimationFrame(() => classify(el));
    });
  }

  function scan(root=document) {
    if (root.nodeType === 1 && root.matches?.(SELECTOR)) classify(root);
    root.querySelectorAll?.(SELECTOR).forEach(classify);
    document.documentElement.setAttribute('data-nl6473-native-button-text','1');
  }

  // Recompute text tone after the application's own hover/focus styles paint.
  document.addEventListener('pointerover', e => {
    classifyAfterPaint(e.target.closest?.(SELECTOR));
  }, true);

  document.addEventListener('pointerout', e => {
    classifyAfterPaint(e.target.closest?.(SELECTOR));
  }, true);

  document.addEventListener('focusin', e => {
    classifyAfterPaint(e.target.closest?.(SELECTOR));
  }, true);

  document.addEventListener('focusout', e => {
    classifyAfterPaint(e.target.closest?.(SELECTOR));
  }, true);

  document.addEventListener('pointerdown', e => {
    classifyAfterPaint(e.target.closest?.(SELECTOR));
  }, true);

  document.addEventListener('pointerup', e => {
    classifyAfterPaint(e.target.closest?.(SELECTOR));
  }, true);

  const observer = new MutationObserver(records => {
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(() => {
      for (const rec of records) {
        for (const node of rec.addedNodes || []) {
          if (node.nodeType === 1) scan(node);
        }
      }
      scan(document);
    }, 100);
  });

  function boot() {
    scan(document);

    observer.observe(document.documentElement, {
      childList:true,
      subtree:true
    });

    // Bounded delayed scans for initial SPA paint only.
    [250,700,1400].forEach(ms => setTimeout(() => scan(document), ms));
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded',boot,{once:true})
    : boot();
})();
