/* ===========================
   filters.js
   Filter + sort trade history
=========================== */

const Filters = (() => {

  function getFiltered() {
    const symbol   = document.getElementById('filterSymbol').value.trim().toUpperCase();
    const session  = document.getElementById('filterSession').value;
    const result   = document.getElementById('filterResult').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo   = document.getElementById('filterDateTo').value;

    let trades = Storage.getAll();

    if (symbol)   trades = trades.filter(t => t.symbol && t.symbol.includes(symbol));
    if (session)  trades = trades.filter(t => t.session === session);
    if (result)   trades = trades.filter(t => t.result  === result);

    if (dateFrom) {
      trades = trades.filter(t => t.date && t.date.slice(0,10) >= dateFrom);
    }
    if (dateTo) {
      trades = trades.filter(t => t.date && t.date.slice(0,10) <= dateTo);
    }

    return trades;
  }

  function renderHistory() {
    const trades = getFiltered();
    const tbody  = document.getElementById('historyTbody');

    if (!trades.length) {
      tbody.innerHTML = '<tr><td colspan="13" class="empty-msg">No trades found matching your filters.</td></tr>';
      return;
    }

    tbody.innerHTML = trades.map(t => Trades.renderRow(t, 'full')).join('');
  }

  function init() {
    const filterIds = ['filterSymbol','filterSession','filterResult','filterDateFrom','filterDateTo'];
    filterIds.forEach(id => {
      document.getElementById(id).addEventListener('input', renderHistory);
      document.getElementById(id).addEventListener('change', renderHistory);
    });

    document.getElementById('btnResetFilters').addEventListener('click', () => {
      filterIds.forEach(id => document.getElementById(id).value = '');
      renderHistory();
    });
  }

  return { init, renderHistory };

})();
