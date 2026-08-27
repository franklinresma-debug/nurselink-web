/* NurseLink Digital Member ID One-Column Layout v64.3.5 */
(() => {
  if (window.__NL_DIGITAL_ID_ONE_COLUMN_V6435__) return;
  window.__NL_DIGITAL_ID_ONE_COLUMN_V6435__ = true;

  const MEMBER_ID_TEXT = 'Your NurseLink Member ID';
  const MEMBERSHIP_TEXT = 'Keep your member details current';

  function normalizedText(el) {
    return (el?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function findHeading(text) {
    const candidates = document.querySelectorAll('h1,h2,h3,strong,[class*="title"],[class*="heading"]');
    for (const el of candidates) {
      if (normalizedText(el).includes(text)) return el;
    }
    return null;
  }

  function meaningfulPanel(el) {
    let node = el;
    for (let i = 0; node && i < 8; i++, node = node.parentElement) {
      const rect = node.getBoundingClientRect();
      if (rect.width > 320 && rect.height > 180) return node;
    }
    return el?.parentElement || null;
  }

  function findCommonParent(a, b) {
    if (!a || !b) return null;
    const ancestors = new Set();
    let n = a;
    while (n) {
      ancestors.add(n);
      n = n.parentElement;
    }
    n = b;
    while (n) {
      if (ancestors.has(n)) return n;
      n = n.parentElement;
    }
    return null;
  }

  function directChildUnder(parent, node) {
    if (!parent || !node) return null;
    let current = node;
    while (current && current.parentElement !== parent) {
      current = current.parentElement;
    }
    return current;
  }

  function apply() {
    const memberHeading = findHeading(MEMBER_ID_TEXT);
    const identityHeading = findHeading(MEMBERSHIP_TEXT);

    if (!memberHeading || !identityHeading) return false;

    const memberPanel = meaningfulPanel(memberHeading);
    const identityPanel = meaningfulPanel(identityHeading);
    const common = findCommonParent(memberPanel, identityPanel);

    if (!common) return false;

    const memberChild = directChildUnder(common, memberPanel);
    const identityChild = directChildUnder(common, identityPanel);

    if (!memberChild || !identityChild || memberChild === identityChild) return false;

    common.setAttribute('data-nl-digital-id-stack', 'v6435');
    memberChild.setAttribute('data-nl-digital-id-panel', 'member-id');
    identityChild.setAttribute('data-nl-digital-id-panel', 'membership-identity');
    document.documentElement.setAttribute('data-nl-digital-id-layout', 'v6435');

    return true;
  }

  let attempts = 0;
  function boot() {
    if (apply()) return;
    if (++attempts < 12) setTimeout(boot, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else {
    boot();
  }

  new MutationObserver(() => {
    if (!document.documentElement.hasAttribute('data-nl-digital-id-layout')) {
      apply();
    }
  }).observe(document.documentElement, {subtree:true, childList:true});
})();
