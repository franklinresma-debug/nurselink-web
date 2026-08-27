(() => {
  'use strict';

  const API = 'https://api.amsertech.com';
  const $ = id => document.getElementById(id);

  const form = $('encoderLoginForm');
  const identifier = $('encoderUsername');
  const password = $('encoderPassword');
  const status = $('encoderLoginStatus');
  const button = $('encoderLoginButton');

  function cookie(name) {
    const prefix = `${name}=`;
    const row = document.cookie
      .split(';')
      .map(value => value.trim())
      .find(value => value.startsWith(prefix));

    return row ? row.slice(prefix.length) : '';
  }

  async function csrf() {
    const response = await fetch(
      `${API}/sanctum/csrf-cookie`,
      {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        }
      }
    );

    if (!response.ok && response.status !== 204) {
      throw new Error(
        'Unable to initialize Temporary Encoder sign-in.'
      );
    }
  }

  async function login(payload) {
    await csrf();

    const token = decodeURIComponent(
      cookie('XSRF-TOKEN')
    );

    const response = await fetch(
      `${API}/api/nurselink/encoder/session-login`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token
            ? {'X-XSRF-TOKEN': token}
            : {})
        },
        body: JSON.stringify(payload)
      }
    );

    let data = null;

    try {
      data = await response.json();
    } catch (_) {}

    if (!response.ok) {
      throw new Error(
        data?.errors?.username?.[0]
        || data?.message
        || `Temporary Encoder sign-in failed (${response.status}).`
      );
    }

    return data;
  }

  form?.addEventListener(
    'submit',
    async event => {
      event.preventDefault();

      status.textContent = '';
      status.dataset.tone = '';
      button.disabled = true;
      button.textContent = 'Signing in…';

      try {
        const result = await login({
          username: identifier.value.trim(),
          password: password.value
        });

        status.textContent =
          `${result?.data?.display_name || 'Temporary Encoder'} access confirmed.`;

        status.dataset.tone = 'success';

        window.location.assign(
          '/nurselink-encoder.html'
        );
      } catch (error) {
        status.textContent = error.message;
        status.dataset.tone = 'error';
      } finally {
        button.disabled = false;
        button.textContent =
          'Sign in to Encoder Workspace';
      }
    }
  );
})();
