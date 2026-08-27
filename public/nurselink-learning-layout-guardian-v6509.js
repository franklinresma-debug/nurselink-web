/* Keep the React Learning workspace isolated from late legacy layout mutations. */
(() => {
  'use strict';
  if (window.__NL_LEARNING_LAYOUT_GUARDIAN_V6509__) return;
  window.__NL_LEARNING_LAYOUT_GUARDIAN_V6509__ = true;

  const important = (node, property, value) => {
    if (!node || node.style.getPropertyValue(property) === value && node.style.getPropertyPriority(property) === 'important') return;
    node.style.setProperty(property, value, 'important');
  };
  function stabilize() {
    if (location.pathname.replace(/\/+$/,'') !== '/learning') return;
    const root=document.querySelector('.member-react-safe-shell-v108 .main-area .page > .nl410-page') ||
      document.querySelector('.page > .nl410-page');
    if (!root) return;
    root.dataset.nlLearningLayout='stable';
    important(root,'display','block');
    important(root,'width','100%');
    important(root,'max-width','1180px');
    const head=root.querySelector(':scope > .nl410-page-head');
    const stats=root.querySelector(':scope > .nl410-stats');
    const grid=root.querySelector(':scope > .nl410-learning-grid');
    important(head,'display','flex');
    important(head,'width','100%');
    important(stats,'display','grid');
    important(stats,'width','100%');
    important(stats,'grid-template-columns','repeat(4,minmax(0,1fr))');
    important(grid,'display','grid');
    important(grid,'width','100%');
    important(grid,'grid-template-columns','minmax(300px,380px) minmax(0,1fr)');
    if (matchMedia('(max-width: 760px)').matches) {
      important(stats,'grid-template-columns','repeat(2,minmax(0,1fr))');
      important(grid,'grid-template-columns','1fr');
    }
  }
  let timer;
  const schedule=() => { clearTimeout(timer); timer=setTimeout(stabilize,0); };
  addEventListener('DOMContentLoaded',schedule,{once:true});
  addEventListener('popstate',schedule);
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  [0,100,350,800,1600,3000,5000].forEach(delay=>setTimeout(stabilize,delay));
  schedule();
})();
