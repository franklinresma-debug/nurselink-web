(() => {
  'use strict';

  const API = 'https://api.amsertech.com';
  const $ = id => document.getElementById(id);

  let currentAccount = null;
  let currentUserId = null;
  let currentMode = null;

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

  function notice(message, tone = '') {
    const el = $('encoderNotice');

    if (!message) {
      el.hidden = true;
      el.textContent = '';
      el.dataset.tone = '';
      return;
    }

    el.hidden = false;
    el.textContent = message;
    el.dataset.tone = tone;
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
      throw new Error('Unable to initialize secure request.');
    }
  }

  async function request(path, options = {}) {
    const method = String(
      options.method || 'GET'
    ).toUpperCase();

    if (!['GET', 'HEAD'].includes(method)) {
      await csrf();
    }

    const token = decodeURIComponent(
      cookie('XSRF-TOKEN')
    );

    const response = await fetch(
      `${API}${path}`,
      {
        ...options,
        method,
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(options.body
            ? {'Content-Type': 'application/json'}
            : {}),
          ...(!['GET', 'HEAD'].includes(method) && token
            ? {'X-XSRF-TOKEN': token}
            : {}),
          ...(options.headers || {})
        }
      }
    );

    let data = null;

    try {
      data = await response.json();
    } catch (_) {}

    if (!response.ok) {
      if ([401, 403].includes(response.status)) {
        const message = data?.message || '';

        if (
          response.status === 401
          || /expired|disabled|authentication/i.test(message)
        ) {
          setTimeout(() => {
            window.location.assign(
              '/nurselink-encoder-login.html'
            );
          }, 900);
        }
      }

      const validation =
        data?.errors
        ? Object.values(data.errors)?.[0]?.[0]
        : '';

      throw new Error(
        validation
        || data?.message
        || `Encoder request failed (${response.status}).`
      );
    }

    return data;
  }

  function displayDate(value) {
    if (!value) return 'Not set';

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleString();
  }

  function dateInput(value) {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value).slice(0, 10);
    }

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  async function loadIdentity() {
    try {
      const payload = await request(
        '/api/nurselink/encoder/me'
      );

      currentAccount = payload?.data || {};

      $('encoderIdentity').innerHTML = `
        <strong>${esc(currentAccount.display_name || currentAccount.username)}</strong>
        <small>@${esc(currentAccount.username || '')}</small>
      `;

      $('encoderExpiry').textContent =
        `Access expires: ${displayDate(currentAccount.expires_at)}`;

      return true;
    } catch (error) {
      notice(error.message, 'error');

      setTimeout(() => {
        window.location.assign(
          '/nurselink-encoder-login.html'
        );
      }, 700);

      return false;
    }
  }

  async function loadAssignments() {
    const list = $('assignmentList');

    list.innerHTML =
      '<div class="nl-empty">Loading assignments…</div>';

    try {
      const payload = await request(
        '/api/nurselink/encoder/assignments'
      );

      const rows = payload?.data || [];

      if (!rows.length) {
        list.innerHTML = `
          <div class="nl-empty">
            No active nurse assignments.
            Contact a NurseLink Super Administrator.
          </div>
        `;
        return;
      }

      list.innerHTML = rows.map(row => `
        <button
          class="nl-nurse"
          type="button"
          data-user-id="${esc(row.nurse_user_id)}"
        >
          <strong>${esc(row.name || row.email)}</strong>
          <small>${esc(row.email || '')}</small>
          <small>
            ${
              row.member_number
                ? `Member ${esc(row.member_number)}`
                : 'Applicant record'
            }
          </small>
          <span class="nl-badge">
            ${esc(
              String(row.membership_status || 'assigned')
                .replace(/_/g, ' ')
            )}
          </span>
        </button>
      `).join('');

      list
        .querySelectorAll('[data-user-id]')
        .forEach(button => {
          button.addEventListener(
            'click',
            () => selectNurse(
              button.dataset.userId,
              button
            )
          );
        });
    } catch (error) {
      list.innerHTML = `
        <div class="nl-empty">${esc(error.message)}</div>
      `;
    }
  }

  function populateProfile(data) {
    const profile = data?.profile || {};
    currentMode = data?.mode || 'applicant';

    $('selectedNurse').innerHTML = `
      <strong>${esc(data?.user?.name || data?.user?.email || '')}</strong>
      <small>${esc(data?.user?.email || '')}</small>
      <span class="nl-badge">
        ${
          currentMode === 'approved_member'
            ? 'Approved member profile'
            : 'Applicant / Smart Registration'
        }
      </span>
    `;

    $('firstName').value = profile.first_name || '';
    $('middleName').value = profile.middle_name || '';
    $('lastName').value = profile.last_name || '';
    $('suffix').value = profile.suffix || '';

    $('birthDate').value = dateInput(
      profile.birth_date || profile.date_of_birth
    );

    $('sex').value = profile.sex || '';
    $('nationality').value = profile.nationality || '';

    $('phone').value =
      profile.phone
      || profile.mobile_phone
      || '';

    $('city').value = profile.city || '';

    $('region').value =
      profile.province
      || profile.region
      || '';

    $('country').value = profile.country || '';
    $('addressLine1').value =
      profile.address_line1 || '';

    $('professionalTitle').value =
      profile.professional_title || '';

    $('yearsExperience').value =
      profile.years_experience ?? '';

    $('currentPosition').value =
      profile.current_position || '';

    $('currentEmployer').value =
      profile.current_employer || '';

    $('specialty').value =
      profile.specialty || '';

    $('highestEducation').value =
      profile.highest_nursing_education || '';

    $('primaryLicenseNumber').value =
      profile.primary_license_number || '';

    $('primaryLicenseCountry').value =
      profile.primary_license_country || '';

    $('primaryLicenseExpiry').value =
      dateInput(profile.primary_license_expiry);

    $('graduationYear').value =
      profile.graduation_year ?? '';

    const applicantOnly = [
      'sexLabel',
      'addressLabel',
      'specialtyLabel',
      'educationLabel',
      'licenseNumberLabel',
      'licenseCountryLabel',
      'licenseExpiryLabel',
      'graduationYearLabel'
    ];

    applicantOnly.forEach(id => {
      $(id).hidden = currentMode === 'approved_member';
    });

    $('emptyEditor').hidden = true;
    $('nurseEditor').hidden = false;
  }

  async function selectNurse(userId, button) {
    currentUserId = userId;

    document
      .querySelectorAll('.nl-nurse')
      .forEach(node => node.classList.remove('active'));

    button?.classList.add('active');

    notice('');

    $('emptyEditor').hidden = false;
    $('emptyEditor').textContent =
      'Loading nurse record…';

    $('nurseEditor').hidden = true;

    try {
      const payload = await request(
        `/api/nurselink/encoder/nurses/${encodeURIComponent(userId)}`
      );

      populateProfile(payload?.data || {});
    } catch (error) {
      $('emptyEditor').textContent = error.message;
      notice(error.message, 'error');
    }
  }

  $('personalForm')?.addEventListener(
    'submit',
    async event => {
      event.preventDefault();

      if (!currentUserId) return;

      try {
        const payload = {
          first_name: $('firstName').value.trim() || null,
          middle_name: $('middleName').value.trim() || null,
          last_name: $('lastName').value.trim() || null,
          suffix: $('suffix').value.trim() || null,
          nationality: $('nationality').value.trim() || null,
          city: $('city').value.trim() || null,
          country: $('country').value.trim() || null
        };

        if (currentMode === 'approved_member') {
          payload.date_of_birth =
            $('birthDate').value || null;

          payload.mobile_phone =
            $('phone').value.trim() || null;

          payload.region =
            $('region').value.trim() || null;
        } else {
          payload.birth_date =
            $('birthDate').value || null;

          payload.phone =
            $('phone').value.trim() || null;

          payload.province =
            $('region').value.trim() || null;

          payload.sex =
            $('sex').value || null;

          payload.address_line1 =
            $('addressLine1').value.trim() || null;
        }

        const result = await request(
          `/api/nurselink/encoder/nurses/${encodeURIComponent(currentUserId)}/personal`,
          {
            method: 'PATCH',
            body: JSON.stringify(payload)
          }
        );

        notice(
          result?.message
          || 'Personal information saved.',
          'success'
        );
      } catch (error) {
        notice(error.message, 'error');
      }
    }
  );

  $('professionalForm')?.addEventListener(
    'submit',
    async event => {
      event.preventDefault();

      if (!currentUserId) return;

      try {
        const payload = {
          professional_title:
            $('professionalTitle').value.trim() || null,
          years_experience:
            $('yearsExperience').value === ''
              ? null
              : Number($('yearsExperience').value),
          current_position:
            $('currentPosition').value.trim() || null,
          current_employer:
            $('currentEmployer').value.trim() || null
        };

        if (currentMode !== 'approved_member') {
          Object.assign(payload, {
            specialty:
              $('specialty').value.trim() || null,
            highest_nursing_education:
              $('highestEducation').value.trim() || null,
            primary_license_number:
              $('primaryLicenseNumber').value.trim() || null,
            primary_license_country:
              $('primaryLicenseCountry').value.trim() || null,
            primary_license_expiry:
              $('primaryLicenseExpiry').value || null,
            graduation_year:
              $('graduationYear').value === ''
                ? null
                : Number($('graduationYear').value)
          });
        }

        const result = await request(
          `/api/nurselink/encoder/nurses/${encodeURIComponent(currentUserId)}/professional`,
          {
            method: 'PATCH',
            body: JSON.stringify(payload)
          }
        );

        notice(
          result?.message
          || 'Professional information saved.',
          'success'
        );
      } catch (error) {
        notice(error.message, 'error');
      }
    }
  );

  $('refreshAssignments')?.addEventListener(
    'click',
    loadAssignments
  );

  $('encoderLogout')?.addEventListener(
    'click',
    async () => {
      try {
        await request(
          '/api/nurselink/encoder/logout',
          {
            method: 'POST',
            body: '{}'
          }
        );
      } catch (_) {}

      window.location.assign(
        '/nurselink-encoder-login.html'
      );
    }
  );

  async function boot() {
    const authenticated = await loadIdentity();

    if (!authenticated) return;

    await loadAssignments();
  }

  boot();
})();

