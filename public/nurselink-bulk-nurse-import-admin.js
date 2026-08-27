(() => {
  'use strict';

  const API =
    'https://api.amsertech.com';

  const $ =
    id => document.getElementById(id);

  const notice =
    $('bulkImportNotice');

  const identity =
    $('adminIdentity');

  const summary =
    $('bulkImportSummary');

  const queue =
    $('bulkImportQueue');

  const detail =
    $('bulkImportDetail');

  let queueRows = [];
  let selectedCandidateId = null;


  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }


  function label(value) {
    return String(value || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char =>
        char.toUpperCase()
      );
  }


  function cookie(name) {
    const prefix = `${name}=`;

    const row = document.cookie
      .split(';')
      .map(value => value.trim())
      .find(value =>
        value.startsWith(prefix)
      );

    return row
      ? row.slice(prefix.length)
      : '';
  }


  async function csrf() {
    const response = await fetch(
      `${API}/sanctum/csrf-cookie`,
      {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'X-Requested-With':
            'XMLHttpRequest'
        }
      }
    );

    if (
      !response.ok
      && response.status !== 204
    ) {
      throw new Error(
        'Unable to initialize secure Administrator request.'
      );
    }
  }


  async function request(
    path,
    options = {}
  ) {
    const method = String(
      options.method || 'GET'
    ).toUpperCase();

    const mutating =
      ![
        'GET',
        'HEAD',
        'OPTIONS'
      ].includes(method);

    if (mutating) {
      await csrf();
    }

    const headers = {
      Accept: 'application/json',
      'X-Requested-With':
        'XMLHttpRequest',
      ...(options.headers || {})
    };

    if (mutating) {
      headers['Content-Type'] =
        'application/json';

      const token = decodeURIComponent(
        cookie('XSRF-TOKEN')
      );

      if (token) {
        headers['X-XSRF-TOKEN'] =
          token;
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

    let body = null;

    try {
      body = await response.json();
    } catch (_) {}

    if (!response.ok) {
      const error = new Error(
        body?.message
        || `Administrator request failed (${response.status}).`
      );

      error.status =
        response.status;

      throw error;
    }

    return body;
  }


  function show(
    message = '',
    tone = ''
  ) {
    notice.textContent =
      message;

    notice.dataset.tone =
      tone;

    notice.hidden =
      !message;
  }


  function login() {
    const target =
      '/nurselink-bulk-nurse-import-admin.html';

    location.replace(
      '/nurselink-admin-login.html?return='
      + encodeURIComponent(target)
    );
  }


  function stat(
    title,
    value,
    detailText
  ) {
    return `
      <div class="bnai-stat">
        <span>${esc(title)}</span>
        <strong>${esc(value)}</strong>
        <small>${esc(detailText)}</small>
      </div>
    `;
  }


  function formatDate(value) {
    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    return Number.isNaN(
      date.valueOf()
    )
      ? String(value)
      : date.toLocaleString();
  }


  function queueCard(item) {
    const candidate =
      item.candidate || {};

    const duplicate =
      item.duplicate || {};

    return `
      <button
        type="button"
        class="bnai-candidate"
        data-candidate-id="${esc(candidate.id)}"
        data-active="${
          Number(candidate.id)
          === Number(selectedCandidateId)
            ? 'true'
            : 'false'
        }"
      >
        <strong>
          ${esc(
            candidate.display_name
            || candidate.email
            || `Candidate ${candidate.id}`
          )}
        </strong>

        <span>
          ${esc(candidate.email || 'No email')}
        </span>

        <small>
          Batch ${esc(candidate.batch_name || candidate.batch_id)}
          · Ready ${esc(formatDate(candidate.ready_for_import_at))}
        </small>

        <small>
          ${
            duplicate.user_exists
              ? '⚠ Existing NurseLink email match'
              : '✓ No current email duplicate'
          }
        </small>
      </button>
    `;
  }


  function reviewSummary(review = {}) {
    const labels = [
      ['education', 'Education'],
      ['employment', 'Employment'],
      ['credentials', 'Credentials'],
      ['competencies', 'Competencies'],
      ['languages', 'Languages'],
      ['references', 'References']
    ];

    return labels
      .map(([key, text]) => {
        const row =
          review[key] || {};

        return `
          <div class="bnai-field">
            <span>${esc(text)}</span>
            <strong>
              ${esc(row.approved || 0)}
              approved
            </strong>
            <small>
              ${esc(row.rejected || 0)} rejected
              · ${esc(row.pending || 0)} pending
            </small>
          </div>
        `;
      })
      .join('');
  }


  function record(
    title,
    subtitle = '',
    meta = '',
    status = ''
  ) {
    return `
      <article class="bnai-record">
        <strong>${esc(title || '—')}</strong>

        ${
          subtitle
            ? `<span>${esc(subtitle)}</span>`
            : ''
        }

        ${
          meta
            ? `<small>${esc(meta)}</small>`
            : ''
        }

        ${
          status
            ? `
              <span class="bnai-badge ${
                status === 'rejected'
                  ? 'danger'
                  : status === 'review_required'
                    ? 'warn'
                    : ''
              }">
                ${esc(label(status))}
              </span>
            `
            : ''
        }
      </article>
    `;
  }


  function renderCollection(
    heading,
    rows,
    renderRow,
    privateNote = ''
  ) {
    return `
      <section class="bnai-section">

        <h3>${esc(heading)}</h3>

        ${
          privateNote
            ? `
              <div class="bnai-private">
                ${esc(privateNote)}
              </div>
            `
            : ''
        }

        <div class="bnai-records">
          ${
            rows.length
              ? rows.map(renderRow).join('')
              : `
                <div class="bnai-empty">
                  No records.
                </div>
              `
          }
        </div>

      </section>
    `;
  }


  async function loadQueue(
    preserveSelection = true
  ) {
    show('');

    try {
      const body = await request(
        '/api/nurselink/admin/bulk-nurse-import'
      );

      queueRows =
        Array.isArray(body?.data)
          ? body.data
          : [];

      const stats =
        body?.summary || {};

      summary.innerHTML = [
        stat(
          'Ready for Import',
          stats.ready_for_admin_import || 0,
          'Reviewed candidates'
        ),

        stat(
          'Email Matches',
          stats.duplicate_email_matches || 0,
          'Fresh duplicate check'
        ),

        stat(
          'Import Mode',
          'Applicant',
          'Draft application only'
        ),

        stat(
          'Credential Verification',
          'Unchanged',
          'Review is not verification'
        )
      ].join('');

      if (
        !preserveSelection
        || !queueRows.some(
          row =>
            Number(
              row?.candidate?.id
            )
            === Number(
              selectedCandidateId
            )
        )
      ) {
        selectedCandidateId =
          queueRows[0]?.candidate?.id
          || null;
      }

      queue.innerHTML =
        queueRows.length
          ? queueRows
              .map(queueCard)
              .join('')
          : `
            <div class="bnai-empty">
              No candidates are awaiting
              Administrator Import.
            </div>
          `;

      queue
        .querySelectorAll(
          '[data-candidate-id]'
        )
        .forEach(button => {
          button.addEventListener(
            'click',
            () => {
              selectedCandidateId =
                Number(
                  button.dataset.candidateId
                );

              renderQueueSelection();

              loadDetail(
                selectedCandidateId
              );
            }
          );
        });

      if (selectedCandidateId) {
        await loadDetail(
          selectedCandidateId
        );
      } else {
        detail.innerHTML = `
          <div class="bnai-empty">
            No candidate selected.
          </div>
        `;
      }

    } catch (error) {
      if (
        [401, 403, 419]
          .includes(error.status)
      ) {
        login();
        return;
      }

      show(
        error.message,
        'error'
      );

      queue.innerHTML = `
        <div class="bnai-empty">
          Import queue unavailable.
        </div>
      `;
    }
  }


  function renderQueueSelection() {
    queue
      .querySelectorAll(
        '[data-candidate-id]'
      )
      .forEach(button => {
        button.dataset.active =
          Number(
            button.dataset.candidateId
          )
          === Number(
            selectedCandidateId
          )
            ? 'true'
            : 'false';
      });
  }


  async function loadDetail(
    candidateId
  ) {
    detail.innerHTML = `
      <div class="nl-admin-loading">
        Loading candidate detail…
      </div>
    `;

    try {
      const body = await request(
        `/api/nurselink/admin/bulk-nurse-import/${candidateId}`
      );

      const data =
        body?.data || {};

      const c =
        data.candidate || {};

      const s =
        data.structured || {};

      const duplicate =
        data.duplicate || {};

      detail.innerHTML = `

        <section>

          <div class="bnai-person">

            ${[
              ['Name', c.display_name],
              ['Email', c.email],
              ['Phone', c.phone],
              ['Country', c.country],
              ['Current Position', c.current_position],
              ['Current Employer', c.current_employer],
              ['Photo Decision', label(c.photo_status)],
              ['Import Status', label(c.import_status)]
            ]
              .map(
                ([name, value]) => `
                  <div class="bnai-field">
                    <span>${esc(name)}</span>
                    <strong>${esc(value || '—')}</strong>
                  </div>
                `
              )
              .join('')}

          </div>

        </section>


        <div class="bnai-duplicate ${
          duplicate.user_exists
            ? 'danger'
            : ''
        }">

          <strong>
            ${
              duplicate.user_exists
                ? 'Duplicate email detected'
                : 'No current NurseLink email duplicate'
            }
          </strong>

          <span>
            ${
              duplicate.user_exists
                ? `Existing account: ${esc(
                    duplicate.user?.email
                    || c.email
                  )}`
                : `Fresh lookup found no user for ${esc(
                    c.email || 'this candidate'
                  )}.`
            }
          </span>

        </div>


        ${renderCollection(
          'Education',
          Array.isArray(s.education)
            ? s.education
            : [],
          x => record(
            x.qualification,
            [
              x.field_of_study,
              x.institution
            ].filter(Boolean).join(' · '),
            [
              x.country,
              x.started_on,
              x.completed_on
            ].filter(Boolean).join(' · '),
            x.review_status
          )
        )}


        ${renderCollection(
          'Employment History',
          Array.isArray(s.employment)
            ? s.employment
            : [],
          x => record(
            x.position_title,
            x.employer,
            [
              x.city,
              x.country,
              x.started_on,
              x.ended_on
                || (
                  x.is_current
                    ? 'Present'
                    : ''
                )
            ].filter(Boolean).join(' · '),
            x.review_status
          )
        )}


        ${renderCollection(
          'Licenses, Certifications & Training',
          Array.isArray(s.credentials)
            ? s.credentials
            : [],
          x => record(
            x.title,
            [
              label(x.credential_type),
              x.issuing_authority
            ].filter(Boolean).join(' · '),
            [
              x.country,
              `Verification: ${
                label(
                  x.verification_status
                  || 'unverified'
                )
              }`
            ].filter(Boolean).join(' · '),
            x.review_status
          )
        )}


        ${renderCollection(
          'Skills & Competencies',
          Array.isArray(s.competencies)
            ? s.competencies
            : [],
          x => record(
            x.name,
            x.domain,
            x.proficiency
              ? `Proficiency: ${label(x.proficiency)}`
              : 'Proficiency not inferred',
            x.review_status
          )
        )}


        ${renderCollection(
          'Languages',
          Array.isArray(s.languages)
            ? s.languages
            : [],
          x => record(
            x.language,
            [
              x.speaking
                ? `Speaking ${label(x.speaking)}`
                : '',
              x.reading
                ? `Reading ${label(x.reading)}`
                : '',
              x.writing
                ? `Writing ${label(x.writing)}`
                : ''
            ].filter(Boolean).join(' · '),
            '',
            x.review_status
          )
        )}


        ${renderCollection(
          'Character / Professional References',
          Array.isArray(s.references)
            ? s.references
            : [],
          x => record(
            x.name,
            [
              x.position_title,
              x.organization
            ].filter(Boolean).join(' · '),
            [
              x.phone,
              x.email
            ].filter(Boolean).join(' · '),
            x.review_status
          ),
          'Private third-party reference information. Not part of the public member profile.'
        )}


        <section class="bnai-section">

          <div class="bnai-import-box">

            <strong>
              Import as Applicant
            </strong>

            <p>
              This will eventually create an unverified
              applicant account and draft application only.
              Membership approval and credential verification
              remain separate governed workflows.
            </p>

            <button
              id="bulkImportApplicantButton"
              type="button"
              data-import-candidate-id="${Number(candidateId)}"
            >
              Import as Applicant
            </button>

          </div>

        </section>
      `;

    } catch (error) {
      if (
        [401, 403, 419]
          .includes(error.status)
      ) {
        login();
        return;
      }

      detail.innerHTML = `
        <div class="bnai-empty">
          ${esc(error.message)}
        </div>
      `;
    }
  }


  /*
   * V696 Controlled Administrator Import
   *
   * The button creates an applicant account and draft application
   * only. Membership approval and credential verification remain
   * separate governed workflows enforced by the backend.
   *
   * Delegation is used because the candidate-detail HTML is
   * dynamically replaced whenever a queue item is opened/refreshed.
   */
  document.addEventListener(
    'click',
    async event => {
      const button =
        event.target.closest(
          '#bulkImportApplicantButton'
        );

      if (!button) {
        return;
      }

      event.preventDefault();

      const candidateId =
        Number(
          button.dataset
            .importCandidateId
        );

      if (!candidateId) {
        show(
          'Unable to determine the candidate selected for import.',
          'error'
        );

        return;
      }

      if (
        button.dataset.importing
        === '1'
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          'Import this reviewed nurse as a NurseLink Applicant?\n\n'
          + 'This creates an applicant account and DRAFT application only.\n\n'
          + 'It does NOT approve membership and does NOT verify credentials.'
        );

      if (!confirmed) {
        return;
      }

      const originalText =
        button.textContent;

      button.dataset.importing =
        '1';

      button.disabled =
        true;

      button.textContent =
        'Importing Applicant…';

      let succeeded =
        false;

      try {
        const result =
          await request(
            `/api/nurselink/admin/bulk-nurse-import/${candidateId}/import`,
            {
              method: 'POST',
              body: '{}'
            }
          );

        succeeded =
          true;

        show(
          result?.message
          || 'Applicant account and draft application created.',
          'success'
        );

        detail.innerHTML = `
          <div class="bnai-empty">
            <strong>Applicant import completed.</strong>
            <br>
            Membership approval and credential verification
            remain pending governed workflows.
          </div>
        `;

        await loadQueue(true);

      } catch (error) {
        if (
          [401, 403, 419]
            .includes(error.status)
        ) {
          login();
          return;
        }

        show(
          error.message
          || 'Unable to import this applicant.',
          'error'
        );

      } finally {
        if (
          !succeeded
          && button.isConnected
        ) {
          button.disabled =
            false;

          button.dataset.importing =
            '0';

          button.textContent =
            originalText;
        }
      }
    }
  );


  $('refreshBulkImport')
    .addEventListener(
      'click',
      () => loadQueue(true)
    );


  $('adminSignOut')
    .addEventListener(
      'click',
      async () => {
        try {
          await request(
            '/api/nurselink/admin/logout',
            {
              method: 'POST',
              body: '{}'
            }
          );
        } catch (_) {}

        location.replace(
          '/nurselink-admin-login.html'
        );
      }
    );


  (async () => {
    try {
      const session = await request(
        '/api/nurselink/admin/session'
      );

      const data =
        session?.data || {};

      identity.innerHTML = `
        <span>
          ${esc(
            data?.access?.label
            || 'Administrator'
          )}
        </span>

        <strong>
          ${esc(
            data?.user?.name
            || data?.user?.email
            || 'NurseLink Staff'
          )}
        </strong>

        <small>
          ${esc(
            data?.user?.email
            || ''
          )}
        </small>
      `;

      await loadQueue(false);

    } catch (error) {
      if (
        [401, 403, 419]
          .includes(error.status)
      ) {
        login();
        return;
      }

      show(
        error.message,
        'error'
      );
    }
  })();

})();
