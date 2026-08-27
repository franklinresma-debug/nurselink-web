import React, { useEffect, useMemo, useState } from 'react'
import './policies-advocacy-intelligence-v6480.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.amsertech.com'

const seededPolicies = [
  {
    id: 'de-foreign-qualifications-2024',
    country: 'Germany',
    flag: '🇩🇪',
    region: 'Europe',
    category: 'Recognition & Registration',
    title: 'Recognition of Foreign Nursing Qualifications Act (BQFG) – Update 2024',
    summary: 'Simplified recognition pathways, qualification assessment updates and faster administrative processing for selected foreign-trained professionals.',
    status: 'Active',
    impact: 'Positive Opportunity',
    effective_date: '18 Dec 2023',
    updated_at: '20 May 2024',
    source_authority: 'Competent German federal / state authorities',
    source_url: '',
    last_verified: 'Demo record • Source verification required before production use',
    tags: ['Licensing & Recognition', 'EU / Germany', 'Registration'],
    lmi: true,
    explainer: 'What changed, who may benefit, and what documents are commonly required.',
  },
  {
    id: 'sa-localization-phase2',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    region: 'Middle East',
    category: 'Workforce Localization',
    title: 'Health Sector Nationalization Program – Phase 2',
    summary: 'Localization targets may affect recruitment demand by facility type, region, occupation and specialty. Nurses should monitor employer-specific workforce requirements.',
    status: 'Monitoring',
    impact: 'Monitor',
    effective_date: '01 Jan 2025',
    updated_at: '16 May 2024',
    source_authority: 'Competent Saudi government / health authorities',
    source_url: '',
    last_verified: 'Demo record • Source verification required before production use',
    tags: ['Localization', 'Vision 2030', 'Nursing Demand'],
    lmi: true,
    explainer: 'How localization targets can influence international nurse hiring and specialty demand.',
  },
  {
    id: 'uk-skilled-worker-healthcare',
    country: 'United Kingdom',
    flag: '🇬🇧',
    region: 'Europe',
    category: 'Migration & Visa',
    title: 'Skilled Worker Visa: Health & Care – Salary Threshold Update',
    summary: 'Monitor visa eligibility, salary thresholds, occupation coding and employer sponsorship requirements that may affect internationally recruited nurses.',
    status: 'Active',
    impact: 'Action Required',
    effective_date: '04 Apr 2024',
    updated_at: '04 Apr 2024',
    source_authority: 'UK Government / competent immigration authority',
    source_url: '',
    last_verified: 'Demo record • Source verification required before production use',
    tags: ['Visa', 'Migration', 'Employer Sponsorship'],
    lmi: true,
    explainer: 'Which salary and sponsorship changes may require action before accepting an offer.',
  },
  {
    id: 'ph-cpd-professional-practice',
    country: 'Philippines',
    flag: '🇵🇭',
    region: 'Philippines',
    category: 'Professional Practice',
    title: 'Continuing Professional Development and Nursing Practice Watch',
    summary: 'Track regulatory guidance, CPD requirements, professional standards, renewal rules and policy developments relevant to registered nurses.',
    status: 'Active',
    impact: 'Informational',
    effective_date: 'Ongoing',
    updated_at: '12 Aug 2026',
    source_authority: 'Competent Philippine professional and regulatory authorities',
    source_url: '',
    last_verified: 'Demo record • Source verification required before production use',
    tags: ['CPD', 'Professional Practice', 'License Renewal'],
    lmi: false,
    explainer: 'What professional-development and renewal changes nurses should watch.',
  },
  {
    id: 'au-skilled-migration-nursing',
    country: 'Australia',
    flag: '🇦🇺',
    region: 'Oceania',
    category: 'Migration & Skills',
    title: 'Skilled Migration and Nursing Occupation Demand Watch',
    summary: 'Monitor occupation lists, registration requirements, state nomination settings and specialty demand signals for internationally educated nurses.',
    status: 'Monitoring',
    impact: 'Positive Opportunity',
    effective_date: 'Ongoing',
    updated_at: '07 Aug 2026',
    source_authority: 'Australian government / competent nursing regulator',
    source_url: '',
    last_verified: 'Demo record • Source verification required before production use',
    tags: ['Migration', 'Registration', 'Skills Shortage'],
    lmi: true,
    explainer: 'How migration and registration signals combine with specialty demand.',
  },
  {
    id: 'ca-ien-licensure',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'North America',
    category: 'Licensure & Mobility',
    title: 'Internationally Educated Nurse Licensure Pathway Watch',
    summary: 'Track provincial licensure modernization, bridging requirements and processing reforms that may influence mobility and hiring timelines.',
    status: 'Monitoring',
    impact: 'Positive Opportunity',
    effective_date: 'Ongoing',
    updated_at: '02 Aug 2026',
    source_authority: 'Provincial regulators / competent authorities',
    source_url: '',
    last_verified: 'Demo record • Source verification required before production use',
    tags: ['IEN', 'Licensure', 'Bridging'],
    lmi: true,
    explainer: 'Which licensure changes may shorten or alter the path to practice.',
  },
  {
    id: 'jp-care-worker-language',
    country: 'Japan',
    flag: '🇯🇵',
    region: 'Asia',
    category: 'Language & Qualification',
    title: 'Language, Qualification and Care Workforce Policy Watch',
    summary: 'Monitor language thresholds, credential recognition, employer programs and healthcare workforce policies relevant to foreign nurses and care professionals.',
    status: 'Monitoring',
    impact: 'Monitor',
    effective_date: 'Ongoing',
    updated_at: '29 Jul 2026',
    source_authority: 'Competent Japanese government / health authorities',
    source_url: '',
    last_verified: 'Demo record • Source verification required before production use',
    tags: ['Language', 'Qualification', 'Care Workforce'],
    lmi: true,
    explainer: 'What language and qualification factors may affect access to nursing roles.',
  },
  {
    id: 'ae-emiratization-healthcare',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    region: 'Middle East',
    category: 'Workforce Localization',
    title: 'Healthcare Emiratization and International Recruitment Watch',
    summary: 'Track localization targets, licensing changes, facility demand and specialty-specific recruitment signals across the UAE healthcare market.',
    status: 'Monitoring',
    impact: 'Possible Demand Reduction',
    effective_date: 'Ongoing',
    updated_at: '25 Jul 2026',
    source_authority: 'Competent UAE authorities',
    source_url: '',
    last_verified: 'Demo record • Source verification required before production use',
    tags: ['Emiratization', 'Licensing', 'Recruitment'],
    lmi: true,
    explainer: 'Where localization may reduce general demand while specialty shortages remain.',
  },
]

