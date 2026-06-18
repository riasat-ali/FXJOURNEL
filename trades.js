/* ===========================
   trades.js
   Add / Edit / Delete trades
   + form logic + auto-calc
=========================== */

const Trades = (() => {

  // ---- Auto-calculate pips, pnl, rr, result ----
  function autoCalc() {
    const entry   = parseFloat(document.getElementById('tradeEntry').value);
    const exit    = parseFloat(document.getElementById('tradeExit').value);
    const sl      = parseFloat(document.getElementById('tradeSL').value);
    const tp      = parseFloat(document.getElementById('tradeTP').value);
    const lot     = parseFloat(document.getElementById('tradeLot').value);
    const type    = document.getElementById('tradeType').value;
    const symbol  = document.getElementById('tradeSymbol').value.toUpperCase();

    const pipsEl   = document.getElementById('tradePips');
    const pnlEl    = document.getElementById('tradePnl');
    const rrEl     = document.getElementById('tradeRR');
    const resultEl = document.getElementById('tradeResult');

    // Pip size: XAUUSD/Gold = 0.01, JPY pairs = 0.01, others = 0.0001
    let pipSize = 0.0001;
    if (symbol.includes('JPY') || symbol.includes('XAG')) pipSize = 0.01;
    if (symbol.includes('XAU') || symbol.includes('GOLD')) pipSize = 0.1;

    // Pip value per lot (standard lot = 100000 units, 1 pip = $10 for most pairs)
    let pipValue = 10;
    if (symbol.includes('XAU') || symbol.includes('GOLD')) pipValue = 10;
    if (symbol.includes('JPY')) pipValue = 9.1;

    let pips = '', pnl = '', rr = '', result = '';

    if (!isNaN(entry) && !isNaN(exit)) {
      const rawPips = (exit - entry) / pipSize;
      const directedPips = type === 'sell' ? -rawPips : rawPips;
      pips = directedPips.toFixed(1);

      if (!isNaN(lot)) {
        const rawPnl = directedPips * pipValue * lot;
        pnl    = rawPnl.toFixed(2);
        result = rawPnl > 0 ? 'Win' : rawPnl < 0 ? 'Loss' : 'BE';
      }
    }

    // R:R = (tp - entry) / (entry - sl) for buy
    if (!isNaN(entry) && !isNaN(sl) && !isNaN(tp)) {
      const risk   = Math.abs(entry - sl);
      const reward = Math.abs(tp - entry);
      if (risk > 0) rr = (reward / risk).toFixed(2);
    }

    pipsEl.value   = pips;
    pnlEl.value    = pnl ? '$' + pnl : '';
    rrEl.value     = rr ? '1:' + rr : '';
    resultEl.value = result;

    // Color result field
    resultEl.style.color =
      result === 'Win'  ? 'var(--green)' :
      result === 'Loss' ? 'var(--red)'   : 'var(--amber)';
  }

  function bindAutoCalc() {
    const fields = ['tradeEntry','tradeExit','tradeSL','tradeTP','tradeLot','tradeType','tradeSymbol'];
    fields.forEach(id => {
      document.getElementById(id).addEventListener('input', autoCalc);
      document.getElementById(id).addEventListener('change', autoCalc);
    });
  }

  // ---- Save trade ----
  function saveTrade() {
    const symbol = document.getElementById('tradeSymbol').value.trim();
    const type   = document.getElementById('tradeType').value;
    const date   = document.getElementById('tradeDate').value;

    if (!symbol || !type || !date) {
      alert('Please fill in at least: Date, Symbol, and Direction.');
      return;
    }

    const pnlRaw = document.getElementById('tradePnl').value.replace('$','');
    const rrRaw  = document.getElementById('tradeRR').value.replace('1:','');

    const trade = {
      date:    date,
      symbol:  symbol.toUpperCase(),
      type:    type,
      entry:   document.getElementById('tradeEntry').value,
      exit:    document.getElementById('tradeExit').value,
      sl:      document.getElementById('tradeSL').value,
      tp:      document.getElementById('tradeTP').value,
      lot:     document.getElementById('tradeLot').value,
      pips:    document.getElementById('tradePips').value,
      pnl:     pnlRaw,
      rr:      rrRaw,
      result:  document.getElementById('tradeResult').value,
      session: document.getElementById('tradeSession').value,
      setup:   document.getElementById('tradeSetup').value,
      emotion: document.getElementById('tradeEmotion').value,
      notes:   document.getElementById('tradeNotes').value.trim()
    };

    const editId = document.getElementById('editTradeId').value;

    if (editId) {
      Storage.updateTrade(editId, trade);
      document.getElementById('editTradeId').value = '';
    } else {
      Storage.addTrade(trade);
    }

    clearForm();
    App.refresh();
    App.navigate('dashboard');
  }

  // ---- Load trade into form for editing ----
  function editTrade(id) {
    const t = Storage.getById(id);
    if (!t) return;

    document.getElementById('tradeDate').value    = t.date;
    document.getElementById('tradeSymbol').value  = t.symbol;
    document.getElementById('tradeType').value    = t.type;
    document.getElementById('tradeEntry').value   = t.entry;
    document.getElementById('tradeExit').value    = t.exit;
    document.getElementById('tradeSL').value      = t.sl;
    document.getElementById('tradeTP').value      = t.tp;
    document.getElementById('tradeLot').value     = t.lot;
    document.getElementById('tradeSession').value = t.session;
    document.getElementById('tradeSetup').value   = t.setup;
    document.getElementById('tradeEmotion').value = t.emotion;
    document.getElementById('tradeNotes').value   = t.notes;
    document.getElementById('editTradeId').value  = id;

    autoCalc();
    App.navigate('new-trade');
    document.querySelector('.form-heading').textContent = 'Edit Trade';
    document.getElementById('btnSaveTrade').textContent = 'Update Trade';
  }

  function deleteTrade(id) {
    if (!confirm('Delete this trade? This cannot be undone.')) return;
    Storage.deleteTrade(id);
    App.refresh();
  }

  function clearForm() {
    const fields = ['tradeDate','tradeSymbol','tradeEntry','tradeExit','tradeSL','tradeTP','tradeLot','tradeNotes'];
    fields.forEach(id => document.getElementById(id).value = '');
    ['tradeType','tradeSession','tradeSetup','tradeEmotion'].forEach(id => document.getElementById(id).value = '');
    ['tradePips','tradePnl','tradeRR','tradeResult'].forEach(id => {
      document.getElementById(id).value = '';
      document.getElementById(id).style.color = '';
    });
    document.getElementById('editTradeId').value = '';
    document.querySelector('.form-heading').textContent  = 'Log New Trade';
    document.getElementById('btnSaveTrade').textContent  = 'Save Trade';
  }

  // ---- Render a single table row ----
  function renderRow(t, cols) {
    const pnl    = parseFloat(t.pnl) || 0;
    const pnlStr = (pnl >= 0 ? '+$' : '-$') + Math.abs(pnl).toFixed(2);
    const pnlCls = pnl > 0 ? 'color:var(--green);font-weight:600' : pnl < 0 ? 'color:var(--red);font-weight:600' : '';

    const resultBadge =
      t.result === 'Win'  ? '<span class="badge badge-win">Win</span>'  :
      t.result === 'Loss' ? '<span class="badge badge-loss">Loss</span>' :
      t.result === 'BE'   ? '<span class="badge badge-be">BE</span>'    : '—';

    const typeBadge = t.type === 'buy'
      ? '<span class="badge badge-buy">Buy</span>'
      : '<span class="badge badge-sell">Sell</span>';

    const dateStr = t.date ? t.date.replace('T', ' ').slice(0, 16) : '—';

    if (cols === 'recent') {
      return `<tr>
        <td>${dateStr}</td>
        <td><strong>${t.symbol}</strong></td>
        <td>${typeBadge}</td>
        <td>${t.entry || '—'}</td>
        <td>${t.exit  || '—'}</td>
        <td>${t.pips  || '—'}</td>
        <td style="${pnlCls}">${pnlStr}</td>
        <td>${t.session || '—'}</td>
        <td>${resultBadge}</td>
      </tr>`;
    }

    // Full history row
    return `<tr>
      <td>${dateStr}</td>
      <td><strong>${t.symbol}</strong></td>
      <td>${typeBadge}</td>
      <td>${t.entry || '—'}</td>
      <td>${t.exit  || '—'}</td>
      <td>${t.lot   || '—'}</td>
      <td>${t.pips  || '—'}</td>
      <td style="${pnlCls}">${pnlStr}</td>
      <td>${t.rr ? '1:' + parseFloat(t.rr).toFixed(2) : '—'}</td>
      <td>${t.session || '—'}</td>
      <td>${t.emotion || '—'}</td>
      <td>${resultBadge}</td>
      <td>
        <button class="btn-action" onclick="Trades.editTrade('${t.id}')">Edit</button>
        <button class="btn-action delete" onclick="Trades.deleteTrade('${t.id}')">Delete</button>
      </td>
    </tr>`;
  }

  // ---- Render recent trades table (dashboard) ----
  function renderRecent() {
    const trades = Storage.getAll().slice(0, 8);
    const tbody  = document.getElementById('recentTradesTbody');
    if (!trades.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="empty-msg">No trades yet. Add your first trade!</td></tr>';
      return;
    }
    tbody.innerHTML = trades.map(t => renderRow(t, 'recent')).join('');
  }

  // ---- Render stats cards ----
  function renderStats() {
    const trades = Storage.getAll();
    const s      = Stats.calculate(trades);

    document.getElementById('statTotalTrades').textContent  = s.total;
    document.getElementById('statWinRate').textContent      = s.winRate + '%';
    document.getElementById('statAvgRR').textContent        = '1:' + s.avgRR;
    document.getElementById('statProfitFactor').textContent = s.profitFactor;
    document.getElementById('statBestTrade').textContent    = '+$' + s.bestTrade;
    document.getElementById('statWorstTrade').textContent   = '-$' + Math.abs(s.worstTrade).toFixed(2);

    const pnl    = parseFloat(s.totalPnl);
    const pnlEl  = document.getElementById('statTotalPnl');
    pnlEl.textContent = (pnl >= 0 ? '+$' : '-$') + Math.abs(pnl).toFixed(2);
    pnlEl.className   = 'stat-value ' + (pnl >= 0 ? 'green' : 'red');

    const streakEl = document.getElementById('statStreak');
    if (streakEl) {
      streakEl.textContent = s.streak > 0 ? '🔥 ' + s.streak + 'W' : s.streak < 0 ? '❄️ ' + Math.abs(s.streak) + 'L' : '—';
      streakEl.className   = 'stat-value ' + (s.streak > 0 ? 'green' : s.streak < 0 ? 'red' : '');
    }

    // Sync wins/losses sub-text
    const subWins = document.getElementById('statSubWins');
    if (subWins) subWins.textContent = s.wins + 'W / ' + s.losses + 'L';
    const subTrades = document.getElementById('statSubTrades');
    if (subTrades) subTrades.textContent = s.total > 0 ? s.total + ' total' : 'No trades yet';
  }

  function init() {
    bindAutoCalc();
    document.getElementById('btnSaveTrade').addEventListener('click', saveTrade);
    document.getElementById('btnClearForm').addEventListener('click', clearForm);

    // Set default datetime to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('tradeDate').value = now.toISOString().slice(0, 16);
  }

  return { init, renderStats, renderRecent, renderRow, editTrade, deleteTrade };

})();
