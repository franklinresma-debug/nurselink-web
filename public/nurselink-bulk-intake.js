(() => {
  'use strict';

  const API = 'https://api.amsertech.com';
  const $ = id => document.getElementById(id);

  let batchId = null;
  let batchPayload = null;
  let selectedFiles = [];
  let currentCandidateBundles = [];
  let processingRefreshTimer = null;
  let previewObjectUrl = null;

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
      throw new Error('Unable to initialize secure request.');
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

    if (
      mutating
      && !(options.body instanceof FormData)
    ) {
      headers['Content-Type'] = 'application/json';
    }

    if (mutating) {
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
        || `Request failed (${response.status}).`
      );

      error.status = response.status;

      throw error;
    }

    return payload;
  }

  function notice(message = '', tone = '') {
    const el = $('notice');

    el.textContent = message;
    el.dataset.tone = tone;
    el.classList.toggle(
      'nlbi-hidden',
      !message
    );
  }

  function humanSize(bytes) {
    const value = Number(bytes || 0);

    if (value < 1024) return `${value} B`;
    if (value < 1048576) {
      return `${(value / 1024).toFixed(1)} KB`;
    }

    return `${(value / 1048576).toFixed(1)} MB`;
  }

  function pct(value) {
    if (value === null || value === undefined) {
      return '—';
    }

    return `${Math.round(Number(value) * 100)}%`;
  }

  function label(value) {
    return String(value || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }


  function reviewBadge(status) {
    const value =
      String(
        status || 'review_required'
      );

    const tone =
      value === 'approved'
        ? 'ok'
        : value === 'rejected'
          ? 'danger'
          : 'warn';

    return `
      <span class="nlbi-badge ${tone}">
        ${esc(label(value))}
      </span>
    `;
  }


  function recordActions(
    type,
    item
  ) {
    return `
      <div class="nlbi-record-actions">

        <button
          type="button"
          data-record-edit
          data-record-type="${esc(type)}"
          data-record-id="${esc(item.id)}"
        >
          Edit
        </button>

        <button
          type="button"
          data-record-review="approved"
          data-record-type="${esc(type)}"
          data-record-id="${esc(item.id)}"
          ${item.review_status === 'approved' ? 'disabled' : ''}
        >
          Approve
        </button>

        <button
          type="button"
          data-record-review="rejected"
          data-record-type="${esc(type)}"
          data-record-id="${esc(item.id)}"
          ${item.review_status === 'rejected' ? 'disabled' : ''}
        >
          Reject
        </button>

      </div>
    `;
  }


  function addRecordButton(
    type,
    labelText
  ) {
    return `
      <div class="nlbi-section-actions">
        <button
          type="button"
          data-record-add="${esc(type)}"
        >
          + Add ${esc(labelText)}
        </button>
      </div>
    `;
  }


  function structuredReviewCounts(bundle) {
    const collections = [
      ['Education', bundle.education || []],
      ['Employment', bundle.employment || []],
      ['Credentials', bundle.credentials || []],
      ['Competencies', bundle.competencies || []],
      ['Languages', bundle.languages || []],
      ['References', bundle.references || []]
    ];

    const pending = [];

    for (
      const [name, items]
      of collections
    ) {
      const count =
        items.filter(
          item =>
            String(
              item.review_status
              || 'review_required'
            ) === 'review_required'
        ).length;

      if (count) {
        pending.push(
          `${name}: ${count}`
        );
      }
    }

    return pending;
  }

  async function verifySession() {
    try {
      await request(
        '/api/nurselink/encoder/me'
      );
    } catch (error) {
      if ([401, 403, 419].includes(error.status)) {
        location.replace(
          '/nurselink-encoder-login.html'
        );
      }

      throw error;
    }
  }

  async function loadBatches() {
    const payload = await request(
      '/api/nurselink/encoder/bulk-intake'
    );

    const rows =
      Array.isArray(payload?.data)
        ? payload.data
        : [];

    $('batchSelect').innerHTML =
      '<option value="">Select a batch</option>'
      + rows.map(row => `
          <option value="${row.id}">
            ${esc(row.name)} · ${esc(label(row.status))}
          </option>
        `).join('');

    return rows;
  }

  async function chooseBatch(id) {
    batchId = Number(id);

    if (!batchId) {
      $('uploadCard').classList.add('nlbi-hidden');
      $('progressCard').classList.add('nlbi-hidden');
      $('reviewCard').classList.add('nlbi-hidden');
      return;
    }

    $('uploadCard').classList.remove('nlbi-hidden');
    $('progressCard').classList.remove('nlbi-hidden');

    await refreshBatch();
  }

  async function refreshBatch() {
    if (!batchId) return;

    const payload = await request(
      `/api/nurselink/encoder/bulk-intake/${batchId}`
    );

    batchPayload = payload?.data || {};

    renderProgress();

    const candidateCount =
      Number(
        batchPayload?.batch?.candidate_count || 0
      );

    if (candidateCount > 0) {
      await loadCandidates();
    }
  }

  function renderProgress() {
    const batch =
      batchPayload?.batch || {};

    $('statFiles').textContent =
      batch.file_count || 0;

    $('statProcessed').textContent =
      batch.processed_count || 0;

    $('statFailed').textContent =
      batch.failed_count || 0;

    $('statCandidates').textContent =
      batch.candidate_count || 0;

    $('statReady').textContent =
      batch.ready_count || 0;

    $('statReview').textContent =
      batch.review_count || 0;

    const totalFiles = Number(batch.file_count || 0);
    const processedFiles = Number(batch.processed_count || 0);
    const progressPercent = totalFiles > 0
      ? Math.min(100, Math.round((processedFiles / totalFiles) * 100))
      : 0;

    $('processingProgressLabel').textContent =
      `${processedFiles} of ${totalFiles} document${totalFiles === 1 ? '' : 's'} processed`;
    $('processingProgressPercent').textContent = `${progressPercent}%`;
    $('processingProgressFill').style.width = `${progressPercent}%`;
    $('processingProgress').setAttribute(
      'aria-valuenow',
      String(progressPercent)
    );

    const rows =
      Array.isArray(batchPayload?.files)
        ? batchPayload.files
        : [];

    $('batchFiles').innerHTML =
      rows.length
        ? rows.map(row => `
            <div class="nlbi-file">
              <div>
                <strong>${esc(row.original_name)}</strong>
                <small>
                  ${esc(row.document_type || 'Unclassified')}
                  · ${esc(humanSize(row.file_size))}
                </small>
              </div>

              <div>
                <strong>${esc(label(row.extraction_status))}</strong>
                <small>
                  Security: ${esc(label(row.security_status))}
                </small>
                ${fileProcessingProgress(row)}
              </div>
              <button
                class="nlbi-remove-file"
                type="button"
                data-remove-file="${row.id}"
                ${Number(batch.candidate_count || 0) > 0 ? 'disabled title="Documents cannot be removed after candidates are built."' : ''}
              >
                Remove
              </button>
              <button
                class="nlbi-reprocess-file"
                type="button"
                data-reprocess-file="${row.id}"
              >
                Reprocess
              </button>
              <button
                class="nlbi-preview-file"
                type="button"
                data-preview-file="${row.id}"
              >
                Preview
              </button>
            </div>
          `).join('')
        : '<div>No files uploaded yet.</div>';

    $('batchFiles')
      .querySelectorAll('[data-remove-file]')
      .forEach(button => {
        button.addEventListener('click', async () => {
          const fileId = Number(button.dataset.removeFile);
          const file = rows.find(row => Number(row.id) === fileId);

          if (!fileId || !file) return;

          if (!confirm(`Remove ${file.original_name} from this batch? This cannot be undone.`)) {
            return;
          }

          button.disabled = true;

          try {
            const result = await request(
              `/api/nurselink/encoder/bulk-intake/${batchId}/files/${fileId}`,
              { method: 'DELETE' }
            );

            notice(
              result?.message || 'Document removed from this batch.',
              'success'
            );

            await refreshBatch();
          } catch (error) {
            button.disabled = false;
            notice(error.message, 'error');
          }
        });
      });

    $('batchFiles')
      .querySelectorAll('[data-preview-file]')
      .forEach(button => {
        button.addEventListener('click', () => {
          const fileId = Number(button.dataset.previewFile);
          const file = rows.find(row => Number(row.id) === fileId);

          if (fileId && file) {
            openDocumentPreview(file);
          }
        });
      });

    $('batchFiles')
      .querySelectorAll('[data-reprocess-file]')
      .forEach(button => {
        button.addEventListener('click', async () => {
          const fileId = Number(button.dataset.reprocessFile);
          const file = rows.find(row => Number(row.id) === fileId);

          if (!fileId || !file) return;

          if (!confirm(`Reprocess ${file.original_name}? After processing completes, rebuild the candidate record to refresh its fields.`)) {
            return;
          }

          button.disabled = true;

          try {
            const result = await request(
              `/api/nurselink/encoder/bulk-intake/${batchId}/files/${fileId}/reprocess`,
              { method: 'POST', body: '{}' }
            );

            notice(result?.message || 'Document reprocessing started.', 'success');
            await refreshBatch();
          } catch (error) {
            button.disabled = false;
            notice(error.message, 'error');
          }
        });
      });

    const unfinished =
      rows.some(row =>
        ['queued', 'processing']
          .includes(row.extraction_status)
      );

    $('buildCandidates').disabled =
      rows.length === 0 || unfinished;

    scheduleProcessingRefresh(rows);
  }

  function fileProcessingProgress(row) {
    const status = String(row.extraction_status || 'queued');
    const values = {
      queued: [15, 'Queued for OCR'],
      processing: [60, 'Scanning and extracting'],
      extracted: [100, 'Extraction complete'],
      needs_input: [100, 'Extraction complete — review fields'],
      blocked: [100, 'Processing blocked'],
      failed: [100, 'Processing failed'],
    };
    const [percent, description] = values[status] || [0, 'Waiting'];
    const tone = ['blocked', 'failed'].includes(status) ? 'error' : status === 'needs_input' ? 'warn' : '';

    return `
      <div class="nlbi-file-progress ${tone}" role="progressbar" aria-label="${esc(row.original_name)} processing progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}">
        <span>${esc(description)}</span>
        <div><i style="width:${percent}%"></i></div>
      </div>
    `;
  }

  function scheduleProcessingRefresh(rows) {
    if (processingRefreshTimer) {
      clearTimeout(processingRefreshTimer);
      processingRefreshTimer = null;
    }

    const unfinished = rows.some(row =>
      ['queued', 'processing'].includes(row.extraction_status)
    );

    if (!unfinished || !batchId) return;

    processingRefreshTimer = setTimeout(async () => {
      processingRefreshTimer = null;

      try {
        await refreshBatch();
      } catch (error) {
        notice(error.message, 'error');
      }
    }, 3000);
  }

  function closeDocumentPreview() {
    const dialog = $('documentPreviewDialog');

    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = null;
    }

    $('documentPreviewContent').innerHTML = '';

    if (dialog.open) {
      dialog.close();
    }
  }

  async function openDocumentPreview(file) {
    const dialog = $('documentPreviewDialog');
    const content = $('documentPreviewContent');
    const previewUrl =
      `${API}/api/nurselink/encoder/bulk-intake/${batchId}/files/${file.id}/preview`;
    const isPdf =
      /pdf/i.test(String(file.mime_type || ''))
      || /\.pdf$/i.test(String(file.original_name || ''));

    /*
     * PDFs are opened in a secure browser tab. This lets the browser use its
     * native PDF viewer without weakening the portal's frame CSP.
     */
    if (isPdf) {
      closeDocumentPreview();
      $('documentPreviewTitle').textContent = file.original_name || 'Document Preview';
      content.innerHTML = `
        <div class="nlbi-pdf-preview-message">
          <strong>PDF preview is ready.</strong>
          <p>Open it directly in a secure browser tab to inspect the scanned pages.</p>
          <a class="nlbi-button primary" href="${previewUrl}" target="_blank" rel="noopener">Open PDF Preview</a>
        </div>
      `;

      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }

      return;
    }

    closeDocumentPreview();
    $('documentPreviewTitle').textContent = file.original_name || 'Document Preview';
    content.textContent = 'Loading secure preview…';

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }

    try {
      const response = await fetch(
        previewUrl,
        {
          credentials: 'include',
          headers: {
            Accept: 'application/pdf,image/*,application/octet-stream',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Unable to load the document preview.');
      }

      const blob = await response.blob();
      previewObjectUrl = URL.createObjectURL(blob);
      const mime = blob.type || file.mime_type || '';

      content.innerHTML = mime.startsWith('image/')
        ? `<img src="${previewObjectUrl}" alt="Preview of ${esc(file.original_name)}">`
        : `<iframe src="${previewObjectUrl}" title="Preview of ${esc(file.original_name)}"></iframe>`;
    } catch (error) {
      content.textContent = error.message;
    }
  }

  function showCandidateBuiltNotice() {
    const dialog = $('candidateBuiltNotice');

    if (!dialog) return;

    if (dialog.open) {
      dialog.close();
    }

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  function renderSelectedFiles() {
    $('selectedFiles').innerHTML =
      selectedFiles.length
        ? selectedFiles.map(file => `
            <div class="nlbi-file">
              <div>
                <strong>${esc(file.name)}</strong>
                <small>${esc(humanSize(file.size))}</small>
              </div>
            </div>
          `).join('')
        : '';
  }

  async function uploadSelectedFiles() {
    if (!batchId) {
      return notice(
        'Create or select a batch first.',
        'error'
      );
    }

    if (!selectedFiles.length) {
      return notice(
        'Select at least one document.',
        'error'
      );
    }

    const tooLarge =
      selectedFiles.find(
        file => file.size > 15 * 1024 * 1024
      );

    if (tooLarge) {
      return notice(
        `${tooLarge.name} exceeds the 15 MB NurseLink document limit.`,
        'error'
      );
    }

    $('uploadFiles').disabled = true;

    let uploaded = 0;
    let failed = 0;
    let duplicates = 0;
    let reprocessed = 0;

    for (const file of selectedFiles) {
      const body = new FormData();

      body.append(
        'file',
        file,
        file.name
      );

      try {
        const response = await request(
          `/api/nurselink/encoder/bulk-intake/${batchId}/files`,
          {
            method: 'POST',
            body
          }
        );

        if (response?.reused_existing_file) {
          reprocessed++;
        } else {
          uploaded++;
        }
      } catch (error) {
        if (error.status === 409) {
          duplicates++;
          notice(
            `${file.name} is already attached to this batch. Refreshing its existing processing result.`,
            'info'
          );
        } else {
          failed++;
          notice(
            `${file.name}: ${error.message}`,
            'error'
          );
        }
      }

      $('uploadFiles').textContent =
        `Uploading ${uploaded + failed}/${selectedFiles.length}`;
    }

    $('uploadFiles').disabled = false;
    $('uploadFiles').textContent =
      'Upload Selected Files';

    selectedFiles = [];
    $('fileInput').value = '';
    renderSelectedFiles();

    notice(
      `${uploaded} document(s) uploaded${reprocessed ? `; ${reprocessed} existing roster reprocessing` : ''}${duplicates ? `; ${duplicates} already in this batch` : ''}${failed ? `; ${failed} failed` : ''}. OCR is processing in the background.`,
      failed ? 'error' : 'success'
    );

    await refreshBatch();
  }

  async function buildCandidates() {
    if (!batchId) return;

    $('buildCandidates').disabled = true;

    try {
      const result = await request(
        `/api/nurselink/encoder/bulk-intake/${batchId}/group`,
        {
          method: 'POST',
          body: '{}'
        }
      );

      notice(
        result?.message
        || 'Candidate record built for review.',
        'success'
      );

      await refreshBatch();
      await loadCandidates();
      showCandidateBuiltNotice();

    } catch (error) {
      notice(
        error.message,
        'error'
      );
    } finally {
      $('buildCandidates').disabled = false;
    }
  }

  async function loadCandidates() {
    if (!batchId) return;

    const payload = await request(
      `/api/nurselink/encoder/bulk-intake/${batchId}/candidates`
    );

    const rows =
      payload?.data?.candidates || [];

    $('reviewCard').classList.remove(
      'nlbi-hidden'
    );

    renderCandidates(rows);
  }

  function input(
    id,
    labelText,
    value = '',
    type = 'text'
  ) {
    return `
      <label>
        ${esc(labelText)}
        <input
          data-field="${esc(id)}"
          type="${esc(type)}"
          value="${esc(value || '')}"
        >
      </label>
    `;
  }

  function candidateReadinessSummary(bundle) {
    const row = bundle.candidate || {};
    let rosterDetails = {};
    try {
      rosterDetails = typeof row.roster_details === 'string'
        ? JSON.parse(row.roster_details || '{}')
        : (row.roster_details || {});
    } catch (_) {}
    const rosterEntries = Object.entries(rosterDetails || {})
      .filter(([, value]) => String(value || '').trim() !== '');
    const fields = [
      ['first_name', 'First name'], ['last_name', 'Last name'],
      ['birth_date', 'Birth date'], ['sex', 'Sex'],
      ['nationality', 'Nationality'], ['email', 'Email address'],
      ['phone', 'Mobile / phone'], ['address_line1', 'Address'],
      ['city', 'City'], ['province', 'Province / region'],
      ['country', 'Country'], ['professional_title', 'Professional title'],
      ['current_position', 'Current position'], ['current_employer', 'Current employer'],
      ['specialty', 'Specialty'], ['years_experience', 'Years of experience'],
      ['highest_nursing_education', 'Highest nursing education'], ['graduation_year', 'Graduation year'],
      ['primary_license_number', 'Professional licence number'],
      ['primary_license_country', 'Licence country'], ['primary_license_expiry', 'Licence expiry'],
    ];
    const hasValue = value => value !== null && value !== undefined && String(value).trim() !== '';
    const detected = fields.filter(([key]) => hasValue(row[key]));
    const missing = fields.filter(([key]) => !hasValue(row[key]));
    const documents = Array.isArray(bundle.files) ? bundle.files : [];
    const pendingReviews = structuredReviewCounts(bundle);

    return `
      <section class="nlbi-readiness-summary">
        <div class="nlbi-readiness-heading">
          <div>
            <span class="nlbi-eyebrow">PRE-SUBMISSION SUMMARY</span>
            <h3>Candidate record readiness</h3>
            <p>Review the saved, collated details below before submitting this candidate for Administrator Import.</p>
          </div>
          <span class="nlbi-badge ${missing.length || pendingReviews.length ? 'warn' : 'ok'}">
            ${missing.length || pendingReviews.length ? 'Review needed' : 'Information complete'}
          </span>
        </div>
        <div class="nlbi-readiness-grid">
          <div>
            <h4>Detected fields (${detected.length})</h4>
            ${detected.length ? `<dl class="nlbi-summary-fields">${detected.map(([key, fieldLabel]) => `<div><dt>${esc(fieldLabel)}</dt><dd>${esc(row[key])}</dd></div>`).join('')}</dl>` : '<p class="nlbi-summary-empty">No profile fields detected yet.</p>'}
          </div>
          <div>
            <h4>Missing information (${missing.length})</h4>
            ${missing.length ? `<ul class="nlbi-summary-missing">${missing.map(([, fieldLabel]) => `<li>${esc(fieldLabel)}</li>`).join('')}</ul>` : '<p class="nlbi-summary-complete">No profile fields are missing.</p>'}
          </div>
          <div>
            <h4>Documents in this batch (${documents.length})</h4>
            ${documents.length ? `<ul class="nlbi-summary-documents">${documents.map(file => `<li>${esc(file.original_name)} <small>${esc(label(file.document_type || 'unclassified'))}</small></li>`).join('')}</ul>` : '<p class="nlbi-summary-empty">No processed documents are attached.</p>'}
            ${pendingReviews.length ? `<p class="nlbi-summary-warning">Pending professional-record review: ${esc(pendingReviews.join(' · '))}</p>` : '<p class="nlbi-summary-complete">Professional records reviewed.</p>'}
          </div>
          <div>
            <h4>Roster details (${rosterEntries.length})</h4>
            ${rosterEntries.length ? `<dl class="nlbi-summary-fields">${rosterEntries.map(([fieldLabel, value]) => `<div><dt>${esc(fieldLabel)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>` : '<p class="nlbi-summary-empty">No additional roster details supplied.</p>'}
          </div>
        </div>
      </section>
    `;
  }

  function renderCandidates(rows) {
    currentCandidateBundles =
      Array.isArray(rows)
        ? rows
        : [];

    const list = $('candidateList');

    if (!rows.length) {
      list.innerHTML =
        '<div>No candidate nurses were produced from this batch.</div>';

      return;
    }

    list.innerHTML = rows.map(bundle => {
      const row = bundle.candidate;
      const duplicate =
        row.duplicate_status || 'unknown';

      const duplicateClass =
        duplicate === 'conflict'
          ? 'danger'
          : duplicate === 'existing_match'
            ? 'warn'
            : 'ok';

      return `
        <article
          class="nlbi-candidate"
          data-candidate-id="${row.id}"
        >
          <header class="nlbi-candidate-head">
            <div>
              <strong>${esc(row.display_name || `Candidate ${row.id}`)}</strong>

              <small>
                Candidate #${row.id}
                · confidence
                <span class="nlbi-confidence">${esc(pct(row.confidence))}</span>
              </small>

              <div class="nlbi-badges">
                <span class="nlbi-badge ${row.status === 'ready' ? 'ok' : 'warn'}">
                  ${esc(label(row.status))}
                </span>

                <span class="nlbi-badge ${duplicateClass}">
                  ${esc(label(duplicate))}
                </span>

                ${
                  row.matched_user_id
                    ? '<span class="nlbi-badge warn">Existing NurseLink record</span>'
                    : ''
                }
              </div>
            </div>

            <button
              type="button"
              data-toggle-candidate
            >
              Review
            </button>
          </header>

          <div class="nlbi-candidate-body nlbi-hidden">

            ${
              row.photo_path
                ? `
                  <section class="nlbi-photo-review">
                    <div class="nlbi-photo-preview">
                      <img
                        data-candidate-photo="${row.id}"
                        alt="Extracted profile photo preview"
                      >
                    </div>

                    <div>
                      <strong>Extracted Profile Photo</strong>

                      <small>
                        Suggested from source document
                        · confidence ${esc(pct(row.photo_confidence))}
                      </small>

                      <label>
                        Profile photo handling
                        <select data-field="photo_status">
                          <option
                            value="staged"
                            ${row.photo_status === 'staged' ? 'selected' : ''}
                          >
                            Review required
                          </option>

                          <option
                            value="approved"
                            ${row.photo_status === 'approved' ? 'selected' : ''}
                          >
                            Use as Profile Photo
                          </option>

                          <option
                            value="rejected"
                            ${row.photo_status === 'rejected' ? 'selected' : ''}
                          >
                            Do not use this photo
                          </option>
                        </select>
                      </label>

                      <div class="nlbi-record-actions">
                        <button
                          type="button"
                          class="primary"
                          data-photo-review="approved"
                        >
                          Use as Profile Photo
                        </button>

                        <button
                          type="button"
                          data-photo-review="rejected"
                        >
                          Reject Photo
                        </button>
                      </div>

                      <small>
                        Current decision:
                        <strong>
                          ${esc(label(row.photo_status || 'staged'))}
                        </strong>
                      </small>

                      <small>
                        Approval only stages this choice.
                        It does not overwrite an existing member photo.
                      </small>
                    </div>
                  </section>
                `
                : ''
            }

            <h3>Personal Information</h3>

            <div class="nlbi-grid three">
              ${input('first_name', 'First Name', row.first_name)}
              ${input('second_name', 'Second Name', row.second_name)}
              ${input('middle_initial', 'Middle Initial', row.middle_initial)}
              ${input('last_name', 'Last Name', row.last_name)}
              ${input('birth_date', 'Birth date', row.birth_date, 'date')}
              ${input('sex', 'Sex', row.sex)}
              ${input('nationality', 'Nationality', row.nationality)}
              ${input('email', 'Email', row.email, 'email')}
              ${input('phone', 'Mobile / phone', row.phone)}
              ${input('address_line1', 'Address', row.address_line1)}
              ${input('city', 'City', row.city)}
              ${input('province', 'Province / region', row.province)}
              ${input('country', 'Country', row.country)}
            </div>

            <h3 style="margin-top:22px">Professional Information</h3>

            <div class="nlbi-grid three">
              ${input('professional_title', 'Professional title', row.professional_title)}
              ${input('current_position', 'Current position', row.current_position)}
              ${input('current_employer', 'Current employer', row.current_employer)}
              ${input('specialty', 'Specialty', row.specialty)}
              ${input('years_experience', 'Years experience', row.years_experience, 'number')}
              ${input('highest_nursing_education', 'Highest nursing education', row.highest_nursing_education)}
              ${input('graduation_year', 'Graduation year', row.graduation_year, 'number')}
            </div>

            <div class="nlbi-section-heading">
              <h3>Education</h3>
              ${addRecordButton('education', 'Education')}
            </div>

            <div class="nlbi-docs">
              ${
                (bundle.education || []).length
                  ? bundle.education.map(item => `
                      <div
                        class="nlbi-doc nlbi-review-record"
                        data-record-container
                        data-record-type="education"
                        data-record-id="${item.id}"
                      >
                        <div class="nlbi-record-head">
                          <strong>
                            ${esc(item.qualification)}
                          </strong>

                          ${reviewBadge(item.review_status)}
                        </div>

                        <small>
                          ${esc(item.field_of_study || 'Nursing')}
                        </small>

                        <small>
                          ${esc(item.institution || 'Institution requires review')}
                          ${
                            item.country
                              ? ` · ${esc(item.country)}`
                              : ''
                          }
                        </small>

                        <small>
                          ${
                            item.started_on
                              ? esc(item.started_on)
                              : 'Start date unknown'
                          }
                          →
                          ${
                            item.completed_on
                              ? esc(item.completed_on)
                              : 'Completion date unknown'
                          }
                          · confidence ${esc(pct(item.confidence))}
                        </small>

                        ${recordActions('education', item)}
                      </div>
                    `).join('')
                  : '<div>No education records extracted.</div>'
              }
            </div>


            <div class="nlbi-section-heading">
              <h3>Employment History</h3>
              ${addRecordButton('employment', 'Employment')}
            </div>

            <div class="nlbi-docs">
              ${
                (bundle.employment || []).length
                  ? bundle.employment.map(item => `
                      <div
                        class="nlbi-doc nlbi-review-record"
                        data-record-container
                        data-record-type="employment"
                        data-record-id="${item.id}"
                      >
                        <div class="nlbi-record-head">
                          <strong>
                            ${esc(item.position_title)}
                          </strong>

                          ${reviewBadge(item.review_status)}
                        </div>

                        <small>
                          ${esc(item.employer || 'Employer requires review')}
                          ${
                            item.city
                              ? ` · ${esc(item.city)}`
                              : ''
                          }
                          ${
                            item.country
                              ? ` · ${esc(item.country)}`
                              : ''
                          }
                        </small>

                        <small>
                          ${
                            item.started_on
                              ? esc(item.started_on)
                              : 'Start date unknown'
                          }
                          →
                          ${
                            item.is_current
                              ? 'Present'
                              : (
                                  item.ended_on
                                    ? esc(item.ended_on)
                                    : 'End date unknown'
                                )
                          }
                          · confidence ${esc(pct(item.confidence))}
                        </small>

                        ${
                          item.responsibilities
                            ? `
                              <details>
                                <summary>Responsibilities</summary>
                                <div style="white-space:pre-line">
                                  ${esc(item.responsibilities)}
                                </div>
                              </details>
                            `
                            : ''
                        }

                        ${recordActions('employment', item)}
                      </div>
                    `).join('')
                  : '<div>No employment history extracted.</div>'
              }
            </div>


            <div class="nlbi-section-heading">
              <h3>Skills & Competencies</h3>
              ${addRecordButton('competencies', 'Skill')}
            </div>

            <div class="nlbi-creds">
              ${
                (bundle.competencies || []).length
                  ? bundle.competencies.map(item => `
                      <div
                        class="nlbi-cred nlbi-review-record"
                        data-record-container
                        data-record-type="competencies"
                        data-record-id="${item.id}"
                      >
                        <div class="nlbi-record-head">
                          <strong>
                            ${esc(item.name)}
                          </strong>

                          ${reviewBadge(item.review_status)}
                        </div>

                        <small>
                          ${esc(item.domain || 'Clinical Nursing')}
                          · confidence ${esc(pct(item.confidence))}
                        </small>

                        <small>
                          ${
                            item.proficiency
                              ? `Proficiency: ${esc(item.proficiency)}`
                              : 'Proficiency not automatically inferred'
                          }
                        </small>

                        ${recordActions('competencies', item)}
                      </div>
                    `).join('')
                  : '<div>No competencies extracted.</div>'
              }
            </div>


            <div class="nlbi-section-heading">
              <h3>Languages</h3>
              ${addRecordButton('languages', 'Language')}
            </div>

            <div class="nlbi-creds">
              ${
                (bundle.languages || []).length
                  ? bundle.languages.map(item => `
                      <div
                        class="nlbi-cred nlbi-review-record"
                        data-record-container
                        data-record-type="languages"
                        data-record-id="${item.id}"
                      >
                        <div class="nlbi-record-head">
                          <strong>
                            ${esc(item.language)}
                          </strong>

                          ${reviewBadge(item.review_status)}
                        </div>

                        <small>
                          Speaking: ${esc(item.speaking || 'Not specified')}
                          · Reading: ${esc(item.reading || 'Not specified')}
                          · Writing: ${esc(item.writing || 'Not specified')}
                        </small>

                        ${recordActions('languages', item)}
                      </div>
                    `).join('')
                  : '<div>No languages explicitly extracted. Add manually if documented.</div>'
              }
            </div>


            <div class="nlbi-section-heading">
              <h3>Character / Professional References</h3>
              ${addRecordButton('references', 'Reference')}
            </div>

            <div class="nlbi-docs">
              ${
                (bundle.references || []).length
                  ? bundle.references.map(item => `
                      <div
                        class="nlbi-doc nlbi-review-record"
                        data-record-container
                        data-record-type="references"
                        data-record-id="${item.id}"
                      >
                        <div class="nlbi-record-head">
                          <strong>
                            ${esc(item.name)}
                          </strong>

                          ${reviewBadge(item.review_status)}
                        </div>

                        <small>
                          ${esc(item.position_title || 'Role requires review')}
                        </small>

                        <small>
                          ${esc(item.organization || 'Organization requires review')}
                        </small>

                        ${
                          item.phone
                            ? `<small>Phone: ${esc(item.phone)}</small>`
                            : ''
                        }

                        ${
                          item.email
                            ? `<small>Email: ${esc(item.email)}</small>`
                            : ''
                        }

                        <small>
                          Private reference data
                          · confidence ${esc(pct(item.confidence))}
                        </small>

                        ${recordActions('references', item)}
                      </div>
                    `).join('')
                  : '<div>No character references extracted.</div>'
              }
            </div>


            <h3 style="margin-top:22px">Primary Nursing License</h3>

            <div class="nlbi-grid three">
              ${input('primary_license_number', 'PRC / license number', row.primary_license_number)}
              ${input('primary_license_country', 'License country', row.primary_license_country)}
              ${input('primary_license_expiry', 'License expiry', row.primary_license_expiry, 'date')}
            </div>

            <label style="margin-top:18px">
              Review notes
              <textarea
                data-field="review_notes"
                rows="3"
              >${esc(row.review_notes || '')}</textarea>
            </label>

            <h3 style="margin-top:22px">Source Documents</h3>

            <div class="nlbi-docs">
              ${
                (bundle.files || []).length
                  ? bundle.files.map(file => `
                      <div class="nlbi-doc">
                        <strong>${esc(file.original_name)}</strong>
                        <small>
                          ${esc(label(file.document_type || 'other'))}
                          · ${esc(label(file.extraction_status))}
                          · security ${esc(label(file.security_status))}
                        </small>
                      </div>
                    `).join('')
                  : '<div>No source documents linked.</div>'
              }
            </div>

            <div class="nlbi-section-heading">
              <h3>Licenses, Certifications & Training</h3>
              ${addRecordButton('credentials', 'Credential')}
            </div>

            <div class="nlbi-creds">
              ${
                (bundle.credentials || []).length
                  ? bundle.credentials.map(credential => `
                      <div
                        class="nlbi-cred nlbi-review-record"
                        data-record-container
                        data-record-type="credentials"
                        data-record-id="${credential.id}"
                      >
                        <div class="nlbi-record-head">
                          <strong>
                            ${esc(
                              credential.title
                              || label(
                                credential.credential_type
                              )
                            )}
                          </strong>

                          ${reviewBadge(credential.review_status)}
                        </div>

                        <small>
                          ${esc(label(credential.category))}
                          · ${esc(label(credential.credential_type))}
                        </small>

                        <small>
                          ${
                            credential.credential_number
                              ? `Number: ${esc(credential.credential_number)} · `
                              : ''
                          }

                          Credential verification:
                          ${esc(label(credential.verification_status))}

                          · confidence ${esc(pct(credential.confidence))}
                        </small>

                        ${
                          credential.issuing_authority
                            ? `
                              <small>
                                Issuer:
                                ${esc(credential.issuing_authority)}
                              </small>
                            `
                            : ''
                        }

                        ${
                          credential.expires_on
                            ? `
                              <small>
                                Expires ${esc(credential.expires_on)}
                              </small>
                            `
                            : ''
                        }

                        ${recordActions('credentials', credential)}
                      </div>
                    `).join('')
                  : '<div>No credential candidates extracted.</div>'
              }
            </div>

            ${candidateReadinessSummary(bundle)}


            ${
              structuredReviewCounts(bundle).length
                ? `
                  <div class="nlbi-review-warning">
                    <strong>Structured review incomplete</strong>

                    <small>
                      ${esc(
                        structuredReviewCounts(bundle)
                          .join(' · ')
                      )}
                    </small>

                    <div class="nlbi-record-actions">
                      <button
                        type="button"
                        data-approve-all-records
                      >
                        Approve All Extracted Records
                      </button>
                    </div>
                  </div>
                `
                : `
                  <div class="nlbi-review-complete">
                    Structured professional records reviewed.
                  </div>
                `
            }

            <div class="nlbi-actions" style="margin-top:20px">
              <button
                class="primary"
                type="button"
                data-save-candidate
              >
                Save Reviewed Candidate
              </button>

              ${
                row.import_status === 'ready_for_admin_import'
                  ? `
                    <span class="nlbi-badge ok">
                      Awaiting Administrator Import
                    </span>
                  `
                  : row.import_status === 'blocked_duplicate'
                    ? `
                      <span class="nlbi-badge danger">
                        Import Blocked — Duplicate
                      </span>
                    `
                    : `
                      <button
                        type="button"
                        data-ready-import
                      >
                        Submit for Administrator Import
                      </button>
                    `
              }
            </div>

          </div>
        </article>
      `;
    }).join('');

    loadCandidatePhotos(list);

    list
      .querySelectorAll('[data-toggle-candidate]')
      .forEach(button => {
        button.addEventListener(
          'click',
          () => {
            const card =
              button.closest(
                '[data-candidate-id]'
              );

            const body =
              card.querySelector(
                '.nlbi-candidate-body'
              );

            body.classList.toggle(
              'nlbi-hidden'
            );

            button.textContent =
              body.classList.contains(
                'nlbi-hidden'
              )
                ? 'Review'
                : 'Close';
          }
        );
      });

    list
      .querySelectorAll('[data-save-candidate]')
      .forEach(button => {
        button.addEventListener(
          'click',
          () => saveCandidate(
            button.closest(
              '[data-candidate-id]'
            )
          )
        );
      });

    list
      .querySelectorAll('[data-record-review]')
      .forEach(button => {
        button.addEventListener(
          'click',
          () => reviewStructuredRecord(
            button.closest(
              '[data-candidate-id]'
            ),
            button
          )
        );
      });


    list
      .querySelectorAll('[data-record-edit]')
      .forEach(button => {
        button.addEventListener(
          'click',
          () => editStructuredRecord(
            button.closest(
              '[data-candidate-id]'
            ),
            button
          )
        );
      });


    list
      .querySelectorAll('[data-record-add]')
      .forEach(button => {
        button.addEventListener(
          'click',
          () => addStructuredRecord(
            button.closest(
              '[data-candidate-id]'
            ),
            button.dataset.recordAdd
          )
        );
      });


    list
      .querySelectorAll('[data-approve-all-records]')
      .forEach(button => {
        button.addEventListener(
          'click',
          () => approveAllStructuredRecords(
            button.closest(
              '[data-candidate-id]'
            ),
            button
          )
        );
      });


    list
      .querySelectorAll('[data-ready-import]')
      .forEach(button => {
        button.addEventListener(
          'click',
          () => readyForImport(
            button.closest(
              '[data-candidate-id]'
            ),
            button
          )
        );
      });
  }

  async function reviewStructuredRecord(
    card,
    button
  ) {
    const candidateId =
      Number(
        card.dataset.candidateId
      );

    const type =
      button.dataset.recordType;

    const recordId =
      Number(
        button.dataset.recordId
      );

    const status =
      button.dataset.recordReview;

    if (
      !candidateId
      || !recordId
      || !type
      || !status
      || !batchId
    ) {
      return;
    }

    let reviewNotes = null;

    if (status === 'rejected') {
      reviewNotes =
        window.prompt(
          'Reason for rejection / review note (optional):',
          ''
        );

      if (reviewNotes === null) {
        return;
      }
    }

    button.disabled = true;

    try {
      const result = await request(
        `/api/nurselink/encoder/bulk-intake/${batchId}/candidates/${candidateId}/records/${encodeURIComponent(type)}/${recordId}/review`,
        {
          method: 'POST',
          body: JSON.stringify({
            status,
            review_notes:
              reviewNotes
              ? reviewNotes.trim()
              : null
          })
        }
      );

      notice(
        result?.message
        || 'Structured record reviewed.',
        'success'
      );

      await loadCandidates();

    } catch (error) {
      notice(
        error.message,
        'error'
      );

    } finally {
      button.disabled = false;
    }
  }


  function structuredRecordPrompts(
    type,
    existing = {}
  ) {
    const schemas = {
      education: [
        ['qualification', 'Qualification / Degree', true],
        ['field_of_study', 'Field of study'],
        ['institution', 'Institution'],
        ['country', 'Country'],
        ['started_on', 'Start date (YYYY-MM-DD)'],
        ['completed_on', 'Completion date (YYYY-MM-DD)'],
        ['review_notes', 'Review notes']
      ],

      employment: [
        ['position_title', 'Position title', true],
        ['employer', 'Employer'],
        ['facility_type', 'Facility type'],
        ['city', 'City'],
        ['country', 'Country'],
        ['started_on', 'Start date (YYYY-MM-DD)'],
        ['ended_on', 'End date (YYYY-MM-DD; blank if current)'],
        ['is_current', 'Current role? Enter yes or no'],
        ['responsibilities', 'Responsibilities'],
        ['review_notes', 'Review notes']
      ],

      credentials: [
        ['category', 'Category (license / registration / certification / training)', true],
        ['credential_type', 'Credential type', true],
        ['title', 'Credential title', true],
        ['credential_number', 'Credential / license number'],
        ['issuing_authority', 'Issuing authority'],
        ['country', 'Country'],
        ['issued_on', 'Issued date (YYYY-MM-DD)'],
        ['expires_on', 'Expiry date (YYYY-MM-DD)'],
        ['review_notes', 'Review notes']
      ],

      competencies: [
        ['domain', 'Domain'],
        ['name', 'Skill / competency name', true],
        ['proficiency', 'Proficiency (only if documented)'],
        ['review_notes', 'Review notes']
      ],

      languages: [
        ['language', 'Language', true],
        ['speaking', 'Speaking level'],
        ['reading', 'Reading level'],
        ['writing', 'Writing level'],
        ['review_notes', 'Review notes']
      ],

      references: [
        ['name', 'Reference name', true],
        ['position_title', 'Position / role'],
        ['organization', 'Organization'],
        ['phone', 'Phone'],
        ['email', 'Email'],
        ['reference_type', 'Reference type'],
        ['review_notes', 'Review notes']
      ]
    };

    const schema =
      schemas[type];

    if (!schema) {
      throw new Error(
        'Unsupported structured record type.'
      );
    }

    const payload = {};

    for (
      const [
        field,
        promptLabel,
        required
      ]
      of schema
    ) {
      let initial =
        existing[field]
        ?? '';

      if (
        type === 'employment'
        && field === 'is_current'
      ) {
        initial =
          existing.is_current
            ? 'yes'
            : 'no';
      }

      const value =
        window.prompt(
          promptLabel,
          String(initial ?? '')
        );

      if (value === null) {
        return null;
      }

      const cleaned =
        value.trim();

      if (
        required
        && !cleaned
      ) {
        throw new Error(
          `${promptLabel} is required.`
        );
      }

      if (
        type === 'employment'
        && field === 'is_current'
      ) {
        payload[field] =
          ['yes', 'y', '1', 'true']
            .includes(
              cleaned.toLowerCase()
            );

        continue;
      }

      payload[field] =
        cleaned || null;
    }

    return payload;
  }


  async function editStructuredRecord(
    card,
    button
  ) {
    const candidateId =
      Number(
        card.dataset.candidateId
      );

    const type =
      button.dataset.recordType;

    const recordId =
      Number(
        button.dataset.recordId
      );

    const bundle =
      currentCandidateBundles
        ?.find(
          item =>
            Number(
              item?.candidate?.id
            ) === candidateId
        );

    const collection =
      bundle?.[type] || [];

    const existing =
      collection.find(
        item =>
          Number(item.id)
          === recordId
      );

    if (!existing) {
      return notice(
        'Unable to locate structured record.',
        'error'
      );
    }

    let payload;

    try {
      payload =
        structuredRecordPrompts(
          type,
          existing
        );

    } catch (error) {
      return notice(
        error.message,
        'error'
      );
    }

    if (!payload) {
      return;
    }

    button.disabled = true;

    try {
      const result = await request(
        `/api/nurselink/encoder/bulk-intake/${batchId}/candidates/${candidateId}/records/${encodeURIComponent(type)}/${recordId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload)
        }
      );

      notice(
        result?.message
        || 'Structured record updated.',
        'success'
      );

      await loadCandidates();

    } catch (error) {
      notice(
        error.message,
        'error'
      );

    } finally {
      button.disabled = false;
    }
  }


  async function addStructuredRecord(
    card,
    type
  ) {
    const candidateId =
      Number(
        card.dataset.candidateId
      );

    let payload;

    try {
      payload =
        structuredRecordPrompts(
          type,
          {}
        );

    } catch (error) {
      return notice(
        error.message,
        'error'
      );
    }

    if (!payload) {
      return;
    }

    try {
      const result = await request(
        `/api/nurselink/encoder/bulk-intake/${batchId}/candidates/${candidateId}/records/${encodeURIComponent(type)}`,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      );

      notice(
        result?.message
        || 'Structured record added.',
        'success'
      );

      await loadCandidates();

    } catch (error) {
      notice(
        error.message,
        'error'
      );
    }
  }


  async function approveAllStructuredRecords(
    card,
    button
  ) {
    const candidateId =
      Number(
        card.dataset.candidateId
      );

    if (
      !candidateId
      || !batchId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        'Approve every structured record still marked Review Required? This accepts the extracted data for staging only. Credential verification remains unchanged.'
      );

    if (!confirmed) {
      return;
    }

    button.disabled = true;

    try {
      const result = await request(
        `/api/nurselink/encoder/bulk-intake/${batchId}/candidates/${candidateId}/records/approve-all`,
        {
          method: 'POST',
          body: '{}'
        }
      );

      const counts =
        result?.data || {};

      const total =
        Object.values(counts)
          .reduce(
            (sum, value) =>
              sum + Number(value || 0),
            0
          );

      notice(
        `Approved ${total} pending structured record${total === 1 ? '' : 's'}. Credential verification was not changed.`,
        'success'
      );

      await loadCandidates();

    } catch (error) {
      notice(
        error.message,
        'error'
      );

    } finally {
      button.disabled = false;
    }
  }


  async function readyForImport(
    card,
    button
  ) {
    const candidateId =
      Number(card.dataset.candidateId);

    if (!candidateId || !batchId) {
      return;
    }

    const confirmed =
      window.confirm(
        'Submit this reviewed candidate to the Administrator Import Queue? No permanent NurseLink account will be created yet.'
      );

    if (!confirmed) {
      return;
    }

    button.disabled = true;

    try {
      const result = await request(
        `/api/nurselink/encoder/bulk-intake/${batchId}/candidates/${candidateId}/ready-for-import`,
        {
          method: 'POST',
          body: '{}'
        }
      );

      notice(
        result?.message
        || 'Candidate submitted for Administrator import.',
        'success'
      );

      await loadCandidates();

    } catch (error) {
      notice(
        error.message,
        'error'
      );

    } finally {
      button.disabled = false;
    }
  }

  async function loadCandidatePhotos(container) {
    const images =
      container.querySelectorAll(
        '[data-candidate-photo]'
      );

    for (const image of images) {
      const candidateId =
        Number(
          image.dataset.candidatePhoto
        );

      if (
        !candidateId
        || !batchId
      ) {
        continue;
      }

      try {
        const response = await fetch(
          `https://api.amsertech.com/api/nurselink/encoder/bulk-intake/${batchId}/candidates/${candidateId}/photo`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'image/*'
            }
          }
        );

        if (!response.ok) {
          throw new Error(
            `Photo HTTP ${response.status}`
          );
        }

        const blob =
          await response.blob();

        if (
          !blob.type
            .toLowerCase()
            .startsWith('image/')
        ) {
          throw new Error(
            'Candidate photo response was not an image.'
          );
        }

        const objectUrl =
          URL.createObjectURL(blob);

        const previous =
          image.dataset.objectUrl;

        if (previous) {
          URL.revokeObjectURL(
            previous
          );
        }

        image.dataset.objectUrl =
          objectUrl;

        image.src =
          objectUrl;

        image.classList.remove(
          'nlbi-photo-error'
        );

      } catch (error) {
        console.error(
          'Unable to load candidate profile photo:',
          candidateId,
          error
        );

        image.classList.add(
          'nlbi-photo-error'
        );
      }
    }
  }

  async function reviewCandidatePhoto(
    card,
    button
  ) {
    const candidateId =
      Number(
        card?.dataset?.candidateId
      );

    const photoStatus =
      String(
        button?.dataset?.photoReview
        || ''
      );

    if (
      !candidateId
      || !batchId
      || ![
        'approved',
        'rejected'
      ].includes(photoStatus)
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        photoStatus === 'approved'
          ? 'Use this extracted portrait as the staged NurseLink profile photo?'
          : 'Reject this extracted portrait?'
      );

    if (!confirmed) {
      return;
    }

    button.disabled = true;

    try {
      const result = await request(
        `/api/nurselink/encoder/bulk-intake/${batchId}/candidates/${candidateId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            photo_status: photoStatus
          })
        }
      );

      notice(
        photoStatus === 'approved'
          ? 'Profile photo approved for staging.'
          : 'Profile photo rejected.',
        'success'
      );

      await loadCandidates();

    } catch (error) {
      notice(
        error.message,
        'error'
      );

    } finally {
      button.disabled = false;
    }
  }


  async function saveCandidatePhotoStatus(
    card,
    select
  ) {
    const candidateId =
      Number(
        card?.dataset?.candidateId
      );

    if (
      !candidateId
      || !batchId
      || !select
    ) {
      return;
    }

    const photoStatus =
      String(
        select.value || ''
      );

    if (
      ![
        'staged',
        'approved',
        'rejected'
      ].includes(photoStatus)
    ) {
      return notice(
        'Invalid profile photo review status.',
        'error'
      );
    }

    select.disabled = true;

    try {
      const result = await request(
        `/api/nurselink/encoder/bulk-intake/${batchId}/candidates/${candidateId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            photo_status: photoStatus
          })
        }
      );

      notice(
        photoStatus === 'approved'
          ? 'Profile photo approved for staging.'
          : photoStatus === 'rejected'
            ? 'Profile photo rejected.'
            : 'Profile photo returned to review.',
        'success'
      );

      await loadCandidates();

    } catch (error) {
      notice(
        error.message,
        'error'
      );

      /*
       * Reload authoritative server value after any failed save.
       */
      await loadCandidates();

    } finally {
      select.disabled = false;
    }
  }


  async function saveCandidate(card) {
    const candidateId =
      Number(card.dataset.candidateId);

    const payload = {};

    card
      .querySelectorAll('[data-field]')
      .forEach(field => {
        payload[field.dataset.field] =
          field.value.trim() || null;
      });

    for (
      const numeric of [
        'years_experience',
        'graduation_year'
      ]
    ) {
      if (
        payload[numeric] !== null
        && payload[numeric] !== ''
      ) {
        payload[numeric] =
          Number(payload[numeric]);
      }
    }

    try {
      const result = await request(
        `/api/nurselink/encoder/bulk-intake/${batchId}/candidates/${candidateId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload)
        }
      );

      notice(
        result?.message
        || 'Candidate corrections saved.',
        'success'
      );

      await loadCandidates();

    } catch (error) {
      notice(
        error.message,
        'error'
      );
    }
  }

  $('createBatch')
    ?.addEventListener('click', async () => {
      const name =
        $('batchName').value.trim();

      if (!name) {
        return notice(
          'Enter a candidate name or batch label.',
          'error'
        );
      }

      try {
        const result = await request(
          '/api/nurselink/encoder/bulk-intake',
          {
            method: 'POST',
            body: JSON.stringify({name})
          }
        );

        batchId = Number(
          result?.data?.id
        );

        $('batchName').value = '';

        await loadBatches();

        $('batchSelect').value =
          String(batchId);

        await chooseBatch(batchId);

        notice(
          result?.message
          || 'Candidate batch created. Upload this nurse’s documents next.',
          'success'
        );

      } catch (error) {
        notice(
          error.message,
          'error'
        );
      }
    });

  $('batchSelect')
    ?.addEventListener('change', event => {
      chooseBatch(event.target.value);
    });

  $('fileInput')
    ?.addEventListener('change', event => {
      selectedFiles =
        Array.from(
          event.target.files || []
        );

      renderSelectedFiles();
    });

  $('uploadFiles')
    ?.addEventListener(
      'click',
      uploadSelectedFiles
    );

  $('refreshBatch')
    ?.addEventListener(
      'click',
      refreshBatch
    );

  $('closeDocumentPreview')
    ?.addEventListener('click', closeDocumentPreview);

  $('documentPreviewDialog')
    ?.addEventListener('close', () => {
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
        previewObjectUrl = null;
      }
    });

  $('closeCandidateBuiltNotice')
    ?.addEventListener('click', () => {
      const dialog = $('candidateBuiltNotice');

      if (dialog?.open) {
        dialog.close();
      }
    });

  $('buildCandidates')
    ?.addEventListener(
      'click',
      buildCandidates
    );

  $('logoutButton')
    ?.addEventListener('click', async () => {
      try {
        await request(
          '/api/nurselink/encoder/logout',
          {
            method: 'POST',
            body: '{}'
          }
        );
      } finally {
        location.replace(
          '/nurselink-encoder-login.html'
        );
      }
    });

  /*
   * Delegated profile-photo review handler.
   * Candidate cards are dynamically re-rendered.
   */
  document.addEventListener(
    'click',
    event => {
      const button =
        event.target.closest(
          '[data-photo-review]'
        );

      if (!button) {
        return;
      }

      const card =
        button.closest(
          '[data-candidate-id]'
        );

      if (!card) {
        notice(
          'Unable to locate candidate for photo review.',
          'error'
        );

        return;
      }

      event.preventDefault();

      reviewCandidatePhoto(
        card,
        button
      );
    }
  );


  document.addEventListener(
    'DOMContentLoaded',
    async () => {
      try {
        await verifySession();
        await loadBatches();
      } catch (error) {
        notice(
          error.message,
          'error'
        );
      }
    }
  );
})();
