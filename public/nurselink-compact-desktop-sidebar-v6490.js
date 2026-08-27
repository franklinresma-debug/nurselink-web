/* NurseLink Compact Desktop Sidebar v64.9.0 */
(() => {
  if (window.__NL_COMPACT_DESKTOP_SIDEBAR_V6490__) return;
  window.__NL_COMPACT_DESKTOP_SIDEBAR_V6490__ = true;

  let timer = null;

  function sidebar() {
    return document.querySelector(
      '.nurselink-sidebar,.nl-sidebar,aside[class*="sidebar"],[data-nl-sidebar]'
    );
  }

  function txt(el) {
    return (el?.textContent || '').replace(/\s+/g,' ').trim();
  }

  function visible(el) {
    if (!el) return false;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 5 && r.height > 5;
  }

  function markBrandBlock(sb) {
    const title = sb.querySelector('[data-nl6489-brand-title="1"]') ||
      Array.from(sb.querySelectorAll('*')).find(el => txt(el) === 'NurseLink');

    if (!title) return;

    let block = title.parentElement;
    while (block && block !== sb) {
      const r = block.getBoundingClientRect();
      if (r.width > 130 && r.height > 40 && r.height < 180) {
        block.setAttribute('data-nl6490-brand-block','1');
        return;
      }
      block = block.parentElement;
    }
  }

  function markDividers(sb) {
    for (const el of sb.querySelectorAll('hr,[class*="divider"],[class*="separator"]')) {
      if (visible(el)) el.setAttribute('data-nl6490-sidebar-divider','1');
    }
  }

  function findCenterCard(sb, needle) {
    const candidates = Array.from(sb.querySelectorAll('a,button,div,section,article'));

    return candidates.find(el => {
      const t = txt(el).toLowerCase();
      if (!t.includes(needle)) return false;

      const r = el.getBoundingClientRect();
      return r.width > 120 && r.height > 35 && r.height < 120;
    }) || null;
  }

  function markCenterCard(card) {
    if (!card) return;

    card.setAttribute('data-nl6490-center-card','1');

    const children = Array.from(card.children);

    const icon = children.find(el => {
      const r = el.getBoundingClientRect();
      return r.width <= 60 && r.height <= 60;
    });

    if (icon) icon.setAttribute('data-nl6490-center-icon','1');

    const textBlock = children.find(el => el !== icon && txt(el).length > 0);
    if (textBlock) {
      textBlock.setAttribute('data-nl6490-center-text','1');

      const pieces = Array.from(textBlock.querySelectorAll('*')).filter(el => txt(el).length > 0);

      if (pieces[0]) pieces[0].setAttribute('data-nl6490-center-title','1');
      if (pieces[1]) pieces[1].setAttribute('data-nl6490-center-subtitle','1');
    }
  }

  function markStack(admin, test) {
    if (!admin || !test) return;

    let p = admin.parentElement;
    while (p && p !== sidebar()) {
      if (p.contains(test)) {
        p.setAttribute('data-nl6490-center-stack','1');
        return;
      }
      p = p.parentElement;
    }
  }

  function markSignout(sb) {
    const el = Array.from(sb.querySelectorAll('a,button,div'))
      .find(el => txt(el).toLowerCase() === 'sign out');

    if (el) el.setAttribute('data-nl6490-signout','1');
  }

  function apply() {
    if (innerWidth <= 900) return;

    const sb = sidebar();
    if (!sb) return;

    markBrandBlock(sb);
    markDividers(sb);

    const admin = findCenterCard(sb, 'admin center');
    const test = findCenterCard(sb, 'test center');

    markCenterCard(admin);
    markCenterCard(test);
    markStack(admin, test);
    markSignout(sb);

    document.documentElement.setAttribute('data-nl6490-compact-desktop-sidebar','1');

    requestAnimationFrame(() => {
      const r = sb.getBoundingClientRect();
      const overflow = sb.scrollHeight > sb.clientHeight + 2;

      document.documentElement.setAttribute(
        'data-nl6490-sidebar-fit',
        overflow ? 'overflow' : 'ok'
      );
    });
  }

  const observer = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(apply,100);
  });

  window.addEventListener('resize', () => setTimeout(apply,100));

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
