// Shared mock data, persisted demo state and helpers for the Finance screens (23–32).
// State lives in localStorage (key swich_demo_fin) so a payment made on one
// screen shows up in balance / activity / loans everywhere else. Use the
// "Reset demo data" button in any mockup control strip to start over.
// Markup is an ILLUSTRATIVE flat 2%/month so schedule, repayments and ledger
// reconcile; real pricing comes from the lending partner (see handoff notes).

const FKEY = 'swich_demo_fin2';
const TODAY = new Date('Nov 4, 2026');
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// One activity list for everything: sales/links/settlements (money in),
// transfers/bills/airtime/installments (money out), credit pulls (money in).
// Fields: id, i(icon), t(title), s(sub), time, d(days ago), a(signed Rs),
// type(sale|link|settlement|transfer|bill|airtime|credit), ch(retail|online|link),
// st(success|pending|expired|declined|failed), by, x(extra details).
function mk(id, i, t, s, time, d, a, type, o) { return Object.assign({ id: id, i: i, t: t, s: s, time: time, d: d, a: a, type: type, ch: null, st: 'success', by: null, x: {} }, o || {}); }
const SEED = {
  balance: 184250,
  pending: 44460,        // collected, not yet settled to the wallet
  sales: 142860, salesCount: 86,   // today's collections (all channels)
  used: 150000,
  auto: { on: false, below: 25000, amt: 50000 },
  flash: null,
  seq: 0,
  draft: null,
  acts: [
    mk('TXN-88231', 'card', 'Card sale', 'Retail · Card ···· 4471', 'Today, 10:52 AM', 0, 2450, 'sale', { ch: 'retail', by: 'cashier-nisar', x: { device: 'Front Counter' } }),
    mk('TXN-88229', 'card', 'QR sale', 'Retail · QR', 'Today, 10:31 AM', 0, 1200, 'sale', { ch: 'retail', by: 'cashier-nisar', x: { device: 'Front Counter' } }),
    mk('LNK-4521', 'link', 'Payment link', 'Order #4521', 'Today, 10:05 AM', 0, 4300, 'link', { ch: 'link', st: 'pending', by: 'cashier-nisar', x: { expiry: '24 hours' } }),
    mk('TX-0901', 'send', 'Ali Traders', 'Raast', 'Today, 9:40 AM', 0, -25000, 'transfer', { x: { to: 'Ali Traders', acct: 'HBL · ···· 4521', rail: 'Raast', purpose: 'Vendor payment', ref: 'RST-20261104-77213', note: 'Invoice #1182', fee: 0, payee: 'AT' } }),
    mk('STL-1103', 'down', 'Sales settlement', 'Yesterday\'s sales · 38 payments', 'Today, 9:00 AM', 0, 98400, 'settlement', { x: { count: 38 } }),
    mk('TXN-88102', 'card', 'Online order', 'Online · Wallet', 'Yesterday, 8:12 PM', 1, 3800, 'sale', { ch: 'online' }),
    mk('LNK-219', 'link', 'Payment link', 'Delivery #219', 'Yesterday, 4:20 PM', 1, 1650, 'link', { ch: 'link', st: 'expired', by: 'cashier-nisar', x: { expiry: '1 hour' } }),
    mk('TXN-88074', 'card', 'Card sale', 'Retail · Card ···· 0912', 'Yesterday, 2:47 PM', 1, 5600, 'sale', { ch: 'retail', st: 'declined', by: 'cashier-nisar', x: { device: 'Front Counter', reason: 'Insufficient funds' } }),
    mk('TX-0902', 'phone', 'Jazz airtime', 'Prepaid', 'Nov 2, 6:05 PM', 2, -500, 'airtime', { x: { op: 'Jazz', num: '0300 1234567', kind: 'Prepaid', ref: 'AT-20261102-41820' } }),
    mk('TX-0903', 'loop', 'Running finance pulled', 'Pulled to balance', 'Nov 1, 10:30 AM', 3, 50000, 'credit', { x: { kind: 'rf' } }),
    mk('TX-0904', 'flame', 'SSGC bill', 'Bill payment', 'Oct 28, 2:10 PM', 7, -3240, 'bill', { x: { biller: 'SSGC', refno: '2204 5518 03', ref: 'BP-20261028-22011', billerId: 'ssgc' } }),
    mk('TX-0905', 'loop', 'Running finance pulled', 'Pulled to balance', 'Oct 22, 2:15 PM', 13, 100000, 'credit', { x: { kind: 'rf' } }),
    mk('TX-0907', 'layers', 'Loan installment · L-2048', 'Installment 2 of 6', 'Oct 15, 9:00 AM', 20, -28000, 'credit', { x: { kind: 'loan', loan: 'L-2048' } }),
    mk('TU-0801', 'plus', 'Balance top-up', 'Bank deposit · slip verified', 'Oct 26, 11:05 AM', 9, 20000, 'topup', { x: { kind: 'balance', amt: 20000, slip: 'slip-oct26.jpg' } }),
    mk('TX-0906', 'loop', 'Running finance repaid', 'Repaid from balance', 'Oct 10, 5:40 PM', 25, -60000, 'credit', { x: { kind: 'rf' } }),
    mk('TX-0908', 'layers', 'Loan installment · L-2048', 'Installment 1 of 6', 'Sep 15, 9:00 AM', 50, -28000, 'credit', { x: { kind: 'loan', loan: 'L-2048' } }),
    mk('TX-0909', 'layers', 'Loan disbursed · L-2048', 'Credited to wallet', 'Aug 15, 11:20 AM', 81, 150000, 'credit', { x: { kind: 'loan', loan: 'L-2048' } }),
  ],
  payees: [],
  bills: { ssgc: 'paid' },
  savedBills: ['kelectric', 'ssgc'],
  paid: {},
  apps: [{ id: 'L-2061', amount: 120000, tenure: 6, methodKey: 'balance', date: 'Nov 3, 2026', status: 'review' }],
};

