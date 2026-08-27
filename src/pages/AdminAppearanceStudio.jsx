import { useEffect, useMemo, useState } from 'react'
import './AdminAppearanceStudio.css'
import defaultConfig from '../nurselink-design-config.json'

const API_BASE = '/api/nurselink/admin/operations-center/appearance-settings'
const LOCAL_KEY = 'nurselink-admin-appearance-draft-v1'

const clone = (value) => JSON.parse(JSON.stringify(value))
const slug = () => `hero-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

function normalizeConfig(input) {
  const cfg = clone(input || defaultConfig)
  cfg.globalDesign ||= {}
  cfg.heroSliders ||= {}
  for (const scope of ['login', 'registration']) {
    cfg.heroSliders[scope] ||= {}
    const s = cfg.heroSliders[scope]
    s.enabled ??= true
    s.autoplay ??= scope === 'registration'
    s.durationMs ??= 6000
    s.transition ??= 'fade'
    s.transitionMs ??= 800
    s.showDots ??= scope === 'registration'
    s.showArrows ??= false
    s.loop ??= true
    s.pauseOnHover ??= true
    s.slides = Array.isArray(s.slides) ? s.slides : []
  }
  return cfg
}

async function apiFetch(path = '', options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })
  const text = await response.text()
  let body = {}
  try { body = text ? JSON.parse(text) : {} } catch { body = { message: text } }
  if (!response.ok) {
    const err = new Error(body?.message || `Request failed (${response.status})`)
    err.status = response.status
    err.data = body
    throw err
  }
  return body
}

function unwrapPayload(body) {
  return body?.data?.payload || body?.payload || body?.data?.setting?.payload ||
    body?.setting?.payload || null
}

function unwrapVersion(body) {
  return body?.data?.version || body?.version || body?.data?.setting?.version ||
    body?.setting?.version || null
}

function emitDesign(config) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(config))
  window.dispatchEvent(new CustomEvent('nurselink:design-config-changed', { detail: config }))
}

function Field({ label, children }) {
  return <label className="nl-ap-field"><span>{label}</span>{children}</label>
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="nl-ap-toggle">
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

function EmptySlide(scope) {
  return {
    id: slug(),
    name: scope === 'login' ? 'New Login Slide' : 'New Registration Slide',
    enabled: true,
    desktopImage: '',
    tabletImage: '',
    mobileImage: '',
    alt: '',
    headline: '',
    description: '',
    buttonLabel: '',
    buttonUrl: '',
    openInNewTab: false,
    responsive: {
      desktop: { fit: 'cover', x: 50, y: 46 },
      tablet: { fit: 'cover', x: 50, y: 44 },
      mobile: { fit: 'cover', x: 50, y: 36 },
    },
  }
}

function HeroPreview({ slider, slide, breakpoint }) {
  if (!slide) return <div className="nl-ap-preview-empty">No slide selected.</div>
  const bp = slide.responsive?.[breakpoint] || {}
  const src =
    breakpoint === 'mobile'
      ? slide.mobileImage || slide.tabletImage || slide.desktopImage
      : breakpoint === 'tablet'
        ? slide.tabletImage || slide.desktopImage
        : slide.desktopImage
  return (
    <div className={`nl-ap-hero-preview is-${breakpoint}`}>
      {src ? (
        <img
          src={src}
          alt={slide.alt || ''}
          style={{
            objectFit: bp.fit || 'cover',
            objectPosition: `${bp.x ?? 50}% ${bp.y ?? 50}%`,
          }}
        />
      ) : <div className="nl-ap-preview-empty">Choose an image for this breakpoint.</div>}
      <div className="nl-ap-preview-overlay">
        {slide.headline && <strong>{slide.headline}</strong>}
        {slide.description && <span>{slide.description}</span>}
        {slide.buttonLabel && <button type="button">{slide.buttonLabel}</button>}
      </div>
      <div className="nl-ap-preview-meta">
        {slider.autoplay ? `Autoplay ${Math.round((slider.durationMs || 0) / 100) / 10}s` : 'Autoplay off'}
        {' · '}{slider.transition || 'fade'}
      </div>
    </div>
  )
}

function SliderEditor({ scope, config, setConfig }) {
  const slider = config.heroSliders[scope]
  const [selectedId, setSelectedId] = useState(slider.slides[0]?.id || '')
  const [breakpoint, setBreakpoint] = useState('desktop')

  useEffect(() => {
    if (!slider.slides.some(s => s.id === selectedId)) {
      setSelectedId(slider.slides[0]?.id || '')
    }
  }, [slider.slides, selectedId])

  const index = Math.max(0, slider.slides.findIndex(s => s.id === selectedId))
  const slide = slider.slides[index] || null

  function updateSlider(key, value) {
    setConfig(prev => {
      const next = clone(prev)
      next.heroSliders[scope][key] = value
      emitDesign(next)
      return next
    })
  }

  function updateSlide(path, value) {
    setConfig(prev => {
      const next = clone(prev)
      const list = next.heroSliders[scope].slides
      const i = list.findIndex(s => s.id === selectedId)
      if (i < 0) return prev
      let target = list[i]
      const parts = path.split('.')
      for (let p = 0; p < parts.length - 1; p++) {
        target[parts[p]] ||= {}
        target = target[parts[p]]
      }
      target[parts.at(-1)] = value
      emitDesign(next)
      return next
    })
  }

  function mutateSlides(fn) {
    setConfig(prev => {
      const next = clone(prev)
      fn(next.heroSliders[scope].slides)
      emitDesign(next)
      return next
    })
  }

  function addSlide() {
    const fresh = EmptySlide(scope)
    mutateSlides(list => list.push(fresh))
    setSelectedId(fresh.id)
  }

  function duplicateSlide() {
    if (!slide) return
    const copy = clone(slide)
    copy.id = slug()
    copy.name = `${copy.name || 'Slide'} Copy`
    mutateSlides(list => list.splice(index + 1, 0, copy))
    setSelectedId(copy.id)
  }

  function move(delta) {
    const target = index + delta
    if (!slide || target < 0 || target >= slider.slides.length) return
    mutateSlides(list => {
      const [item] = list.splice(index, 1)
      list.splice(target, 0, item)
    })
  }

  function remove() {
    if (!slide || slider.slides.length <= 1) return
    const fallback = slider.slides[index - 1]?.id || slider.slides[index + 1]?.id || ''
    mutateSlides(list => list.splice(index, 1))
    setSelectedId(fallback)
  }

  return (
    <div className="nl-ap-hero-workspace">
      <section className="nl-ap-card">
        <div className="nl-ap-card-head">
          <div>
            <span className="nl-ap-eyebrow">{scope === 'login' ? 'LOGIN' : 'REGISTRATION'}</span>
            <h2>Hero Slider</h2>
          </div>
          <button className="nl-ap-primary" type="button" onClick={addSlide}>+ Add Slide</button>
        </div>

        <div className="nl-ap-slider-settings">
          <Toggle label="Enabled" checked={slider.enabled} onChange={v => updateSlider('enabled', v)} />
          <Toggle label="Autoplay" checked={slider.autoplay} onChange={v => updateSlider('autoplay', v)} />
          <Toggle label="Dots" checked={slider.showDots} onChange={v => updateSlider('showDots', v)} />
          <Toggle label="Arrows" checked={slider.showArrows} onChange={v => updateSlider('showArrows', v)} />
          <Toggle label="Loop" checked={slider.loop} onChange={v => updateSlider('loop', v)} />
          <Toggle label="Pause on hover" checked={slider.pauseOnHover} onChange={v => updateSlider('pauseOnHover', v)} />
          <Field label="Duration (ms)">
            <input type="number" min="1000" step="250" value={slider.durationMs || 6000}
              onChange={e => updateSlider('durationMs', Number(e.target.value || 6000))} />
          </Field>
          <Field label="Transition">
            <select value={slider.transition || 'fade'} onChange={e => updateSlider('transition', e.target.value)}>
              <option value="fade">Fade</option><option value="slide">Slide</option><option value="none">None</option>
            </select>
          </Field>
          <Field label="Transition ms">
            <input type="number" min="0" step="50" value={slider.transitionMs ?? 800}
              onChange={e => updateSlider('transitionMs', Number(e.target.value || 0))} />
          </Field>
        </div>
      </section>

      <div className="nl-ap-columns">
        <section className="nl-ap-card nl-ap-slide-list">
          <div className="nl-ap-card-head"><h3>Slides <small>{slider.slides.length}</small></h3></div>
          <div className="nl-ap-slides">
            {slider.slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`nl-ap-slide-row ${s.id === selectedId ? 'is-active' : ''}`}
                onClick={() => setSelectedId(s.id)}
              >
                <span className="nl-ap-slide-number">{String(i + 1).padStart(2, '0')}</span>
                <span className="nl-ap-thumb">
                  {(s.mobileImage || s.desktopImage) ? <img src={s.mobileImage || s.desktopImage} alt="" /> : <span>IMG</span>}
                </span>
                <span className="nl-ap-slide-copy">
                  <strong>{s.name || `Slide ${i + 1}`}</strong>
                  <small>{s.enabled === false ? 'Disabled' : 'Enabled'}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="nl-ap-row-actions">
            <button type="button" onClick={() => move(-1)} disabled={index <= 0}>↑</button>
            <button type="button" onClick={() => move(1)} disabled={index >= slider.slides.length - 1}>↓</button>
            <button type="button" onClick={duplicateSlide} disabled={!slide}>Duplicate</button>
            <button type="button" className="danger" onClick={remove} disabled={!slide || slider.slides.length <= 1}>Delete</button>
          </div>
        </section>

        <section className="nl-ap-card nl-ap-slide-editor">
          {slide ? <>
            <div className="nl-ap-card-head">
              <div><span className="nl-ap-eyebrow">SLIDE {index + 1}</span><h3>{slide.name || 'Untitled Slide'}</h3></div>
              <Toggle label="Enabled" checked={slide.enabled !== false} onChange={v => updateSlide('enabled', v)} />
            </div>

            <div className="nl-ap-form-grid">
              <Field label="Slide name"><input value={slide.name || ''} onChange={e => updateSlide('name', e.target.value)} /></Field>
              <Field label="Alt text"><input value={slide.alt || ''} onChange={e => updateSlide('alt', e.target.value)} /></Field>
              <Field label="Desktop image"><input value={slide.desktopImage || ''} onChange={e => updateSlide('desktopImage', e.target.value)} /></Field>
              <Field label="Tablet image"><input value={slide.tabletImage || ''} onChange={e => updateSlide('tabletImage', e.target.value)} /></Field>
              <Field label="Mobile image"><input value={slide.mobileImage || ''} onChange={e => updateSlide('mobileImage', e.target.value)} /></Field>
              <Field label="Headline"><input value={slide.headline || ''} onChange={e => updateSlide('headline', e.target.value)} /></Field>
              <Field label="Description"><textarea rows="3" value={slide.description || ''} onChange={e => updateSlide('description', e.target.value)} /></Field>
              <Field label="Button label"><input value={slide.buttonLabel || ''} onChange={e => updateSlide('buttonLabel', e.target.value)} /></Field>
              <Field label="Button URL"><input value={slide.buttonUrl || ''} onChange={e => updateSlide('buttonUrl', e.target.value)} /></Field>
              <Toggle label="Open button in new tab" checked={slide.openInNewTab} onChange={v => updateSlide('openInNewTab', v)} />
            </div>

            <div className="nl-ap-breakpoint-tabs">
              {['desktop', 'tablet', 'mobile'].map(bp => (
                <button key={bp} type="button" className={breakpoint === bp ? 'is-active' : ''} onClick={() => setBreakpoint(bp)}>
                  {bp}
                </button>
              ))}
            </div>

            <div className="nl-ap-responsive-controls">
              <Field label="Image fit">
                <select value={slide.responsive?.[breakpoint]?.fit || 'cover'} onChange={e => updateSlide(`responsive.${breakpoint}.fit`, e.target.value)}>
                  <option value="cover">Cover</option><option value="contain">Contain</option><option value="fill">Fill</option>
                </select>
              </Field>
              <Field label={`Focal X ${slide.responsive?.[breakpoint]?.x ?? 50}%`}>
                <input type="range" min="0" max="100" value={slide.responsive?.[breakpoint]?.x ?? 50}
                  onChange={e => updateSlide(`responsive.${breakpoint}.x`, Number(e.target.value))} />
              </Field>
              <Field label={`Focal Y ${slide.responsive?.[breakpoint]?.y ?? 50}%`}>
                <input type="range" min="0" max="100" value={slide.responsive?.[breakpoint]?.y ?? 50}
                  onChange={e => updateSlide(`responsive.${breakpoint}.y`, Number(e.target.value))} />
              </Field>
            </div>

            <HeroPreview slider={slider} slide={slide} breakpoint={breakpoint} />
          </> : <div className="nl-ap-preview-empty">Add a slide to begin.</div>}
        </section>
      </div>
    </div>
  )
}

function GlobalDesign({ config, setConfig }) {
  const gd = config.globalDesign || {}
  const update = (key, value) => {
    setConfig(prev => {
      const next = clone(prev)
      next.globalDesign ||= {}
      next.globalDesign[key] = value
      emitDesign(next)
      return next
    })
  }
  return (
    <section className="nl-ap-card">
      <span className="nl-ap-eyebrow">SYSTEM TOKENS</span>
      <h2>Global Design</h2>
      <p className="nl-ap-muted">Canonical global design values used by the NurseLink runtime.</p>
      <div className="nl-ap-form-grid">
        <Field label="Font family"><input value={gd.fontFamily || ''} onChange={e => update('fontFamily', e.target.value)} placeholder="Inter, system-ui, sans-serif" /></Field>
        <Field label="H1 size"><input value={gd.h1Size || ''} onChange={e => update('h1Size', e.target.value)} placeholder="56px" /></Field>
        <Field label="H2 size"><input value={gd.h2Size || ''} onChange={e => update('h2Size', e.target.value)} placeholder="40px" /></Field>
        <Field label="Primary button radius"><input value={gd.buttonRadius || ''} onChange={e => update('buttonRadius', e.target.value)} placeholder="12px" /></Field>
      </div>
    </section>
  )
}

export default function AdminAppearanceStudio() {
  const [config, setConfig] = useState(() => {
    try {
      const local = localStorage.getItem(LOCAL_KEY)
      return normalizeConfig(local ? JSON.parse(local) : defaultConfig)
    } catch { return normalizeConfig(defaultConfig) }
  })
  const [tab, setTab] = useState('global')
  const [loading, setLoading] = useState(true)
  const [serverBusy, setServerBusy] = useState(false)
  const [error, setError] = useState('')
  const [draftVersion, setDraftVersion] = useState(null)
  const [publishedVersion, setPublishedVersion] = useState(null)
  const [history, setHistory] = useState([])

  async function refreshServer() {
    setLoading(true); setError('')
    try {
      const [current, hist] = await Promise.all([
        apiFetch(''),
        apiFetch('/history'),
      ])
      const payload = unwrapPayload(current)
      if (payload) {
        const normalized = normalizeConfig(payload)
        setConfig(normalized)
        emitDesign(normalized)
      }
      setDraftVersion(current?.data?.draft?.version || current?.draft?.version || unwrapVersion(current))
      setPublishedVersion(current?.data?.published?.version || current?.published?.version || null)
      setHistory(hist?.data?.history || hist?.history || hist?.data || [])
    } catch (err) {
      // Staging preview may not share production auth/API; local editing still works.
      if (err?.status !== 401 && err?.status !== 403) setError(err.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { refreshServer() }, [])

  async function saveDraft() {
    setServerBusy(true); setError('')
    try {
      emitDesign(config)
      const result = await apiFetch('/draft', { method: 'POST', body: JSON.stringify({ payload: config }) })
      setDraftVersion(unwrapVersion(result))
      await refreshServer()
    } catch (err) { setError(err.message) }
    finally { setServerBusy(false) }
  }

  async function publish() {
    if (!draftVersion) return
    setServerBusy(true); setError('')
    try {
      await apiFetch(`/${draftVersion}/publish`, { method: 'POST', body: '{}' })
      await refreshServer()
    } catch (err) { setError(err.message) }
    finally { setServerBusy(false) }
  }

  async function restore(version) {
    setServerBusy(true); setError('')
    try {
      await apiFetch(`/${version}/restore`, { method: 'POST', body: '{}' })
      await refreshServer()
    } catch (err) { setError(err.message) }
    finally { setServerBusy(false) }
  }

  const tabs = useMemo(() => ([
    ['global', 'Global Design'],
    ['login', 'Hero Slider · Login'],
    ['registration', 'Hero Slider · Registration'],
  ]), [])

  return (
    <main className="nl-ap-shell">
      <header className="nl-ap-top">
        <div>
          <span className="nl-ap-eyebrow">ADMIN CENTER · APPEARANCE</span>
          <h1>Global Design & Hero Slider</h1>
          <p>Manage canonical design tokens and responsive hero experiences without adding CSS override stacks.</p>
        </div>
        <div className="nl-ap-actions">
          <span className="nl-ap-version">Draft {draftVersion || 'local'} · Published {publishedVersion || '—'}</span>
          <button type="button" onClick={() => emitDesign(config)}>Preview Local</button>
          <button className="nl-ap-primary" type="button" onClick={saveDraft} disabled={serverBusy}>Save Draft</button>
          <button type="button" onClick={publish} disabled={serverBusy || !draftVersion}>Publish</button>
        </div>
      </header>

      {error && <div className="nl-ap-alert">{error}</div>}
      {loading && <div className="nl-ap-loading">Loading server design state…</div>}

      <nav className="nl-ap-tabs">
        {tabs.map(([key, label]) => <button key={key} type="button" className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>{label}</button>)}
      </nav>

      {tab === 'global' && <GlobalDesign config={config} setConfig={setConfig} />}
      {tab === 'login' && <SliderEditor scope="login" config={config} setConfig={setConfig} />}
      {tab === 'registration' && <SliderEditor scope="registration" config={config} setConfig={setConfig} />}

      <section className="nl-ap-card nl-ap-history">
        <div className="nl-ap-card-head"><h3>Server Persistence & History</h3><button type="button" onClick={refreshServer}>Refresh</button></div>
        {history?.length ? (
          <div className="nl-ap-history-list">
            {history.slice(0, 12).map((row, i) => {
              const version = row.version ?? row.id ?? i
              return <div className="nl-ap-history-row" key={version}>
                <span><strong>Version {version}</strong><small>{row.status || 'saved'}</small></span>
                <button type="button" onClick={() => restore(version)} disabled={serverBusy}>Restore</button>
              </div>
            })}
          </div>
        ) : <p className="nl-ap-muted">No server history available in this session yet.</p>}
      </section>
    </main>
  )
}
