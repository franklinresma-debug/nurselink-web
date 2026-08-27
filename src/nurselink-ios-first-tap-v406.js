// NurseLink iOS First-Tap Activation Bridge v4.0.6
// Activates actionable controls on the first clean touchend in iOS Safari.
// Does not run on Android/desktop and ignores scroll gestures/form editing.

const NURSELINK_IOS_FIRST_TAP_MARKER = 'NURSELINK_IOS_FIRST_TAP_V406'

function isIOSLike() {
  if (typeof navigator === 'undefined') return false
  return /iP(hone|ad|od)/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export function installNurseLinkIOSFirstTapBridge() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (!isIOSLike()) return
  if (window.__nurselinkIOSFirstTapV406) return

  window.__nurselinkIOSFirstTapV406 = true
  document.documentElement.setAttribute('data-nurselink-ios-first-tap', 'v4.0.6')

  let startX = 0
  let startY = 0
  let startTarget = null
  let moved = false
  let lastForcedClickAt = 0
  let lastForcedTarget = null

  const actionableSelector = [
    'button',
    'a[href]',
    '[role="button"]',
    'input[type="button"]',
    'input[type="submit"]'
  ].join(',')

  document.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1) {
      startTarget = null
      return
    }

    const touch = event.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    startTarget = event.target
    moved = false
  }, { capture: true, passive: true })

  document.addEventListener('touchmove', (event) => {
    if (!startTarget || event.touches.length !== 1) return
    const touch = event.touches[0]
    if (Math.abs(touch.clientX - startX) > 10 || Math.abs(touch.clientY - startY) > 10) {
      moved = true
    }
  }, { capture: true, passive: true })

  document.addEventListener('touchend', (event) => {
    if (!startTarget || moved) {
      startTarget = null
      return
    }

    const raw = event.target instanceof Element ? event.target : null
    const actionable = raw?.closest(actionableSelector)

    if (!actionable) {
      startTarget = null
      return
    }

    // Do not interfere with editable/native picker fields.
    if (
      actionable.matches('input:not([type="button"]):not([type="submit"])')
      || actionable.matches('select, textarea')
      || actionable.closest('[contenteditable="true"]')
    ) {
      startTarget = null
      return
    }

    if (
      actionable.hasAttribute('disabled')
      || actionable.getAttribute('aria-disabled') === 'true'
    ) {
      startTarget = null
      return
    }

    const rect = actionable.getBoundingClientRect()
    if (
      startX < rect.left - 8 || startX > rect.right + 8
      || startY < rect.top - 8 || startY > rect.bottom + 8
    ) {
      startTarget = null
      return
    }

    // Prevent Safari from consuming the first touch as hover and then
    // synthesizing a delayed duplicate click.
    event.preventDefault()
    lastForcedClickAt = Date.now()
    lastForcedTarget = actionable
    actionable.click()
    startTarget = null
  }, { capture: true, passive: false })

  // Suppress only a near-immediate duplicate synthetic click from Safari.
  document.addEventListener('click', (event) => {
    if (!lastForcedTarget) return
    if (Date.now() - lastForcedClickAt > 700) {
      lastForcedTarget = null
      return
    }

    const raw = event.target instanceof Element ? event.target : null
    const actionable = raw?.closest(actionableSelector)

    if (actionable === lastForcedTarget && event.isTrusted) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }

    lastForcedTarget = null
  }, true)

  console.info(NURSELINK_IOS_FIRST_TAP_MARKER)
}
