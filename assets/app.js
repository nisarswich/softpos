// Shared helpers for Swich SoftPOS mockups.

// iOS-style status bar icons (signal / wifi / battery), reused on every screen.
function renderStatusIcons() {
  // fill="currentColor" instead of a hardcoded white — .statusbar sets
  // color: var(--heading), so these invert automatically with the theme.
  return `
    <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0" y="7" width="3" height="5" rx="0.5" fill="currentColor"/><rect x="5" y="5" width="3" height="7" rx="0.5" fill="currentColor"/><rect x="10" y="3" width="3" height="9" rx="0.5" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="0.5" fill="currentColor"/></svg>
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 9.8a1 1 0 100 2 1 1 0 000-2z" fill="currentColor"/><path d="M4.6 7.2a4.8 4.8 0 016.8 0l-1.2 1.2a3 3 0 00-4.4 0L4.6 7.2z" fill="currentColor"/><path d="M2 4.6a8.4 8.4 0 0112 0L12.8 5.8a6.6 6.6 0 00-9.6 0L2 4.6z" fill="currentColor"/></svg>
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.4"/><rect x="2" y="2" width="18" height="8" rx="1.3" fill="currentColor"/><rect x="22.5" y="4" width="1.6" height="4" rx="0.8" fill="currentColor" opacity="0.4"/></svg>
  `;
}

function renderNotch() { return '<div class="notch"></div>'; }

function initStatusBar(time) {
  document.querySelectorAll('[data-statusbar]').forEach(el => {
    el.innerHTML = `<span>${time || '9:41'}</span><div class="icons">${renderStatusIcons()}</div>`;
  });
  document.querySelectorAll('[data-notch]').forEach(el => { el.outerHTML = renderNotch(); });
}

// Deterministic pseudo-QR pattern (visual only — not a scannable code).
// Same seed always renders the same pattern; different seeds look distinct
// so "fresh QR generated per transaction" reads visually true across screens.
function renderQrPattern(el, seed = 42) {
  const size = 21;
  let s = seed;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  let html = '';
  const isFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let on;
      if (isFinder(r, c)) {
        const lr = r < 7 ? r : r - (size - 7);
        const lc = c < 7 ? c : c - (size - 7);
        on = (lr === 0 || lr === 6 || lc === 0 || lc === 6) || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
      } else {
        on = rand() > 0.56;
      }
      html += `<div class="${on ? 'on' : ''}"></div>`;
    }
  }
  el.innerHTML = html;
}

// Mockup-only state switcher: toggles which .state-panel is visible inside
// a screen, driven by the demo control strip beneath the phone frame.
function showState(group, name) {
  document.querySelectorAll(`[data-state-group="${group}"]`).forEach(el => {
    el.dataset.active = (el.dataset.stateName === name) ? 'true' : 'false';
  });
  document.querySelectorAll(`[data-state-btn-group="${group}"]`).forEach(btn => {
    btn.classList.toggle('active', btn.dataset.stateBtn === name);
  });
}

// =====================================================================
// Role model (dashboard/reporting addendum)
// Roles: owner | branch_manager | solo | cashier
// Persisted in localStorage so the role choice survives navigating across
// linked mockup pages — this is a desktop prototype file, not a claude.ai
// artifact, so localStorage is safe/expected here.
// =====================================================================
const ROLE_LABELS = {
  owner: 'Owner (multi-branch)',
  branch_manager: 'Branch Manager',
  solo: 'Solo / small business',
  cashier: 'Cashier only',
};
const ROLE_KEY = 'swich_demo_role';

function getRole() {
  return localStorage.getItem(ROLE_KEY) || 'owner';
}

function setRole(role) {
  localStorage.setItem(ROLE_KEY, role);
  applyRole();
}

// Elements opt in via data-role-show="owner,branch_manager,solo" (comma list).
// Elements with no data-role-show are always visible.
function applyRole() {
  const role = getRole();
  document.documentElement.setAttribute('data-active-role', role);

  document.querySelectorAll('[data-role-show]').forEach(el => {
    const allowed = el.dataset.roleShow.split(',').map(s => s.trim());
    el.hidden = !allowed.includes(role); // `hidden` attr, not inline style — lets each
    // element fall back to its own CSS display value (flex/block/etc.) when shown.
  });

  document.querySelectorAll('[data-role-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.roleBtn === role);
  });

  document.querySelectorAll('[data-role-label]').forEach(el => {
    el.textContent = ROLE_LABELS[role];
  });
}

function initRoleUI() {
  applyRole();
}

// =====================================================================
// Light/dark theme (Settings > Appearance)
// Scoped to the .phone element (not <html>) so only the actual product
// surface re-themes — the dark review chrome around it (frame-stage,
// captions, mockup controls) is untouched, same separation as the role
// system. Dark is the default; persisted in localStorage so the choice
// survives navigating between screens, same as the role selector.
// =====================================================================
const THEME_KEY = 'swich_demo_theme';

function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme();
}

function applyTheme() {
  const theme = getTheme();
  document.querySelectorAll('.phone').forEach(el => el.setAttribute('data-theme', theme));

  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeBtn === theme);
  });

  // Keep the browser chrome (mobile Safari/Chrome address bar tint) in
  // sync with whatever the phone's current background actually is.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#f5f6f8' : '#070707');
}

function initTheme() {
  applyTheme();
}

document.addEventListener('DOMContentLoaded', () => { initStatusBar(); initRoleUI(); initTheme(); });
