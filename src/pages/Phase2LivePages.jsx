import { useEffect, useMemo, useState } from 'react'

const API = () => window.NurseLinkPhase2Final || {}

function unwrap(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

function value(payload) {
  return payload?.data ?? payload ?? null
}

function PageShell({ eyebrow='NurseLink Member Services', title, description, children }) {
  return <div className="page nl-live-page">
    <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div></div>
    {children}
  </div>
}

function State({ loading, error, empty, children }) {
  if (loading) return <div className="nl-phase2-panel"><p>Loading NurseLink data…</p></div>
  if (error) return <div className="nl-phase2-error" role="alert"><strong>Unable to load this service.</strong><div>{error}</div></div>
  if (empty) return <div className="nl-phase2-panel"><p>No records are available yet.</p></div>
  return children
}

function useLoad(loader) {
  const [data,setData]=useState(null), [loading,setLoading]=useState(true), [error,setError]=useState('')
  const reload = async () => { setLoading(true); setError(''); try { setData(await loader()) } catch(e) { setError(e?.message || 'Request failed') } finally { setLoading(false) } }
  useEffect(()=>{ reload() },[])
  return {data,loading,error,reload}
}

export function Phase2JobsPage(){
  const {data,loading,error,reload}=useLoad(()=>API().JobApi.opportunities())
  const jobs=unwrap(data)
  const [busy,setBusy]=useState(null),[notice,setNotice]=useState('')
  async function apply(job){ setBusy(job.id); setNotice(''); try { await API().JobApi.apply({job_opportunity_id:job.id}); setNotice('Application submitted.'); } catch(e){ setNotice(e?.message||'Unable to apply.'); } finally { setBusy(null) } }
  return <PageShell eyebrow="Career & Jobs" title="Job Opportunities" description="Explore verified NurseLink opportunities and apply from your member account.">
    {notice && <div className="nl-phase2-note">{notice}</div>}
    <State loading={loading} error={error} empty={!jobs.length}><div className="nl-live-list">{jobs.map(job=><article className="nl-phase2-panel" key={job.id}>
      <div className="nl-live-card-head"><div><h2>{job.title||'Opportunity'}</h2><p>{job.employer_name||job.partner_organization?.name||'NurseLink partner'}{job.country?` · ${job.country}`:''}</p></div><span className="badge">{job.status||'open'}</span></div>
      {job.description && <p>{job.description}</p>}
      <div className="nl-live-meta"><span>{job.employment_type||'Employment'}</span><span>{job.work_setting||'Work setting not specified'}</span>{job.minimum_experience_years!=null&&<span>{job.minimum_experience_years}+ yrs experience</span>}</div>
      <div className="nl-phase2-actions"><button type="button" className="primary-button" disabled={busy===job.id} onClick={()=>apply(job)}>{busy===job.id?'Applying…':'Apply'}</button>{job.apply_url&&<a className="secondary-button" href={job.apply_url} target="_blank" rel="noreferrer">External details</a>}</div>
    </article>)}</div></State>
  </PageShell>
}

export function Phase2ApplicationsPage(){
  const {data,loading,error}=useLoad(()=>API().JobApi.applications())
  const apps=unwrap(data)
  const [busy,setBusy]=useState(null)
  const [notice,setNotice]=useState('')

  async function withdraw(id){
    if(!window.confirm('Withdraw this job application?')) return
    setBusy(id)
    try {
      await API().JobApi.withdraw(id)
      setNotice('Application withdrawn. Refresh the page to see the latest status.')
    } catch(e){
      setNotice(e?.message||'Unable to withdraw.')
    } finally {
      setBusy(null)
    }
  }

  return <PageShell
    eyebrow="Career & Jobs"
    title="My Applications"
    description="Track applications, review status changes and manage active submissions."
  >
    {notice&&<div className="nl-phase2-note">{notice}</div>}
    <State loading={loading} error={error} empty={false}>
      {apps.length ? (
        <div className="nl-live-list">
          {apps.map(app=><article className="nl-phase2-panel" key={app.id}>
            <div className="nl-live-card-head">
              <div>
                <h2>{app.job_opportunity?.title||app.job?.title||`Application #${app.id}`}</h2>
                <p>{app.job_opportunity?.employer_name||app.job?.employer_name||'NurseLink opportunity'}</p>
              </div>
              <span className="badge">{app.status||'submitted'}</span>
            </div>
            <div className="nl-live-meta">
              {app.submitted_at&&<span>Submitted {new Date(app.submitted_at).toLocaleDateString()}</span>}
              {app.reviewed_at&&<span>Reviewed {new Date(app.reviewed_at).toLocaleDateString()}</span>}
            </div>
            {!['withdrawn','rejected','hired','closed'].includes(String(app.status||'').toLowerCase())&&
              <div className="nl-phase2-actions">
                <button type="button" className="secondary-button" disabled={busy===app.id} onClick={()=>withdraw(app.id)}>
                  {busy===app.id?'Withdrawing…':'Withdraw application'}
                </button>
              </div>
            }
          </article>)}
        </div>
      ) : null}
    </State>
  </PageShell>
}

export function Phase2QualificationsPage(){
  const [frameworks,setFrameworks]=useState([]),[assessments,setAssessments]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('')
  useEffect(()=>{(async()=>{try{const [f,a]=await Promise.all([API().QualificationApi.frameworks(),API().QualificationApi.assessments()]);setFrameworks(unwrap(f));setAssessments(unwrap(a))}catch(e){setError(e?.message||'Request failed')}finally{setLoading(false)}})()},[])
  return <PageShell eyebrow="Professional Development" title="Qualifications" description="Review NurseLink qualification frameworks and your assessment readiness.">
    <State loading={loading} error={error} empty={!frameworks.length&&!assessments.length}><>
      <div className="nl-live-summary"><div className="nl-phase2-panel"><strong>{frameworks.length}</strong><span>Frameworks</span></div><div className="nl-phase2-panel"><strong>{assessments.length}</strong><span>Assessments</span></div></div>
      {!!assessments.length&&<div className="nl-live-list"><h2>Your assessments</h2>{assessments.map(a=><article className="nl-phase2-panel" key={a.id}><div className="nl-live-card-head"><h3>{a.framework?.name||a.framework_name||'Qualification assessment'}</h3><span className="badge">{a.status||'draft'}</span></div><p>Readiness: {a.readiness_score??0}% {a.readiness_label?`· ${a.readiness_label}`:''}</p></article>)}</div>}
      {!!frameworks.length&&<div className="nl-live-list"><h2>Available frameworks</h2>{frameworks.map(f=><article className="nl-phase2-panel" key={f.id}><h3>{f.name||f.code}</h3><p>{f.description||`${f.jurisdiction||'NurseLink'} qualification framework`}</p><div className="nl-live-meta"><span>{f.version_label||'Current version'}</span><span>{f.level_count||0} levels</span></div></article>)}</div>}
    </></State>
  </PageShell>
}

function collectDocuments(obj, out=[], seen=new Set()) {
  if (!obj || typeof obj!=='object' || seen.has(obj)) return out
  seen.add(obj)
  if (Array.isArray(obj)) { obj.forEach(x=>collectDocuments(x,out,seen)); return out }
  const looksLikeDoc = ('original_name' in obj || 'document_type' in obj || 'mime_type' in obj) && ('id' in obj || 'path' in obj || 'storage_path' in obj)
  if (looksLikeDoc) out.push(obj)
  Object.values(obj).forEach(v=>collectDocuments(v,out,seen))
  return out
}

export function Phase2DocumentsPage(){
  const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('')
  useEffect(()=>{(async()=>{try{const [cred,app]=await Promise.allSettled([API().CredentialApi.dashboard(),API().ApplicationApi.get()]);setData({cred:cred.status==='fulfilled'?cred.value:null,app:app.status==='fulfilled'?app.value:null})}catch(e){setError(e?.message||'Request failed')}finally{setLoading(false)}})()},[])
  const docs=useMemo(()=>collectDocuments(data||[]).filter((d,i,a)=>a.findIndex(x=>String(x.id??x.path??x.storage_path)===String(d.id??d.path??d.storage_path))===i),[data])
  return <PageShell eyebrow="Professional Records" title="Documents" description="View evidence associated with your application and credentials.">
    <State loading={loading} error={error} empty={!docs.length}><div className="nl-live-list">{docs.map((d,i)=><article className="nl-phase2-panel" key={d.id||d.path||i}><div className="nl-live-card-head"><div><h2>{d.title||d.original_name||d.document_type||'Document'}</h2><p>{d.document_type||d.category||d.mime_type||'Evidence'}</p></div><span className="badge">{d.security_status||d.upload_status||d.verification_status||'recorded'}</span></div>{d.expires_on&&<p>Expires: {d.expires_on}</p>}</article>)}</div></State>
    {!loading&&!error&&!docs.length&&<div className="nl-phase2-note">No document collection was exposed by the verified member-facing API responses. Upload and manage application evidence in Smart Registration and credential evidence in Credentials.</div>}
  </PageShell>
}

export function Phase2LearningPage(){
  const {data,loading,error}=useLoad(()=>API().EventsApi.list())
  const events=unwrap(data)
  return <PageShell eyebrow="Professional Learning" title="Learning" description="Discover NurseLink events that can support your continuing professional development.">
    <div className="nl-phase2-note">The production route inventory does not expose a standalone member learning-records endpoint, so this screen shows verified event-based learning opportunities without fabricating record data.</div>
    <State loading={loading} error={error} empty={!events.length}><div className="nl-live-list">{events.map(e=><article className="nl-phase2-panel" key={e.id}><div className="nl-live-card-head"><div><h2>{e.title||'NurseLink Event'}</h2><p>{e.event_type||e.delivery_mode||e.format||'Learning activity'}</p></div><span className="badge">{e.status||'scheduled'}</span></div><div className="nl-live-meta">{(e.starts_at)&&<span>{new Date(e.starts_at).toLocaleString()}</span>}{(e.learning_hours||e.cpd_units_claimed)&&<span>{e.learning_hours||e.cpd_units_claimed} learning/CPD units</span>}</div></article>)}</div></State>
  </PageShell>
}

export function Phase2MessagesPage(){
  const {data,loading,error,reload}=useLoad(()=>API().NotificationApi.list())
  const items=unwrap(data)
  const [busy,setBusy]=useState(false)
  async function readAll(){setBusy(true);try{await API().NotificationApi.markAllRead();await reload()}finally{setBusy(false)}}
  return <PageShell eyebrow="Communications" title="Messages" description="Review NurseLink notices, updates and action-required notifications.">
    <div className="nl-phase2-actions"><button type="button" className="secondary-button" onClick={readAll} disabled={busy}>{busy?'Updating…':'Mark all as read'}</button></div>
    <State loading={loading} error={error} empty={!items.length}><div className="nl-live-list">{items.map(n=><article className={`nl-phase2-panel ${!n.read_at?'is-unread':''}`} key={n.id}><div className="nl-live-card-head"><div><h2>{n.title||n.subject||'NurseLink update'}</h2><p>{n.message||n.body||''}</p></div><span className="badge">{n.severity||n.priority||(!n.read_at?'New':'Read')}</span></div>{n.action_url&&<a className="secondary-button" href={n.action_url}>Open action</a>}</article>)}</div></State>
  </PageShell>
}

export function Phase2EventsPage(){
  const {data,loading,error,reload}=useLoad(()=>API().EventsApi.list())
  const events=unwrap(data)
  const [busy,setBusy]=useState(null)
  const [notice,setNotice]=useState('')

  async function register(id){
    setBusy(id)
    setNotice('')
    try {
      await API().EventsApi.register(id)
      setNotice('Registration submitted.')
      await reload()
    } catch(e){
      setNotice(e?.message||'Unable to register.')
    } finally {
      setBusy(null)
    }
  }

  return <PageShell
    eyebrow="Community & Learning"
    title="Events"
    description="View NurseLink events and register for available activities."
  >
    {notice&&<div className="nl-phase2-note">{notice}</div>}
    <State loading={loading} error={error} empty={false}>
      {events.length ? (
        <div className="nl-live-list">
          {events.map(e=><article className="nl-phase2-panel" key={e.id}>
            <div className="nl-live-card-head">
              <div>
                <h2>{e.title||'Event'}</h2>
                <p>{e.venue_name||e.venue||e.delivery_mode||e.format||'NurseLink event'}</p>
              </div>
              <span className="badge">{e.status||'scheduled'}</span>
            </div>
            {e.description&&<p>{e.description}</p>}
            <div className="nl-live-meta">
              {e.starts_at&&<span>{new Date(e.starts_at).toLocaleString()}</span>}
              {e.capacity!=null&&<span>Capacity {e.capacity}</span>}
            </div>
            <div className="nl-phase2-actions">
              <button type="button" className="primary-button" disabled={busy===e.id} onClick={()=>register(e.id)}>
                {busy===e.id?'Registering…':'Register'}
              </button>
            </div>
          </article>)}
        </div>
      ) : (
        <div className="nl-phase2-panel nl-event-empty-v330">
          <div className="nl-empty-icon" aria-hidden="true">◫</div>
          <h2>No upcoming events yet</h2>
          <p>New NurseLink training activities, webinars, workshops and community events will appear here when they are published.</p>
        </div>
      )}
    </State>
  </PageShell>
}

