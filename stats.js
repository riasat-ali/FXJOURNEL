/* ===========================
   stats.js
   Calculates all dashboard
   statistics from trade data
=========================== */

const Stats = (() => {

  function calculate(trades) {
    if (!trades.length) return getEmpty();

    const closed = trades.filter(t => t.pnl !== '' && t.pnl !== null && !isNaN(parseFloat(t.pnl)));

    const wins   = closed.filter(t => parseFloat(t.pnl) > 0);
    const losses = closed.filter(t => parseFloat(t.pnl) < 0);
    const be     = closed.filter(t => parseFloat(t.pnl) === 0);

    const totalPnl     = closed.reduce((s, t) => s + parseFloat(t.pnl), 0);
    const grossProfit  = wins.reduce((s, t) => s + parseFloat(t.pnl), 0);
    const grossLoss    = Math.abs(losses.reduce((s, t) => s + parseFloat(t.pnl), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

    const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;

    const rrValues = closed.filter(t => t.rr && !isNaN(parseFloat(t.rr))).map(t => parseFloat(t.rr));
    const avgRR = rrValues.length > 0 ? rrValues.reduce((s, v) => s + v, 0) / rrValues.length : 0;

    const bestTrade  = wins.length   ? Math.max(...wins.map(t => parseFloat(t.pnl)))   : 0;
    const worstTrade = losses.length ? Math.min(...losses.map(t => parseFloat(t.pnl))) : 0;

    const streak = calcStreak(closed);

    return {
      total:        trades.length,
      wins:         wins.length,
      losses:       losses.length,
      be:           be.length,
      winRate:      winRate.toFixed(1),
      totalPnl:     totalPnl.toFixed(2),
      profitFactor: profitFactor.toFixed(2),
      avgRR:        avgRR.toFixed(2),
      bestTrade:    bestTrade.toFixed(2),
      worstTrade:   worstTrade.toFixed(2),
      streak:       streak
    };
  }

  function calcStreak(trades) {
    if (!trades.length) return 0;
    const sorted = [...trades].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    const first = parseFloat(sorted[0].pnl);
    const isWin = first > 0;

    for (const t of sorted) {
      const pnl = parseFloat(t.pnl);
      if (isWin && pnl > 0) streak++;
      else if (!isWin && pnl < 0) streak++;
      else break;
    }

    return isWin ? streak : -streak;
  }

  // Equity curve: cumulative PnL over time
  function getEquityCurve(trades) {
    const sorted = [...trades]
      .filter(t => t.pnl && !isNaN(parseFloat(t.pnl)))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    let cumulative = 0;
    return sorted.map(t => {
      cumulative += parseFloat(t.pnl);
      return {
        date:  t.date ? t.date.split('T')[0] : 'N/A',
        value: parseFloat(cumulative.toFixed(2))
      };
    });
  }

  // Daily PnL grouped by date
  function getDailyPnl(trades) {
    const map = {};
    trades
      .filter(t => t.pnl && !isNaN(parseFloat(t.pnl)))
      .forEach(t => {
        const day = t.date ? t.date.split('T')[0] : 'N/A';
        map[day] = (map[day] || 0) + parseFloat(t.pnl);
      });

    return Object.entries(map)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, pnl]) => ({ date, pnl: parseFloat(pnl.toFixed(2)) }));
  }

  // Win rate per symbol
  function getSymbolStats(trades) {
    const map = {};
    trades
      .filter(t => t.pnl && !isNaN(parseFloat(t.pnl)) && t.symbol)
      .forEach(t => {
        const sym = t.symbol.toUpperCase();
        if (!map[sym]) map[sym] = { wins: 0, total: 0 };
        map[sym].total++;
        if (parseFloat(t.pnl) > 0) map[sym].wins++;
      });

    return Object.entries(map).map(([symbol, d]) => ({
      symbol,
      winRate: parseFloat(((d.wins / d.total) * 100).toFixed(1)),
      total: d.total
    })).sort((a, b) => b.total - a.total);
  }

  // PnL per session
  function getSessionStats(trades) {
    const sessions = ['Asian', 'London', 'New York', 'Pacific'];
    return sessions.map(s => {
      const filtered = trades.filter(t => t.session === s && t.pnl && !isNaN(parseFloat(t.pnl)));
      const pnl = filtered.reduce((sum, t) => sum + parseFloat(t.pnl), 0);
      return { session: s, pnl: parseFloat(pnl.toFixed(2)), count: filtered.length };
    });
  }

  // PnL per day of week
  function getDayOfWeekStats(trades) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const map = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };

    trades
      .filter(t => t.pnl && !isNaN(parseFloat(t.pnl)) && t.date)
      .forEach(t => {
        const d = new Date(t.date).getDay();
        map[d] += parseFloat(t.pnl);
      });

    return days.map((name, i) => ({
      day: name,
      pnl: parseFloat(map[i].toFixed(2))
    }));
  }

  // Win rate per emotion
  function getEmotionStats(trades) {
    const map = {};
    trades
      .filter(t => t.emotion && t.pnl && !isNaN(parseFloat(t.pnl)))
      .forEach(t => {
        if (!map[t.emotion]) map[t.emotion] = { wins: 0, total: 0 };
        map[t.emotion].total++;
        if (parseFloat(t.pnl) > 0) map[t.emotion].wins++;
      });

    return Object.entries(map).map(([emotion, d]) => ({
      emotion,
      winRate: parseFloat(((d.wins / d.total) * 100).toFixed(1)),
      total: d.total
    }));
  }

  function getEmpty() {
    return {
      total: 0, wins: 0, losses: 0, be: 0,
      winRate: '0.0', totalPnl: '0.00',
      profitFactor: '0.00', avgRR: '0.00',
      bestTrade: '0.00', worstTrade: '0.00', streak: 0
    };
  }

  return { calculate, getEquityCurve, getDailyPnl, getSymbolStats, getSessionStats, getDayOfWeekStats, getEmotionStats };

})();
