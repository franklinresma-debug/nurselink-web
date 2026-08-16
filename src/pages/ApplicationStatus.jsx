import {
  useEffect,
  useState,
} from 'react'

import {
  getApplication,
  markApplicationReady,
  submitApplication,
  resubmitApplication,
} from '../lib/api'

import { useAuth } from '../context/AuthContext'

const statusLabels = {
  draft: 'Draft',
  in_progress: 'In Progress',
  ready_to_submit: 'Ready to Submit',
  submitted: 'Submitted',
  under_review: 'Under Review',
  returned_for_information:
    'Returned for Information',
  resubmitted: 'Resubmitted',
  approved: 'Approved',
  rejected: 'Rejected',
}

const statusDescriptions = {
  draft:
    'Your NurseLink membership application has been created.',

  in_progress:
    'Complete your profile and supporting information before submitting your application.',

  ready_to_submit:
    'Your application is ready. Review your information and submit it for evaluation.',

  submitted:
    'Your application has been submitted and is waiting for NurseLink review.',

  under_review:
    'Your membership application is currently being reviewed.',

  returned_for_information:
    'The reviewer requires additional information before your application can continue.',

  resubmitted:
    'Your updated application has been resubmitted and is waiting for review.',

  approved:
    'Congratulations. Your NurseLink membership application has been approved.',

  rejected:
    'Your membership application was not approved. Please review the decision information below.',
}

function getErrorMessage(error) {
  if (error?.data?.errors) {
    const first =
      Object.values(
        error.data.errors
      )[0]

    if (Array.isArray(first)) {
      return first[0]
    }

    return first
  }

  return (
    error?.data?.message ||
    error?.message ||
    'The request could not be completed.'
  )
}

