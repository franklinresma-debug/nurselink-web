// NurseLink Phase 2 Cumulative Workflows v2.5.0
// Additive workflow utilities. No global fetch wrapping and no direct DOM mutation.

export const NL_PHASE2_VERSION = '2.5.0';

export const NL_APPLICATION_STAGES = [
  'Submitted',
  'Under Review',
  'Needs Information',
  'Ready for Approval',
  'Approved',
];

export const NL_CREDENTIAL_STATES = [
  'Not Submitted',
  'Submitted',
  'Under Verification',
  'Verified',
  'Needs Information',
  'Expired',
];

export function normalizeApplicationStage(value) {
  const raw = String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  const map = {
    submitted: 'Submitted',
    'under review': 'Under Review',
    review: 'Under Review',
    'needs information': 'Needs Information',
    'needs info': 'Needs Information',
    'ready for approval': 'Ready for Approval',
    approved: 'Approved',
  };
  return map[raw] || 'Submitted';
}

export function applicationStageIndex(value) {
  return Math.max(0, NL_APPLICATION_STAGES.indexOf(normalizeApplicationStage(value)));
}

export function normalizeCredentialState(value) {
  const raw = String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  const map = {
    'not submitted': 'Not Submitted',
    submitted: 'Submitted',
    'under verification': 'Under Verification',
    verification: 'Under Verification',
    verified: 'Verified',
    'needs information': 'Needs Information',
    expired: 'Expired',
  };
  return map[raw] || 'Not Submitted';
}

export function computeProfileCompletion(record = {}) {
  const required = [
    'first_name',
    'last_name',
    'email',
    'mobile',
    'country',
    'profession',
    'license_number',
    'employment_status',
  ];
  const completed = required.filter((key) => {
    const value = record?.[key];
    return value !== undefined && value !== null && String(value).trim() !== '';
  }).length;
  return Math.round((completed / required.length) * 100);
}

export function createWorkflowSnapshot({
  application = {},
  member = {},
  credentials = [],
  documents = [],
} = {}) {
  return {
    version: NL_PHASE2_VERSION,
    generated_at: new Date().toISOString(),
    application_stage: normalizeApplicationStage(
      application.status || application.stage || application.application_status
    ),
    profile_completion: computeProfileCompletion(member),
    credentials: Array.isArray(credentials)
      ? credentials.map((item) => ({
          ...item,
          normalized_status: normalizeCredentialState(item?.status),
        }))
      : [],
    documents: Array.isArray(documents) ? documents : [],
  };
}

function apiBase() {
  return String(
    window?.NURSELINK_API_BASE ||
    window?.NurseLinkConfig?.apiBase ||
    window?.NL_API_BASE ||
    'https://api.amsertech.com'
  ).replace(/\/+$/, '');
}

async function jsonRequest(path, options = {}) {
  const response = await fetch(`${apiBase()}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? {'Content-Type': 'application/json'} : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      body?.message || body?.error || `NurseLink request failed (${response.status})`
    );
    error.status = response.status;
    error.payload = body;
    throw error;
  }

  return body;
}

export const Phase2Api = {
  // These paths are resolved by the deployment-time route manifest.
  // Callers can override any path through window.NURSELINK_PHASE2_ROUTES.
  route(name, fallback) {
    return window?.NURSELINK_PHASE2_ROUTES?.[name] || fallback;
  },

  getRegistration() {
    return jsonRequest(this.route('registration_get', '/api/nurselink/member/registration'));
  },

  saveRegistrationDraft(payload) {
    return jsonRequest(
      this.route('registration_draft', '/api/nurselink/member/registration/draft'),
      {method: 'POST', body: JSON.stringify(payload || {})}
    );
  },

  submitRegistration(payload) {
    return jsonRequest(
      this.route('registration_submit', '/api/nurselink/member/registration/submit'),
      {method: 'POST', body: JSON.stringify(payload || {})}
    );
  },

  getApplicationStatus() {
    return jsonRequest(
      this.route('application_status', '/api/nurselink/member/application/status')
    );
  },

  respondNeedsInformation(payload) {
    return jsonRequest(
      this.route('needs_information_response', '/api/nurselink/member/application/respond'),
      {method: 'POST', body: JSON.stringify(payload || {})}
    );
  },

  getProfile() {
    return jsonRequest(this.route('profile_get', '/api/nurselink/member/profile'));
  },

  saveProfile(payload) {
    return jsonRequest(
      this.route('profile_save', '/api/nurselink/member/profile'),
      {method: 'PUT', body: JSON.stringify(payload || {})}
    );
  },

  getCredentials() {
    return jsonRequest(this.route('credentials_get', '/api/nurselink/member/credentials'));
  },

  getJobs() {
    return jsonRequest(this.route('jobs_get', '/api/nurselink/jobs'));
  },

  applyToJob(jobId, payload = {}) {
    const template = this.route('job_apply', '/api/nurselink/jobs/{id}/apply');
    return jsonRequest(template.replace('{id}', encodeURIComponent(jobId)), {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getEnrollments() {
    return jsonRequest(this.route('enrollments_get', '/api/nurselink/member/enrollments'));
  },

  getNotifications() {
    return jsonRequest(this.route('notifications_get', '/api/nurselink/member/notifications'));
  },
};

export function installUnsavedChangesGuard(isDirty) {
  const handler = (event) => {
    if (!isDirty()) return;
    event.preventDefault();
    event.returnValue = '';
  };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}
