// Lightweight, safe haptics wrapper. No-ops on web or when plugin missing.
type HapticsPlugin = {
  impact?: (opts: { style: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'SOFT' | 'RIGID' } | { style: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid' }) => Promise<void> | void
  selectionChanged?: () => Promise<void> | void
  notification?: (opts: { type: 'SUCCESS' | 'WARNING' | 'ERROR' } | { type: 'success' | 'warning' | 'error' }) => Promise<void> | void
};

function getHaptics(): HapticsPlugin | null {
  try {
    const w = window as any;
    // Capacitor v4/5 style
    if (w.Capacitor?.Haptics) return w.Capacitor.Haptics as HapticsPlugin;
    // Legacy Plugins API
    if (w.Capacitor?.Plugins?.Haptics) return w.Capacitor.Plugins.Haptics as HapticsPlugin;
  } catch {}
  return null;
}

export function impactLight() {
  try {
    const h = getHaptics();
    if (!h?.impact) return;
    h.impact({ style: 'LIGHT' as any });
  } catch {}
}

export function impactMedium() {
  try {
    const h = getHaptics();
    if (!h?.impact) return;
    h.impact({ style: 'MEDIUM' as any });
  } catch {}
}

export function selection() {
  try {
    const h = getHaptics();
    if (!h?.selectionChanged) return;
    h.selectionChanged();
  } catch {}
}

export function notifySuccess() {
  try {
    const h = getHaptics();
    if (!h?.notification) return;
    h.notification({ type: 'SUCCESS' as any });
  } catch {}
}

