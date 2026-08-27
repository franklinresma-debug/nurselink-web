/* NurseLink Profile GET Deduplicator v64.1.4
   Only active on /profile. Coalesces identical GETs briefly.
   Never intercepts writes. */
(() => {
  if (location.pathname.replace(/\/+$/,'') !== '/profile') return;
  if (window.__NL6414_FETCH_GUARD__) return;
  window.__NL6414_FETCH_GUARD__ = true;

  const nativeFetch = window.fetch.bind(window);
  const inflight = new Map();
  const cache = new Map();
  const TTL = 1200;

  function keyOf(input, init={}) {
    const method = String(init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    if (method !== 'GET') return null;
    const url = input instanceof Request ? input.url : new URL(String(input), location.href).href;
    if (!(url.startsWith(location.origin) || url.startsWith('https://api.amsertech.com/'))) return null;
    return method + ' ' + url;
  }

  window.fetch = function(input, init={}) {
    const key = keyOf(input, init);
    if (!key) return nativeFetch(input, init);

    const now = Date.now();
    const hit = cache.get(key);
    if (hit && now - hit.at < TTL) {
      return Promise.resolve(hit.response.clone());
    }

    if (inflight.has(key)) {
      return inflight.get(key).then(r => r.clone());
    }

    const p = nativeFetch(input, init)
      .then(response => {
        if (response && response.ok) {
          cache.set(key, {at: Date.now(), response: response.clone()});
          setTimeout(() => {
            const current = cache.get(key);
            if (current && Date.now() - current.at >= TTL) cache.delete(key);
          }, TTL + 50);
        }
        return response;
      })
      .finally(() => inflight.delete(key));

    inflight.set(key, p);
    return p;
  };

  document.documentElement.setAttribute('data-nurselink-profile-fetch-guard','v64.1.4');
})();