import React, { useEffect, useMemo, useState } from 'react'
import './welfare-crisis-canonical-v6490.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.amsertech.com'

const demoOverview = {
  assisted: '7,125',
  resolved: '3,482',
  responseTime: '2.6 hrs',
  assistance: '₱128.6M',
}

const demoAnnouncements = [
  { type: 'ADVISORY', title: 'Middle East Situation Update', body: 'NurseLink welfare monitoring remains ready to surface verified official advisories and assistance information.', date: 'Demo' },
  { type: 'NEWS', title: 'AKSYON Fund Assistance Information', body: 'Review eligibility, documentary requirements and official DMW channels before relying on assistance figures or program rules.', date: 'Demo' },
  { type: 'REMINDER', title: 'Keep travel and employment documents accessible', body: 'Maintain secure copies of your passport, visa, contract, IDs and emergency contacts.', date: 'Demo' },
]

const concerns = [
  'Abuse, Harassment & Exploitation',
  'Passport, Documents & Visa Issues',
  'Salary, Benefits & Contract Issues',
  'Illegal Recruitment & Trafficking',
  'Missing Persons & Lost Contact',
  'Health, Medical & Insurance Issues',
]

const programs = [
  ['AKSYON Fund', 'Financial assistance information for OFWs in distress'],
  ['Reintegration & Livelihood', 'Support pathways for reintegration and livelihood'],
  ['Legal Assistance', 'Guidance and referral for legal concerns'],
  ['Education & Scholarship', 'Programs for eligible OFWs and dependents'],
]

const quickAccess = [
  ['crisis', 'Report a Crisis / Incident', 'Start a confidential incident report'],
  ['location', 'Find Help Near You', 'Embassies, shelters and partner support'],
  ['travel', 'Travel & Repatriation Help', 'Assistance with safe return and travel'],
  ['money', 'Financial Assistance', 'Programs and eligibility information'],
  ['legal', 'Legal Assistance', 'Know your rights and available referrals'],
  ['mental', 'Mental Health Support', 'Counselling and psychosocial resources'],
]

function Icon({ name }) {
  const paths = {
    crisis: ['M12 3 2.8 20h18.4L12 3Z', 'M12 9v4', 'M12 17h.01'],
    location: ['M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z', 'M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'],
    travel: ['M3 12h18', 'm14 7 5 5-5 5', 'M6 5v14'],
    money: ['M3 6h18v12H3z', 'M7 12h10', 'M12 9v6'],
    legal: ['M12 3v18', 'M5 7h14', 'M7 7l-3 6h6L7 7Z', 'M17 7l-3 6h6l-3-6Z'],
    mental: ['M9 4a4 4 0 0 0-4 4v2a4 4 0 0 0 2 3.5V20h5v-5', 'M15 4a4 4 0 0 1 4 4v2a4 4 0 0 1-2 3.5V20h-5'],
    people: ['M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M16 11a3 3 0 1 0 0-6', 'M3 20a5 5 0 0 1 10 0', 'M13 20a5 5 0 0 1 8-4'],
    check: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'm8 12 2.5 2.5L16 9'],
    clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3 2'],
    heart: ['M12 20S4 15 4 9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 6-6 11-6 11Z'],
    phone: ['M6 3h4l2 5-3 2a15 15 0 0 0 5 5l2-3 5 2v4c0 1-1 2-2 2A17 17 0 0 1 4 5c0-1 1-2 2-2Z'],
    shield: ['M12 3 20 6v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z', 'm9 12 2 2 4-5'],
    bell: ['M6 9a6 6 0 0 1 12 0v5l2 3H4l2-3z', 'M10 20h4'],
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true">{(paths[name] || paths.shield).map(d => <path key={d} d={d}/>)}</svg>
}

function safeArray(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.alerts)) return payload.alerts
  if (Array.isArray(payload?.updates)) return payload.updates
  if (Array.isArray(payload?.locations)) return payload.locations
  return []
}

