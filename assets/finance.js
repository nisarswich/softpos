// Shared mock data, persisted demo state and helpers for the Finance screens (23–32).
// State lives in localStorage (key swich_demo_fin) so a payment made on one
// screen shows up in balance / activity / loans everywhere else. Use the
// "Reset demo data" button in any mockup control strip to start over.
// Markup is an ILLUSTRATIVE flat 2%/month so schedule, repayments and ledger
// reconcile; real pricing comes from the lending partner (see handoff notes).

const FKEY = 'swich_demo_fin';
const TODAY = new Date('Nov 4, 2026');
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const SEED = {
  balance: 184250,
  used: 150000,
  acts: [
    { i: 'send', t: 'Ali Traders', s: 'Raast · Today, 11:20 AM', a: -25000 },
    { i: 'down', t: 'Sales settlement', s: 'Today, 9:00 AM', a: 98400 },
    { i: 'phone', t: 'Jazz airtime', s: 'Nov 2, 6:05 PM', a: -500 },
    { i: 'loop', t: 'Running finance pulled', s: 'Nov 1, 10:30 AM', a: 50000 },
    { i: 'flame', t: 'SSGC bill', s: 'Oct 28, 2:10 PM', a: -3240 },
    { i: 'loop', t: 'Running finance pulled', s: 'Oct 22, 2:15 PM', a: 100000 },
    { i: 'loop', t: 'Running finance repaid', s: 'Oct 10, 5:40 PM', a: -60000 },
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
// Record a wallet movement (signed amount) and add it to recent activity.
function finTx(icon, title, sub, amt) {
  FS.balance += amt;
  FS.acts.unshift({ i: icon, t: title, s: sub + ' · Today, ' + timeNow(), a: amt });
  finSave();
}

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
};
function icn(name, s) { s = s || 17; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (FICON_PATHS[name] || FICON_PATHS.bill) + '</svg>'; }
function actRow(a) {
  const pos = a.a > 0;
  return '<div class="txn-row"><div class="chan-icon">' + icn(a.i) + '</div><div class="meta"><div class="amt">' + a.t + '</div><div class="sub">' + a.s + '</div></div>' +
    '<div style="font-size:13.5px;font-weight:700;color:' + (pos ? 'var(--green)' : 'var(--heading)') + '">' + (pos ? '+ ' : '− ') + rs(Math.abs(a.a)) + '</div></div>';
}

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
