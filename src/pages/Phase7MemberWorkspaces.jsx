import { useEffect, useMemo, useState } from 'react'
import { request } from '../lib/api'
import './phase7-member-workspaces-v1300.css'

function dateText(value) {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString()
}

function statusText(value) {
  if (!value) return 'Published'
  return String(value).replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function arrayOf(value) {
  return Array.isArray(value) ? value : []
}

function ProgressBar({ value }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className="p7-progress" aria-label={`Progress ${pct}%`}>
      <span style={{ width: `${pct}%` }} />
    </div>
  )
}

function EmptyState({ children }) {
  return <div className="p7-empty">{children}</div>
}

function ListShell({ eyebrow, title, intro, children, count, onRefresh, loading }) {
  return (
    <div className="p7-member-page">
      <section className="p7-hero">
        <div>
          <span className="p7-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
        <div className="p7-hero-actions">
          <div className="p7-count"><strong>{count}</strong><span>Published</span></div>
          <button type="button" className="p7-secondary" onClick={onRefresh} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </section>
      {children}
    </div>
  )
}

export function Phase7InitiativesPage() {
  const [items, setItems] = useState([])
  const [detail, setDetail] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  async function load() {
    setLoading(true); setError('')
    try {
      const response = await request('/api/organization/initiatives')
      setItems(arrayOf(response?.data))
    } catch (e) {
      setError(e?.message || 'Unable to load programs and initiatives.')
    } finally { setLoading(false) }
  }

  async function openDetail(id) {
    setSelectedId(id); setDetailLoading(true); setError('')
    try {
      const response = await request(`/api/organization/initiatives/${id}`)
      setDetail(response || null)
    } catch (e) {
      setError(e?.message || 'Unable to load initiative details.')
    } finally { setDetailLoading(false) }
  }

  useEffect(() => { load() }, [])

  const statuses = useMemo(() => [...new Set(items.map(x => x.status).filter(Boolean))], [items])
  const visible = useMemo(
    () => statusFilter === 'all' ? items : items.filter(x => x.status === statusFilter),
    [items, statusFilter]
  )

  return (
    <ListShell
      eyebrow="PROGRAMS & PROJECTS"
      title="Programs & Initiatives"
      intro="Follow NurseLink programs, projects, milestones, partners, beneficiary activities and published progress updates."
      count={items.length}
      onRefresh={load}
      loading={loading}
    >
      {error && <div className="p7-message p7-error">{error}</div>}
      <section className="p7-toolbar">
        <label>
          <span>Status</span>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All published</option>
            {statuses.map(s => <option key={s} value={s}>{statusText(s)}</option>)}
          </select>
        </label>
      </section>

      <section className="p7-layout">
        <div className="p7-list">
          {loading && <EmptyState>Loading published programs…</EmptyState>}
          {!loading && !visible.length && <EmptyState>No published programs match this view.</EmptyState>}
          {visible.map(item => {
            const progress = item.progress_percent ?? item.progress ?? 0
            return (
              <button
                type="button"
                className={`p7-list-card ${selectedId === item.id ? 'is-selected' : ''}`}
                key={item.id}
                onClick={() => openDetail(item.id)}
              >
                <div className="p7-card-top">
                  <div>
                    <span className="p7-kicker">{item.type || 'Program / Project'}</span>
                    <h2>{item.title || item.name || `Initiative #${item.id}`}</h2>
                  </div>
                  <span className="p7-status">{statusText(item.status)}</span>
                </div>
                {(item.summary || item.description) && <p>{item.summary || item.description}</p>}
                <ProgressBar value={progress} />
                <div className="p7-meta">
                  <span>{Number(progress) || 0}% progress</span>
                  {item.target_date && <span>Target {dateText(item.target_date)}</span>}
                  {item.published_at && <span>Published {dateText(item.published_at)}</span>}
                </div>
              </button>
            )
          })}
        </div>

        <aside className="p7-detail">
          {!selectedId && <EmptyState>Select a program or initiative to view its published details.</EmptyState>}
          {detailLoading && <EmptyState>Loading details…</EmptyState>}
          {detail && !detailLoading && (
            <>
              <span className="p7-kicker">{detail.type || 'PROGRAM / PROJECT'}</span>
              <h2>{detail.title || detail.name || `Initiative #${detail.id}`}</h2>
              <div className="p7-detail-meta">
                <span className="p7-status">{statusText(detail.status)}</span>
                {detail.target_date && <span>Target: {dateText(detail.target_date)}</span>}
              </div>
              {(detail.description || detail.summary) && <p className="p7-description">{detail.description || detail.summary}</p>}

              <h3>Milestones</h3>
              <div className="p7-stack">
                {arrayOf(detail.milestones).map(m => (
                  <div className="p7-mini" key={m.id || m.title}>
                    <strong>{m.title || m.name || 'Milestone'}</strong>
                    <span>{statusText(m.status)}</span>
                    {m.due_date && <small>Due {dateText(m.due_date)}</small>}
                  </div>
                ))}
                {!arrayOf(detail.milestones).length && <small>No published milestones.</small>}
              </div>

              <h3>Partners & stakeholders</h3>
              <div className="p7-chips">
                {arrayOf(detail.partners).map(p => <span key={p.id || p.name}>{p.name || p.organization_name || 'Partner'}</span>)}
                {!arrayOf(detail.partners).length && <small>No published partners.</small>}
              </div>

              <h3>Beneficiary / impact activity</h3>
              <div className="p7-stack">
                {arrayOf(detail.beneficiaries).slice(0, 8).map(b => (
                  <div className="p7-mini" key={b.id || b.name || b.label}>
                    <strong>{b.name || b.label || b.beneficiary_type || 'Beneficiary record'}</strong>
                    {(b.count ?? b.total) != null && <span>{b.count ?? b.total}</span>}
                  </div>
                ))}
                {!arrayOf(detail.beneficiaries).length && <small>No published beneficiary records.</small>}
              </div>

              <h3>Latest updates</h3>
              <div className="p7-stack">
                {arrayOf(detail.updates).slice(0, 8).map(u => (
                  <div className="p7-mini" key={u.id || u.title}>
                    <strong>{u.title || 'Program update'}</strong>
                    {u.body && <p>{u.body}</p>}
                    {u.published_at && <small>{dateText(u.published_at)}</small>}
                  </div>
                ))}
                {!arrayOf(detail.updates).length && <small>No published updates.</small>}
              </div>
            </>
          )}
        </aside>
      </section>
    </ListShell>
  )
}

