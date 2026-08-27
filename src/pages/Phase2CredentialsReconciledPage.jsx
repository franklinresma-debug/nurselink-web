import { useEffect, useState } from 'react'

function collectCredentialLike(value, out = [], seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return out
  seen.add(value)
  if (Array.isArray(value)) {
    value.forEach((item) => collectCredentialLike(item, out, seen))
    return out
  }

  const keys = Object.keys(value).map((key) => key.toLowerCase())
  const looksCredential =
    (keys.includes('credential_type') ||
      keys.includes('license_number') ||
      keys.includes('credential_number') ||
      keys.includes('issuing_authority')) &&
    (keys.includes('id') ||
      keys.includes('uuid') ||
      keys.includes('title') ||
      keys.includes('name'))

  if (looksCredential) out.push(value)
  Object.values(value).forEach((item) => collectCredentialLike(item, out, seen))
  return out
}

function uniqueCredentials(items) {
  const seen = new Set()
  return items.filter((item) => {
    const key = String(
      item?.id ??
      item?.uuid ??
      item?.credential_number ??
      item?.license_number ??
      item?.title ??
      item?.name ??
      JSON.stringify(item)
    )
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export default function Phase2CredentialsReconciledPage({ children }) {
  const [applicationCredentials, setApplicationCredentials] = useState([])
  const [professionalCount, setProfessionalCount] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true

    ;(async () => {
      try {
        const api = window.NurseLinkPhase2Final
        const [applicationResult, professionalResult] = await Promise.allSettled([
          api?.ApplicationApi?.get?.(),
          api?.CredentialApi?.list?.(),
        ])

        if (!alive) return

        if (applicationResult.status === 'fulfilled') {
          setApplicationCredentials(
            uniqueCredentials(
              collectCredentialLike(applicationResult.value)
            )
          )
        }

        if (professionalResult.status === 'fulfilled') {
          const payload = professionalResult.value
          const list = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.items)
                ? payload.items
                : []
          setProfessionalCount(list.length)
        }
      } finally {
        if (alive) setLoaded(true)
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  const appCount = applicationCredentials.length
  const showContext =
    loaded && (appCount > 0 || professionalCount !== null)

  return (
    <div className="nl-credential-reconcile-v330">
      {showContext && (
        <section
          className="nl-phase2-panel nl-credential-context"
          aria-label="Credential record context"
        >
          <div>
            <div className="eyebrow">Credential Record Context</div>
            <h1>Your NurseLink credential records</h1>
            <p>
              Application credentials and post-approval professional
              credentials are maintained as separate record sets.
            </p>
          </div>

          <div className="nl-credential-context-stats">
            <div>
              <strong>{appCount}</strong>
              <span>
                Application credential{appCount === 1 ? '' : 's'}
              </span>
            </div>

            <div>
              <strong>{professionalCount ?? '—'}</strong>
              <span>
                Professional credential
                {professionalCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {appCount > 0 && professionalCount === 0 && (
            <div className="nl-phase2-note">
              Your Smart Registration credentials are already recorded.
              The professional credential workspace below starts separately
              so you can maintain post-approval licenses, certificates and
              renewals without duplicating application evidence.
            </div>
          )}
        </section>
      )}

      {children}
    </div>
  )
}
