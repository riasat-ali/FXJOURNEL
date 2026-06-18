# 📈 FXJournal

> A clean, fully offline trading journal built for forex traders who are serious about tracking their performance.

No frameworks. No server. No installation. Just open `index.html` in your browser and start logging trades.

## ✨ Features

### 📋 Trade Logging
- Log every trade with Symbol, Direction (Buy/Sell), Entry, Exit, Stop Loss, Take Profit, and Lot Size
- **Auto-calculates** Pips, P&L (USD), R:R Ratio, and Result on the fly

### 💰 Equity Tracking
- Set your starting balance and current equity
- Live account growth percentage displayed in the sidebar
- Visual progress bar — always visible while you work

### 🏷️ Smart Tagging
- **Session** — Asian, London, New York, Pacific
- **Setup** — Breakout, Reversal, Trend Follow, Range, News Trade
- **Emotion** — Confident, Neutral, FOMO, Revenge, Anxious, Greedy

### 📊 Dashboard
- 8 stat cards — Total Trades, Win Rate, Total P&L, Current Equity, Avg R:R, Profit Factor, Best Trade, Worst Trade
- Equity Curve chart
- Daily P&L bar chart
- Win/loss streak tracker with smart banner alerts

### 📈 Analytics
- Win Rate by Symbol
- Performance by Session
- Performance by Day of Week
- Emotion vs Win Rate analysis

### 🗂️ Trade History
- Full trade history table
- Filter by Symbol, Session, Result, and Date Range
- Edit or delete any trade

### 💾 Data
- Auto-saves to `localStorage` — no data loss on refresh
- Export journal as CSV anytime
- Import MT5 trade history via CSV

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/fxjournal.git

# 2. Open in browser
cd fxjournal
open index.html
```

That's it. No `npm install`. No build step. No server needed.

## 📁 Project Structure

```
fxjournal/
│
├── index.html          # Main layout — all pages & components
│
├── css/
│   ├── style.css       # Main theme, sidebar, cards, buttons
│   └── charts.css      # Chart container styles
│
└── js/
    ├── app.js          # Navigation, equity modal, init
    ├── trades.js       # Add / edit / delete trades + auto-calc
    ├── stats.js        # Win rate, P&L, equity curve, analytics data
    ├── charts.js       # All Chart.js rendering
    ├── filters.js      # History filter & search logic
    └── storage.js      # localStorage + CSV export/import
```

## 🛠️ Built With

| Technology | Purpose |
|---|---|
| HTML5 | Structure & layout |
| CSS3 | Styling, dark navy sidebar, responsive grid |
| Vanilla JavaScript | All logic, calculations, routing |
| [Chart.js](https://www.chartjs.org/) | Equity curve, P&L charts, analytics |

Zero dependencies installed locally. Chart.js loads from CDN.

## 📸 Screenshots

> Dashboard · New Trade · Analytics · Trade History

## 🔧 Supported Symbols

Auto pip calculation works for:
- **Forex majors & minors** — EURUSD, GBPUSD, USDJPY, etc.
- **Gold** — XAUUSD
- **JPY pairs** — correct pip size (0.01)


## 📤 MT5 CSV Import
Export your trade history from MetaTrader 5:
1. Open MT5 → Account History tab
2. Right-click → Save as Report → CSV
3. In FXJournal → sidebar → **⬆ Import CSV**

FXJournal will auto-map the columns.

## 🗺️ Roadmap

- [ ] Screenshot/image attachment per trade
- [ ] Dark mode toggle
- [ ] Weekly & monthly summary reports
- [ ] Mobile responsive layout
- [ ] IndexedDB support for larger datasets


## 🤝 Contributing
Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.
1. Fork the repo
2. Create your branch — `git checkout -b feature/your-feature`
3. Commit changes — `git commit -m 'Add your feature'`
4. Push — `git push origin feature/your-feature`
5. Open a Pull Request


## 📄 License

[MIT](LICENSE) — free to use, modify, and distribute.


## 👤 Author

**RANA RIASAT ALI KHAN**
- GitHub: https://github.com/riasat-ali
- LinkedIn: www.linkedin.com/in/rana-riasat-ali-khan

> *"The best tool you'll ever use is the one you built for yourself."*


