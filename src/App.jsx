import './nurselink-dark-sidebar-buttons-v5200.css'
import './nurselink-dark-mode-contrast-v5200.css'
/* NurseLink Phase 2 Final Cumulative Full-Stack v3.0.0 */
import './nurselink-phase2-final.css';
import * as NurseLinkPhase2Final from './nurselink-phase2-final.js';
import Phase6WelfareCrisisPage from './pages/Phase6WelfareCrisis.jsx'
import { Phase7InitiativesPage, Phase7PoliciesPage } from './pages/Phase7MemberWorkspaces.jsx'
import PoliciesAdvocacyIntelligencePage from './PoliciesAdvocacyIntelligencePage'
import AdminAppearanceStudio from './pages/AdminAppearanceStudio'
import { installNurseLinkDesignRuntime } from './nurselink-design-runtime.js'
/* NURSELINK_DESIGN_RUNTIME_V6322 */
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => installNurseLinkDesignRuntime(), { once: true })
  } else {
    installNurseLinkDesignRuntime()
  }
}
window.NurseLinkPhase2Final = NurseLinkPhase2Final;

/* NurseLink Phase 2 Cumulative Workflows v2.5.0 */
import './nurselink-phase2-workflows.css';
import * as NurseLinkPhase2 from './nurselink-phase2-workflows.js';
window.NURSELINK_PHASE2_ROUTES = {};
window.NurseLinkPhase2 = NurseLinkPhase2;

// NurseLink Smart Registration Application Workflow v2.0.0
const NL_APPLICATION_STAGES_V200 = [
  'Submitted',
  'Under Review',
  'Needs Information',
  'Ready for Approval',
  'Approved',
];

function nlNormalizeApplicationStageV200(value) {
  const raw = String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  const map = {
    'submitted': 'Submitted',
    'under review': 'Under Review',
    'review': 'Under Review',
    'needs information': 'Needs Information',
    'needs info': 'Needs Information',
    'ready for approval': 'Ready for Approval',
    'approved': 'Approved',
  };
  return map[raw] || 'Submitted';
}

function nlApplicationStageIndexV200(value) {
  return Math.max(0, NL_APPLICATION_STAGES_V200.indexOf(nlNormalizeApplicationStageV200(value)));
}

import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom'

import { useEffect, useMemo, useState } from 'react'

import './App.css'

import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Profile from './pages/Profile'
import SmartRegistration from './pages/SmartRegistration'
import ApplicationStatus from './pages/ApplicationStatus'
import Credentials from './pages/Credentials'
/* NurseLink Phase 2 Final One Deploy v3.2.0 */
import { Phase2JobsPage, Phase2ApplicationsPage, Phase2QualificationsPage, Phase2DocumentsPage, Phase2LearningPage, Phase2MessagesPage, Phase2EventsPage } from './pages/Phase2LivePages'
import './phase2-live-pages.css'
/* NurseLink Phase 2 QA Correction v3.3.2 */
import Phase2CredentialsReconciledPage from './pages/Phase2CredentialsReconciledPage'
/* NurseLink Phase 3 Real Inbox + Professional Learning v4.1.0 */
import { Phase3MessagesPage, Phase3LearningPage } from './pages/Phase3CommunicationsLearning'
import './phase3-real-inbox-learning-v410.css'
import './phase2-qa-v330.css'
/* NurseLink Member Portal Theme Restore Resume v3.3.9 */
import './member-theme-v339.css'
/* NurseLink Member Theme Dark Contrast Polish v3.4.0 */
import './member-dark-contrast-v340.css'
/* NurseLink Phase 2 Final Visual QA v3.4.1 */
import './member-final-visual-qa-v341.css'
/* NurseLink Phase 2 Final Dark Checklist Polish v3.4.2 */
import './member-final-dark-checklist-v342.css'
/* NurseLink Phase 2 Final Membership Activation Dark Fix v3.4.4 */
import './member-membership-activation-dark-v344.css'
/* NurseLink Phase 2 Final Dark Surface Fix v3.4.6 */
import './member-final-dark-surface-v346.css'
/* NurseLink Theme Runtime Repair v4.0.1 */
import './member-theme-runtime-repair-v401.css'
import './member-ios-theme-compat-v404.css'
import './member-iphone-tap-reliability-v405.css'
import './member-iphone-typography-v407.css'
import './member-iphone-android-typography-parity-v408.css'
import './member-drawer-brand-white-text-v433.css'
import { installNurseLinkIOSFirstTapBridge } from './nurselink-ios-first-tap-v406.js'
import ResetPassword from './pages/ResetPassword'
import {
  getRegistrationStatus,
  getPolicyConsent,
  acceptCurrentPolicies,
  requestPasswordReset,
  resendEmailVerification,
} from './lib/api'

// NurseLink Members Portal Icon Harmonization v1.0.0
// NurseLink Members Portal Admin-Style Icons v1.0.3
const menu = [
  ['Dashboard', '/dashboard', 'dashboard'],
  ['My Profile', '/profile', 'profile'],
  ['Smart Registration', '/smart-registration', 'scan'],
  ['Application Status', '/application-status', 'status'],
  ['Portfolio', '/portfolio', 'portfolio'],
  ['Jobs', '/jobs', 'jobs'],
  ['Applications', '/applications', 'applications'],
  ['Mentoring', '/mentoring', 'mentoring'],
  ['Engagement Hub', '/engagement', 'engagement'],
  ['Learning', '/learning', 'learning'],
  ['Credentials', '/credentials', 'credentials'],
  ['Qualifications', '/qualifications', 'qualifications'],
  ['Documents', '/documents', 'documents'],
  ['Digital Member ID', '/digital-member-id', 'member-id'],
  ['Messages', '/messages', 'messages'],
  ['Events', '/events', 'events'],
  ['Programs & Initiatives', '/initiatives', 'programs'],
  ['Policies & Advocacy', '/policies', 'advocacy'],
  ['Welfare & Crisis', '/welfare', 'welfare'],
  ['Policy & Privacy', '/policy-center', 'privacy'],
]

