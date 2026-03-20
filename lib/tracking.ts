// Type declarations for analytics globals
declare global {
  interface Window {
    gtag: (command: string, eventName: string, params?: Record<string, unknown>) => void
    fbq: (command: string, eventName: string) => void
  }
}

export function trackContactClick(channel: 'whatsapp' | 'line'): void {
  if (typeof window === 'undefined') return

  try {
    window.gtag('event', 'contact_click', { channel })
  } catch {
    // Silently ignore — tracking must never break UX
  }

  try {
    window.fbq('track', 'Contact')
  } catch {
    // Silently ignore — tracking must never break UX
  }
}