export default function Phase6WelfareCrisisPage() {
  const [overview, setOverview] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [updates, setUpdates] = useState([])
  const [safeLocations, setSafeLocations] = useState([])
  const [sourceMode, setSourceMode] = useState('seeded-demo')
  const [reportOpen, setReportOpen] = useState(false)
  const [reportStep, setReportStep] = useState(1)
  const [report, setReport] = useState({ type: '', country: '', date: '', description: '', contact: '' })
  const [panicBusy, setPanicBusy] = useState(false)
  const [panicResult, setPanicResult] = useState('')

  useEffect(() => {
    let active = true
    async function get(path) {
      const response = await fetch(`${API_URL}${path}`, { credentials: 'include', headers: { Accept: 'application/json' } })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.json()
    }
    Promise.allSettled([
      get('/api/welfare/overview'),
      get('/api/welfare/alerts'),
      get('/api/welfare/crisis-updates'),
      get('/api/welfare/safe-locations'),
    ]).then(results => {
      if (!active) return
      const [ov, al, up, sl] = results
      if (ov.status === 'fulfilled') setOverview(ov.value?.data || ov.value)
      if (al.status === 'fulfilled') setAlerts(safeArray(al.value))
      if (up.status === 'fulfilled') setUpdates(safeArray(up.value))
      if (sl.status === 'fulfilled') setSafeLocations(safeArray(sl.value))
      const live = results.some(r => r.status === 'fulfilled')
      setSourceMode(live ? 'live' : 'seeded-demo')
    })
    return () => { active = false }
  }, [])

  const stats = useMemo(() => ({
    assisted: overview?.assisted ?? overview?.members_assisted ?? demoOverview.assisted,
    resolved: overview?.resolved ?? overview?.cases_resolved ?? demoOverview.resolved,
    responseTime: overview?.average_response_time ?? overview?.response_time ?? demoOverview.responseTime,
    assistance: overview?.assistance_provided ?? overview?.assistance_amount ?? demoOverview.assistance,
  }), [overview])

  const announcementRows = updates.length
    ? updates.slice(0, 3).map((u, i) => ({
        type: u.type || u.category || 'UPDATE',
        title: u.title || u.name || `Crisis update ${i + 1}`,
        body: u.message || u.summary || u.description || 'Open for details.',
        date: u.published_at || u.updated_at || '',
      }))
    : demoAnnouncements

  async function sendPanicAlert() {
    if (!window.confirm('Send an urgent NurseLink welfare alert? Use only when immediate assistance is needed.')) return
    setPanicBusy(true)
    setPanicResult('')
    try {
      const response = await fetch(`${API_URL}/api/welfare/panic-alerts`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'member_welfare_page', message: 'Member requested urgent welfare assistance.' }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      setPanicResult('Urgent alert sent. Keep your phone available for follow-up.')
    } catch {
      setPanicResult('The online alert could not be confirmed. Use an official emergency or welfare contact channel immediately.')
    } finally {
      setPanicBusy(false)
    }
  }

  function submitDemoReport(e) {
    e.preventDefault()
    if (reportStep < 3) {
      setReportStep(reportStep + 1)
      return
    }
    setReportOpen(false)
    setReportStep(1)
    setReport({ type: '', country: '', date: '', description: '', contact: '' })
    window.alert('Demo report captured in the page preview. A production case-submission API must be connected before this form is used for official reporting.')
  }

  return (
    <main className="nwc-page" data-nurselink-page="welfare-crisis-canonical-v6490">
      <header className="nwc-heading">
        <div>
          <h1>Welfare &amp; Crisis Support</h1>
          <p>You are not alone. Get help, guidance, and support wherever you are.</p>
        </div>
        <div className={`nwc-source ${sourceMode === 'live' ? 'is-live' : ''}`}><span></span>{sourceMode === 'live' ? 'Live welfare services' : 'Seeded demo mode'}</div>
      </header>

      <section className="nwc-top-grid">
        <article className="nwc-emergency">
          <div>
            <strong>IN AN EMERGENCY? Get immediate help now.</strong>
            <p>If you are in danger or need urgent assistance, use the competent local emergency service and official government welfare channels.</p>
            <div className="nwc-hotline"><Icon name="phone"/><div><b>1348</b><span>DMW hotline reference</span><small>Availability and dialing rules must be confirmed from official DMW information.</small></div></div>
            <div className="nwc-emergency-actions">
              <button type="button" onClick={sendPanicAlert} disabled={panicBusy}><Icon name="bell"/>{panicBusy ? 'Sending…' : 'Send Urgent NurseLink Alert'}</button>
              <button type="button" className="secondary" onClick={() => setReportOpen(true)}>Report Crisis / Incident</button>
            </div>
            {panicResult && <div className="nwc-panic-result">{panicResult}</div>}
          </div>
          <div className="nwc-emergency-art" aria-hidden="true"><div className="headset">☎</div><div className="shield">+</div></div>
        </article>

        <article className="nwc-card nwc-quick">
          <div className="nwc-card-title"><div><span>SUPPORT TOOLS</span><h2>Quick Access</h2></div></div>
          <div className="nwc-quick-grid">
            {quickAccess.map(([icon, title, sub]) => (
              <button key={title} type="button" onClick={() => title.startsWith('Report') && setReportOpen(true)}>
                <i><Icon name={icon}/></i><span><strong>{title}</strong><small>{sub}</small></span>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="nwc-overview">
        <h2>Welfare Support Overview</h2>
        <div className="nwc-stats">
          <div><i><Icon name="people"/></i><strong>{stats.assisted}</strong><span>OFWs / Members Assisted</span><small>{sourceMode === 'live' ? 'Live overview data' : 'Illustrative demo metric'}</small></div>
          <div><i><Icon name="check"/></i><strong>{stats.resolved}</strong><span>Cases Resolved</span><small>{sourceMode === 'live' ? 'Live overview data' : 'Illustrative demo metric'}</small></div>
          <div><i><Icon name="clock"/></i><strong>{stats.responseTime}</strong><span>Average Response Time</span><small>{sourceMode === 'live' ? 'Live overview data' : 'Illustrative demo metric'}</small></div>
          <div><i><Icon name="heart"/></i><strong>{stats.assistance}</strong><span>Assistance Provided</span><small>{sourceMode === 'live' ? 'Live overview data' : 'Illustrative demo metric'}</small></div>
        </div>
      </section>

      <section className="nwc-main-grid">
        <article className="nwc-card">
          <div className="nwc-card-title"><div><span>HELP TOPICS</span><h2>Common Concerns</h2></div></div>
          <div className="nwc-concerns">{concerns.map((x, i) => <button type="button" key={x}><i>{i+1}</i><span>{x}</span></button>)}</div>
        </article>

        <article className="nwc-card">
          <div className="nwc-card-title"><div><span>VERIFIED INFORMATION</span><h2>Latest Announcements</h2></div><button type="button">View all</button></div>
          <div className="nwc-announcements">
            {announcementRows.map((a, i) => <div key={a.title + i}><b className={`t${i%3}`}>{a.type}</b><section><strong>{a.title}</strong><p>{a.body}</p><small>{a.date}</small></section></div>)}
          </div>
        </article>

        <article className="nwc-card">
          <div className="nwc-card-title"><div><span>ASSISTANCE</span><h2>Programs &amp; Assistance</h2></div><button type="button">View all</button></div>
          <div className="nwc-programs">
            {programs.map(([title, sub], i) => <div key={title}><i><Icon name={['money','travel','legal','people'][i]}/></i><span><strong>{title}</strong><small>{sub}</small></span><b>Active</b></div>)}
          </div>
        </article>
      </section>

      <section className="nwc-support-grid">
        <article className="nwc-card">
          <div className="nwc-card-title"><div><span>SAFETY</span><h2>Safety Reminders</h2></div></div>
          <ul>
            <li>Share your location with someone you trust when appropriate.</li>
            <li>Keep secure copies of important travel and employment documents.</li>
            <li>Verify emergency numbers and official contacts for your current country.</li>
            <li>Do not rely on unverified social media posts during a crisis.</li>
          </ul>
        </article>
        <article className="nwc-card">
          <div className="nwc-card-title"><div><span>NEARBY SUPPORT</span><h2>Safe Locations</h2></div><b>{safeLocations.length || 'Demo'}</b></div>
          <p className="nwc-muted">{safeLocations.length ? 'Safe-location records are available from the live welfare service.' : 'Seeded mode: connect verified embassy, shelter, hospital and partner-location records here.'}</p>
          <button className="nwc-outline" type="button">Find Help Near You</button>
        </article>
        <article className="nwc-card">
          <div className="nwc-card-title"><div><span>ACTIVE SIGNALS</span><h2>Crisis Alerts</h2></div><b>{alerts.length}</b></div>
          <p className="nwc-muted">{alerts.length ? 'Active welfare alerts are available for your account.' : 'No live member alerts were returned. Continue to monitor verified official advisories.'}</p>
        </article>
      </section>

      <div className="nwc-disclaimer"><Icon name="shield"/><div><strong>Important</strong><p>Welfare information in seeded demo mode is illustrative. Emergency numbers, assistance eligibility, program amounts, government advisories and contact channels can change. Confirm critical information with the competent authority before acting.</p></div></div>

      {reportOpen && (
        <div className="nwc-modal-backdrop" onClick={() => setReportOpen(false)}>
          <form className="nwc-modal" onSubmit={submitDemoReport} onClick={e => e.stopPropagation()}>
            <button type="button" className="close" onClick={() => setReportOpen(false)}>×</button>
            <span>CONFIDENTIAL SUPPORT INTAKE • DEMO</span>
            <h2>Report a Crisis / Incident</h2>
            <p>This interface demonstrates the intended intake workflow. It does not submit an official welfare case until a production case API is connected.</p>
            <div className="nwc-stepper"><b className={reportStep>=1?'on':''}>1 Incident</b><b className={reportStep>=2?'on':''}>2 Contact</b><b className={reportStep>=3?'on':''}>3 Review</b></div>
            {reportStep === 1 && <>
              <label>Type of incident<select required value={report.type} onChange={e=>setReport({...report,type:e.target.value})}><option value="">Select incident type</option>{concerns.map(x=><option key={x}>{x}</option>)}</select></label>
              <label>Country / location<input required value={report.country} onChange={e=>setReport({...report,country:e.target.value})} placeholder="Country or location"/></label>
              <label>Date of incident<input type="date" value={report.date} onChange={e=>setReport({...report,date:e.target.value})}/></label>
              <label>Description<textarea required maxLength="1000" value={report.description} onChange={e=>setReport({...report,description:e.target.value})} placeholder="Describe what happened and what help is needed."/></label>
            </>}
            {reportStep === 2 && <label>Preferred contact information<input required value={report.contact} onChange={e=>setReport({...report,contact:e.target.value})} placeholder="Phone, email, or secure contact method"/></label>}
            {reportStep === 3 && <div className="nwc-review"><strong>Review demo report</strong><p><b>Incident:</b> {report.type}</p><p><b>Location:</b> {report.country}</p><p><b>Description:</b> {report.description}</p><p><b>Contact:</b> {report.contact}</p></div>}
            <div className="nwc-modal-actions">{reportStep>1 && <button type="button" className="secondary" onClick={()=>setReportStep(reportStep-1)}>Back</button>}<button type="submit">{reportStep<3?'Next':'Finish Demo'}</button></div>
          </form>
        </div>
      )}
    </main>
  )
}
