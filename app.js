/* ===========================
   app.js
   Main entry point
   Navigation + refresh + equity
=========================== */

const App = (() => {

  // ---- Equity ----
  function getEquityData() {
    const raw = localStorage.getItem('fxjournal_equity');
    return raw ? JSON.parse(raw) : { start: 0, current: 0 };
  }

  function saveEquityData(start, current) {
    localStorage.setItem('fxjournal_equity', JSON.stringify({ start, current }));
  }

  function renderEquity() {
    const trades  = Storage.getAll();
    const stats   = Stats.calculate(trades);
    const eq      = getEquityData();

    const totalPnl   = parseFloat(stats.totalPnl) || 0;
    const startEq    = parseFloat(eq.start)   || 0;
    const manualCurr = parseFloat(eq.current) || 0;

    // Current equity = manual current + realized PnL from trades
    const currentEq = manualCurr > 0
      ? manualCurr
      : (startEq > 0 ? startEq + totalPnl : 0);

    const pnlAmt = currentEq - startEq;
    const pnlPct = startEq > 0 ? ((pnlAmt / startEq) * 100).toFixed(2) : null;

    // Sidebar widget
    const seqVal  = document.getElementById('sidebarEquity');
    const seqSt   = document.getElementById('sidebarStartEquity');
    const seqPct  = document.getElementById('sidebarPnlPct');
    const seqBar  = document.getElementById('sidebarEquityBar');

    seqVal.textContent = currentEq > 0 ? '$' + currentEq.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}) : '$0.00';
    seqSt.textContent  = startEq  > 0 ? '$' + startEq.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}) : '—';

    if (pnlPct !== null) {
      const isPos = pnlAmt >= 0;
      seqPct.textContent  = (isPos ? '+' : '') + pnlPct + '%';
      seqPct.className    = 'seq-pnl ' + (isPos ? 'pos' : 'neg');
      const barPct = Math.min(Math.abs(pnlAmt / startEq) * 100 * 5, 100);
      seqBar.style.width  = barPct + '%';
      seqBar.style.background = isPos ? '#3b82f6' : '#f87171';
    } else {
      seqPct.textContent = '—';
      seqPct.className   = 'seq-pnl neutral';
      seqBar.style.width = '0%';
    }

    // Dashboard stat card
    const statEqEl  = document.getElementById('statCurrentEquity');
    const statEqSub = document.getElementById('statEquityChange');
    if (statEqEl) {
      statEqEl.textContent = currentEq > 0
        ? '$' + currentEq.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})
        : '$0.00';
      statEqEl.className = 'stat-value ' + (pnlAmt >= 0 ? 'green' : 'red');
    }
    if (statEqSub && pnlPct !== null) {
      statEqSub.textContent = (pnlAmt >= 0 ? '+' : '') + '$' + Math.abs(pnlAmt).toFixed(2) + ' (' + (pnlAmt >= 0 ? '+' : '') + pnlPct + '%)';
      statEqSub.style.color = pnlAmt >= 0 ? 'var(--green)' : 'var(--red)';
    } else if (statEqSub) {
      statEqSub.textContent = 'Set starting equity';
      statEqSub.style.color = '';
    }

    // Equity pill on chart card
    const pill = document.getElementById('equityPill');
    if (pill && pnlPct !== null) {
      pill.textContent  = (pnlAmt >= 0 ? '+' : '') + pnlPct + '%';
      pill.style.background = pnlAmt >= 0 ? 'var(--green-bg)' : 'var(--red-bg)';
      pill.style.color      = pnlAmt >= 0 ? 'var(--green)'   : 'var(--red)';
    } else if (pill) {
      pill.textContent = '—';
    }
  }

  function initEquityModal() {
    const modal      = document.getElementById('equityModal');
    const btnEdit    = document.getElementById('btnEditEquity');
    const btnSave    = document.getElementById('btnSaveEquity');
    const btnCancel  = document.getElementById('btnCancelEquity');
    const inpStart   = document.getElementById('inputStartEquity');
    const inpCurrent = document.getElementById('inputCurrentEquity');

    btnEdit.addEventListener('click', () => {
      const eq = getEquityData();
      inpStart.value   = eq.start   || '';
      inpCurrent.value = eq.current || '';
      modal.classList.add('open');
    });

    btnSave.addEventListener('click', () => {
      const s = parseFloat(inpStart.value)   || 0;
      const c = parseFloat(inpCurrent.value) || 0;
      saveEquityData(s, c);
      modal.classList.remove('open');
      renderEquity();
    });

    btnCancel.addEventListener('click', () => modal.classList.remove('open'));

    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }

  // ---- Navigation ----
  function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');

    const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navEl) navEl.classList.add('active');

    const titles = {
      'dashboard': 'Dashboard',
      'new-trade': 'New Trade',
      'history':   'Trade History',
      'analytics': 'Analytics'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'FXJournal';

    if (page === 'dashboard') {
      Trades.renderStats();
      Trades.renderRecent();
      Charts.refreshAll(Storage.getAll());
      renderEquity();
      renderStreak();
    }
    if (page === 'history')   Filters.renderHistory();
    if (page === 'analytics') Charts.refreshAnalytics(Storage.getAll());
  }

  function renderStreak() {
    const trades  = Storage.getAll();
    const stats   = Stats.calculate(trades);
    const banner  = document.getElementById('streakBanner');
    const text    = document.getElementById('streakText');
    if (!banner) return;

    if (stats.streak >= 3) {
      text.textContent = '🔥 You are on a ' + stats.streak + '-win streak! Keep it up!';
      banner.style.display = 'block';
      banner.style.background = 'linear-gradient(90deg,#dcfce7,#bbf7d0)';
      banner.style.borderColor = '#86efac';
      banner.style.color = '#14532d';
    } else if (stats.streak <= -3) {
      text.textContent = '⚠️ ' + Math.abs(stats.streak) + ' losses in a row — consider taking a break.';
      banner.style.display = 'block';
      banner.style.background = 'linear-gradient(90deg,#fee2e2,#fecaca)';
      banner.style.borderColor = '#fca5a5';
      banner.style.color = '#7f1d1d';
    } else {
      banner.style.display = 'none';
    }
  }

  function refresh() {
    const activePage = document.querySelector('.page.active');
    if (!activePage) return;
    navigate(activePage.id.replace('page-', ''));
  }

  // ---- Init ----
  function initNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        navigate(item.dataset.page);
      });
    });

    // "View all" link on dashboard recent trades
    document.querySelectorAll('.section-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const pg = link.dataset.page;
        if (pg) navigate(pg);
      });
    });

    // Quick trade button in topbar
    const qbtn = document.getElementById('btnQuickTrade');
    if (qbtn) qbtn.addEventListener('click', () => navigate('new-trade'));
  }

  function initDate() {
    const opts = { weekday:'short', year:'numeric', month:'short', day:'numeric' };
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', opts);
  }

  function initExportImport() {
    document.getElementById('btnExport').addEventListener('click', () => {
      const csv = Storage.exportCSV();
      if (!csv) { alert('No trades to export.'); return; }
      const blob = new Blob([csv], { type:'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'fxjournal-' + new Date().toISOString().slice(0,10) + '.csv';
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('btnImportTrigger').addEventListener('click', () => {
      document.getElementById('csvFileInput').click();
    });

    document.getElementById('csvFileInput').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const count = Storage.importTrades(ev.target.result);
        if (count > 0) { alert(count + ' trades imported!'); refresh(); }
        else alert('Could not parse CSV. Please check format.');
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  function init() {
    initNav();
    initDate();
    initEquityModal();
    Trades.init();
    Filters.init();
    initExportImport();
    navigate('dashboard');
  }

  document.addEventListener('DOMContentLoaded', init);

  return { navigate, refresh, renderEquity };

})();
