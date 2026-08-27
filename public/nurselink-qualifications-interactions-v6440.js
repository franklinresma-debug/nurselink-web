/* NurseLink Qualifications Buttons + Profile Photo v64.4.0 */
(() => {
  if (window.__NL_QUALIFICATIONS_INTERACTIONS_V6440__) return;
  window.__NL_QUALIFICATIONS_INTERACTIONS_V6440__ = true;

  const onQualificationsRoute = () => location.pathname.replace(/\/+$/,'') === '/qualifications';

  const ROUTES = {
    'Overview': '/profile',
    'Qualifications': '/qualifications',
    'Certificates': '/credentials',
    'Portfolio': '/portfolio',
    'Experience': '/profile#experience',
    'Licenses': '/credentials',
    'Education': '/profile#education',
    'Documents': '/documents'
  };

  function normalized(el) {
    return (el?.textContent || '').replace(/[^\p{L}\p{N}\s/&-]/gu,' ').replace(/\s+/g,' ').trim();
  }

  function photoFromImg() {
    const selectors = [
      '.topbar img',
      'header img',
      '.user-chip img',
      '.nurselink-super-admin-user img',
      '[class*="user"] [class*="avatar"] img',
      '[class*="avatar"] img',
      '[class*="profile"] img'
    ];

    const seen = new Set();
    for (const selector of selectors) {
      for (const img of document.querySelectorAll(selector)) {
        const src = img.currentSrc || img.getAttribute('src') || '';
        if (!src || seen.has(src)) continue;
        seen.add(src);

        if (
          src.startsWith('blob:') ||
          src.startsWith('data:image/') ||
          src.startsWith('http://') ||
          src.startsWith('https://') ||
          src.startsWith('/')
        ) {
          return src;
        }
      }
    }
    return '';
  }

  function photoFromBackground() {
    const selectors = [
      '.avatar',
      '[class*="avatar"]',
      '.user-chip',
      '[class*="profile-photo"]',
      '[class*="profile_image"]'
    ];

    for (const selector of selectors) {
      for (const el of document.querySelectorAll(selector)) {
        const bg = getComputedStyle(el).backgroundImage || '';
        const m = bg.match(/url\(["']?(.*?)["']?\)/i);
        if (m && m[1] && m[1] !== 'none') return m[1];
      }
    }
    return '';
  }

  function bestPhoto() {
    return photoFromImg() || photoFromBackground() || '';
  }

  function applyPhoto(page) {
    const holder = page.querySelector('.nl6439-avatar');
    if (!holder) return false;

    const src = bestPhoto();
    if (!src) return false;

    if (holder.tagName === 'IMG') {
      if (holder.getAttribute('src') !== src) holder.setAttribute('src',src);
      holder.alt = 'Member profile photo';
      holder.classList.remove('nl6439-avatar-fallback');
      return true;
    }

    const img = document.createElement('img');
    img.className = 'nl6439-avatar nl6440-profile-photo';
    img.src = src;
    img.alt = 'Member profile photo';
    holder.replaceWith(img);
    return true;
  }

  function activateTabs(page) {
    const nav = page.querySelector('.nl6439-tabs');
    if (!nav || nav.dataset.nl6440Ready === '1') return;

    Array.from(nav.children).forEach(item => {
      const label = normalized(item);
      const matched = Object.keys(ROUTES).find(k => label.includes(k));
      if (!matched) return;

      const a = document.createElement('a');
      a.href = ROUTES[matched];
      a.className = matched === 'Qualifications' ? 'nl6440-tab active' : 'nl6440-tab';
      a.textContent = matched;

      if (matched === 'Qualifications') {
        a.setAttribute('aria-current','page');
        a.addEventListener('click',e=>e.preventDefault());
      }

      item.replaceWith(a);
    });

    nav.dataset.nl6440Ready='1';
  }

  function activateExport(page) {
    const head = page.querySelector('.nl6439-page-head');
    const btn = head?.querySelector('button');
    if (!btn || btn.dataset.nl6440Ready === '1') return;

    btn.type='button';
    btn.innerHTML='⇩ Export to PDF';
    btn.title='Open print dialog to save this qualifications profile as PDF';
    btn.addEventListener('click',e=>{
      e.preventDefault();
      window.print();
    });
    btn.dataset.nl6440Ready='1';
  }

  function activateDetails(page) {
    const link = page.querySelector('.nl6439-readiness a');
    const target = page.querySelector('#nl6439-framework');
    if (!link || !target || link.dataset.nl6440Ready === '1') return;

    link.href='#nl6439-framework';
    link.addEventListener('click',e=>{
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'start'});
      history.replaceState(null,'','#nl6439-framework');
    });
    link.dataset.nl6440Ready='1';
  }

  function activateCopy(page) {
    const btn = page.querySelector('[data-copy]');
    if (!btn || btn.dataset.nl6440Ready === '1') return;

    btn.addEventListener('click',async()=>{
      const value=btn.getAttribute('data-copy')||'';
      try {
        await navigator.clipboard.writeText(value);
        const old=btn.textContent;
        btn.textContent='✓';
        btn.title='Copied';
        setTimeout(()=>{btn.textContent=old;btn.title='Copy member number';},1000);
      } catch (_) {
        const input=document.createElement('textarea');
        input.value=value;
        input.style.position='fixed';
        input.style.opacity='0';
        document.body.appendChild(input);
        input.select();
        try { document.execCommand('copy'); } catch (_) {}
        input.remove();
      }
    });
    btn.title='Copy member number';
    btn.dataset.nl6440Ready='1';
  }

  function enhance() {
    const page=document.querySelector('.nl6439-page');
    if (!page) return false;

    activateTabs(page);
    activateExport(page);
    activateDetails(page);
    activateCopy(page);
    applyPhoto(page);
    page.setAttribute('data-nl6440-enhanced','1');
    return true;
  }

  window.__NL6440_ENHANCE_QUALIFICATIONS__ = function() {
    if (!onQualificationsRoute()) return false;
    return enhance();
  };

  window.__NL6440_INTERACTIONS_AVAILABLE__ = true;

  function initialBoot() {
    if (!onQualificationsRoute()) return;
    let attempts=0;
    const attempt=()=>{
      if (!onQualificationsRoute()) return;
      if (enhance()) return;
      if (++attempts < 20) setTimeout(attempt,150);
    };
    attempt();
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',initialBoot,{once:true})
    : initialBoot();
})();
