(() => {
  'use strict';

  const API = 'https://api.amsertech.com';

  const $ = id => document.getElementById(id);

  let accounts = [];
  let selectedEncoderId = null;

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

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
          'X-Requested-With': 'XMLHttpRequest'
        }
      }
    );

    if (!response.ok && response.status !== 204) {
      throw new Error(
        'Unable to initialize secure Temporary Encoder request.'
      );
    }
  }

  async function request(path, options = {}) {
    const method = String(
      options.method || 'GET'
    ).toUpperCase();

    const mutating =
      !['GET', 'HEAD', 'OPTIONS'].includes(method);

    if (mutating) {
      await csrf();
    }

    const headers = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(options.headers || {})
    };

    if (mutating) {
      headers['Content-Type'] = 'application/json';

      const token = decodeURIComponent(
        cookie('XSRF-TOKEN')
      );

      if (token) {
        headers['X-XSRF-TOKEN'] = token;
      }
    }

    const response = await fetch(
      `${API}${path}`,
      {
        ...options,
        method,
        credentials: 'include',
        cache: 'no-store',
        headers
      }
    );

    let payload = null;

    try {
      payload = await response.json();
    } catch (_) {}

    if (!response.ok) {
      const validation =
        payload?.errors
          ? Object.values(payload.errors)
              .flat()
              .find(Boolean)
          : '';

      const error = new Error(
        validation
        || payload?.message
        || `Temporary Encoder request failed (${response.status}).`
      );

      error.status = response.status;
      throw error;
    }

    return payload;
  }

  function redirectToAdminLogin() {
    const target =
      '/nurselink-admin-login.html?return='
      + encodeURIComponent(
          location.pathname
          + location.search
          + location.hash
        );

    location.replace(target);
  }

  function ensureTemporaryEncoderCardVisible() {
    const panel = document.querySelector(
      '[data-panel="settings"]'
    );

    const card = $(
      'temporaryEncoderAdminCard'
    );

    if (!panel || !card) {
      return;
    }

    /*
     * The main Administrator dashboard owns panel visibility.
     * This function only ensures the Temporary Encoder card itself
     * is not accidentally suppressed after the Settings panel opens.
     */
    if (!panel.hidden) {
      card.hidden = false;
      card.style.removeProperty('display');
      card.style.removeProperty('visibility');
      card.style.removeProperty('opacity');
    }
  }

  async function requireAdministratorSession() {
    try {
      const payload = await request(
        '/api/nurselink/admin/session'
      );

      const user = payload?.data?.user || {};
      const access = payload?.data?.access || {};

      if (
        (!user.id && !user.email)
        || !access.role
      ) {
        redirectToAdminLogin();
        return false;
      }

      return true;

    } catch (error) {
      if (
        [401, 419].includes(
          Number(error?.status)
        )
      ) {
        showNotice(
          'Your Administrator session has expired. Redirecting to sign in…',
          'error'
        );

        setTimeout(
          redirectToAdminLogin,
          500
        );

        return false;
      }

      throw error;
    }
  }

  function showNotice(message = '', tone = '') {
    const el = $('temporaryEncoderNotice');

    if (!el) return;

    el.hidden = !message;
    el.textContent = message;
    el.dataset.tone = tone;
  }

  function formatDate(value) {
    if (!value) return 'Not set';

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleString();
  }

  function toLocalInput(value) {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value).slice(0, 16);
    }

    const local = new Date(
      date.getTime()
      - date.getTimezoneOffset() * 60000
    );

    return local.toISOString().slice(0, 16);
  }

  function normalizeDateInput(value) {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toISOString();
  }

  function rowStatus(account) {
    if (!account.active) {
      return {
        label: 'Disabled',
        tone: 'danger'
      };
    }

    if (account.expired) {
      return {
        label: 'Expired',
        tone: 'warning'
      };
    }

    return {
      label: 'Active',
      tone: 'success'
    };
  }

  function renderAccounts() {
    const el = $('temporaryEncoderList');

    if (!el) return;

    if (!accounts.length) {
      el.innerHTML = `
        <div class="nl590-encoder-empty">
          No Temporary Encoder accounts have been created.
        </div>
      `;
      return;
    }

    el.innerHTML = accounts.map(account => {
      const status = rowStatus(account);

      return `
        <article
          class="nl590-encoder-row"
          data-encoder-id="${esc(account.id)}"
        >
          <div class="nl590-encoder-row-head">
            <div class="nl590-encoder-row-main">
              <strong>${esc(account.display_name)}</strong>
              <small>@${esc(account.username)}</small>
              <small>${esc(account.email || 'No email assigned')}</small>

              <div class="nl590-encoder-badges">
                <span
                  class="nl590-encoder-badge"
                  data-tone="${esc(status.tone)}"
                >
                  ${esc(status.label)}
                </span>

                <span class="nl590-encoder-badge">
                  ${esc(account.assignment_count || 0)}
                  nurse assignment${Number(account.assignment_count || 0) === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            <div>
              <small>
                Expires<br>
                <strong>${esc(formatDate(account.expires_at))}</strong>
              </small>
            </div>
          </div>

          <small style="display:block;margin-top:10px;color:#607585">
            Last login:
            ${esc(
              account.last_login_at
                ? formatDate(account.last_login_at)
                : 'Never'
            )}
          </small>

          <div class="nl590-encoder-actions">
            <button
              type="button"
              class="primary"
              data-manage-encoder
            >
              Manage
            </button>

            <button
              type="button"
              data-toggle-encoder
            >
              ${account.active ? 'Disable' : 'Enable'}
            </button>
          </div>
        </article>
      `;
    }).join('');

    el
      .querySelectorAll('[data-manage-encoder]')
      .forEach(button => {
        button.addEventListener(
          'click',
          () => {
            const row =
              button.closest('[data-encoder-id]');

            selectEncoder(
              Number(row.dataset.encoderId)
            );
          }
        );
      });

    el
      .querySelectorAll('[data-toggle-encoder]')
      .forEach(button => {
        button.addEventListener(
          'click',
          async () => {
            const row =
              button.closest('[data-encoder-id]');

            const id =
              Number(row.dataset.encoderId);

            const account =
              accounts.find(
                item => Number(item.id) === id
              );

            if (!account) return;

            const next = !account.active;

            if (
              !confirm(
                `${next ? 'Enable' : 'Disable'} Temporary Encoder @${account.username}?`
              )
            ) {
              return;
            }

            try {
              await request(
                `/api/nurselink/admin/temporary-encoders/${id}`,
                {
                  method: 'PATCH',
                  body: JSON.stringify({
                    active: next
                  })
                }
              );

              showNotice(
                `Temporary Encoder @${account.username} ${next ? 'enabled' : 'disabled'}.`,
                'success'
              );

              await loadAccounts();

              if (selectedEncoderId === id) {
                selectEncoder(id);
              }
            } catch (error) {
              showNotice(
                error.message,
                'error'
              );
            }
          }
        );
      });
  }

  async function loadAccounts() {
    const list = $('temporaryEncoderList');

    if (!list) return;

    list.innerHTML = `
      <div class="nl590-encoder-empty">
        Loading Temporary Encoders…
      </div>
    `;

    try {
      const payload = await request(
        '/api/nurselink/admin/temporary-encoders'
      );

      accounts =
        Array.isArray(payload?.data)
          ? payload.data
          : [];

      $('temporaryEncoderLocked').hidden = true;
      $('temporaryEncoderCreateArea').hidden = false;
      $('temporaryEncoderRosterArea').hidden = false;

      renderAccounts();
    } catch (error) {
      if (error.status === 403) {
        $('temporaryEncoderCreateArea').hidden = true;
        $('temporaryEncoderRosterArea').hidden = true;
        $('temporaryEncoderLocked').hidden = false;

        return;
      }

      list.innerHTML = `
        <div class="nl590-encoder-empty">
          ${esc(error.message)}
        </div>
      `;
    }
  }

  async function loadAssignments(id) {
    const el = $('temporaryEncoderAssignmentList');

    if (!el) return;

    el.innerHTML = `
      <div class="nl590-encoder-empty">
        Loading assignments…
      </div>
    `;

    try {
      const payload = await request(
        `/api/nurselink/admin/temporary-encoders/${id}/assignments`
      );

      const rows =
        Array.isArray(payload?.data)
          ? payload.data
          : [];

      const activeRows =
        rows.filter(
          row =>
            row.active
            && !row.revoked_at
        );

      if (!activeRows.length) {
        el.innerHTML = `
          <div class="nl590-encoder-empty">
            No active nurse assignments.
          </div>
        `;

        return;
      }

      el.innerHTML = activeRows.map(row => `
        <div
          class="nl590-assignment"
          data-assignment-id="${esc(row.id)}"
        >
          <div>
            <strong>${esc(row.name || row.email)}</strong>
            <small>${esc(row.email || '')}</small>
            <small>
              ${
                row.member_number
                  ? `Member ${esc(row.member_number)}`
                  : 'Applicant record'
              }
              · expires ${esc(formatDate(row.expires_at))}
            </small>
          </div>

          <button
            type="button"
            data-revoke-assignment
          >
            Revoke
          </button>
        </div>
      `).join('');

      el
        .querySelectorAll('[data-revoke-assignment]')
        .forEach(button => {
          button.addEventListener(
            'click',
            async () => {
              const row =
                button.closest('[data-assignment-id]');

              const assignmentId =
                Number(row.dataset.assignmentId);

              if (
                !confirm(
                  'Revoke this nurse assignment from the Temporary Encoder?'
                )
              ) {
                return;
              }

              try {
                const result = await request(
                  `/api/nurselink/admin/temporary-encoders/${id}/assignments/${assignmentId}`,
                  {
                    method: 'DELETE',
                    body: '{}'
                  }
                );

                showNotice(
                  result?.message
                  || 'Nurse assignment revoked.',
                  'success'
                );

                await loadAssignments(id);
                await loadAccounts();
              } catch (error) {
                showNotice(
                  error.message,
                  'error'
                );
              }
            }
          );
        });
    } catch (error) {
      el.innerHTML = `
        <div class="nl590-encoder-empty">
          ${esc(error.message)}
        </div>
      `;
    }
  }

  function selectEncoder(id) {
    const account =
      accounts.find(
        item => Number(item.id) === Number(id)
      );

    if (!account) return;

    selectedEncoderId = Number(id);

    $('temporaryEncoderManager').hidden = false;

    $('temporaryEncoderSelectedName').textContent =
      account.display_name;

    $('temporaryEncoderSelectedMeta').textContent =
      `@${account.username}`
      + `${account.email ? ` · ${account.email}` : ''}`
      + ` · expires ${formatDate(account.expires_at)}`;

    $('temporaryEncoderEmailUpdate').value =
      account.email || '';

    $('temporaryEncoderExpiryUpdate').value =
      toLocalInput(account.expires_at);

    $('temporaryEncoderNewPassword').value = '';

    $('temporaryEncoderToggleSelected').textContent =
      account.active
        ? 'Disable Account'
        : 'Enable Account';

    loadAssignments(id);

    $('temporaryEncoderManager')
      .scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
  }

  $('temporaryEncoderCreateForm')
    ?.addEventListener(
      'submit',
      async event => {
        event.preventDefault();

        const form = event.currentTarget;

        const username =
          $('temporaryEncoderUsername')
            .value
            .trim();

        const email =
          $('temporaryEncoderEmail')
            .value
            .trim()
            .toLowerCase();

        const displayName =
          $('temporaryEncoderDisplayName')
            .value
            .trim();

        const password =
          $('temporaryEncoderPassword').value;

        const expiresAt =
          $('temporaryEncoderExpiresAt').value;

        if (!expiresAt) {
          return showNotice(
            'Set an expiration date and time.',
            'error'
          );
        }

        try {
          if (
            !await requireAdministratorSession()
          ) {
            return;
          }

          const result = await request(
            '/api/nurselink/admin/temporary-encoders',
            {
              method: 'POST',
              body: JSON.stringify({
                username,
                email,
                display_name: displayName,
                password,
                expires_at:
                  normalizeDateInput(expiresAt)
              })
            }
          );

          showNotice(
            result?.message
            || 'Temporary Encoder created.',
            'success'
          );

          form.reset();

          await loadAccounts();

          if (result?.data?.id) {
            selectEncoder(
              Number(result.data.id)
            );
          }
        } catch (error) {
          showNotice(
            error.message,
            'error'
          );
        }
      }
    );

  $('temporaryEncoderAssignmentForm')
    ?.addEventListener(
      'submit',
      async event => {
        event.preventDefault();

        const form = event.currentTarget;

        if (!selectedEncoderId) return;

        const identifier =
          $('temporaryEncoderNurseIdentifier')
            .value
            .trim();

        const expires =
          $('temporaryEncoderAssignmentExpiresAt')
            .value;

        const reason =
          $('temporaryEncoderAssignmentReason')
            .value
            .trim();

        try {
          const result = await request(
            `/api/nurselink/admin/temporary-encoders/${selectedEncoderId}/assignments`,
            {
              method: 'POST',
              body: JSON.stringify({
                nurse_identifier: identifier,
                expires_at:
                  expires
                    ? normalizeDateInput(expires)
                    : null,
                assignment_reason:
                  reason || null
              })
            }
          );

          showNotice(
            result?.message
            || 'Nurse assigned.',
            'success'
          );

          form.reset();

          await loadAssignments(
            selectedEncoderId
          );

          await loadAccounts();
        } catch (error) {
          showNotice(
            error.message,
            'error'
          );
        }
      }
    );

  $('temporaryEncoderUpdateEmail')
    ?.addEventListener(
      'click',
      async () => {
        if (!selectedEncoderId) return;

        const email =
          $('temporaryEncoderEmailUpdate')
            .value
            .trim()
            .toLowerCase();

        if (!email) {
          return showNotice(
            'Enter the Temporary Encoder email address.',
            'error'
          );
        }

        try {
          const result = await request(
            `/api/nurselink/admin/temporary-encoders/${selectedEncoderId}`,
            {
              method: 'PATCH',
              body: JSON.stringify({
                email
              })
            }
          );

          showNotice(
            result?.message
            || 'Temporary Encoder email updated.',
            'success'
          );

          await loadAccounts();
          selectEncoder(
            selectedEncoderId
          );
        } catch (error) {
          showNotice(
            error.message,
            'error'
          );
        }
      }
    );


  $('temporaryEncoderUpdateExpiry')
    ?.addEventListener(
      'click',
      async () => {
        if (!selectedEncoderId) return;

        const value =
          $('temporaryEncoderExpiryUpdate').value;

        if (!value) {
          return showNotice(
            'Set a new expiration date and time.',
            'error'
          );
        }

        try {
          const result = await request(
            `/api/nurselink/admin/temporary-encoders/${selectedEncoderId}`,
            {
              method: 'PATCH',
              body: JSON.stringify({
                expires_at:
                  normalizeDateInput(value)
              })
            }
          );

          showNotice(
            result?.message
            || 'Temporary Encoder expiration updated.',
            'success'
          );

          await loadAccounts();
          selectEncoder(
            selectedEncoderId
          );
        } catch (error) {
          showNotice(
            error.message,
            'error'
          );
        }
      }
    );

  $('temporaryEncoderResetPassword')
    ?.addEventListener(
      'click',
      async () => {
        if (!selectedEncoderId) return;

        const password =
          $('temporaryEncoderNewPassword').value;

        if (!password) {
          return showNotice(
            'Enter the new Temporary Encoder password.',
            'error'
          );
        }

        try {
          const result = await request(
            `/api/nurselink/admin/temporary-encoders/${selectedEncoderId}/reset-password`,
            {
              method: 'POST',
              body: JSON.stringify({
                password
              })
            }
          );

          $('temporaryEncoderNewPassword').value = '';

          showNotice(
            result?.message
            || 'Temporary Encoder password reset.',
            'success'
          );
        } catch (error) {
          showNotice(
            error.message,
            'error'
          );
        }
      }
    );

  $('temporaryEncoderToggleSelected')
    ?.addEventListener(
      'click',
      async () => {
        if (!selectedEncoderId) return;

        const account =
          accounts.find(
            item =>
              Number(item.id) ===
              Number(selectedEncoderId)
          );

        if (!account) return;

        const next = !account.active;

        if (
          !confirm(
            `${next ? 'Enable' : 'Disable'} Temporary Encoder @${account.username}?`
          )
        ) {
          return;
        }

        try {
          await request(
            `/api/nurselink/admin/temporary-encoders/${selectedEncoderId}`,
            {
              method: 'PATCH',
              body: JSON.stringify({
                active: next
              })
            }
          );

          showNotice(
            `Temporary Encoder ${next ? 'enabled' : 'disabled'}.`,
            'success'
          );

          await loadAccounts();
          selectEncoder(
            selectedEncoderId
          );
        } catch (error) {
          showNotice(
            error.message,
            'error'
          );
        }
      }
    );

  $('temporaryEncoderRefresh')
    ?.addEventListener(
      'click',
      loadAccounts
    );

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      document
        .querySelector('[data-tab="settings"]')
        ?.addEventListener(
          'click',
          () => setTimeout(
            async () => {
              ensureTemporaryEncoderCardVisible();

              try {
                if (
                  await requireAdministratorSession()
                ) {
                  await loadAccounts();
                  ensureTemporaryEncoderCardVisible();
                }
              } catch (error) {
                showNotice(
                  error.message,
                  'error'
                );
              }
            },
            120
          )
        );

      if (
        location.hash.replace(/^#/, '')
        === 'settings'
      ) {
        setTimeout(
          async () => {
            try {
              ensureTemporaryEncoderCardVisible();

              if (
                await requireAdministratorSession()
              ) {
                await loadAccounts();
                ensureTemporaryEncoderCardVisible();
              }
            } catch (error) {
              showNotice(
                error.message,
                'error'
              );
            }
          },
          150
        );
      }
    }
  );

  const standaloneTemporaryEncoderPage =
    !!$('temporaryEncoderAdminCard')
    && !document.querySelector(
      '[data-panel="settings"]'
    );

  if (standaloneTemporaryEncoderPage) {
    document.addEventListener(
      'DOMContentLoaded',
      async () => {
        try {
          ensureTemporaryEncoderCardVisible();

          if (
            await requireAdministratorSession()
          ) {
            await loadAccounts();
          }

        } catch (error) {
          showNotice(
            error.message,
            'error'
          );
        }
      }
    );
  }

  const settingsPanel = document.querySelector(
    '[data-panel="settings"]'
  );

  if (settingsPanel) {
    new MutationObserver(() => {
      if (!settingsPanel.hidden) {
        ensureTemporaryEncoderCardVisible();
      }
    }).observe(
      settingsPanel,
      {
        attributes: true,
        attributeFilter: ['hidden']
      }
    );
  }

  window.NurseLinkLoadTemporaryEncoders =
    loadAccounts;
})();
