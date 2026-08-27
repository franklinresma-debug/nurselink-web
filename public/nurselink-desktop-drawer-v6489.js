/* NurseLink Desktop Drawer Normalization v64.8.9 */
(() => {
  if (window.__NL_DESKTOP_DRAWER_V6489__) return;
  window.__NL_DESKTOP_DRAWER_V6489__ = true;

  let timer = null;

  function sidebar() {
    return document.querySelector(
      '.nurselink-sidebar,.nl-sidebar,aside[class*="sidebar"],[data-nl-sidebar]'
    );
  }

  function text(el) {
    return (el?.textContent || '').replace(/\s+/g,' ').trim();
  }

  function markBrand(sb) {
    if (!sb) return;

    const all = Array.from(sb.querySelectorAll('*'));

    for (const el of all) {
      const t = text(el);

      if (t === 'NurseLink') {
        el.setAttribute('data-nl6489-brand-title','1');
      }

      if (t === 'KAPIT-BISIG' || t === 'KAPIT–BISIG') {
        el.setAttribute('data-nl6489-brand-subtitle','1');
      }
    }
  }

  function findCard(sb, name) {
    const candidates = Array.from(
      sb.querySelectorAll('a,button,div,section,article')
    );

    return candidates.find(el => {
      const t = text(el).toLowerCase();
      if (!t.includes(name)) return false;

      const r = el.getBoundingClientRect();
      return r.width > 120 && r.height > 40 && r.height < 130;
    }) || null;
  }

  function directVisualChild(card, predicate) {
    if (!card) return null;

    const children = Array.from(card.children);
    return children.find(predicate) || null;
  }

  function markCenterCard(card) {
    if (!card) return;

    card.setAttribute('data-nl6489-center-card','1');

    const icon = directVisualChild(card, el => {
      const r = el.getBoundingClientRect();
      return r.width <= 60 && r.height <= 60;
    }) || card.querySelector(
      '[class*="icon"],[class*="avatar"],[class*="badge"],svg'
    )?.parentElement;

    if (icon && icon !== card) {
      icon.setAttribute('data-nl6489-center-icon','1');
    }

    const textBlock = Array.from(card.children).find(el => el !== icon && text(el).length > 0);

    if (textBlock && textBlock !== card) {
      textBlock.setAttribute('data-nl6489-center-text','1');
    }
  }

  function markCenterStack(admin, test) {
    if (!admin || !test) return;

    const ap = admin.parentElement;
    const tp = test.parentElement;

    if (ap && ap === tp) {
      ap.setAttribute('data-nl6489-center-stack','1');
    }
  }

  function markSignOut(sb) {
    if (!sb) return;

    const el = Array.from(sb.querySelectorAll('a,button,div')).find(
      el => text(el).toLowerCase() === 'sign out'
    );

    if (el) el.setAttribute('data-nl6489-signout','1');
  }

  function apply() {
    const sb = sidebar();
    if (!sb) return;

    markBrand(sb);

    const admin = findCard(sb,'admin center');
    const test = findCard(sb,'test center');

    markCenterCard(admin);
    markCenterCard(test);
    markCenterStack(admin,test);
    markSignOut(sb);

    document.documentElement.setAttribute('data-nl6489-desktop-drawer','1');
  }

  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(apply,100);
  });

  function boot() {
    apply();

    observer.observe(document.documentElement,{
      childList:true,
      subtree:true
    });

    [250,700,1400].forEach(ms => setTimeout(apply,ms));
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded',boot,{once:true})
    : boot();
})();