const advocacyPriorities = [
  { title: 'Fair and Transparent Recognition of Foreign Qualifications', status: 'Active' },
  { title: 'Ethical International Recruitment and No Exploitative Fees', status: 'Active' },
  { title: 'Safe Working Conditions, Welfare and Professional Protection', status: 'Active' },
  { title: 'Evidence-Based Workforce Planning and Specialty Development', status: 'Active' },
]

const explainers = [
  'Localization: What Nurses Need to Know',
  'UK Health & Care Visa: What Nurses Need to Know',
  'Germany’s Recognition Law (BQFG) in Plain Language',
  'Why a “Nursing Shortage” Can Still Coexist With Localization',
]

function normalizeCollection(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.policies)) return payload.policies
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  return []
}

function normalizePolicy(item, index) {
  const rawTags = item?.tags || item?.topics || item?.keywords || []
  const tags = Array.isArray(rawTags)
    ? rawTags.map((tag) => typeof tag === 'string' ? tag : tag?.name).filter(Boolean)
    : []

  return {
    id: item?.id ?? item?.uuid ?? `policy-${index}`,
    country: item?.country?.name || item?.country || item?.jurisdiction || 'Global / Unspecified',
    flag: item?.flag || '🌐',
    region: item?.region || '',
    category: item?.category?.name || item?.category || item?.policy_type || 'Policy',
    title: item?.title || item?.name || 'Policy update',
    summary: item?.summary || item?.description || item?.excerpt || 'Open this policy record for details.',
    status: item?.status || item?.workflow_status || 'Published',
    impact: item?.impact || item?.impact_label || item?.member_impact || 'Informational',
    effective_date: item?.effective_date || item?.effective_at || item?.published_at || 'See source',
    updated_at: item?.updated_at || item?.verified_at || item?.published_at || 'Current',
    source_authority: item?.source_authority || item?.authority || item?.issuer || 'Official source',
    source_url: item?.source_url || item?.official_url || item?.url || '',
    last_verified: item?.last_verified || item?.verified_at || item?.updated_at || 'Current record',
    tags,
    lmi: Boolean(item?.lmi || item?.labor_market_intelligence || item?.demand_signal),
    explainer: item?.explainer || 'Review the official source and NurseLink policy notes for practical implications.',
  }
}

