/* NurseLink Dynamic Demo Profile Data Bridge v64.4.2 */
(() => {
  if (window.__NL_DEMO_PROFILE_DATA_V6442__) return;
  window.__NL_DEMO_PROFILE_DATA_V6442__=true;

  if (location.pathname.replace(/\/+$/,'') !== '/qualifications') return;

  // v64.4.1 owns the UI. This patch only redirects its read-only data request
  // to the v64.4.2 live-first/demo-database-fallback endpoint.
  const originalFetch=window.fetch.bind(window);

  window.fetch=function(input,init){
    let url=typeof input==='string' ? input : (input?.url || '');
    if(url==='/api/member-profile-tabs-v6441' || url.endsWith('/api/member-profile-tabs-v6441')){
      if(typeof input==='string'){
        input='/api/member-profile-tabs-v6442';
      }else if(input instanceof Request){
        input=new Request('/api/member-profile-tabs-v6442',input);
      }
    }
    return originalFetch(input,init);
  };

  document.documentElement.setAttribute('data-nl6442-demo-profile-data','1');
})();
