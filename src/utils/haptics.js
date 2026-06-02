// Haptic feedback for iOS/Android PWA
// Uses Vibration API with fallback to no-op

const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)

export function hapticLight() {
  if (navigator.vibrate) navigator.vibrate(10)
  // iOS Safari doesn't support Vibration API, but PWA standalone may in future
}

export function hapticMedium() {
  if (navigator.vibrate) navigator.vibrate(20)
}

export function hapticHeavy() {
  if (navigator.vibrate) navigator.vibrate(40)
}

export function hapticSuccess() {
  if (navigator.vibrate) navigator.vibrate([10, 30, 10])
}

export function hapticError() {
  if (navigator.vibrate) navigator.vibrate([30, 20, 30])
}
