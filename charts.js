/* ===========================
   charts.js
   All Chart.js chart rendering
=========================== */

const Charts = (() => {

  const instances = {};

  const BLUE       = '#1a56db';
  const BLUE_LIGHT = '#93c5fd';
  const GREEN      = '#16a34a';
  const RED        = '#dc2626';
  const GRID       = '#e2e8f0';
  const TEXT_MUTED = '#94a3b8';

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { color: GRID, lineWidth: 0.5 },
        ticks: { color: TEXT_MUTED, font: { size: 11 }, maxRotation: 30 }
      },
      y: {
        grid: { color: GRID, lineWidth: 0.5 },
        ticks: { color: TEXT_MUTED, font: { size: 11 } }
      }
    }
  };

  function destroy(id) {
    if (instances[id]) {
      instances[id].destroy();
      delete instances[id];
    }
  }

  // Equity Curve — line chart
  function drawEquity(data) {
    destroy('equityChart');
    if (!data.length) return;

    const ctx = document.getElementById('equityChart');
    if (!ctx) return;

    instances['equityChart'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.date),
        datasets: [{
          label: 'Equity',
          data: data.map(d => d.value),
          borderColor: BLUE,
          backgroundColor: 'rgba(26,86,219,0.07)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: data.length > 30 ? 0 : 3,
          pointBackgroundColor: BLUE
        }]
      },
      options: {
        ...baseOptions,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => '$' + ctx.parsed.y.toFixed(2)
            }
          }
        },
        scales: {
          ...baseOptions.scales,
          y: {
            ...baseOptions.scales.y,
            ticks: {
              ...baseOptions.scales.y.ticks,
              callback: v => '$' + v.toFixed(0)
            }
          }
        }
      }
    });
  }

  // Daily PnL — bar chart
  function drawDailyPnl(data) {
    destroy('dailyPnlChart');
    if (!data.length) return;

    const ctx = document.getElementById('dailyPnlChart');
    if (!ctx) return;

    instances['dailyPnlChart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.date),
        datasets: [{
          label: 'Daily P&L',
          data: data.map(d => d.pnl),
          backgroundColor: data.map(d => d.pnl >= 0 ? 'rgba(22,163,74,0.75)' : 'rgba(220,38,38,0.75)'),
          borderColor:     data.map(d => d.pnl >= 0 ? GREEN : RED),
          borderWidth: 1,
          borderRadius: 3
        }]
      },
      options: {
        ...baseOptions,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => '$' + ctx.parsed.y.toFixed(2)
            }
          }
        },
        scales: {
          ...baseOptions.scales,
          x: { ...baseOptions.scales.x, ticks: { ...baseOptions.scales.x.ticks, autoSkip: true, maxTicksLimit: 10 } },
          y: {
            ...baseOptions.scales.y,
            ticks: { ...baseOptions.scales.y.ticks, callback: v => '$' + v.toFixed(0) }
          }
        }
      }
    });
  }

  // Win Rate by Symbol — horizontal bar
  function drawSymbol(data) {
    destroy('symbolChart');
    if (!data.length) return;

    const ctx = document.getElementById('symbolChart');
    if (!ctx) return;

    instances['symbolChart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.symbol),
        datasets: [{
          label: 'Win Rate %',
          data: data.map(d => d.winRate),
          backgroundColor: 'rgba(26,86,219,0.7)',
          borderColor: BLUE,
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        ...baseOptions,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ctx.parsed.x.toFixed(1) + '%' } }
        },
        scales: {
          x: {
            ...baseOptions.scales.x,
            min: 0, max: 100,
            ticks: { ...baseOptions.scales.x.ticks, callback: v => v + '%' }
          },
          y: { ...baseOptions.scales.y }
        }
      }
    });
  }

  // Session PnL — bar chart
  function drawSession(data) {
    destroy('sessionChart');
    if (!data.length) return;

    const ctx = document.getElementById('sessionChart');
    if (!ctx) return;

    instances['sessionChart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.session),
        datasets: [{
          label: 'P&L',
          data: data.map(d => d.pnl),
          backgroundColor: data.map(d => d.pnl >= 0 ? 'rgba(22,163,74,0.7)' : 'rgba(220,38,38,0.7)'),
          borderColor:     data.map(d => d.pnl >= 0 ? GREEN : RED),
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        ...baseOptions,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => '$' + ctx.parsed.y.toFixed(2) } }
        },
        scales: {
          ...baseOptions.scales,
          y: { ...baseOptions.scales.y, ticks: { ...baseOptions.scales.y.ticks, callback: v => '$' + v } }
        }
      }
    });
  }

  // Day of Week — bar chart
  function drawDayOfWeek(data) {
    destroy('dayChart');
    if (!data.length) return;

    const ctx = document.getElementById('dayChart');
    if (!ctx) return;

    instances['dayChart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.day.slice(0, 3)),
        datasets: [{
          label: 'P&L',
          data: data.map(d => d.pnl),
          backgroundColor: data.map(d => d.pnl >= 0 ? 'rgba(22,163,74,0.7)' : 'rgba(220,38,38,0.7)'),
          borderColor:     data.map(d => d.pnl >= 0 ? GREEN : RED),
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        ...baseOptions,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => '$' + ctx.parsed.y.toFixed(2) } }
        },
        scales: {
          ...baseOptions.scales,
          y: { ...baseOptions.scales.y, ticks: { ...baseOptions.scales.y.ticks, callback: v => '$' + v } }
        }
      }
    });
  }

  // Emotion win rate — horizontal bar
  function drawEmotion(data) {
    destroy('emotionChart');
    if (!data.length) return;

    const ctx = document.getElementById('emotionChart');
    if (!ctx) return;

    const colors = {
      'Confident': 'rgba(22,163,74,0.7)',
      'Neutral':   'rgba(26,86,219,0.7)',
      'FOMO':      'rgba(220,38,38,0.7)',
      'Revenge':   'rgba(185,28,28,0.7)',
      'Anxious':   'rgba(217,119,6,0.7)',
      'Greedy':    'rgba(180,83,9,0.7)'
    };

    instances['emotionChart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.emotion),
        datasets: [{
          label: 'Win Rate %',
          data: data.map(d => d.winRate),
          backgroundColor: data.map(d => colors[d.emotion] || 'rgba(26,86,219,0.7)'),
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        ...baseOptions,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ctx.parsed.x.toFixed(1) + '%' } }
        },
        scales: {
          x: {
            ...baseOptions.scales.x,
            min: 0, max: 100,
            ticks: { ...baseOptions.scales.x.ticks, callback: v => v + '%' }
          },
          y: { ...baseOptions.scales.y }
        }
      }
    });
  }

  function refreshAll(trades) {
    drawEquity(Stats.getEquityCurve(trades));
    drawDailyPnl(Stats.getDailyPnl(trades));
  }

  function refreshAnalytics(trades) {
    drawSymbol(Stats.getSymbolStats(trades));
    drawSession(Stats.getSessionStats(trades));
    drawDayOfWeek(Stats.getDayOfWeekStats(trades));
    drawEmotion(Stats.getEmotionStats(trades));
  }

  return { refreshAll, refreshAnalytics };

})();