/* NurseLink Temporary Membership Operator Workflow v591 */
(() => {
  'use strict';

  const API = 'https://api.amsertech.com';
  const $ = id => document.getElementById(id);

  let workflowUserId = null;
  let workflowData = null;
  let pendingTransition = null;

  function cookie(name) {
    const prefix = `${name}=`;
    const row = document.cookie
      .split(';')
      .map(v => v.trim())
      .find(v => v.startsWith(prefix));
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
      throw new Error('Unable to initialize secure workflow request.');
    }
  }

  async function request(path, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(method);

    if (mutating) await csrf();

    const headers = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
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

    const response = await fetch(`${API}${path}`, {
      ...options,
      method,
      credentials: 'include',
      cache: 'no-store',
      headers
    });

    let data = null;

    try {
      data = await response.json();
    } catch (_) {}

    if (!response.ok) {
      const validation =
        data?.errors
          ? Object.values(data.errors).flat().find(Boolean)
          : '';

      throw new Error(
        validation
        || data?.message
        || `Workflow request failed (${response.status}).`
      );
    }

    return data;
  }

  function announce(message, tone = '') {
    const el = $('encoderNotice');
    if (!el) return;

    el.hidden = !message;
    el.textContent = message;
    el.dataset.tone = tone;
  }

  function label(value) {
    return String(value || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  async function loadWorkflow(userId) {
    workflowUserId = userId;

    try {
      const payload = await request(
        `/api/nurselink/encoder/nurses/${encodeURIComponent(userId)}/workflow`
      );

      workflowData = payload?.data || {};
      renderWorkflow();
    } catch (error) {
      announce(error.message, 'error');
    }
  }

  function renderWorkflow() {
    const membership = workflowData?.membership || null;
    const status = membership?.status || 'draft';

    const summary = $('workflowSummary');
    if (summary) {
      summary.innerHTML = `
        <strong>Status: ${label(status)}</strong>
        <small>
          ${
            membership?.member_number
              ? `Member number: ${membership.member_number}`
              : 'No member number yet'
          }
        </small>
      `;
    }

    const actions = $('workflowActions');
    if (actions) {
      const buttons = [];

      if (workflowData?.can_submit) {
        buttons.push(`
          <button
            class="nl-primary"
            type="button"
            data-workflow-submit
          >
            ${
              status === 'needs_information'
                ? 'Resubmit Application'
                : 'Submit Application'
            }
          </button>
        `);
      }

      (workflowData?.allowed_membership_transitions || [])
        .forEach(next => {
          const cls =
            ['approved', 'declined'].includes(next)
              ? 'nl-danger'
              : 'nl-secondary';

          buttons.push(`
            <button
              class="${cls}"
              type="button"
              data-workflow-transition="${next}"
            >
              ${label(next)}
            </button>
          `);
        });

      actions.innerHTML =
        buttons.join('')
        || '<span>No workflow actions available for this status.</span>';

      actions
        .querySelector('[data-workflow-submit]')
        ?.addEventListener('click', submitApplication);

      actions
        .querySelectorAll('[data-workflow-transition]')
        .forEach(button => {
          button.addEventListener('click', () => {
            pendingTransition =
              button.dataset.workflowTransition;

            $('workflowDecisionForm').hidden = false;

            $('workflowReviewerNotes').value = '';
            $('workflowDecisionReason').value = '';

            $('workflowDecisionSubmit').textContent =
              `Confirm ${label(pendingTransition)}`;
          });
        });
    }

    const standingSection = $('standingSection');

    if (
      standingSection
      && membership?.status === 'approved'
    ) {
      standingSection.hidden = false;

      const standing =
        membership?.standing || 'active';

      $('standingSummary').innerHTML = `
        <strong>Current standing: ${label(standing)}</strong>
        <small>
          ${membership?.standing_reason || 'No standing reason recorded.'}
        </small>
      `;

      const options =
        workflowData?.allowed_standing_transitions || [];

      $('standingTarget').innerHTML =
        options.length
          ? options.map(value =>
              `<option value="${value}">${label(value)}</option>`
            ).join('')
          : '<option value="">No allowed standing changes</option>';

      $('standingForm')
        .querySelector('button[type="submit"]')
        .disabled = options.length === 0;

    } else if (standingSection) {
      standingSection.hidden = true;
    }

    renderCredentials();
  }

  async function submitApplication() {
    if (!workflowUserId) return;

    if (
      !confirm(
        'Submit this assigned nurse application into the NurseLink review workflow?'
      )
    ) {
      return;
    }

    try {
      const result = await request(
        `/api/nurselink/encoder/nurses/${encodeURIComponent(workflowUserId)}/submit`,
        {
          method: 'POST',
          body: '{}'
        }
      );

      announce(
        result?.message || 'Application submitted.',
        'success'
      );

      await loadWorkflow(workflowUserId);
    } catch (error) {
      announce(error.message, 'error');
    }
  }

  $('workflowDecisionForm')
    ?.addEventListener('submit', async event => {
      event.preventDefault();

      if (!workflowUserId || !pendingTransition) {
        return;
      }

      const reason =
        $('workflowDecisionReason').value.trim();

      if (
        ['needs_information', 'declined']
          .includes(pendingTransition)
        && !reason
      ) {
        announce(
          'A decision reason is required for this action.',
          'error'
        );
        return;
      }

      if (
        pendingTransition === 'approved'
        && !confirm(
          'Approve this NurseLink membership? This is a final membership decision.'
        )
      ) {
        return;
      }

      try {
        const result = await request(
          `/api/nurselink/encoder/nurses/${encodeURIComponent(workflowUserId)}/membership-transition`,
          {
            method: 'POST',
            body: JSON.stringify({
              status: pendingTransition,
              reviewer_notes:
                $('workflowReviewerNotes').value.trim() || null,
              decision_reason:
                reason || null
            })
          }
        );

        announce(
          result?.message || 'Membership workflow updated.',
          'success'
        );

        pendingTransition = null;
        $('workflowDecisionForm').hidden = true;

        await loadWorkflow(workflowUserId);
      } catch (error) {
        announce(error.message, 'error');
      }
    });

  $('workflowDecisionCancel')
    ?.addEventListener('click', () => {
      pendingTransition = null;
      $('workflowDecisionForm').hidden = true;
    });

  $('standingForm')
    ?.addEventListener('submit', async event => {
      event.preventDefault();

      if (!workflowUserId) return;

      const standing =
        $('standingTarget').value;

      const reason =
        $('standingReason').value.trim();

      if (!standing || !reason) {
        announce(
          'Select a standing and enter a reason.',
          'error'
        );
        return;
      }

      if (
        !confirm(
          `Change this member's standing to ${label(standing)}?`
        )
      ) {
        return;
      }

      try {
        const result = await request(
          `/api/nurselink/encoder/nurses/${encodeURIComponent(workflowUserId)}/standing`,
          {
            method: 'POST',
            body: JSON.stringify({
              standing,
              reason
            })
          }
        );

        announce(
          result?.message || 'Membership standing updated.',
          'success'
        );

        $('standingReason').value = '';

        await loadWorkflow(workflowUserId);
      } catch (error) {
        announce(error.message, 'error');
      }
    });

  function renderCredentials() {
    const section = $('credentialSection');
    const list = $('credentialList');

    if (!section || !list) return;

    const credentials =
      workflowData?.credentials || [];

    if (!credentials.length) {
      section.hidden = true;
      return;
    }

    section.hidden = false;

    list.innerHTML = credentials.map(row => `
      <div class="nl-person-bar" style="margin-bottom:10px">
        <strong>${row.title || row.credential_type || 'Credential'}</strong>

        <small>
          ${row.issuing_authority || ''}
          ${
            row.credential_number_last4
              ? ` · ••••${row.credential_number_last4}`
              : ''
          }
        </small>

        <small>
          Current verification:
          ${label(row.verification_status)}
        </small>

        <div class="nl-form-grid" style="margin-top:10px">
          <label>
            <span>Verification decision</span>
            <select data-credential-status="${row.id}">
              ${
                (workflowData?.credential_decisions || [])
                  .map(value => `
                    <option
                      value="${value}"
                      ${
                        value === row.verification_status
                          ? 'selected'
                          : ''
                      }
                    >
                      ${label(value)}
                    </option>
                  `)
                  .join('')
              }
            </select>
          </label>

          <label class="nl-span-2">
            <span>Review notes</span>
            <textarea
              rows="2"
              data-credential-notes="${row.id}"
            >${row.verification_note || ''}</textarea>
          </label>

          <div class="nl-actions nl-span-2">
            <button
              class="nl-primary"
              type="button"
              data-save-credential="${row.id}"
            >
              Save Credential Review
            </button>
          </div>
        </div>
      </div>
    `).join('');

    list
      .querySelectorAll('[data-save-credential]')
      .forEach(button => {
        button.addEventListener('click', async () => {
          const id =
            button.dataset.saveCredential;

          const status =
            list.querySelector(
              `[data-credential-status="${CSS.escape(id)}"]`
            ).value;

          const notes =
            list.querySelector(
              `[data-credential-notes="${CSS.escape(id)}"]`
            ).value.trim();

          try {
            const result = await request(
              `/api/nurselink/encoder/nurses/${encodeURIComponent(workflowUserId)}/credentials/${encodeURIComponent(id)}`,
              {
                method: 'PATCH',
                body: JSON.stringify({
                  verification_status: status,
                  review_notes: notes || null
                })
              }
            );

            announce(
              result?.message || 'Credential review saved.',
              'success'
            );

            await loadWorkflow(workflowUserId);
          } catch (error) {
            announce(error.message, 'error');
          }
        });
      });
  }

  /*
   * Hook into the existing nurse-selection UI.
   * The existing page sets currentUserId when an assigned nurse is selected.
   * We observe the selected nurse header and reload workflow when it changes.
   */
  const selected = $('selectedNurse');

  if (selected) {
    const observer = new MutationObserver(() => {
      const active =
        document.querySelector(
          '.nl-nurse.active[data-user-id]'
        );

      const userId =
        active?.dataset?.userId || '';

      if (
        userId
        && userId !== workflowUserId
      ) {
        loadWorkflow(userId);
      }
    });

    observer.observe(selected, {
      childList: true,
      subtree: true
    });
  }

  window.NurseLinkLoadEncoderWorkflow =
    loadWorkflow;
})();


/* NURSELINK_TEMP_ENCODER_DOCUMENT_VIEWER_V708 */
(() => {
  const byId = id => document.getElementById(id);

  let documentViewerUserId = null;
  let documentViewerRows = [];

  function humanBytes(value) {
    const bytes = Number(value || 0);

    if (!bytes) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unit = 0;

    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit += 1;
    }

    return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
  }

  function docTypeLabel(value) {
    return String(value || 'other')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function statusTone(row) {
    const status = String(row?.security_status || '').toLowerCase();

    return status === 'clean' || status === 'unavailable'
      ? 'clean'
      : 'pending';
  }

  function clearDocumentPreview() {
    const frame = byId('encoderPreviewFrame');
    const image = byId('encoderPreviewImage');
    const empty = byId('encoderPreviewEmpty');
    const unsupported = byId('encoderPreviewUnsupported');
    const meta = byId('encoderPreviewMeta');
    const open = byId('encoderPreviewOpen');
    const name = byId('encoderPreviewName');

    if (frame) {
      frame.hidden = true;
      frame.removeAttribute('src');
    }

    if (image) {
      image.hidden = true;
      image.removeAttribute('src');
    }

    if (unsupported) unsupported.hidden = true;
    if (empty) empty.hidden = false;
    if (meta) {
      meta.hidden = true;
      meta.innerHTML = '';
    }
    if (open) {
      open.hidden = true;
      open.removeAttribute('href');
    }
    if (name) name.textContent = 'Select a document';
  }

  function previewDocument(row, button) {
    document
      .querySelectorAll('.nl-v708-doc-row')
      .forEach(node => node.classList.remove('active'));

    button?.classList.add('active');

    const frame = byId('encoderPreviewFrame');
    const image = byId('encoderPreviewImage');
    const empty = byId('encoderPreviewEmpty');
    const unsupported = byId('encoderPreviewUnsupported');
    const meta = byId('encoderPreviewMeta');
    const open = byId('encoderPreviewOpen');
    const name = byId('encoderPreviewName');

    if (!row?.preview_url) return;

    if (empty) empty.hidden = true;
    if (unsupported) unsupported.hidden = true;

    if (frame) {
      frame.hidden = true;
      frame.removeAttribute('src');
    }

    if (image) {
      image.hidden = true;
      image.removeAttribute('src');
    }

    if (name) name.textContent = row.name || 'Document';

    if (open) {
      open.href = row.preview_url;
      open.hidden = false;
    }

    const mime = String(row.mime_type || '').toLowerCase();

    if (mime === 'application/pdf') {
      if (frame) {
        frame.src = row.preview_url;
        frame.hidden = false;
      }
    } else if (mime.startsWith('image/')) {
      if (image) {
        image.src = row.preview_url;
        image.hidden = false;
      }
    } else {
      if (unsupported) unsupported.hidden = false;
    }

    if (meta) {
      meta.innerHTML = `
        <span><strong>Type:</strong> ${docTypeLabel(row.document_type)}</span>
        <span><strong>Size:</strong> ${humanBytes(row.file_size)}</span>
        <span><strong>Source:</strong> ${row.imported_source ? 'Imported evidence' : 'Temporary Encoder upload'}</span>
        <span><strong>Security:</strong> ${String(row.security_status || 'unknown')}</span>
      `;
      meta.hidden = false;
    }
  }

  function renderDocumentLibrary(rows) {
    const list = byId('encoderDocumentList');
    const count = byId('encoderDocumentCount');

    if (!list) return;

    documentViewerRows = Array.isArray(rows) ? rows : [];

    if (count) {
      count.textContent =
        `${documentViewerRows.length} document${documentViewerRows.length === 1 ? '' : 's'}`;
    }

    if (!documentViewerRows.length) {
      list.innerHTML = `
        <div class="nl-empty">
          No attached documents yet.
        </div>
      `;
      clearDocumentPreview();
      return;
    }

    list.innerHTML = documentViewerRows.map((row, index) => `
      <button
        type="button"
        class="nl-v708-doc-row"
        data-doc-index="${index}"
      >
        <span class="nl-v708-doc-icon">
          ${
            String(row.mime_type || '').includes('pdf')
              ? 'PDF'
              : String(row.mime_type || '').startsWith('image/')
                ? 'IMG'
                : 'DOC'
          }
        </span>

        <span class="nl-v708-doc-info">
          <strong>${row.name || 'Document'}</strong>
          <small>
            ${docTypeLabel(row.document_type)}
            · ${humanBytes(row.file_size)}
            ${row.imported_source ? ' · Imported source' : ''}
          </small>
        </span>

        <span
          class="nl-v708-doc-badge"
          data-tone="${statusTone(row)}"
        >
          ${
            statusTone(row) === 'clean'
              ? 'Available'
              : 'Processing'
          }
        </span>
      </button>
    `).join('');

    list
      .querySelectorAll('[data-doc-index]')
      .forEach(button => {
        button.addEventListener('click', () => {
          const row =
            documentViewerRows[
              Number(button.dataset.docIndex)
            ];

          previewDocument(row, button);
        });
      });

    const firstPreviewable =
      documentViewerRows.findIndex(row =>
        row?.preview_url
        && (
          String(row.mime_type || '') === 'application/pdf'
          || String(row.mime_type || '').startsWith('image/')
        )
      );

    if (firstPreviewable >= 0) {
      const button =
        list.querySelector(
          `[data-doc-index="${firstPreviewable}"]`
        );

      previewDocument(
        documentViewerRows[firstPreviewable],
        button
      );
    }
  }

  async function loadAssignedNurseDocuments(userId) {
    documentViewerUserId = userId;

    const list = byId('encoderDocumentList');

    if (list) {
      list.innerHTML = `
        <div class="nl-empty">
          Loading attached documents…
        </div>
      `;
    }

    clearDocumentPreview();

    try {
      const body =
        await request(
          `/api/nurselink/encoder/nurses/${encodeURIComponent(userId)}/documents`
        );

      renderDocumentLibrary(
        body?.data || []
      );

    } catch (error) {
      if (list) {
        list.innerHTML = `
          <div class="nl-empty">
            ${error.message || 'Unable to load documents.'}
          </div>
        `;
      }
    }
  }

  const originalPopulateProfile =
    window.populateProfile;

  /*
   * The existing application keeps populateProfile scoped inside
   * its IIFE, so we observe nurse selection via the network-loaded
   * editor state instead of replacing that implementation.
   */
  document.addEventListener(
    'click',
    event => {
      const nurseButton =
        event.target.closest('.nl-nurse');

      if (!nurseButton) return;

      const userId =
        nurseButton.dataset.userId
        || nurseButton.dataset.nurseUserId
        || nurseButton.getAttribute('data-user-id');

      if (userId) {
        setTimeout(
          () => loadAssignedNurseDocuments(userId),
          150
        );
      }
    }
  );

  const uploadButton =
    byId('quickUploadDocument');

  const uploadInput =
    byId('encoderDocumentInput');

  uploadButton?.addEventListener(
    'click',
    () => {
      if (!documentViewerUserId) {
        notice(
          'Select an assigned nurse first.',
          'error'
        );
        return;
      }

      uploadInput?.click();
    }
  );

  uploadInput?.addEventListener(
    'change',
    async () => {
      const file =
        uploadInput.files?.[0];

      if (!file || !documentViewerUserId) {
        return;
      }

      const type =
        byId('encoderDocumentType')?.value
        || 'other';

      const body =
        new FormData();

      body.append(
        'document',
        file
      );

      body.append(
        'document_type',
        type
      );

      if (uploadButton) {
        uploadButton.disabled = true;
        uploadButton.textContent = 'Uploading…';
      }

      try {
        const response =
          await fetch(
            `/api/nurselink/encoder/nurses/${encodeURIComponent(documentViewerUserId)}/documents`,
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'X-XSRF-TOKEN':
                  decodeURIComponent(
                    document.cookie
                      .split('; ')
                      .find(row =>
                        row.startsWith('XSRF-TOKEN=')
                      )
                      ?.split('=')[1]
                    || ''
                  ),
                'Accept':
                  'application/json'
              },
              body
            }
          );

        const payload =
          await response.json()
            .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            payload?.message
            || 'Unable to upload document.'
          );
        }

        notice(
          payload?.message
          || 'Document uploaded.',
          'success'
        );

        await loadAssignedNurseDocuments(
          documentViewerUserId
        );

      } catch (error) {
        notice(
          error.message
          || 'Unable to upload document.',
          'error'
        );

      } finally {
        uploadInput.value = '';

        if (uploadButton) {
          uploadButton.disabled = false;
          uploadButton.textContent =
            'Upload Document';
        }
      }
    }
  );
})();
/* NURSELINK_TEMP_ENCODER_DOCUMENT_VIEWER_V708_END */
