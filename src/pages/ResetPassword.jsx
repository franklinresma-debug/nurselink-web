import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { resetPassword } from '../lib/api'

function errorMessage(error) {
  if (error?.data?.errors) {
    const first = Object.values(error.data.errors)[0]
    if (Array.isArray(first) && first.length) return first[0]
  }

  return error?.data?.message || error?.message || 'Unable to replace your password.'
}

export default function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const token = params.get('token') || ''
  const email = params.get('email') || ''
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!token || !email) {
      setError('This password-reset link is incomplete or invalid.')
      return
    }

    if (password !== confirmation) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)

    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: confirmation,
      })
      navigate('/login', { replace: true })
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <div className="brand-mark">NL</div>
        <h1>NurseLink</h1>
        <p>Choose a new password for your NurseLink account.</p>
      </div>

      <div className="auth-card">
        <div className="eyebrow">Account Recovery</div>
        <h2>Replace your password</h2>
        <p>{email || 'Open the complete link from your reset email.'}</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            New password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength="8" required />
          </label>

          <label>
            Confirm new password
            <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" minLength="8" required />
          </label>

          <button type="submit" className="primary-button full" disabled={submitting || !token || !email}>
            {submitting ? 'Replacing password...' : 'Replace password'}
          </button>
        </form>
      </div>
    </div>
  )
}