function formatDate(value) {
  if (!value) return null

  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

export default function ApplicationStatus() {
  const { refreshUser } = useAuth()

  const [
    application,
    setApplication,
  ] = useState(null)

  const [loading, setLoading] =
    useState(true)

  const [processing, setProcessing] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

  async function loadApplication() {
    try {
      setError('')

      const app =
        await getApplication()

      setApplication(app)
    } catch (err) {
      setError(
        getErrorMessage(err)
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApplication()
  }, [])

  async function handleReady() {
    if (!application) return

    setProcessing(true)
    setMessage('')
    setError('')

    try {
      const updated =
        await markApplicationReady(
          application.id
        )

      setApplication(updated)

      await refreshUser()

      setMessage(
        'Your application is now ready for submission.'
      )
    } catch (err) {
      setError(
        getErrorMessage(err)
      )
    } finally {
      setProcessing(false)
    }
  }

  async function handleSubmit() {
    if (!application) return

    if (
      !window.confirm(
        'Submit your NurseLink membership application for review?'
      )
    ) {
      return
    }

    setProcessing(true)
    setMessage('')
    setError('')

    try {
      const updated =
        await submitApplication(
          application.id
        )

      setApplication(updated)

      await refreshUser()

      setMessage(
        'Your NurseLink membership application has been submitted successfully.'
      )
    } catch (err) {
      setError(
        getErrorMessage(err)
      )
    } finally {
      setProcessing(false)
    }
  }

  async function handleResubmit() {
    if (!application) return

    if (
      !window.confirm(
        'Resubmit your updated NurseLink application?'
      )
    ) {
      return
    }

    setProcessing(true)
    setMessage('')
    setError('')

    try {
      const updated =
        await resubmitApplication(
          application.id
        )

      setApplication(updated)

      await refreshUser()

      setMessage(
        'Your updated application has been resubmitted.'
      )
    } catch (err) {
      setError(
        getErrorMessage(err)
      )
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        Loading application status...
      </div>
    )
  }

  if (!application) {
    return (
      <div className="page">
        <div className="panel">
          <h2>
            No membership application found
          </h2>

          <p>
            Complete your NurseLink profile
            to begin your membership application.
          </p>
        </div>
      </div>
    )
  }

  const status =
    application.status

  const progress =
    application.progress_percent ?? 0

  const canMarkReady =
    status === 'in_progress' &&
    progress >= 60

  const canSubmit =
    status === 'ready_to_submit'

  const canResubmit =
    status ===
    'returned_for_information'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            Membership Application
          </div>

          <h1>
            Application Status
          </h1>

          <p>
            Track, complete and submit your
            NurseLink membership application.
          </p>
        </div>

        <span className="badge">
          {application.application_no}
        </span>
      </div>

      {message && (
        <div className="form-success">
          {message}
        </div>
      )}

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="application-status-grid">
        <div className="panel application-status-main">

          <div className="application-status-heading">
            <div>
              <span className="application-status-label">
                Current Status
              </span>

              <h2>
                {statusLabels[status] ||
                  status}
              </h2>
            </div>

            <span
              className={`application-status-badge status-${status}`}
            >
              {statusLabels[status] ||
                status}
            </span>
          </div>

          <p>
            {statusDescriptions[status] ||
              'Your application is being processed.'}
          </p>

          <div className="application-progress-header">
            <span>
              Application Completion
            </span>

            <strong>
              {progress}%
            </strong>
          </div>

          <div className="progress">
            <div
              className="progress-bar"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          {application.return_reason && (
            <div className="application-notice warning">
              <strong>
                Additional information required
              </strong>

              <p>
                {application.return_reason}
              </p>
            </div>
          )}

          {application.rejection_reason && (
            <div className="application-notice danger">
              <strong>
                Review Decision
              </strong>

              <p>
                {application.rejection_reason}
              </p>
            </div>
          )}

          <div className="application-actions">

            {canMarkReady && (
              <button
                type="button"
                className="primary-button"
                disabled={processing}
                onClick={handleReady}
              >
                {processing
                  ? 'Processing...'
                  : 'Mark Ready for Submission'}
              </button>
            )}

            {canSubmit && (
              <button
                type="button"
                className="primary-button"
                disabled={processing}
                onClick={handleSubmit}
              >
                {processing
                  ? 'Submitting...'
                  : 'Submit Application'}
              </button>
            )}

            {canResubmit && (
              <button
                type="button"
                className="primary-button"
                disabled={processing}
                onClick={handleResubmit}
              >
                {processing
                  ? 'Submitting...'
                  : 'Resubmit Application'}
              </button>
            )}

            {[
              'submitted',
              'under_review',
              'resubmitted',
            ].includes(status) && (
              <div className="application-waiting">
                Your application is already
                with NurseLink for review.
              </div>
            )}

            {status === 'approved' && (
              <div className="application-approved">
                Membership activated.
                Member services are now available.
              </div>
            )}

          </div>
        </div>

        <div className="panel">
          <h2>
            Application Details
          </h2>

          <div className="application-details">

            <div>
              <span>
                Application Number
              </span>

              <strong>
                {application.application_no}
              </strong>
            </div>

            <div>
              <span>
                Progress
              </span>

              <strong>
                {progress}%
              </strong>
            </div>

            <div>
              <span>
                Status
              </span>

              <strong>
                {statusLabels[status] ||
                  status}
              </strong>
            </div>

            {application.submitted_at && (
              <div>
                <span>
                  Submitted
                </span>

                <strong>
                  {formatDate(
                    application.submitted_at
                  )}
                </strong>
              </div>
            )}

            {application.review_started_at && (
              <div>
                <span>
                  Review Started
                </span>

                <strong>
                  {formatDate(
                    application.review_started_at
                  )}
                </strong>
              </div>
            )}

            {application.approved_at && (
              <div>
                <span>
                  Approved
                </span>

                <strong>
                  {formatDate(
                    application.approved_at
                  )}
                </strong>
              </div>
            )}

            {application.rejected_at && (
              <div>
                <span>
                  Decision Date
                </span>

                <strong>
                  {formatDate(
                    application.rejected_at
                  )}
                </strong>
              </div>
            )}

          </div>
        </div>
      </div>

      <div className="panel">
        <h2>
          Application Journey
        </h2>

        <div className="application-journey">

          <div className="journey-step complete">
            <span>1</span>

            <div>
              <strong>
                Account Created
              </strong>

              <small>
                NurseLink account verified
              </small>
            </div>
          </div>

          <div
            className={`journey-step ${
              progress >= 60
                ? 'complete'
                : ''
            }`}
          >
            <span>2</span>

            <div>
              <strong>
                Profile Completed
              </strong>

              <small>
                Personal and professional
                information
              </small>
            </div>
          </div>

          <div
            className={`journey-step ${
              [
                'ready_to_submit',
                'submitted',
                'under_review',
                'returned_for_information',
                'resubmitted',
                'approved',
                'rejected',
              ].includes(status)
                ? 'complete'
                : ''
            }`}
          >
            <span>3</span>

            <div>
              <strong>
                Ready for Submission
              </strong>

              <small>
                Applicant review completed
              </small>
            </div>
          </div>

          <div
            className={`journey-step ${
              [
                'submitted',
                'under_review',
                'returned_for_information',
                'resubmitted',
                'approved',
                'rejected',
              ].includes(status)
                ? 'complete'
                : ''
            }`}
          >
            <span>4</span>

            <div>
              <strong>
                Submitted
              </strong>

              <small>
                Sent to NurseLink
              </small>
            </div>
          </div>

          <div
            className={`journey-step ${
              [
                'under_review',
                'returned_for_information',
                'resubmitted',
                'approved',
                'rejected',
              ].includes(status)
                ? 'complete'
                : ''
            }`}
          >
            <span>5</span>

            <div>
              <strong>
                Membership Review
              </strong>

              <small>
                Application evaluation
              </small>
            </div>
          </div>

          <div
            className={`journey-step ${
              status === 'approved'
                ? 'complete'
                : ''
            }`}
          >
            <span>6</span>

            <div>
              <strong>
                NurseLink Member
              </strong>

              <small>
                Member services activated
              </small>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