function finLoad() {
  try { const s = JSON.parse(localStorage.getItem(FKEY)); if (s) return Object.assign(JSON.parse(JSON.stringify(SEED)), s); } catch (e) {}
  return JSON.parse(JSON.stringify(SEED));
}
let FS = finLoad();
function finSave() { try { localStorage.setItem(FKEY, JSON.stringify(FS)); } catch (e) {} }
function finReset() { try { localStorage.removeItem(FKEY); } catch (e) {} location.reload(); }
function timeNow() { const d = new Date(); let h = d.getHours(); const m = d.getMinutes(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + ':' + String(m).padStart(2, '0') + ' ' + ap; }
function nextSeq() { FS.seq = (FS.seq || 0) + 1; return FS.seq; }

// Money out / credit movement: changes the wallet balance AND lands in Activity.
function finTx(icon, title, sub, amt, type, x, st) {
  const id = 'TX-' + (1000 + nextSeq());
  FS.balance += amt;
  FS.acts.unshift(mk(id, icon, title, sub, 'Today, ' + timeNow(), 0, amt, type || 'credit', { x: x || {}, st: st || 'success' }));
  autoPullCheck(amt);
  finSave();
  return id;
}
function txById(id) { return FS.acts.find(t => t.id === id); }


// Auto-pull: when on, a payment that drops the balance below the chosen floor
// pulls from running finance automatically.
function autoPullCheck(delta) {
  const A = FS.auto; if (!A || !A.on || delta >= 0) return;
  const avail = 300000 - FS.used; if (FS.balance >= A.below || avail <= 0) return;
  const amt = Math.min(A.amt, avail);
  FS.used += amt; FS.balance += amt;
  FS.acts.unshift(mk('TX-' + (1000 + nextSeq()), 'loop', 'Auto-pull · Running finance', 'Balance fell below ' + rs(A.below), 'Today, ' + timeNow(), 0, amt, 'credit', { x: { kind: 'rf', auto: true } }));
  FS.flash = 'Auto-pulled ' + rs(amt) + ' from running finance';
}
// Top-up / repay-by-deposit requests: user uploads a slip, ops confirms later.
function addTopup(kind, amt, title, x) {
  const id = 'TU-' + (2000 + nextSeq()), bal = kind === 'balance';
  FS.acts.unshift(mk(id, 'plus', title, bal ? 'Bank deposit · slip attached' : 'Repayment by deposit · slip attached', 'Today, ' + timeNow(), 0, bal ? amt : -amt, 'topup', { st: 'pending', x: Object.assign({ kind: kind, amt: amt }, x || {}) }));
  finSave(); return id;
}
function decideTopup(id, approve) {
  const a = txById(id); if (!a || a.st !== 'pending') return false;
  const x = a.x;
  if (!approve) { a.st = 'declined'; x.reason = 'Slip could not be verified'; finSave(); return true; }
  a.st = 'success'; a.s = a.s.replace('slip attached', 'confirmed');
  if (x.kind === 'balance') FS.balance += x.amt;
  else if (x.kind === 'rf') FS.used = Math.max(0, FS.used - x.amt);
  else FS.paid[x.loan] = (FS.paid[x.loan] || 0) + (x.count || 1);
  finSave(); return true;
}
function pendingTopups() { return FS.acts.filter(t => t.type === 'topup' && t.st === 'pending'); }
function showToast(msg) {
  const ph = document.querySelector('.phone'); if (!ph) return;
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; ph.appendChild(t); setTimeout(() => t.remove(), 4500);
}

// Collect flow: screen 10 records the sale in Activity; successful sales add to
// "pending settlement" until funds settle into the wallet.
function recordSale(status) {
  if (!FS.draft) FS.draft = { amt: 2450, method: 'card', txid: null };
  const d = FS.draft; let a = d.txid && txById(d.txid);
  if (!a) {
    d.txid = 'TXN-' + (88300 + nextSeq());
    const qr = d.method === 'qr';
    a = mk(d.txid, 'card', qr ? 'QR sale' : 'Card sale', qr ? 'Retail · QR' : 'Retail · Card ···· 4471', 'Today, ' + timeNow(), 0, d.amt, 'sale', { ch: 'retail', st: 'none', by: 'cashier-nisar', x: { device: 'Front Counter' } });
    FS.acts.unshift(a);
  }
  const st = status === 'success' ? 'success' : (status === 'declined' ? 'declined' : 'failed');
  if (a.st === 'success' && st !== 'success') { FS.pending -= a.a; FS.sales -= a.a; FS.salesCount--; }
  if (a.st !== 'success' && st === 'success') { FS.pending += a.a; FS.sales += a.a; FS.salesCount++; }
  a.st = st; a.x.reason = st === 'declined' ? 'Insufficient funds' : (st === 'failed' ? 'Network unavailable' : '');
  finSave();
}
function recordLink() {
  const d = FS.draft; if (!d || !d.link || d.linkId) return;
  d.linkId = 'LNK-' + (4600 + nextSeq());
  FS.acts.unshift(mk(d.linkId, 'link', 'Payment link', d.link.ref || 'No reference', 'Today, ' + timeNow(), 0, d.link.amt, 'link', { ch: 'link', st: 'pending', by: 'cashier-nisar', x: { expiry: d.link.expiry } }));
  finSave();
}
function markLinkPaid(id) {
  const a = txById(id); if (!a || a.st === 'success') return;
  a.st = 'success'; FS.pending += a.a; FS.sales += a.a; FS.salesCount++; finSave();
}
function settleNow() {
  if (FS.pending <= 0) return;
  const amt = FS.pending; FS.pending = 0;
  finTx('down', 'Sales settlement', 'Collected payments', amt, 'settlement', { count: 12 });
}

// Collect-flow draft amount: keypad on screens 6/21, then every later screen
// swaps the sample "2,450" for what was actually typed.
function initAmountKeypad(start, onChange) {
  let digits = String(start), fresh = true;
  const disp = document.querySelector('.amount-display'); const tn = [...disp.childNodes].find(n => n.nodeType === 3);
  const val = () => parseInt(digits || '0') || 0;
  const paint = () => { tn.nodeValue = num(val()); if (onChange) onChange(val()); };
  document.querySelectorAll('.keypad button').forEach(b => {
    const t = b.textContent.trim();
    b.addEventListener('click', () => {
      if (/^\d$/.test(t)) digits = fresh || digits === '0' ? t : digits + t;
      else if (t === '.00') digits = (fresh ? '0' : digits) + '00';
      else digits = digits.slice(0, -1) || '0';
      fresh = false; digits = String(parseInt(digits || '0')).slice(0, 7); paint();
    });
  });
  paint(); return val;
}
document.addEventListener('DOMContentLoaded', () => {
  const b = document.body;
  if (FS.flash) { showToast(FS.flash); FS.flash = null; finSave(); }
  if (b.hasAttribute('data-fresh')) { FS.draft = null; finSave(); }
  if (b.dataset.method && FS.draft) { FS.draft.method = b.dataset.method; finSave(); }
  if (b.hasAttribute('data-draft') && FS.draft) {
    const w = document.createTreeWalker(document.querySelector('.phone'), NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) if (n.nodeValue.includes('2,450')) n.nodeValue = n.nodeValue.replace('2,450', num(FS.draft.amt));
  }
});

function rs(n) { return 'Rs ' + Math.round(n).toLocaleString('en-US'); }
function num(n) { return Math.round(n).toLocaleString('en-US'); }
function byId(id) { return document.getElementById(id); }
function intOf(id) { return parseInt((byId(id).value || '').replace(/[^0-9]/g, '')) || 0; }

// ---------------------------------------------------------------- icons
const FICON_PATHS = {
  send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
  down: '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  zap: '<path d="M13 2L3 14h9l-1 8 10-12h-9z"/>',
  phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
  loop: '<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  flame: '<path d="M12 2c1 4 5 5.5 5 10a5 5 0 01-10 0c0-2 1-3.5 2-4.5.3 1.5 1 2.5 2 2.5 0-3-.5-5 1-8z"/>',
  drop: '<path d="M12 2.7l5.7 5.6a8 8 0 11-11.4 0z"/>',
  wifi: '<path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>',
  bill: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  link: '<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  upload: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>',
  card: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
};
function icn(name, s) { s = s || 17; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (FICON_PATHS[name] || FICON_PATHS.bill) + '</svg>'; }

const ST_BADGE = {
  pending: '<span class="badge blue">Pending</span>', expired: '<span class="badge neutral">Expired</span>',
  declined: '<span class="badge red">Declined</span>', failed: '<span class="badge amber">Not completed</span>',
};
// One row style for every kind of money movement.
function actRow(t) {
  const pos = t.a > 0, muted = ['declined', 'failed', 'expired'].includes(t.st);
  const col = muted ? 'var(--text-faint)' : (pos && t.st === 'success' ? 'var(--green)' : 'var(--heading)');
  return '<a class="txn-row" href="screen-17-transaction-detail.html?id=' + t.id + '"><div class="chan-icon">' + icn(t.i) + '</div><div class="meta"><div class="amt">' + t.t + '</div><div class="sub">' + t.s + ' · ' + t.time + '</div></div>' +
    '<div style="text-align:right"><div style="font-size:13.5px;font-weight:700;color:' + col + '">' + (pos ? '+ ' : '− ') + rs(Math.abs(t.a)) + '</div>' + (ST_BADGE[t.st] || '') + '</div></a>';
}
function isOut(t) { return t.a < 0; }

// ---------------------------------------------------------------- payees
const PAYEES0 = [
  { id: 'AT', av: 'AT', n: 'Ali Traders', s: 'HBL · ···· 4521', t: 'bank' },
  { id: 'FW', av: 'FW', n: 'Fatima Wholesale', s: 'Raast ID · 0300 ···· 567', t: 'raast' },
  { id: 'KP', av: 'KP', n: 'Karachi Packaging', s: 'Meezan · ···· 8830', t: 'bank' },
  { id: 'ND', av: 'ND', n: 'Noor Dairy Farm', s: 'Raast ID · 0321 ···· 012', t: 'raast' },
  { id: 'ZS', av: 'ZS', n: 'Zahid Spices', s: 'UBL · ···· 1175', t: 'bank' },
];
function allPayees() { return PAYEES0.concat(FS.payees); }
function payee(id) { return allPayees().find(p => p.id === id); }

// ---------------------------------------------------------------- billers
const CATS = [['Electricity', 'zap'], ['Gas', 'flame'], ['Water', 'drop'], ['Internet & TV', 'wifi'], ['Mobile bill', 'phone'], ['Education', 'book']];
const BILLERS = {
  kelectric: { n: 'K-Electric', cat: 'Electricity', i: 'zap', ref: '0412 7731 6620', cust: 'Ali Hassan Trading', month: 'Oct 2026', due: 'Nov 12, 2026', amt: 12480, late: 12980 },
  lesco: { n: 'LESCO', cat: 'Electricity', i: 'zap', ref: '14 12345 6789012', cust: 'Ali Hassan Trading', month: 'Oct 2026', due: 'Nov 10, 2026', amt: 9860, late: 10350 },
  ssgc: { n: 'SSGC', cat: 'Gas', i: 'flame', ref: '2204 5518 03', cust: 'Ali Hassan Trading', month: 'Oct 2026', due: 'Nov 14, 2026', amt: 3240, late: 3400 },
  sngpl: { n: 'SNGPL', cat: 'Gas', i: 'flame', ref: '7781 2290 41', cust: 'Ali Hassan Trading', month: 'Oct 2026', due: 'Nov 15, 2026', amt: 2780, late: 2950 },
  kwsb: { n: 'KWSB', cat: 'Water', i: 'drop', ref: '3301 8842 17', cust: 'Ali Hassan Trading', month: 'Oct 2026', due: 'Nov 20, 2026', amt: 1850, late: 1990 },
  ptcl: { n: 'PTCL', cat: 'Internet & TV', i: 'wifi', ref: '021 3456 7890', cust: 'Ali Hassan Trading', month: 'Oct 2026', due: 'Nov 9, 2026', amt: 4999, late: 5300 },
  nayatel: { n: 'Nayatel', cat: 'Internet & TV', i: 'wifi', ref: '5120 0098 33', cust: 'Ali Hassan Trading', month: 'Oct 2026', due: 'Nov 18, 2026', amt: 6500, late: 6800 },
  jazzpost: { n: 'Jazz Postpaid', cat: 'Mobile bill', i: 'phone', ref: '0300 1234567', cust: 'Ali Hassan Trading', month: 'Oct 2026', due: 'Nov 11, 2026', amt: 2350, late: 2500 },
  ufonepost: { n: 'Ufone Postpaid', cat: 'Mobile bill', i: 'phone', ref: '0333 5550321', cust: 'Ali Hassan Trading', month: 'Oct 2026', due: 'Nov 13, 2026', amt: 1780, late: 1900 },
  school: { n: 'The City School', cat: 'Education', i: 'book', ref: 'STU-2231-08', cust: 'Ali Hassan Trading', month: 'Nov 2026', due: 'Nov 25, 2026', amt: 38500, late: 40000 },
};
function dueIn(dateStr) { return Math.round((new Date(dateStr) - TODAY) / 864e5); }
function dueLabel(dateStr) { const d = dueIn(dateStr); return d < 0 ? 'Overdue ' + (-d) + ' days' : (d === 0 ? 'Due today' : 'Due in ' + d + ' days'); }

// ---------------------------------------------------------------- loans
const METHOD_LABEL = { balance: 'Monthly installment from balance', bank: 'Bank auto-debit', sales: 'Deduct from daily sales' };
const METHOD_NOTE = { balance: 'From wallet balance on the 15th', bank: 'Bank auto-debit on the 15th', sales: '15% of daily sales' };

const LOANS = {
  'L-2048': {
    id: 'L-2048', principal: 150000, tenure: 6, rate: 2, disbursed: 'Aug 15, 2026',
    status: 'active', methodKey: 'balance', methodNote: 'From wallet balance on the 15th',
    schedule: [
      { d: 'Sep 15, 2026', st: 'paid', paidOn: 'Sep 15, 2026', ref: 'RPY-30417' },
      { d: 'Oct 15, 2026', st: 'paid', paidOn: 'Oct 15, 2026', ref: 'RPY-31882' },
      { d: 'Nov 15, 2026', st: 'due' },
      { d: 'Dec 15, 2026', st: 'upcoming' },
      { d: 'Jan 15, 2027', st: 'upcoming' },
      { d: 'Feb 15, 2027', st: 'upcoming' },
    ],
  },
  'L-2031': {
    id: 'L-2031', principal: 90000, tenure: 3, rate: 2, disbursed: 'Apr 10, 2026',
    status: 'closed', closedOn: 'Jul 12, 2026', methodKey: 'bank', methodNote: 'HBL ···· 4521 auto-debit',
    schedule: [
      { d: 'May 10, 2026', st: 'paid', paidOn: 'May 10, 2026', ref: 'RPY-22041' },
      { d: 'Jun 10, 2026', st: 'paid', paidOn: 'Jun 10, 2026', ref: 'RPY-24515' },
      { d: 'Jul 10, 2026', st: 'late', paidOn: 'Jul 12, 2026', ref: 'RPY-27730' },
    ],
  },
  'L-1987': {
    id: 'L-1987', principal: 60000, tenure: 3, rate: 2, disbursed: 'Dec 5, 2025',
    status: 'closed', closedOn: 'Mar 5, 2026', methodKey: 'sales', methodNote: '15% of daily sales',
    schedule: [
      { d: 'Jan 5, 2026', st: 'paid', paidOn: 'Jan 5, 2026', ref: 'RPY-08812' },
      { d: 'Feb 5, 2026', st: 'paid', paidOn: 'Feb 5, 2026', ref: 'RPY-11093' },
      { d: 'Mar 5, 2026', st: 'paid', paidOn: 'Mar 5, 2026', ref: 'RPY-13376' },
    ],
  },
};

function dueDates(n) { const out = []; let y = 2026, m = 10; for (let i = 0; i < n; i++) { m++; if (m > 11) { m = 0; y++; } out.push(MONTHS[m] + ' 15, ' + y); } return out; }

// Approved applications become real loans; installments paid in-session
// (FS.paid) are applied on top of the base schedules.
(function deriveLoans() {
  FS.apps.filter(a => a.status === 'approved').forEach(a => {
    LOANS[a.id] = { id: a.id, principal: a.amount, tenure: a.tenure, rate: 2, disbursed: 'Nov 4, 2026', status: 'active', methodKey: a.methodKey, methodNote: METHOD_NOTE[a.methodKey],
      schedule: dueDates(a.tenure).map((d, i) => ({ d: d, st: i === 0 ? 'due' : 'upcoming' })) };
  });
  Object.values(LOANS).forEach(l => {
    let n = FS.paid[l.id] || 0, k = 0;
    l.schedule.forEach(s => { if ((s.st === 'due' || s.st === 'upcoming') && k < n) { s.st = 'paid'; s.paidOn = 'Nov 4, 2026'; s.ref = 'RPY-9' + (4100 + l.tenure * 7 + k * 13); k++; } });
    const firstOpen = l.schedule.find(s => s.st === 'due' || s.st === 'upcoming');
    if (firstOpen) firstOpen.st = 'due'; else if (l.status === 'active') { l.status = 'closed'; l.closedOn = 'Nov 4, 2026'; }
  });
})();

function loanCalc(l) {
  const markup = l.principal * l.rate / 100 * l.tenure;
  const total = l.principal + markup;
  const inst = total / l.tenure;
  const paidCount = l.schedule.filter(s => s.st === 'paid' || s.st === 'late').length;
  return { markup, total, inst, paidCount, paid: inst * paidCount, outstanding: total - inst * paidCount };
}
function activeLoans() { return Object.values(LOANS).filter(l => l.status === 'active'); }
function nextInstallment() {
  let best = null;
  activeLoans().forEach(l => { const s = l.schedule.find(x => x.st === 'due'); if (s && (!best || new Date(s.d) < new Date(best.d))) best = { d: s.d, amt: loanCalc(l).inst, loan: l.id }; });
  return best;
}
function totalOutstanding() { return activeLoans().reduce((a, l) => a + loanCalc(l).outstanding, 0); }

// Running ledger: disbursement + markup debit the borrower's loan account,
// each installment credits it. Balance is the amount still owed.
function loanLedger(l) {
  const c = loanCalc(l);
  const rows = [
    { d: l.disbursed, ds: 'Disbursement', sub: 'Credited to wallet', dr: l.principal, cr: 0 },
    { d: l.disbursed, ds: 'Markup charged', sub: l.rate + '% × ' + l.tenure + ' months', dr: c.markup, cr: 0 },
  ];
  l.schedule.forEach((s, i) => {
    if (s.paidOn) rows.push({ d: s.paidOn, ds: 'Installment ' + (i + 1), sub: s.ref, dr: 0, cr: c.inst });
  });
  let bal = 0;
  rows.forEach(r => { bal += r.dr - r.cr; r.bal = bal; });
  return rows;
}
