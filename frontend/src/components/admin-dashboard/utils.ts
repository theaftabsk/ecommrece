// ─── Types ───────────────────────────────────────────────────────────────────
export type SuperPage = 'dashboard' | 'stores' | 'store-detail' | 'requests' | 'onboard';

// ─── Utilities ────────────────────────────────────────────────────────────────
export function copyText(text: string, label = 'Copied!') {
  navigator.clipboard.writeText(text).then(() => {
    const el = document.createElement('div');
    el.className = 'copy-toast';
    el.textContent = label;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  });
}

export function genPassword(slug: string) {
  return `${slug}@OakSol${new Date().getFullYear()}`;
}
