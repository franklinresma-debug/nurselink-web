/* NurseLink rendered-control contrast audit v65.0.7 */
(() => {
  'use strict';
  const SELECTOR = [
    'button','input[type="button"]','input[type="submit"]','input[type="reset"]',
    'a[role="button"]','[role="button"]',
    '[class*="button"]','[class*="btn"]','[class*="badge"]','[class*="pill"]','[class*="status"]'
  ].join(',');

  const parse = value => {
    const m = String(value || '').match(/rgba?\(([^)]+)\)/i);
    if (!m) return null;
    const parts = m[1].split(',').map(v => Number.parseFloat(v.trim()));
    return parts.length >= 3 ? {r:parts[0],g:parts[1],b:parts[2],a:parts[3] ?? 1} : null;
  };
  const linear = v => {
    v /= 255;
    return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4);
  };
  const luminance = c => .2126 * linear(c.r) + .7152 * linear(c.g) + .0722 * linear(c.b);
  const contrast = (a,b) => {
    const la=luminance(a), lb=luminance(b);
    return (Math.max(la,lb)+.05)/(Math.min(la,lb)+.05);
  };
  function background(node) {
    for (let el=node; el && el !== document.documentElement; el=el.parentElement) {
      const rgb=parse(getComputedStyle(el).backgroundColor);
      if (rgb && rgb.a > .85) return rgb;
    }
    return parse(getComputedStyle(document.body).backgroundColor) || {r:255,g:255,b:255,a:1};
  }
  function audit() {
    document.querySelectorAll(SELECTOR).forEach(el => {
      if (el.closest('#nurselink-universal-sidebar')) return;
      // A repaired control keeps its chosen foreground until the next theme
      // change.  Re-measuring it after the repair would only measure our own
      // override and incorrectly remove it.
      if (el.classList.contains('nl-control-contrast-repaired')) return;
      const fg=parse(getComputedStyle(el).color), bg=background(el);
      if (!fg || !bg) return;
      if (contrast(fg,bg) >= 4.5) {
        el.classList.remove('nl-control-contrast-repaired');
        el.style.removeProperty('--nl-control-foreground');
        return;
      }
      el.style.setProperty('--nl-control-foreground', luminance(bg) < .36 ? '#ffffff' : '#10233f');
      el.classList.add('nl-control-contrast-repaired');
    });
  }
  let timer;
  const schedule=() => { clearTimeout(timer); timer=setTimeout(audit,80); };
  const resetForTheme=() => {
    document.querySelectorAll('.nl-control-contrast-repaired').forEach(el => {
      el.classList.remove('nl-control-contrast-repaired');
      el.style.removeProperty('--nl-control-foreground');
    });
    schedule();
  };
  addEventListener('DOMContentLoaded', schedule, {once:true});
  addEventListener('nurselink:themechange', resetForTheme);
  new MutationObserver(records => {
    const themeChanged=records.some(record => record.target === document.documentElement &&
      ['class','data-theme','data-nl-effective-theme'].includes(record.attributeName));
    if (themeChanged) resetForTheme(); else schedule();
  }).observe(document.documentElement, {
    subtree:true, childList:true, attributes:true,
    attributeFilter:['class','style','data-theme','data-nl-effective-theme']
  });
  schedule();
})();
