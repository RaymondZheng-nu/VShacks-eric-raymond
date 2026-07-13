// web audio is a pain — ctx has to be created on user gesture or browsers block it
let ctx = null
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

function beep(freq, dur, type = 'square', vol = 0.12) {
  try {
    const c = getCtx()
    if (c.state === 'suspended') c.resume()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.frequency.value = freq
    osc.type = type
    gain.gain.setValueAtTime(vol, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + dur)
  } catch {}
  // TODO: add a volume slider at some point, the beeps are a bit loud
}

export function isMuted() { return localStorage.getItem('quota-machine-muted') === 'true' }
export function setMuted(v) { localStorage.setItem('quota-machine-muted', v ? 'true' : 'false') }

export function playInstall() {
  if (isMuted()) return
  beep(523, 0.08)
  setTimeout(() => beep(659, 0.08), 80)
  setTimeout(() => beep(784, 0.15), 160)
}

export function playQuotaPass() {
  if (isMuted()) return
  // little ascending ding
  ;[392, 523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, 0.1, 'sine', 0.1), i * 80))
}

export function playQuotaFail() {
  if (isMuted()) return
  beep(220, 0.2, 'sawtooth', 0.13)
  setTimeout(() => beep(185, 0.3, 'sawtooth', 0.1), 180)
}

export function playMachineFail() {
  if (isMuted()) return
  beep(300, 0.05)
  setTimeout(() => beep(200, 0.18), 60)
}

export function playPurchase() { if (isMuted()) return; beep(440, 0.06, 'sine', 0.08) }
export function playTask()     { if (isMuted()) return; beep(660, 0.07, 'sine', 0.08) }