function impactClass(value = '') {
  const text = String(value).toLowerCase()
  if (text.includes('positive') || text.includes('opportun')) return 'is-positive'
  if (text.includes('possible demand') || text.includes('reduction')) return 'is-risk'
  if (text.includes('action')) return 'is-action'
  if (text.includes('monitor')) return 'is-monitor'
  return 'is-info'
}

function Icon({ name }) {
  const paths = {
    policy: ['M7 3h10l3 3v15H7z', 'M17 3v4h4', 'M10 11h7', 'M10 15h7'],
    radar: ['M12 12 20 7', 'M12 5a7 7 0 1 0 7 7', 'M12 8a4 4 0 1 0 4 4'],
    globe: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M3 12h18', 'M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21', 'M12 3C9.8 5.5 8.7 8.5 8.7 12S9.8 18.5 12 21'],
    bell: ['M6 9a6 6 0 0 1 12 0v5l2 3H4l2-3z', 'M10 20h4'],
    filter: ['M4 5h16', 'M7 12h10', 'M10 19h4'],
    arrow: ['M5 12h14', 'm14 6 6 6-6 6'],
    check: ['m5 12 4 4L19 6'],
    source: ['M7 3h10l3 3v15H7z', 'M17 3v4h4', 'M10 11h7'],
    megaphone: ['M3 11v2l11 4V7L3 11Z', 'M14 9c3 0 5-2 7-4v14c-2-2-4-4-7-4', 'M6 14l1.5 6h4L10 15'],
    chart: ['M4 19V9', 'M10 19V5', 'M16 19v-7', 'M22 19V3'],
    bookmark: ['M6 3h12v18l-6-4-6 4z'],
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {(paths[name] || paths.policy).map((d) => <path key={d} d={d} />)}
    </svg>
  )
}

function StatCard({ icon, value, label, note }) {
  return (
    <article className="npa-stat-card">
      <div className="npa-stat-icon"><Icon name={icon} /></div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
        <small>{note}</small>
      </div>
    </article>
  )
}

