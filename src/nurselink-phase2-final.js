// NurseLink Phase 2 Final Cumulative Full-Stack v3.0.0
// React-safe service layer bound to verified production routes.
// No global fetch replacement. No direct React-owned DOM mutation.

export const NL_PHASE2_FINAL_VERSION = '3.0.0';

export const APPLICATION_STAGES = [
  'Submitted',
  'Under Review',
  'Needs Information',
  'Ready for Approval',
  'Approved',
];

export const ROUTES = {"application_get":"/api/applications/me","application_create":"/api/applications","application_profile":"/api/applications/{application}/profile","application_ready":"/api/applications/{application}/ready","application_submit":"/api/applications/{application}/submit","application_resubmit":"/api/applications/{application}/resubmit","application_documents":"/api/applications/{application}/documents","application_missing_refresh":"/api/applications/{application}/missing-fields/refresh","credentials_dashboard":"/api/credentials/dashboard","credentials":"/api/credentials","credential_update":"/api/credentials/{credential}","credential_documents":"/api/credentials/{credential}/documents","qualification_frameworks":"/api/qualification-frameworks","qualification_assessments":"/api/qualification-assessments","jobs":"/api/job-opportunities","job_applications":"/api/job-applications","job_withdraw":"/api/job-applications/{id}/withdraw","notifications":"/api/notifications","notification_read":"/api/notifications/{id}/read","notifications_read_all":"/api/notifications/read-all","events":"/api/events","event_register":"/api/events/{event}/register","event_cancel":"/api/event-registrations/{registration}/cancel","mentoring_profile":"/api/mentoring/profile","mentoring_directory":"/api/mentoring/directory","mentoring_requests":"/api/mentoring/requests","membership_me":"/api/membership/me","membership_onboarding":"/api/membership/onboarding","membership_onboarding_progress":"/api/membership/onboarding/progress","session_bootstrap":"/api/nurselink/session-bootstrap","session_login":"/api/nurselink/session-login"};

function apiBase() {
  return String(
    window.NURSELINK_API_BASE ||
    window.NurseLinkConfig?.apiBase ||
    window.NL_API_BASE ||
    'https://api.amsertech.com'
  ).replace(/\/+$/, '');
}

function route(name, params = {}) {
  const template = ROUTES[name];
  if (!template) throw new Error(`Unknown NurseLink Phase 2 route: ${name}`);
  return Object.entries(params).reduce(
    (value, [key, replacement]) =>
      value.replace(`{${key}}`, encodeURIComponent(String(replacement))),
    template
  );
}

async function request(name, {
  method = 'GET',
  params = {},
  body,
  formData,
  headers = {},
} = {}) {
  const options = {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...headers,
    },
  };

  if (formData) {
    options.body = formData;
  } else if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(apiBase() + route(name, params), options);
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      payload?.message ||
      payload?.error ||
      `NurseLink request failed (${response.status})`
    );
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function normalizeApplicationStage(value) {
  const raw = String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  const map = {
    submitted: 'Submitted',
    'under review': 'Under Review',
    review: 'Under Review',
    returned: 'Needs Information',
    'needs information': 'Needs Information',
    'needs info': 'Needs Information',
    ready: 'Ready for Approval',
    'ready for approval': 'Ready for Approval',
    approved: 'Approved',
  };
  return map[raw] || 'Submitted';
}

export function applicationStageIndex(value) {
  return Math.max(0, APPLICATION_STAGES.indexOf(normalizeApplicationStage(value)));
}

export function applicationProgress(value) {
  const idx = applicationStageIndex(value);
  return Math.round(((idx + 1) / APPLICATION_STAGES.length) * 100);
}

export function computeProfileCompletion(profile = {}) {
  const required = [
    'first_name',
    'last_name',
    'phone',
    'country',
    'professional_title',
    'years_experience',
    'primary_license_number',
  ];
  const completed = required.filter((key) => {
    const value = profile?.[key];
    return value !== undefined && value !== null && String(value).trim() !== '';
  }).length;
  return Math.round((completed / required.length) * 100);
}

