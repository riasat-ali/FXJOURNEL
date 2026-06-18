/* ===========================
   storage.js
   Handles all data persistence
   via localStorage
=========================== */

const Storage = (() => {

  const KEY = 'tradingJournal_trades';

  function getAll() {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  }

  function saveAll(trades) {
    localStorage.setItem(KEY, JSON.stringify(trades));
  }

  function addTrade(trade) {
    const trades = getAll();
    trade.id = Date.now().toString();
    trades.unshift(trade);
    saveAll(trades);
    return trade;
  }

  function updateTrade(id, updated) {
    const trades = getAll();
    const idx = trades.findIndex(t => t.id === id);
    if (idx !== -1) {
      trades[idx] = { ...trades[idx], ...updated };
      saveAll(trades);
      return trades[idx];
    }
    return null;
  }

  function deleteTrade(id) {
    const trades = getAll().filter(t => t.id !== id);
    saveAll(trades);
  }

  function getById(id) {
    return getAll().find(t => t.id === id) || null;
  }

  // Export trades as CSV string
  function exportCSV() {
    const trades = getAll();
    if (!trades.length) return null;

    const headers = [
      'Date','Symbol','Type','Entry','Exit','SL','TP',
      'Lot','Pips','PnL','RR','Result','Session','Setup','Emotion','Notes'
    ];

    const rows = trades.map(t => [
      t.date, t.symbol, t.type, t.entry, t.exit, t.sl, t.tp,
      t.lot, t.pips, t.pnl, t.rr, t.result,
      t.session, t.setup, t.emotion,
      '"' + (t.notes || '').replace(/"/g, '""') + '"'
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  // Parse imported CSV (MT5 or journal format)
  function parseImportCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const imported = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = (cols[idx] || '').trim().replace(/^"|"$/g, '');
      });

      imported.push({
        id: Date.now().toString() + i,
        date:    row['date']    || row['open time'] || '',
        symbol:  row['symbol'] || row['pair']       || '',
        type:    row['type']   || row['direction']  || '',
        entry:   row['entry']  || row['open price'] || '',
        exit:    row['exit']   || row['close price']|| '',
        sl:      row['sl']     || row['stop loss']  || '',
        tp:      row['tp']     || row['take profit']|| '',
        lot:     row['lot']    || row['volume']     || '',
        pips:    row['pips']   || '',
        pnl:     row['pnl']    || row['profit']     || '',
        rr:      row['rr']     || '',
        result:  row['result'] || '',
        session: row['session']  || '',
        setup:   row['setup']    || '',
        emotion: row['emotion']  || '',
        notes:   row['notes']    || ''
      });
    }

    return imported;
  }

  function importTrades(csvText) {
    const parsed = parseImportCSV(csvText);
    if (!parsed.length) return 0;
    const existing = getAll();
    saveAll([...parsed, ...existing]);
    return parsed.length;
  }

  return { getAll, saveAll, addTrade, updateTrade, deleteTrade, getById, exportCSV, importTrades };

})();