export default function PoliciesAdvocacyIntelligencePage() {
  const [remotePolicies, setRemotePolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('All countries')
  const [impact, setImpact] = useState('All impacts')
  const [category, setCategory] = useState('All policy types')
  const [selected, setSelected] = useState(null)
  const [sourceMode, setSourceMode] = useState('seeded-demo')
  const [saved, setSaved] = useState(() => new Set())

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const response = await fetch(`${API_URL}/api/organization/policies`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const payload = await response.json()
        if (!active) return
        const normalized = normalizeCollection(payload).map(normalizePolicy)
        setRemotePolicies(normalized)
        setSourceMode(normalized.length ? 'live' : 'seeded-demo')
      } catch {
        if (active) setSourceMode('seeded-demo')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const policies = remotePolicies.length ? remotePolicies : seededPolicies
  const countries = useMemo(
    () => ['All countries', ...Array.from(new Set(policies.map((p) => p.country))).sort()],
    [policies]
  )
  const categories = useMemo(
    () => ['All policy types', ...Array.from(new Set(policies.map((p) => p.category))).sort()],
    [policies]
  )

  const counts = useMemo(() => {
    const positive = policies.filter((p) => impactClass(p.impact) === 'is-positive').length
    const monitor = policies.filter((p) => impactClass(p.impact) === 'is-monitor').length
    const risk = policies.filter((p) => impactClass(p.impact) === 'is-risk').length
    const action = policies.filter((p) => impactClass(p.impact) === 'is-action').length
    return { positive, monitor, risk, action }
  }, [policies])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return policies.filter((p) => {
      const matchesQuery = !needle || [
        p.title, p.summary, p.country, p.category, ...(p.tags || [])
      ].join(' ').toLowerCase().includes(needle)
      const matchesCountry = country === 'All countries' || p.country === country
      const matchesImpact = impact === 'All impacts' || p.impact === impact
      const matchesCategory = category === 'All policy types' || p.category === category
      return matchesQuery && matchesCountry && matchesImpact && matchesCategory
    })
  }, [policies, query, country, impact, category])

  function toggleSaved(id) {
    setSaved((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <main className="npa-page" data-nurselink-page="policies-advocacy-intelligence-v6480">
      <section className="npa-page-heading">
        <div>
          <h1>Policies &amp; Advocacy</h1>
          <p>Understand the policies shaping nursing careers, migration, professional practice, and future workforce demand.</p>
        </div>
      </section>

      <section className="npa-hero">
        <div className="npa-hero-copy">
          <div className="npa-eyebrow">POLICY INTELLIGENCE</div>
          <h2>Know what is changing before it affects your career.</h2>
          <p>We track policy, regulation, workforce reform, migration rules, professional recognition and labor-market signals so nurses can plan ahead with better context.</p>
          <button type="button" className="npa-link-button">How we monitor policies <Icon name="arrow" /></button>
        </div>
        <div className="npa-hero-visual" aria-hidden="true">
          <div className="npa-visual-globe">🌐</div>
          <div className="npa-visual-building">🏛️</div>
          <div className="npa-visual-search">⌕</div>
          <div className="npa-visual-shield">✓</div>
        </div>
      </section>

      <section className="npa-stats">
        <StatCard icon="policy" value={policies.length} label="Active Policy Watch" note={sourceMode === 'live' ? 'Live member policy records' : 'Seeded demo records'} />
        <StatCard icon="globe" value={countries.length - 1} label="Countries Monitored" note="Destination and local markets" />
        <StatCard icon="bell" value={counts.positive + counts.monitor + counts.risk + counts.action} label="Updates Affecting Your Profile" note="Profile-relevant policy signals" />
      </section>

      <section className="npa-content-grid">
        <div className="npa-policy-workspace">
          <div className="npa-workspace-header">
            <div>
              <h2>Policy Watch</h2>
              <p>Filter policy intelligence by market, policy type, impact, or keyword.</p>
            </div>
            <div className={`npa-source-mode ${sourceMode === 'live' ? 'is-live' : 'is-demo'}`}>
              <span></span>{loading ? 'Checking live records…' : sourceMode === 'live' ? 'Live policy records' : 'Seeded demo mode'}
            </div>
          </div>

          <div className="npa-impact-tabs">
            <button className="active">All ({policies.length})</button>
            <button>Positive ({counts.positive})</button>
            <button>Monitor ({counts.monitor})</button>
            <button>Possible Reduction ({counts.risk})</button>
            <button>Action Required ({counts.action})</button>
          </div>

          <div className="npa-filterbar">
            <select value={country} onChange={(e) => setCountry(e.target.value)}>
              {countries.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={impact} onChange={(e) => setImpact(e.target.value)}>
              {['All impacts', 'Positive Opportunity', 'Monitor', 'Possible Demand Reduction', 'Action Required', 'Informational'].map((item) => <option key={item}>{item}</option>)}
            </select>
            <label className="npa-search">
              <span className="sr-only">Search policies</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search policies…" />
            </label>
            <button type="button" className="npa-filter-button"><Icon name="filter" /> Filters</button>
          </div>

          <div className="npa-policy-list">
            {filtered.map((policy) => (
              <article className="npa-policy-row" key={policy.id}>
                <div className={`npa-impact-badge ${impactClass(policy.impact)}`}>{policy.impact}</div>
                <div className="npa-policy-main">
                  <div className="npa-policy-country">{policy.flag} <strong>{policy.country}</strong></div>
                  <h3>{policy.title}</h3>
                  <p>{policy.summary}</p>
                  <div className="npa-policy-tags">
                    {(policy.tags || []).slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
                    <span>Effective: {policy.effective_date}</span>
                  </div>
                </div>
                <div className="npa-policy-side">
                  <button
                    type="button"
                    className={`npa-bookmark ${saved.has(policy.id) ? 'is-saved' : ''}`}
                    aria-label="Save policy"
                    onClick={() => toggleSaved(policy.id)}
                  >
                    <Icon name="bookmark" />
                  </button>
                  <div>
                    <span>Impact on you</span>
                    <strong className={impactClass(policy.impact)}>{policy.impact}</strong>
                  </div>
                  <div>
                    <span>Updated</span>
                    <strong>{policy.updated_at}</strong>
                  </div>
                  <button type="button" className="npa-view-button" onClick={() => setSelected(policy)}>View details</button>
                </div>
              </article>
            ))}
            {!filtered.length && <div className="npa-empty">No policies match your current filters.</div>}
          </div>
        </div>

        <aside className="npa-impact-panel">
          <div className="npa-panel-heading">
            <span>PERSONALIZED POLICY SIGNALS</span>
            <h2>Impact on Me</h2>
            <p>Based on your nursing profile, destination interests, qualifications and experience.</p>
          </div>

          <div className="npa-impact-summary">
            <div className="is-positive"><Icon name="bell" /><strong>{counts.positive}</strong><span>Positive Opportunities</span><small>Policies that may create more demand or pathways.</small></div>
            <div className="is-monitor"><Icon name="bell" /><strong>{counts.monitor}</strong><span>Monitor</span><small>Policies to watch as implementation develops.</small></div>
            <div className="is-risk"><Icon name="bell" /><strong>{counts.risk}</strong><span>Possible Demand Reduction</span><small>Policies that may reduce demand in some areas.</small></div>
            <div className="is-action"><Icon name="bell" /><strong>{counts.action}</strong><span>Action Required</span><small>Policies requiring profile, visa or eligibility updates.</small></div>
          </div>

          <a href="/profile" className="npa-outline-action">Update My Profile</a>
        </aside>
      </section>

      <section className="npa-bottom-grid">
        <article className="npa-bottom-card">
          <div className="npa-card-title-row">
            <div><span>ADVOCACY</span><h2>Advocacy Priorities</h2></div>
            <button type="button">View all</button>
          </div>
          <p>NurseLink and partner organizations can monitor and advocate around evidence-based workforce priorities.</p>
          <div className="npa-priority-list">
            {advocacyPriorities.map((item) => (
              <div key={item.title}><Icon name="check" /><span>{item.title}</span><strong>{item.status}</strong></div>
            ))}
          </div>
        </article>

        <article className="npa-bottom-card">
          <div className="npa-card-title-row">
            <div><span>EXPLAINERS</span><h2>Policy Explainers</h2></div>
            <button type="button">View all</button>
          </div>
          <p>Simplified summaries help members understand what changed and what to do next.</p>
          <div className="npa-explainer-list">
            {explainers.map((item) => <button type="button" key={item}><Icon name="policy" />{item}</button>)}
          </div>
        </article>

        <article className="npa-bottom-card npa-lmi-card">
          <div className="npa-card-title-row">
            <div><span>LABOR MARKET INTELLIGENCE</span><h2>Labor Market Intelligence Connection</h2></div>
          </div>
          <p>See how policy changes connect to demand, shortages, specialty hiring, localization and future workforce trends.</p>
          <div className="npa-lmi-signal">
            <Icon name="chart" />
            <div>
              <strong>Saudi Arabia – Localization Phase 2</strong>
              <span>Compare localization policy with specialty-level demand and hiring trends.</span>
            </div>
          </div>
          <a href="/jobs" className="npa-primary-action">View in LMI <Icon name="arrow" /></a>
        </article>
      </section>

      <section className="npa-disclaimer">
        <strong>Important Disclaimer</strong>
        <p>NurseLink policy intelligence is provided for professional awareness, education and career-planning support. Seeded demo records are illustrative only and must not be treated as verified current legal or regulatory guidance. Always confirm requirements with the competent authority and official source.</p>
      </section>

      {selected && (
        <div className="npa-modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <section className="npa-modal" role="dialog" aria-modal="true" aria-labelledby="npa-policy-title" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="npa-modal-close" onClick={() => setSelected(null)} aria-label="Close">×</button>
            <div className="npa-policy-country">{selected.flag} <strong>{selected.country}</strong></div>
            <div className={`npa-impact-badge ${impactClass(selected.impact)}`}>{selected.impact}</div>
            <span className="npa-modal-kicker">{selected.category}</span>
            <h2 id="npa-policy-title">{selected.title}</h2>
            <p>{selected.summary}</p>
            <div className="npa-detail-grid">
              <div><span>Status</span><strong>{selected.status}</strong></div>
              <div><span>Effective / Published</span><strong>{selected.effective_date}</strong></div>
              <div><span>Source Authority</span><strong>{selected.source_authority}</strong></div>
              <div><span>Last Verified</span><strong>{selected.last_verified}</strong></div>
            </div>
            <div className="npa-explainer-box"><strong>Policy Explainer</strong><p>{selected.explainer}</p></div>
            {selected.lmi && <div className="npa-modal-lmi"><Icon name="chart" /><div><strong>Labor Market Intelligence connected</strong><span>Evaluate this policy alongside demand and workforce signals.</span></div></div>}
            {selected.source_url
              ? <a className="npa-primary-action" href={selected.source_url} target="_blank" rel="noreferrer">Open official source <Icon name="arrow" /></a>
              : <div className="npa-source-note">Seeded demo record: official-source URL intentionally omitted until a verified production source is attached.</div>}
          </section>
        </div>
      )}
    </main>
  )
}