const memberNavIconPaths = {
  dashboard: ['M3 11.5 12 4l9 7.5', 'M5 10.5V20h14v-9.5', 'M9 20v-6h6v6'],
  profile: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
  scan: ['M4 7V4h3', 'M17 4h3v3', 'M20 17v3h-3', 'M7 20H4v-3', 'M8 12h8', 'M12 8v8'],
  status: ['M6 3h12v18H6z', 'M9 8h6', 'M9 12h6', 'm9 16 2 2 4-4'],
  portfolio: ['M4 7h16v13H4z', 'M8 7V4h8v3', 'M4 12h16'],
  jobs: ['M4 7h16v12H4z', 'M9 7V4h6v3', 'M4 12h16'],
  applications: ['M6 3h9l3 3v15H6z', 'M15 3v4h4', 'M9 12h6', 'M9 16h6'],
  mentoring: ['M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M16 13a3 3 0 1 0 0-6', 'M3 21a5 5 0 0 1 10 0', 'M13 21a5 5 0 0 1 8-4'],
  engagement: ['M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z'],
  learning: ['M3 6.5 12 3l9 3.5-9 3.5z', 'M6 8.5V15c3 2 9 2 12 0V8.5', 'M21 7v7'],
  credentials: ['M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z', 'm9 12 2 2 4-4'],
  qualifications: ['M12 3l3 5 6 1-4 4 .8 6-5.8-2.5L6.2 19 7 13 3 9l6-1z'],
  documents: ['M6 3h9l3 3v15H6z', 'M15 3v4h4', 'M9 12h6', 'M9 16h5'],
  'member-id': ['M3 6h18v12H3z', 'M7 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'M5 16c.5-2 3.5-2 4 0', 'M13 10h5', 'M13 14h4'],
  messages: ['M4 5h16v12H8l-4 4z', 'M8 9h8', 'M8 13h5'],
  events: ['M5 5h14v15H5z', 'M8 3v4', 'M16 3v4', 'M5 9h14'],
  programs: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h6v6h-6z'],
  advocacy: ['M4 13V8l11-4v13L4 13Z', 'M15 8h3a3 3 0 0 1 0 6h-3', 'M6 13l2 7h4l-2-6'],
  welfare: ['M12 21s-7-4-7-10a4 4 0 0 1 7-3 4 4 0 0 1 7 3c0 6-7 10-7 10Z', 'M12 9v6', 'M9 12h6'],
  privacy: ['M6 10V7a6 6 0 0 1 12 0v3', 'M5 10h14v11H5z', 'M12 14v3'],
}

function MemberNavIcon({ name }) {
  const paths = memberNavIconPaths[name] || memberNavIconPaths.dashboard

  return (
    <span className="member-admin-nav-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {paths.map((d, index) => (
          <path key={`${name}-${index}`} d={d} />
        ))}
      </svg>
    </span>
  )
}

const memberOnlyPaths = [
  '/portfolio',
  '/jobs',
  '/applications',
  '/mentoring',
  '/engagement',
  '/learning',
  '/credentials',
  '/qualifications',
  '/documents',
  '/digital-member-id',
]

function DigitalMemberIdRedirect() {
  useEffect(() => {
    window.location.replace(
      '/nurselink-digital-id.html'
    )
  }, [])

  return (
    <section className="page-card">
      <h1>Digital Member ID</h1>
      <p>Opening your secure NurseLink member ID…</p>
    </section>
  )
}

const statusLabels = {
  draft: 'Draft',
  in_progress: 'In Progress',
  ready_to_submit: 'Ready to Submit',
  submitted: 'Submitted',
  under_review: 'Under Review',
  returned_for_information: 'Returned for Information',
  resubmitted: 'Resubmitted',
  approved: 'Approved',
  rejected: 'Rejected',
}

