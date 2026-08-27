/* NurseLink v64.5.2 — v64.4.1 DB Feed Compatibility Shim */
(() => {
  if (window.__NL_V6441_DB_FEED_SHIM_V6452__) return;
  window.__NL_V6441_DB_FEED_SHIM_V6452__ = true;

  const nativeFetch = window.fetch.bind(window);

  function isV6441ProfileRequest(input) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    return /\/api\/member-profile-tabs-v6441(?:\?|$)/.test(url);
  }

  function asApiPayload(feed) {
    return {
      data: {
        identity: {
          member_number: feed?.member_number || 'NL-2026-000001'
        },
        certificates: Array.isArray(feed?.certificates) ? feed.certificates : [],
        portfolio: Array.isArray(feed?.portfolio) ? feed.portfolio : [],
        experience: Array.isArray(feed?.experience) ? feed.experience : [],
        licenses: Array.isArray(feed?.licenses) ? feed.licenses : [],
        education: Array.isArray(feed?.education) ? feed.education : [],
        documents: Array.isArray(feed?.documents) ? feed.documents : []
      },
      meta: {
        source: 'database_synced_feed',
        feed_version: feed?.version || '64.5.1',
        compatibility_version: '64.5.2',
        generated_at: feed?.generated_at || null
      }
    };
  }

  window.fetch = async function(input, init) {
    if (!isV6441ProfileRequest(input)) {
      return nativeFetch(input, init);
    }

    try {
      const feedResponse = await nativeFetch(
        `/nurselink-profile-feed-v6451.json?_=${Date.now()}`,
        { cache: 'no-store', headers: { Accept: 'application/json' } }
      );

      if (!feedResponse.ok) {
        console.warn('NurseLink v64.5.2 feed unavailable; falling back to original API request.');
        return nativeFetch(input, init);
      }

      const feed = await feedResponse.json();
      const payload = asApiPayload(feed);

      console.info(
        'NurseLink v64.5.2 profile feed',
        payload.data.certificates.length,
        payload.data.portfolio.length,
        payload.data.experience.length,
        payload.data.licenses.length,
        payload.data.education.length,
        payload.data.documents.length
      );

      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      });
    } catch (error) {
      console.warn('NurseLink v64.5.2 compatibility shim failed; using original API.', error);
      return nativeFetch(input, init);
    }
  };

  document.documentElement.setAttribute('data-nl6452-v6441-feed-shim', '1');
})();
