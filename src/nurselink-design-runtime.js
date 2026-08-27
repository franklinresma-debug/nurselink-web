import defaultConfig from './nurselink-design-config.json'

const LOCAL_KEY = 'nurselink-admin-appearance-draft-v1'
let observer = null
let installed = false
let lastConfig = null

const clone = value => JSON.parse(JSON.stringify(value))

function readConfig(explicit) {
  if (explicit) return explicit
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return clone(defaultConfig)
}

function setVar(name, value) {
  if (value === undefined || value === null || value === '') return
  document.documentElement.style.setProperty(name, String(value))
}

function applyGlobal(config) {
  const g = config?.globalDesign || {}
  setVar('--nl-global-font-family', g.fontFamily)
  setVar('--nl-global-h1-size', g.h1Size)
  setVar('--nl-global-h2-size', g.h2Size)
  setVar('--nl-global-button-radius', g.buttonRadius)
}

function applyHeroVars(config) {
  const slider = config?.heroSliders?.registration || config?.heroSliders?.login || {}
  const first = slider.slides?.find?.(s => s.enabled !== false) || slider.slides?.[0]
  const r = first?.responsive || slider.responsive || {}
  setVar('--nl-hero-transition', `${Number(slider.transitionMs ?? 800)}ms`)
  for (const bp of ['desktop', 'tablet', 'mobile']) {
    const v = r[bp] || {}
    setVar(`--nl-hero-fit-${bp}`, v.fit || 'cover')
    setVar(`--nl-hero-x-${bp}`, `${v.x ?? 50}%`)
    setVar(`--nl-hero-y-${bp}`, `${v.y ?? 50}%`)
  }
}

function enabledSlides(scope) {
  const slider = lastConfig?.heroSliders?.[scope]
  const list = Array.isArray(slider?.slides) ? slider.slides : []
  return list.filter(s => s && s.enabled !== false)
}

function syncLogin() {
  const slider = lastConfig?.heroSliders?.login
  if (!slider?.enabled) return
  const slide = enabledSlides('login')[0]
  if (!slide) return

  const media = document.querySelector('.nl713-login-hero-media')
  if (!media) return
  const picture = media.querySelector('picture')
  const source = picture?.querySelector('source')
  const img = picture?.querySelector('img')
  if (source && slide.mobileImage) source.srcset = slide.mobileImage
  if (img && slide.desktopImage) img.src = slide.desktopImage
  if (img) {
    img.alt = slide.alt || ''
    const bp = window.innerWidth <= 680 ? 'mobile' : window.innerWidth <= 1024 ? 'tablet' : 'desktop'
    const p = slide.responsive?.[bp] || {}
    img.style.objectFit = p.fit || 'cover'
    img.style.objectPosition = `${p.x ?? 50}% ${p.y ?? 50}%`
  }
}

function buildPicture(slide) {
  const picture = document.createElement('picture')
  if (slide.mobileImage) {
    const source = document.createElement('source')
    source.media = '(max-width: 680px)'
    source.srcset = slide.mobileImage
    picture.appendChild(source)
  }
  if (slide.tabletImage) {
    const source = document.createElement('source')
    source.media = '(max-width: 1024px)'
    source.srcset = slide.tabletImage
    picture.appendChild(source)
  }
  const img = document.createElement('img')
  img.src = slide.desktopImage || slide.tabletImage || slide.mobileImage || ''
  img.alt = slide.alt || ''
  picture.appendChild(img)
  return picture
}

function syncRegistration() {
  const sliderCfg = lastConfig?.heroSliders?.registration
  if (!sliderCfg?.enabled) return
  const slides = enabledSlides('registration')
  if (!slides.length) return

  const slider = document.querySelector('.nurselink-registration-hero-slider')
  if (!slider) return

  const existing = [...slider.querySelectorAll('.nurselink-registration-hero-slide')]
  const sameCount = existing.length === slides.length
  const sameSources = sameCount && existing.every((el, i) =>
    (el.querySelector('img')?.getAttribute('src') || '') ===
    (slides[i].desktopImage || slides[i].tabletImage || slides[i].mobileImage || '')
  )

  if (!sameSources) {
    slider.innerHTML = ''
    slides.forEach((slide, index) => {
      const node = document.createElement('div')
      node.className = `nurselink-registration-hero-slide${index === 0 ? ' is-active' : ''}`
      node.dataset.nlDesignSlideId = slide.id || String(index)
      node.appendChild(buildPicture(slide))
      slider.appendChild(node)
    })

    const dots = document.querySelector('.nurselink-registration-hero-dots')
    if (dots) {
      dots.innerHTML = ''
      slides.forEach((slide, index) => {
        const dot = document.createElement('button')
        dot.type = 'button'
        dot.className = `nurselink-registration-hero-dot${index === 0 ? ' is-active' : ''}`
        dot.dataset.slide = String(index)
        dot.setAttribute('aria-label', `Show hero image ${index + 1}`)
        dots.appendChild(dot)
      })
    }
  }

  document.documentElement.dataset.nlHeroAutoplay = sliderCfg.autoplay ? '1' : '0'
  document.documentElement.dataset.nlHeroDuration = String(sliderCfg.durationMs || 6000)
  document.documentElement.dataset.nlHeroTransition = sliderCfg.transition || 'fade'
  document.documentElement.dataset.nlHeroDots = sliderCfg.showDots ? '1' : '0'
  document.documentElement.dataset.nlHeroArrows = sliderCfg.showArrows ? '1' : '0'
  document.documentElement.dataset.nlHeroLoop = sliderCfg.loop ? '1' : '0'

  const dots = document.querySelector('.nurselink-registration-hero-dots')
  if (dots) dots.hidden = sliderCfg.showDots === false

  const nodes = [...slider.querySelectorAll('.nurselink-registration-hero-slide')]
  nodes.forEach((node, index) => {
    const slide = slides[index]
    const img = node.querySelector('img')
    if (!slide || !img) return
    const bp = window.innerWidth <= 680 ? 'mobile' : window.innerWidth <= 1024 ? 'tablet' : 'desktop'
    const p = slide.responsive?.[bp] || {}
    img.style.objectFit = p.fit || 'cover'
    img.style.objectPosition = `${p.x ?? 50}% ${p.y ?? 50}%`
    img.alt = slide.alt || ''
  })
}

function syncDom() {
  syncLogin()
  syncRegistration()
}

export function applyNurseLinkDesignConfig(config) {
  lastConfig = readConfig(config)
  applyGlobal(lastConfig)
  applyHeroVars(lastConfig)
  document.documentElement.dataset.nurselinkDesignRuntime = 'v6352'
  syncDom()
  return lastConfig
}

export function installNurseLinkDesignRuntime() {
  if (installed) return applyNurseLinkDesignConfig()
  installed = true
  applyNurseLinkDesignConfig()

  window.addEventListener('nurselink:design-config-changed', event => {
    applyNurseLinkDesignConfig(event.detail || readConfig())
  })
  window.addEventListener('resize', () => syncDom(), { passive: true })

  if (observer) observer.disconnect()
  observer = new MutationObserver(() => {
    window.clearTimeout(observer._nlTimer)
    observer._nlTimer = window.setTimeout(syncDom, 60)
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })
  return lastConfig
}