export function installUnsavedChangesGuard(isDirty) {
  const handler = (event) => {
    if (!isDirty()) return;
    event.preventDefault();
    event.returnValue = '';
  };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}

export const ApplicationApi = {
  get: () => request('application_get'),
  create: (payload = {}) => request('application_create', {method: 'POST', body: payload}),
  updateProfile: (application, payload) =>
    request('application_profile', {
      method: 'PATCH',
      params: {application},
      body: payload,
    }),
  ready: (application) =>
    request('application_ready', {method: 'POST', params: {application}}),
  submit: (application) =>
    request('application_submit', {method: 'POST', params: {application}}),
  resubmit: (application) =>
    request('application_resubmit', {method: 'POST', params: {application}}),
  uploadDocument: (application, file, category = 'other') => {
    const form = new FormData();
    form.append('file', file);
    form.append('category', category);
    return request('application_documents', {
      method: 'POST',
      params: {application},
      formData: form,
    });
  },
  refreshMissing: (application) =>
    request('application_missing_refresh', {method: 'POST', params: {application}}),
};

export const CredentialApi = {
  dashboard: () => request('credentials_dashboard'),
  list: () => request('credentials'),
  create: (payload) => request('credentials', {method: 'POST', body: payload}),
  update: (credential, payload) =>
    request('credential_update', {
      method: 'PATCH',
      params: {credential},
      body: payload,
    }),
  linkDocument: (credential, payload) =>
    request('credential_documents', {
      method: 'POST',
      params: {credential},
      body: payload,
    }),
};

export const QualificationApi = {
  frameworks: () => request('qualification_frameworks'),
  assessments: () => request('qualification_assessments'),
  createAssessment: (payload) =>
    request('qualification_assessments', {method: 'POST', body: payload}),
};

export const JobApi = {
  opportunities: () => request('jobs'),
  applications: () => request('job_applications'),
  apply: (payload) => request('job_applications', {method: 'POST', body: payload}),
  withdraw: (id) =>
    request('job_withdraw', {method: 'PATCH', params: {id}}),
};

export const NotificationApi = {
  list: () => request('notifications'),
  markRead: (id) =>
    request('notification_read', {method: 'PATCH', params: {id}}),
  markAllRead: () =>
    request('notifications_read_all', {method: 'POST'}),
};

export const EventsApi = {
  list: () => request('events'),
  register: (event) =>
    request('event_register', {method: 'POST', params: {event}}),
  cancel: (registration) =>
    request('event_cancel', {method: 'POST', params: {registration}}),
};

export const MentoringApi = {
  profile: () => request('mentoring_profile'),
  directory: () => request('mentoring_directory'),
  requests: () => request('mentoring_requests'),
  sendRequest: (payload) =>
    request('mentoring_requests', {method: 'POST', body: payload}),
};

export const MembershipApi = {
  me: () => request('membership_me'),
  onboarding: () => request('membership_onboarding'),
  markOnboardingProgress: (payload) =>
    request('membership_onboarding_progress', {method: 'POST', body: payload}),
};

export function createPhase2Snapshot({
  application,
  profile,
  credentials,
  notifications,
  jobs,
} = {}) {
  return {
    version: NL_PHASE2_FINAL_VERSION,
    generated_at: new Date().toISOString(),
    application_stage: normalizeApplicationStage(
      application?.status || application?.stage
    ),
    application_progress: applicationProgress(
      application?.status || application?.stage
    ),
    profile_completion: computeProfileCompletion(profile),
    credential_count: Array.isArray(credentials) ? credentials.length : 0,
    unread_notifications: Array.isArray(notifications)
      ? notifications.filter((item) => !item?.read_at).length
      : 0,
    job_application_count: Array.isArray(jobs) ? jobs.length : 0,
  };
}