export function Phase7PoliciesPage() {
  const [items, setItems] = useState([])
  const [detail, setDetail] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  async function load() {
    setLoading(true); setError('')
    try {
      const response = await request('/api/organization/policies')
      setItems(arrayOf(response?.data))
    } catch (e) {
      setError(e?.message || 'Unable to load policies and advocacy initiatives.')
    } finally { setLoading(false) }
  }

  async function openDetail(id) {
    setSelectedId(id); setDetailLoading(true); setError('')
    try {
      const response = await request(`/api/organization/policies/${id}`)
      setDetail(response || null)
    } catch (e) {
      setError(e?.message || 'Unable to load policy details.')
    } finally { setDetailLoading(false) }
  }

  useEffect(() => { load() }, [])

  const statuses = useMemo(() => [...new Set(items.map(x => x.status).filter(Boolean))], [items])
  const visible = useMemo(
    () => statusFilter === 'all' ? items : items.filter(x => x.status === statusFilter),
    [items, statusFilter]
  )

  return (
    <ListShell
      eyebrow="POLICIES & ADVOCACY"
      title="Policies & Advocacy"
      intro="Track published policy proposals, current status, stage history, stakeholder engagement and advocacy developments affecting Filipino nurses."
      count={items.length}
      onRefresh={load}
      loading={loading}
    >
      {error && <div className="p7-message p7-error">{error}</div>}
      <section className="p7-toolbar">
        <label>
          <span>Status</span>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All published</option>
            {statuses.map(s => <option key={s} value={s}>{statusText(s)}</option>)}
          </select>
        </label>
      </section>

      <section className="p7-layout">
        <div className="p7-list">
          {loading && <EmptyState>Loading published policies…</EmptyState>}
          {!loading && !visible.length && <EmptyState>No published policies match this view.</EmptyState>}
          {visible.map(item => (
            <button
              type="button"
              className={`p7-list-card ${selectedId === item.id ? 'is-selected' : ''}`}
              key={item.id}
              onClick={() => openDetail(item.id)}
            >
              <div className="p7-card-top">
                <div>
                  <span className="p7-kicker">{item.policy_no || 'POLICY / ADVOCACY'}</span>
                  <h2>{item.title || `Policy #${item.id}`}</h2>
                </div>
                <span className="p7-status">{statusText(item.status)}</span>
              </div>
              {(item.summary || item.description || item.objective) && <p>{item.summary || item.description || item.objective}</p>}
              <div className="p7-meta">
                {item.published_at && <span>Published {dateText(item.published_at)}</span>}
                {item.updated_at && <span>Updated {dateText(item.updated_at)}</span>}
              </div>
            </button>
          ))}
        </div>

        <aside className="p7-detail">
          {!selectedId && <EmptyState>Select a policy to view its published workflow and stakeholder details.</EmptyState>}
          {detailLoading && <EmptyState>Loading details…</EmptyState>}
          {detail && !detailLoading && (
            <>
              <span className="p7-kicker">{detail.policy_no || 'POLICY / ADVOCACY'}</span>
              <h2>{detail.title || `Policy #${detail.id}`}</h2>
              <div className="p7-detail-meta">
                <span className="p7-status">{statusText(detail.status)}</span>
                {detail.published_at && <span>Published: {dateText(detail.published_at)}</span>}
              </div>
              {(detail.description || detail.summary || detail.objective) &&
                <p className="p7-description">{detail.description || detail.summary || detail.objective}</p>}

              <h3>Status & stage history</h3>
              <div className="p7-timeline">
                {arrayOf(detail.stage_events).concat(arrayOf(detail.stageEvents)).map((event, idx) => (
                  <div className="p7-stage" key={event.id || `${event.status}-${idx}`}>
                    <span />
                    <div>
                      <strong>{statusText(event.status || event.stage || event.to_status)}</strong>
                      {(event.note || event.notes) && <p>{event.note || event.notes}</p>}
                      <small>{dateText(event.occurred_at || event.created_at)}</small>
                    </div>
                  </div>
                ))}
                {!arrayOf(detail.stage_events).length && !arrayOf(detail.stageEvents).length &&
                  <small>No published stage history.</small>}
              </div>

              <h3>Stakeholders</h3>
              <div className="p7-stack">
                {arrayOf(detail.stakeholders).map(s => (
                  <div className="p7-mini" key={s.id || s.name}>
                    <strong>{s.name || 'Stakeholder'}</strong>
                    <span>{s.stakeholder_type || s.position || statusText(s.engagement_status)}</span>
                  </div>
                ))}
                {!arrayOf(detail.stakeholders).length && <small>No published stakeholder records.</small>}
              </div>
            </>
          )}
        </aside>
      </section>
    </ListShell>
  )
}