function getErrorMessage(error) {
  if (error?.data?.errors) {
    const first = Object.values(
      error.data.errors
    )[0]

    if (
      Array.isArray(first) &&
      first.length
    ) {
      return first[0]
    }
  }

  return (
    error?.data?.message ||
    error?.message ||
    'Something went wrong. Please try again.'
  )
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    login,
    authenticated,
  } = useAuth()

  const params =
    new URLSearchParams(location.search)

  const verificationUrl =
    params.get('verification_url')

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [error, setError] =
    useState('')

  const [submitting, setSubmitting] =
    useState(false)

  useEffect(() => {
    if (
      authenticated &&
      verificationUrl
    ) {
      window.location.assign(
        verificationUrl
      )
    }
  }, [authenticated, verificationUrl])

  if (
    authenticated &&
    verificationUrl
  ) {
    return (
      <div
        className="nl713-login-verifying"
        role="main"
      >
        Completing email verification...
      </div>
    )
  }

  if (
    authenticated &&
    !verificationUrl
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setSubmitting(true)
    setError('')

    try {
      await login(
        email.trim(),
        password
      )

      if (verificationUrl) {
        window.location.href =
          verificationUrl
        return
      }

      const destination =
        location.state?.from ||
        '/dashboard'

      navigate(
        destination,
        {
          replace: true,
        }
      )
    } catch (err) {
      setError(
        getErrorMessage(err)
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="nl713-login-shell">
      <section
        className="nl713-login-hero"
        aria-label="NurseLink member community"
      >
        <div
          className="nl713-login-hero-media"
          aria-hidden="true"
        >
          <picture>
            <source
              media="(max-width: 680px)"
              srcSet="/images/registration-hero/nurselink-hero-global-hospital-01-mob.png"
            />

            <img
              src="/images/registration-hero/nurselink-hero-global-hospital-01.png"
              alt=""
            />
          </picture>
        </div>

        <div className="nl713-login-hero-content">
          <div className="nl713-login-brand">
            <div className="nl713-login-logo">
              NL
            </div>

            <div className="nl713-login-brand-copy">
              <strong>NurseLink</strong>
              <span>KAPIT-BISIG</span>
            </div>
          </div>

          <div className="nl713-login-message">
            <span className="nl713-login-kicker">
              MEMBER ACCESS
            </span>

            <h1>
              Welcome back to NurseLink
            </h1>

            <p>
              Access your profile, credentials,
              learning, opportunities, and
              professional network.
            </p>
          </div>

          <div className="nl713-login-benefits">
            <div className="nl713-login-benefit">
              <div className="nl713-login-benefit-icon">
                +
              </div>

              <div>
                <strong>Built for Nurses</strong>
                <span>
                  A professional community designed
                  around nurses and their careers.
                </span>
              </div>
            </div>

            <div className="nl713-login-benefit">
              <div className="nl713-login-benefit-icon">
                ✓
              </div>

              <div>
                <strong>Secure & Trusted</strong>
                <span>
                  Your information and professional
                  records are handled securely.
                </span>
              </div>
            </div>

            <div className="nl713-login-benefit">
              <div className="nl713-login-benefit-icon">
                ↗
              </div>

              <div>
                <strong>Grow Your Future</strong>
                <span>
                  Build credentials, access learning,
                  and discover opportunities.
                </span>
              </div>
            </div>
          </div>

          <div className="nl713-login-hero-foot">
            <strong>
              Connecting Filipino nurses.
            </strong>

            <span>
              Together, we elevate care.
            </span>
          </div>
        </div>
      </section>

      <section className="nl713-login-panel">
        <div className="nl713-login-card">
          <div className="nl713-login-card-kicker">
            Member Access
          </div>

          <h2>
            {verificationUrl
              ? 'Sign in to verify your email'
              : 'Welcome back'}
          </h2>

          <p className="nl713-login-card-intro">
            {verificationUrl
              ? 'Sign in using the NurseLink account associated with this verification email.'
              : 'Enter your NurseLink account details to continue.'}
          </p>

          {error && (
            <div
              className="nl713-login-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <form
            className="nl713-login-form"
            onSubmit={handleSubmit}
          >
            <label className="nl713-login-field">
              <span>Email address</span>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                autoComplete="email"
                required
              />
            </label>

            <label className="nl713-login-field">
              <span>Password</span>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                autoComplete="current-password"
                required
              />
            </label>

            <p className="nl713-login-forgot">
              <NavLink to="/forgot-password">
                Forgot password?
              </NavLink>
            </p>

            <button
              type="submit"
              className="nl713-login-submit"
              disabled={submitting}
            >
              {submitting
                ? 'Signing in...'
                : verificationUrl
                  ? 'Sign In & Verify Email'
                  : 'Sign in'}
            </button>
          </form>

          <p className="nl713-login-register">
            New to NurseLink?{' '}

            <NavLink to="/register">
              Create an account
            </NavLink>
          </p>

          <div
            className="nl713-login-trust"
            aria-label="NurseLink benefits"
          >
            <div className="nl713-login-trust-item">
              <strong>Secure & Private</strong>
              <span>Your data is protected.</span>
            </div>

            <div className="nl713-login-trust-item">
              <strong>Trusted Community</strong>
              <span>Connect with nurses.</span>
            </div>

            <div className="nl713-login-trust-item">
              <strong>Career Growth</strong>
              <span>Access opportunities.</span>
            </div>
          </div>

          <a
            className="nl713-login-admin"
            href="/admin/login.html"
          >
            Administrator sign in
          </a>
        </div>
      </section>
    </main>
  )
}
function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice('')
    setError('')
    setSubmitting(true)

    try {
      await requestPasswordReset(email.trim())
      setNotice('If an account matches that email, a password reset link has been sent.')
    } catch (err) {
      if (err.status === 422) {
        setNotice('If an account matches that email, a password reset link has been sent.')
      } else {
        setError(getErrorMessage(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-screen" role="main">
      <div className="auth-brand">
        <div className="brand-mark">NL</div>
        <h1 aria-hidden="true">NurseLink</h1>
        <p>Securely recover access to your NurseLink account.</p>
      </div>

      <div className="auth-card">
        <div className="eyebrow">Account Recovery</div>
        <h2>Forgot your password?</h2>
        <p>Enter your registered email address and we’ll send you a secure reset link.</p>

        {notice && <div className="form-success">{notice}</div>}
        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <button type="submit" className="primary-button full" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send password reset link'}
          </button>
        </form>

        <p className="auth-footer">
          <NavLink to="/login">Return to Sign In</NavLink>
        </p>
      </div>
    </div>
  )
}

function Register() {
  const navigate = useNavigate()

  const {
    register,
    authenticated,
  } = useAuth()

  const [
    firstName,
    setFirstName,
  ] = useState('')

  const [
    lastName,
    setLastName,
  ] = useState('')

  const [email, setEmail] =
    useState('')

  const [
    password,
    setPassword,
  ] = useState('')

  const [
    passwordConfirmation,
    setPasswordConfirmation,
  ] = useState('')

  const [error, setError] =
    useState('')

  const [submitting, setSubmitting] =
    useState(false)

  const [termsAccepted, setTermsAccepted] =
    useState(false)

  const [privacyAccepted, setPrivacyAccepted] =
    useState(false)

  const [registrationMode, setRegistrationMode] =
    useState('open')

  useEffect(() => {
    let active = true

    getRegistrationStatus()
      .then((result) => {
        if (active) {
          setRegistrationMode(result?.data?.mode || 'closed')
        }
      })
      .catch(() => {
        // The server remains authoritative on submission if this advisory
        // status request is temporarily unavailable.
      })

    return () => {
      active = false
    }
  }, [])

  if (authenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')

    if (
      password !==
      passwordConfirmation
    ) {
      setError(
        'Passwords do not match.'
      )
      return
    }

    if (!termsAccepted || !privacyAccepted) {
      setError('Please review and accept the Terms of Use and Privacy Notice to continue.')
      return
    }

    setSubmitting(true)

    try {
      const name =
        `${firstName.trim()} ${lastName.trim()}`
          .trim()

      const result =
        await register({
          name,
          email: email.trim(),
          password,
          password_confirmation:
            passwordConfirmation,
          terms_accepted: termsAccepted,
          privacy_accepted: privacyAccepted,
        })

      if (
        (result?.requiresVerification || result?.requires_verification)
      ) {
        navigate(
          '/verify-email',
          {
            replace: true,
            state: {
              email: email.trim(),
            },
          }
        )

        return
      }

      navigate(
        '/dashboard',
        {
          replace: true,
        }
      )
    } catch (err) {
      setError(
        getErrorMessage(err)
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-screen" role="main">
      <div className="auth-brand">
        <div className="brand-mark">
          NL
        </div>

        <h1 aria-hidden="true">Join NurseLink</h1>

        <p>
          Create your account and begin
          your membership application.
        </p>
      </div>

      <div className="auth-card">
        <div className="eyebrow">
          Member Registration
        </div>

        <h2>
          Create account
        </h2>

        {registrationMode === 'pilot' && (
          <div className="form-notice">
            NurseLink registration is currently available to invited pilot participants only.
          </div>
        )}

        {registrationMode === 'closed' && (
          <div className="form-notice form-notice-closed">
            New member registration is temporarily closed. Existing members may still sign in.
          </div>
        )}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              First name

              <input
                value={firstName}
                onChange={(event) =>
                  setFirstName(
                    event.target.value
                  )
                }
                required
              />
            </label>

            <label>
              Last name

              <input
                value={lastName}
                onChange={(event) =>
                  setLastName(
                    event.target.value
                  )
                }
                required
              />
            </label>
          </div>

          <label>
            Email address

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              autoComplete="new-password"
              required
            />
          </label>

          <label>
            Confirm password

            <input
              type="password"
              value={
                passwordConfirmation
              }
              onChange={(event) =>
                setPasswordConfirmation(
                  event.target.value
                )
              }
              autoComplete="new-password"
              required
            />
          </label>

          <div className="registration-consent" role="group" aria-label="Registration consent">
            <label className="consent-option">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                required
              />
              <span>I have read and agree to the <NavLink to="/terms" target="_blank">Terms of Use</NavLink>.</span>
            </label>

            <label className="consent-option">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(event) => setPrivacyAccepted(event.target.checked)}
                required
              />
              <span>I have read the <NavLink to="/privacy" target="_blank">Privacy Notice</NavLink> and understand how my information is handled.</span>
            </label>
          </div>

          <button
            type="submit"
            className="primary-button full"
            disabled={submitting || registrationMode === 'closed'}
          >
            {registrationMode === 'closed'
              ? 'Registration Closed'
              : submitting
              ? 'Creating account...'
              : 'Continue Registration'}
          </button>
        </form>

        <p className="auth-footer">
          Already registered?{' '}

          <NavLink to="/login">
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  )
}

function PublicPolicy({ type }) {
  const isPrivacy = type === 'privacy'

  return (
    <main className="policy-screen">
      <article className="policy-document">
        <NavLink className="policy-back" to="/register">← Back to registration</NavLink>
        <div className="eyebrow">KAPIT-BISIG NurseLink</div>
        <h1>{isPrivacy ? 'Privacy Notice' : 'Terms of Use'}</h1>
        <p className="policy-version">Effective 18 August 2026 · Version 2026-08-18</p>

        {isPrivacy ? (
          <>
            <section><h2>Information we collect</h2><p>NurseLink collects account details, contact information, professional history, credentials, uploaded documents, application records, and service activity needed to administer membership and member services.</p></section>
            <section><h2>Why we use it</h2><p>We use this information to verify identity and qualifications, process applications, maintain the professional registry, deliver requested services, protect the platform, meet governance obligations, and communicate important membership updates.</p></section>
            <section><h2>Document processing and OCR</h2><p>Documents submitted through Smart Registration may be scanned for malware and processed with optical character recognition. Extracted values assist data entry and remain subject to applicant confirmation and authorized reviewer verification.</p></section>
            <section><h2>Access and disclosure</h2><p>Access is limited by role. Authorized NurseLink reviewers, administrators, and service providers may process information only for approved operational purposes. NurseLink does not publish private evidence documents as part of a member profile.</p></section>
            <section><h2>Retention and protection</h2><p>Records are retained only as required for membership administration, audit, legal, security, and continuity purposes. NurseLink uses access controls, encryption in transit, monitoring, restricted backups, and audit records to protect information.</p></section>
            <section><h2>Your choices and rights</h2><p>You may request access, correction, a copy, restriction, or deletion where applicable through NurseLink support and privacy-request services. Some records may need to be retained for legal, security, or governance reasons.</p></section>
          </>
        ) : (
          <>
            <section><h2>Using NurseLink</h2><p>You must provide accurate information, maintain the security of your account, and use NurseLink only for lawful membership and professional purposes. You are responsible for reviewing extracted information before confirming or submitting it.</p></section>
            <section><h2>Applications and credentials</h2><p>Submitting information does not guarantee membership, credential verification, employment, placement, or access to a particular service. NurseLink reviewers may request additional evidence and make governed decisions under current membership rules.</p></section>
            <section><h2>Acceptable use</h2><p>Do not impersonate another person, upload malicious or misleading material, attempt unauthorized access, interfere with the service, or misuse member information. Access may be restricted or suspended to protect members and the platform.</p></section>
            <section><h2>Service availability</h2><p>NurseLink works to keep services available and records protected, but maintenance, security events, or circumstances outside its control may temporarily interrupt access.</p></section>
            <section><h2>Changes</h2><p>Material updates will be identified by a new version and effective date. NurseLink may request renewed acceptance when changes affect how the service or member information is governed.</p></section>
          </>
        )}

        <section>
          <h2>Questions or requests</h2>
          <p>
            Use the NurseLink Support Cases service for policy questions and account concerns.
            Privacy requests may also be sent to the KAPIT-BISIG privacy contact at{' '}
            <a href="mailto:nurselink@amsertech.com">nurselink@amsertech.com</a>.
            Urgent security concerns should be reported as soon as possible.
          </p>
        </section>
      </article>
    </main>
  )
}

function PolicyCenter({ onAccepted }) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getPolicyConsent()
      .then((result) => setStatus(result?.data || null))
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false))
  }, [])

  async function acceptPolicies() {
    setSaving(true)
    setError('')

    try {
      const result = await acceptCurrentPolicies()
      const nextStatus = result?.data || { current: true }
      setStatus(nextStatus)
      onAccepted?.(nextStatus)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page policy-center-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">Account Governance</div>
          <h1>Policy &amp; Privacy Center</h1>
          <p>Review NurseLink’s current policies and your recorded acceptance status.</p>
        </div>
      </div>

      {loading && <div className="panel policy-center-loading">Loading policy status…</div>}
      {error && <div className="form-error">{error}</div>}

      {!loading && status && (
        <>
          <section className={`policy-center-status ${status.current ? 'is-current' : 'is-pending'}`}>
            <div>
              <span>{status.current ? 'CURRENT' : 'ACTION REQUESTED'}</span>
              <h2>{status.current ? 'Your policy acceptance is up to date' : 'Please review and accept the current policies'}</h2>
              <p>{status.current ? 'NurseLink has recorded your explicit acceptance of both current documents.' : 'Your access remains available while you review. Acceptance is recorded only when you select the button below.'}</p>
            </div>
            {!status.current && (
              <button type="button" onClick={acceptPolicies} disabled={saving}>
                {saving ? 'Recording acceptance…' : 'Accept both policies'}
              </button>
            )}
          </section>

          <div className="policy-center-grid">
            <article className="panel policy-center-card">
              <div className="eyebrow">Terms</div>
              <h2>Terms of Use</h2>
              <p>Current version: <strong>{status.terms_version}</strong></p>
              <p>Accepted: <strong>{status.terms_accepted_at ? new Date(status.terms_accepted_at).toLocaleString() : 'Not yet recorded'}</strong></p>
              <NavLink to="/terms" target="_blank">Read Terms of Use</NavLink>
            </article>
            <article className="panel policy-center-card">
              <div className="eyebrow">Privacy</div>
              <h2>Privacy Notice</h2>
              <p>Current version: <strong>{status.privacy_version}</strong></p>
              <p>Accepted: <strong>{status.privacy_accepted_at ? new Date(status.privacy_accepted_at).toLocaleString() : 'Not yet recorded'}</strong></p>
              <NavLink to="/privacy" target="_blank">Read Privacy Notice</NavLink>
            </article>
          </div>

          <section className="panel policy-center-help">
            <h2>Questions or privacy requests</h2>
            <p>
              Use NurseLink Support Cases for questions, correction requests, or account concerns.
              You may also contact KAPIT-BISIG at <a href="mailto:nurselink@amsertech.com">nurselink@amsertech.com</a> for privacy requests.
              Policy acceptance does not waive rights available under applicable law.
            </p>
          </section>
        </>
      )}
    </div>
  )
}

function VerifyEmail() {
  const location =
    useLocation()

  const email =
    location.state?.email ||
    'your registered email'

  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  async function handleResend() {
    setNotice('')
    setError('')
    setSending(true)

    try {
      const result = await resendEmailVerification()
      setNotice(result?.message || 'Verification link sent.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="auth-screen" role="main">
      <div className="auth-brand">
        <div className="brand-mark">
          NL
        </div>

        <h1 aria-hidden="true">NurseLink</h1>

        <p>
          Verify your email before
          continuing.
        </p>
      </div>

      <div className="auth-card">
        <div className="eyebrow">
          Email Verification
        </div>

        <h2>
          Check your email
        </h2>

        <p>
          We sent a verification message to:
        </p>

        <div className="verification-email">
          {email}
        </div>

        <p>
          Follow the secure link in the
          email to activate your account.
        </p>

        {notice && <div className="form-success">{notice}</div>}
        {error && <div className="form-error">{error}</div>}

        <button
          type="button"
          className="secondary-button full"
          onClick={handleResend}
          disabled={sending}
        >
          {sending ? 'Sending…' : 'Resend verification email'}
        </button>

        <NavLink
          to="/login"
          className="primary-button full auth-button-link"
        >
          Return to Sign In
        </NavLink>
      </div>
    </div>
  )
}

function CredentialRenewalRedirect() {
  useEffect(() => {
    window.location.replace('/nurselink-credential-renewal.html')
  }, [])

  return (
    <Placeholder
      title="Credential Renewal"
      description="Opening your NurseLink credential renewal workspace."
      hidePanel
    />
  )
}

function CareerIntelligenceRedirect() {
  useEffect(() => {
    window.location.replace('/nurselink-career-intelligence.html')
  }, [])

  return (
    <Placeholder
      title="Career Intelligence"
      description="Opening your NurseLink career intelligence workspace."
      hidePanel
    />
  )
}

function NotificationsRedirect() {
  useEffect(() => {
    window.location.replace('/nurselink-notifications.html')
  }, [])

  return (
    <Placeholder
      title="Notification Center"
      description="Opening your NurseLink notifications."
      hidePanel
    />
  )
}

function EngagementRedirect() {
  useEffect(() => {
    window.location.replace('/nurselink-engagement.html')
  }, [])

  return (
    <Placeholder
      title="Member Engagement Hub"
      description="Opening your NurseLink community, chapters, events and member activities."
      hidePanel
    />
  )
}

function MentoringRedirect() {
  useEffect(() => {
    window.location.replace('/nurselink-mentoring.html')
  }, [])

  return (
    <Placeholder
      title="Mentoring & Peer Support"
      description="Opening your NurseLink mentoring workspace."
      hidePanel
    />
  )
}

function Placeholder({
  title,
  description,
  hidePanel = false,
}) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            NurseLink System
          </div>

          <h1>{title}</h1>

          <p>{description}</p>
        </div>
      </div>

      {!hidePanel && (
        <div className="panel">
          <h2>{title}</h2>

          <p>
            This module is ready for
            API integration.
          </p>
        </div>
      )}
    </div>
  )
}

function MemberLocked({
  title,
}) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            Member Feature
          </div>

          <h1>{title}</h1>

          <p>
            This feature becomes available
            after your NurseLink membership
            application is approved.
          </p>
        </div>
      </div>

      <div className="panel member-locked-panel">
        <div className="member-lock-icon">
          🔒
        </div>

        <h2>
          Available after membership approval
        </h2>

        <p>
          Complete and submit your membership
          application. Once approved, NurseLink
          will automatically activate this
          member service.
        </p>

        <NavLink
          to="/application-status"
          className="primary-button"
        >
          View Application Status
        </NavLink>
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } =
    useAuth()

  const progress =
    user?.application
      ?.progress_percent ?? 0

  const applicationStatus =
    user?.application?.status ||
    'not_started'

  const applicationLabel =
    statusLabels[
      applicationStatus
    ] ||
    'Not Started'

  const isMember =
    user?.roles?.includes('member') ||
    Boolean(user?.member)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            {isMember
              ? 'Member Dashboard'
              : 'Applicant Dashboard'}
          </div>

          <h1>
            Welcome,{' '}
            {user?.name || 'Member'}
          </h1>

          <p>
            Your professional, membership
            and organization portal.
          </p>
        </div>

        {!isMember && (
          <NavLink
            to="/application-status"
            className="primary-button"
          >
            Application Status
          </NavLink>
        )}
      </div>

      {!isMember && (
        <>
          <div className="stats-grid">
        <div className="stat-card">
          <span>
            Application Progress
          </span>

          <strong>
            {progress}%
          </strong>

          <small>
            Membership registration
          </small>
        </div>

        <div className="stat-card">
          <span>
            Application Status
          </span>

          <strong className="status-word">
            {applicationLabel}
          </strong>

          <small>
            Current application stage
          </small>
        </div>

        <div className="stat-card">
          <span>
            Member Number
          </span>

          <strong className="status-word">
            {user?.member?.member_no ||
              'Pending'}
          </strong>

          <small>
            Issued after approval
          </small>
        </div>

        <div className="stat-card">
          <span>Role</span>

          <strong className="status-word">
            {user?.roles?.[0] ||
              'Applicant'}
          </strong>

          <small>
            Current access level
          </small>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-title">
            <h2>
              Membership Application
            </h2>

            <span className="badge">
              {applicationLabel}
            </span>
          </div>

          <div className="progress">
            <div
              className="progress-bar"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="checklist">
            <div>
              ✓ NurseLink account created
            </div>

            <div>
              {progress >= 60
                ? '✓'
                : '○'}{' '}
              Personal information
            </div>

            <div>
              {progress >= 90
                ? '✓'
                : '○'}{' '}
              Smart registration
            </div>

            <div>
              {[
                'submitted',
                'under_review',
                'resubmitted',
                'approved',
              ].includes(
                applicationStatus
              )
                ? '✓'
                : '○'}{' '}
              Application submitted
            </div>

            <div>
              {isMember
                ? '✓'
                : '○'}{' '}
              Membership approved
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>
              Quick Actions
            </h2>
          </div>

          <div className="quick-actions">
            <NavLink to="/profile">
              Update Profile
            </NavLink>

            <NavLink to="/smart-registration">
              Smart Registration
            </NavLink>

            <NavLink to="/application-status">
              Application Status
            </NavLink>

            {isMember && (
              <NavLink to="/credentials">
                Add Credential
              </NavLink>
            )}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}

function NavigationTour({
  open,
  isMember,
  onClose,
}) {
  const [stepIndex, setStepIndex] = useState(0)
  const [guideMode, setGuideMode] = useState('navigation')

  const navigationSteps = useMemo(() => [
    {
      path: '/dashboard',
      title: 'Your NurseLink dashboard',
      text: 'Start here for membership progress, readiness and the next action NurseLink recommends.',
    },
    {
      path: '/profile',
      title: 'Keep your profile current',
      text: 'Update your personal and professional information so applications and services use accurate details.',
    },
    {
      path: '/smart-registration',
      title: 'Smart Registration',
      text: 'Upload documents, review extracted information and supply anything the document could not provide.',
    },
    {
      path: '/application-status',
      title: 'Follow your application',
      text: 'See the current review stage, decisions and requests for additional information.',
    },
    ...(isMember
      ? [
          {
            path: '/credentials',
            title: 'Credentials and evidence',
            text: 'Maintain licenses and certificates, attach supporting files and follow verification status.',
          },
          {
            path: '/documents',
            title: 'Your private documents',
            text: 'Find documents you uploaded or that NurseLink retained from your approved application.',
          },
        ]
      : []),
    {
      path: '/messages',
      title: 'Messages and notifications',
      text: 'Check updates from NurseLink and respond when an action is required.',
    },
  ], [isMember])

  const smartRegistrationSteps = useMemo(() => [
    {
      path: '/smart-registration',
      title: '1. Upload your documents',
      text: 'Upload a clear PRC license, résumé, diploma, passport, ID or employment certificate. Supported files are PDF, JPG, PNG and DOCX, up to 15 MB each.',
    },
    {
      path: '/smart-registration',
      title: '2. Review OCR suggestions',
      text: 'NurseLink proposes information extracted from your documents. Compare every proposed value with the evidence and correct anything that was interpreted incorrectly.',
    },
    {
      path: '/profile',
      title: '3. Complete missing information',
      text: 'Fill in required details OCR could not find clearly, such as your birth date, mobile number, address, employer or nursing experience. You can save and return later.',
    },
    {
      path: '/smart-registration',
      title: '4. Add credentials and evidence',
      text: 'Record your PRC license and other credentials, enter dates exactly as issued, and attach the matching evidence. Member confirmation is not reviewer verification.',
    },
    {
      path: '/application-status',
      title: '5. Review application readiness',
      text: 'Open each Review or Attention item and confirm personal information, professional details, employment history, credentials and uploaded documents.',
    },
    {
      path: '/application-status',
      title: '6. Submit and track review',
      text: 'Submit when all required information is complete. Watch Application Status, email and notifications for assignment, requests for information, decisions and onboarding.',
    },
  ], [])

  const steps = guideMode === 'smart-registration'
    ? smartRegistrationSteps
    : navigationSteps

  useEffect(() => {
    if (!open) return undefined

    const step = steps[stepIndex]
    const target = document.querySelector(`[data-tour-path="${step.path}"]`)
    target?.classList.add('navigation-tour-target')
    target?.scrollIntoView({ block: 'nearest' })

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setStepIndex(0)
        onClose(false)
      }
      if (event.key === 'ArrowRight' && stepIndex < steps.length - 1) {
        setStepIndex((current) => current + 1)
      }
      if (event.key === 'ArrowLeft' && stepIndex > 0) {
        setStepIndex((current) => current - 1)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      target?.classList.remove('navigation-tour-target')
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open, stepIndex, steps])

  if (!open) return null

  const step = steps[stepIndex]
  const isLast = stepIndex === steps.length - 1

  return (
    <div className="navigation-tour-layer" role="presentation">
      <div className="navigation-tour-backdrop" />
      <section
        className="navigation-tour-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="navigation-tour-title"
      >
        <div className="navigation-tour-guides" aria-label="Help topics">
          <button
            type="button"
            aria-pressed={guideMode === 'navigation'}
            onClick={() => {
              setGuideMode('navigation')
              setStepIndex(0)
            }}
          >
            Navigation
          </button>
          <button
            type="button"
            aria-pressed={guideMode === 'smart-registration'}
            onClick={() => {
              setGuideMode('smart-registration')
              setStepIndex(0)
            }}
          >
            Smart Registration
          </button>
        </div>
        <div className="navigation-tour-progress">
          <span>{guideMode === 'smart-registration' ? 'Smart Registration guide' : 'Navigation guide'}</span>
          <strong>{stepIndex + 1} of {steps.length}</strong>
        </div>
        <h2 id="navigation-tour-title">{step.title}</h2>
        <p>{step.text}</p>
        <div className="navigation-tour-actions">
          <button type="button" className="tour-skip" onClick={() => {
            setStepIndex(0)
            onClose(guideMode === 'navigation')
          }}>
            {guideMode === 'navigation' ? 'Skip tour' : 'Close guide'}
          </button>
          <div>
            <button
              type="button"
              className="tour-secondary"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((current) => current - 1)}
            >
              Back
            </button>
            <button
              type="button"
              className="tour-primary"
              onClick={() => {
                if (isLast) {
                  setStepIndex(0)
                  onClose(guideMode === 'navigation')
                }
                else setStepIndex((current) => current + 1)
              }}
            >
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

// NurseLink Members Portal React-Safe Shell v1.0.8
function AppLayout() {
  installNurseLinkIOSFirstTapBridge()
  document.documentElement.setAttribute('data-nurselink-iphone-typography', 'v4.0.7')
  document.documentElement.setAttribute('data-nurselink-iphone-typography-parity', 'v4.0.8')
  document.documentElement.setAttribute('data-nurselink-drawer-brand-fix', 'v4.3.3')

  const navigate =
    useNavigate()

  const memberShellLocation = useLocation()

  const {
    user,
    logout,
  } = useAuth()

  const [
    signingOut,
    setSigningOut,
  ] = useState(false)

  const [
    memberMobileNavOpen,
    setMemberMobileNavOpen,
  ] = useState(false)

  // NurseLink mobile drawer body scroll lock v3.3.2
  useEffect(() => {
    if (!memberMobileNavOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const previousOverscroll = document.body.style.overscrollBehavior

    document.documentElement.classList.add('nurselink-nav-lock')
    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'

    return () => {
      document.documentElement.classList.remove('nurselink-nav-lock')
      document.body.style.overflow = previousOverflow
      document.body.style.overscrollBehavior = previousOverscroll
    }
  }, [memberMobileNavOpen])

  const [
    navigationTourOpen,
    setNavigationTourOpen,
  ] = useState(false)

  const [memberTheme, setMemberTheme] = useState(() => {
    const saved = window.localStorage.getItem('nurselink-member-theme')
    return ['light', 'dark', 'system'].includes(saved) ? saved : 'system'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = memberTheme
      document.documentElement.setAttribute('data-nurselink-ios-theme-fix', 'v4.0.4')
      document.documentElement.setAttribute('data-nurselink-iphone-tap-fix', 'v4.0.5')
    window.localStorage.setItem('nurselink-member-theme', memberTheme)
  
    /* NurseLink Theme Runtime Repair v4.0.1 */
    const rootTheme = document.documentElement
    rootTheme.setAttribute('data-theme', memberTheme)
    rootTheme.setAttribute('data-nurselink-theme-runtime', 'v4.0.1')

    if (memberTheme === 'light') {
      rootTheme.style.colorScheme = 'light'
    } else if (memberTheme === 'dark') {
      rootTheme.style.colorScheme = 'dark'
    } else {
      rootTheme.style.colorScheme = ''
    }

    document.body?.setAttribute('data-theme', memberTheme)
}, [memberTheme])


  const [policyConsent, setPolicyConsent] = useState(null)
  const [policyConsentSaving, setPolicyConsentSaving] = useState(false)
  const [policyConsentError, setPolicyConsentError] = useState('')

  const isMember =
    user?.roles?.includes('member') ||
    Boolean(user?.member)

  const isAdministrator =
    user?.roles?.some((role) =>
      [
        'administrator',
        'super_administrator',
      ].includes(role)
    )

  const tourStorageKey = `nurselink-navigation-tour-v1:${user?.id || user?.email || 'member'}`

  useEffect(() => {
    setMemberMobileNavOpen(false)
  }, [memberShellLocation.pathname])

  useEffect(() => {
    if (window.localStorage.getItem(tourStorageKey)) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setNavigationTourOpen(true)
    }, 700)

    return () => window.clearTimeout(timer)
  }, [tourStorageKey])

  useEffect(() => {
    let active = true

    getPolicyConsent()
      .then((result) => {
        if (active) setPolicyConsent(result?.data || null)
      })
      .catch(() => {
        if (active) setPolicyConsentError('Policy status is temporarily unavailable. You can continue using NurseLink.')
      })

    return () => {
      active = false
    }
  }, [user?.id])

  async function handlePolicyConsent() {
    setPolicyConsentSaving(true)
    setPolicyConsentError('')

    try {
      const result = await acceptCurrentPolicies()
      setPolicyConsent(result?.data || { current: true })
    } catch (error) {
      setPolicyConsentError(getErrorMessage(error))
    } finally {
      setPolicyConsentSaving(false)
    }
  }

  async function handleLogout() {
    /* NURSELINK_INSTANT_SIGNOUT_V404 */
    setSigningOut(true)

    navigate('/login', { replace: true })

    try {
      await Promise.race([
        logout(),
        new Promise((resolve) => window.setTimeout(resolve, 2500)),
      ])
    } catch (error) {
      console.warn('NurseLink sign-out request completed with a client-side error.', error)
    } finally {
      setSigningOut(false)
    }
  }

  function routeForMemberFeature(
    title,
    element
  ) {
    if (isMember) {
      return element
    }

    return (
      <MemberLocked
        title={title}
      />
    )
  }

  return (
    <div
      className={[
        'app-shell',
        'member-react-safe-shell-v108',
        'member-shell-v636',
        memberMobileNavOpen
          ? 'mobile-nav-open'
          : '',
      ].filter(Boolean).join(' ')}
    >

      <button
        type="button"
        className="mobile-nav-backdrop"
        aria-label="Close navigation"
        onClick={() => setMemberMobileNavOpen(false)}
      />


      <aside className="sidebar">
        <button
          type="button"
          className="mobile-nav-close"
          aria-label="Close navigation"
          onClick={() => setMemberMobileNavOpen(false)}
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className="logo">
          <div className="brand-mark small">
            NL
          </div>

          <div>
            <strong>
              NurseLink
            </strong>

            <small>
              KAPIT-BISIG
            </small>
          </div>
        </div>

        <nav>
          {menu
            .filter(([, path]) =>
              !(
                isMember &&
                [
                  '/smart-registration',
                  '/application-status',
                ].includes(path)
              )
            )
            .map(
            ([label, path, icon]) => {
              const locked =
                memberOnlyPaths.includes(
                  path
                ) &&
                !isMember

              return (
                <NavLink
                  onClick={() => setMemberMobileNavOpen(false)}
                  key={path}
                  to={path}
                  data-tour-path={path}
                  className={({
                    isActive,
                  }) =>
                    [
                      isActive
                        ? 'active'
                        : '',
                      locked
                        ? 'locked-nav'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')
                  }
                >
                  <MemberNavIcon name={icon} />

                  <span className="member-admin-nav-label">
                    {label}
                  </span>

                  {locked && (
                    <small>
                      🔒
                    </small>
                  )}
                </NavLink>
              )
            }
          )}
        </nav>

        <div className="sidebar-bottom">
          {isAdministrator && (
            <NavLink to="/admin">
              Administration
            </NavLink>
          )}

          <button
            className="sidebar-logout"
            onClick={handleLogout}
            disabled={signingOut}
          >
            {signingOut
              ? 'Signing Out...'
              : 'Sign Out'}
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Open navigation"
            aria-expanded={memberMobileNavOpen}
            onClick={() => setMemberMobileNavOpen((open) => !open)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="topbar-brand">
            <strong>NurseLink</strong>
            <span>by Kapit-Bisig</span>
          </div>

          <div className="topbar-member-actions">
            <button
              type="button"
              className="navigation-help-button"
              onClick={() => setNavigationTourOpen(true)}
              aria-label="Open member navigation guide"
            >
              ? <span>Help</span>
            </button>

          <div
            className="member-theme-control-v337"
            role="group"
            aria-label="Appearance"
          >
            <button
              type="button"
              aria-label="Use light mode"
              title="Light"
              aria-pressed={memberTheme === 'light'}
              onClick={() => setMemberTheme('light')}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Use dark mode"
              title="Dark"
              aria-pressed={memberTheme === 'dark'}
              onClick={() => setMemberTheme('dark')}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Follow system appearance"
              title="System"
              aria-pressed={memberTheme === 'system'}
              onClick={() => setMemberTheme('system')}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="4" width="18" height="13" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </button>
          </div>

          <div className="user-chip">
            <div className="avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() ||
                'N'}
            </div>

            <div>
              <strong>
                {user?.name ||
                  'Member'}
              </strong>

              <small>
                {user?.member
                  ? user.member.member_no
                  : 'Membership pending'}
              </small>
            </div>
          </div>
          </div>
        </header>

        {policyConsent && !policyConsent.current && (
          <section className="policy-consent-banner" aria-labelledby="policy-consent-title">
            <div>
              <strong id="policy-consent-title">Please review NurseLink’s current policies</strong>
              <p>
                The Terms of Use and Privacy Notice were updated on 18 August 2026.
                Review both documents before recording your acceptance. Your access remains available while you review.
              </p>
              <div className="policy-consent-links">
                <NavLink to="/terms" target="_blank">Read Terms of Use</NavLink>
                <NavLink to="/privacy" target="_blank">Read Privacy Notice</NavLink>
              </div>
              {policyConsentError && <div className="policy-consent-error">{policyConsentError}</div>}
            </div>
            <button type="button" onClick={handlePolicyConsent} disabled={policyConsentSaving}>
              {policyConsentSaving ? 'Recording acceptance…' : 'Accept both policies'}
            </button>
          </section>
        )}

        {!policyConsent && policyConsentError && (
          <div className="policy-consent-advisory">{policyConsentError}</div>
        )}

        <NavigationTour
          open={navigationTourOpen}
          isMember={isMember}
          onClose={(completed = false) => {
            if (completed) {
              window.localStorage.setItem(tourStorageKey, 'completed')
            }
            setNavigationTourOpen(false)
          }}
        />

        <Routes>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/smart-registration"
            element={
              isMember
                ? <Navigate to="/documents" replace />
                : <SmartRegistration />
            }
          />

          <Route
            path="/application-status"
            element={
              <ApplicationStatus />
            }
          />

          <Route
            path="/portfolio"
            element={routeForMemberFeature(
              'Professional Portfolio',
              <Placeholder
                title="Professional Portfolio"
                description="Build and maintain your nursing professional portfolio."
              />
            )}
          />

          <Route
            path="/jobs"
            element={routeForMemberFeature(
              'Career & Jobs',
              <Phase2JobsPage />
            )}
          />

          <Route
            path="/applications"
            element={routeForMemberFeature(
              'Applications',
              <Phase2ApplicationsPage />
            )}
          />

          <Route
            path="/credential-renewal"
            element={routeForMemberFeature(
              'Credential Renewal',
              <CredentialRenewalRedirect />
            )}
          />

          <Route
            path="/career-intelligence"
            element={routeForMemberFeature(
              'Career Intelligence',
              <CareerIntelligenceRedirect />
            )}
          />

          <Route
            path="/notifications"
            element={<NotificationsRedirect />}
          />

          <Route
            path="/mentoring"
            element={routeForMemberFeature(
              'Mentoring & Peer Support',
              <MentoringRedirect />
            )}
          />

          <Route
            path="/engagement"
            element={routeForMemberFeature(
              'Member Engagement Hub',
              <EngagementRedirect />
            )}
          />

          <Route
            path="/learning"
            element={routeForMemberFeature(
              'Professional Learning',
              <Phase3LearningPage />
            )}
          />

          <Route
            path="/credentials"
            element={routeForMemberFeature(
              'Credentials',
              <Phase2CredentialsReconciledPage><Credentials /></Phase2CredentialsReconciledPage>
            )}
          />

          <Route
            path="/qualifications"
            element={routeForMemberFeature(
              'Qualification Framework',
              <Phase2QualificationsPage />
            )}
          />

          <Route
            path="/documents"
            element={routeForMemberFeature(
              'Documents',
              <Phase2DocumentsPage />
            )}
          />

          <Route
            path="/digital-member-id"
            element={routeForMemberFeature(
              'Digital Member ID',
              <DigitalMemberIdRedirect />
            )}
          />

          <Route
            path="/messages"
            element={
              <Phase3MessagesPage />
            }
          />

          <Route
            path="/events"
            element={
              <Phase2EventsPage />
            }
          />

          <Route
            path="/initiatives"
            element={
              routeForMemberFeature(
                'Programs & Initiatives',
                <Phase7InitiativesPage />
              )
            }
          />

          <Route
            path="/policies"
            element={
              routeForMemberFeature(
                'Policies & Advocacy',
                <PoliciesAdvocacyIntelligencePage />
              )
            }
          />

          <Route
            path="/welfare"
            element={
              routeForMemberFeature(
                'Welfare & Crisis Support',
                <Phase6WelfareCrisisPage />
              )
            }
          />

          <Route path="/policy-center" element={<PolicyCenter onAccepted={setPolicyConsent} />} />

          {isAdministrator && (
            <>
              <Route path="/admin" element={<AdminAppearanceStudio />} />
              <Route path="/admin/appearance" element={<AdminAppearanceStudio />} />
            </>
          )}

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route path="/terms" element={<PublicPolicy type="terms" />} />
        <Route path="/privacy" element={<PublicPolicy type="privacy" />} />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
