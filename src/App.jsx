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
import ResetPassword from './pages/ResetPassword'
import {
  getRegistrationStatus,
  getPolicyConsent,
  acceptCurrentPolicies,
  requestPasswordReset,
  resendEmailVerification,
} from './lib/api'

const menu = [
  ['Dashboard', '/dashboard'],
  ['My Profile', '/profile'],
  ['Smart Registration', '/smart-registration'],
  ['Application Status', '/application-status'],
  ['Portfolio', '/portfolio'],
  ['Credentials', '/credentials'],
  ['Qualifications', '/qualifications'],
  ['Documents', '/documents'],
  ['Messages', '/messages'],
  ['Events', '/events'],
  ['Programs & Initiatives', '/initiatives'],
  ['Policies & Advocacy', '/policies'],
  ['Welfare & Crisis', '/welfare'],
]

const memberOnlyPaths = [
  '/portfolio',
  '/credentials',
  '/qualifications',
  '/documents',
]

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
      <div className="auth-screen" role="main">
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
    <div className="auth-screen" role="main">
      <div className="auth-brand">
        <div className="brand-mark">
          NL
        </div>

        <h1 aria-hidden="true">NurseLink</h1>

        <p>
          Professional network and support
          system for returning OFW nurses.
        </p>
      </div>

      <div className="auth-card">
        <div className="eyebrow">
          Member Access
        </div>

        <h2>
          {verificationUrl
            ? 'Sign in to verify your email'
            : 'Sign in'}
        </h2>

        <p>
          {verificationUrl
            ? 'Sign in using the account associated with this verification email.'
            : 'Enter your NurseLink account details.'}
        </p>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              required
            />
          </label>

          <p className="auth-footer">
            <NavLink to="/forgot-password">
              Forgot password?
            </NavLink>
          </p>

          <button
            type="submit"
            className="primary-button full"
            disabled={submitting}
          >
            {submitting
              ? 'Signing in...'
              : verificationUrl
                ? 'Sign In & Verify Email'
                : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          New to NurseLink?{' '}

          <NavLink to="/register">
            Create an account
          </NavLink>
        </p>
      </div>
    </div>
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

        <section><h2>Questions or requests</h2><p>Use the NurseLink Support Cases service for policy questions, account concerns, or privacy requests. Urgent security concerns should be reported as soon as possible.</p></section>
      </article>
    </main>
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

function Placeholder({
  title,
  description,
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

      <div className="panel">
        <h2>{title}</h2>

        <p>
          This module is ready for
          API integration.
        </p>
      </div>
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

function AppLayout() {
  const navigate =
    useNavigate()

  const {
    user,
    logout,
  } = useAuth()

  const [
    signingOut,
    setSigningOut,
  ] = useState(false)

  const [
    navigationTourOpen,
    setNavigationTourOpen,
  ] = useState(false)

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
    setSigningOut(true)

    try {
      await logout()

      navigate(
        '/login',
        {
          replace: true,
        }
      )
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
    <div className="app-shell">
      <aside className="sidebar">
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
          {menu.map(
            ([label, path]) => {
              const locked =
                memberOnlyPaths.includes(
                  path
                ) &&
                !isMember

              return (
                <NavLink
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
                  <span>
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
          <div>
            <strong>
              KAPIT-BISIG NurseLink
            </strong>

            <span>
              {isMember
                ? 'Member Portal'
                : 'Applicant Portal'}
            </span>
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
              <SmartRegistration />
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
            path="/credentials"
            element={routeForMemberFeature(
              'Credentials',
              <Credentials />
            )}
          />

          <Route
            path="/qualifications"
            element={routeForMemberFeature(
              'Qualification Framework',
              <Placeholder
                title="Qualification Framework"
                description="Review qualification assessments and professional pathways."
              />
            )}
          />

          <Route
            path="/documents"
            element={routeForMemberFeature(
              'Documents',
              <Placeholder
                title="Documents"
                description="Securely manage your professional documents."
              />
            )}
          />

          <Route
            path="/messages"
            element={
              <Placeholder
                title="Messages"
                description="Receive organization notices and communications."
              />
            }
          />

          <Route
            path="/events"
            element={
              <Placeholder
                title="Events"
                description="View training activities and organization events."
              />
            }
          />

          <Route
            path="/initiatives"
            element={
              <Placeholder
                title="Programs & Initiatives"
                description="Track NurseLink programs and organizational initiatives."
              />
            }
          />

          <Route
            path="/policies"
            element={
              <Placeholder
                title="Policies & Advocacy"
                description="Follow policies and advocacy initiatives affecting Filipino nurses."
              />
            }
          />

          <Route
            path="/welfare"
            element={
              <Placeholder
                title="Welfare & Crisis Support"
                description="Access welfare information and crisis support."
              />
            }
          />

          {isAdministrator && (
            <Route
              path="/admin"
              element={
                <Placeholder
                  title="Administration"
                  description="Administrative management and monitoring console."
                />
              }
            />
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
