type OverlayOpts = { durationMs?: number; sticky?: boolean };

let debugContainer: HTMLDivElement | null = null;
let debugHeader: HTMLDivElement | null = null;

function ensureContainer() {
  if (debugContainer) return debugContainer;
  const container = document.createElement('div');
  container.id = 'pulse-debug-console';
  container.style.position = 'fixed';
  container.style.bottom = '12px';
  container.style.left = '12px';
  container.style.zIndex = '99999';
  container.style.width = 'min(92vw, 520px)';
  container.style.maxHeight = '60vh';
  container.style.overflowY = 'auto';
  container.style.background = 'rgba(17,17,17,0.92)';
  container.style.color = '#fff';
  container.style.borderRadius = '10px';
  container.style.boxShadow = '0 6px 18px rgba(0,0,0,0.28)';
  container.style.fontFamily = 'system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial';
  container.style.fontSize = '12px';

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.padding = '8px 10px';
  header.style.borderBottom = '1px solid rgba(255,255,255,0.12)';
  const hTitle = document.createElement('div');
  hTitle.textContent = 'PULSE Debug Console';
  hTitle.style.fontWeight = '700';
  hTitle.style.letterSpacing = '0.3px';
  const close = document.createElement('button');
  close.textContent = '×';
  close.style.background = 'transparent';
  close.style.color = '#fff';
  close.style.border = 'none';
  close.style.fontSize = '18px';
  close.style.cursor = 'pointer';
  close.onclick = () => { try { container.remove(); debugContainer = null; debugHeader = null; } catch {} };
  header.appendChild(hTitle);
  header.appendChild(close);
  container.appendChild(header);
  debugHeader = header;

  document.body.appendChild(container);
  debugContainer = container;
  return container;
}

function shouldShow(): boolean {
  try {
    // Only show in dev builds or when explicitly enabled at runtime
    let isDev = false;
    try {
      // @ts-ignore access vite env
      isDev = !!((import.meta as any)?.env?.DEV);
    } catch {}
    return (typeof window !== 'undefined') && ((((window as any).PULSE_DEBUG === true) || isDev === true));
  } catch {
    return false;
  }
}

export function showDebugOverlay(label: string, details?: Record<string, any>, opts?: OverlayOpts) {
  if (!shouldShow()) return;
  try {
    const persist = (window as any).PULSE_DEBUG === true || opts?.sticky === true;
    const duration = opts?.durationMs ?? 20000; // default 20s per entry
    const container = ensureContainer();

    const entry = document.createElement('div');
    entry.style.padding = '8px 10px';
    entry.style.borderBottom = '1px dashed rgba(255,255,255,0.12)';

    const title = document.createElement('div');
    const ts = new Date().toLocaleTimeString();
    title.textContent = `[${ts}] ${label}`;
    title.style.fontWeight = '600';
    title.style.marginBottom = '4px';
    entry.appendChild(title);

    if (details) {
      const pre = document.createElement('pre');
      pre.textContent = JSON.stringify(details, null, 2);
      pre.style.margin = '0';
      pre.style.whiteSpace = 'pre-wrap';
      pre.style.wordBreak = 'break-word';
      pre.style.color = '#ddd';
      entry.appendChild(pre);
    }

    container.appendChild(entry);
    container.scrollTop = container.scrollHeight;

    if (!persist) {
      setTimeout(() => { try { entry.remove(); } catch {} }, duration);
    }
  } catch {
    // ignore overlay errors
  }
}

export function setDebugPersistent(enabled: boolean) {
  (window as any).PULSE_DEBUG = enabled;
  if (enabled) ensureContainer();
}
