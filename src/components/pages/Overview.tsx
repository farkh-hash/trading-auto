import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useTradingStore } from '../../store/tradingStore'
import KpiCard from '../ui/KpiCard'
import AlertPanel from '../ui/AlertPanel'
import {
  formatCurrencyPlain, formatPct, formatPctPlain,
  getPnlColor, getSideBadgeClass, formatPrice, formatTimeAgo, getStrengthColor
} from '../../utils/formatters'

// ─── Equity Chart mock data (30 days) ─────────────────────────────────────────

function generateEquityData() {
  const data = []
  let equity = 9200
  const months = ['Jan', 'Feb', 'Mar']
  for (let i = 0; i < 30; i++) {
    const change = (Math.random() - 0.38) * 120
    equity = Math.max(8000, equity + change)
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    data.push({
      date: `${months[d.getMonth() % 3]} ${d.getDate()}`,
      equity: parseFloat(equity.toFixed(2)),
    })
  }
  // End on current balance
  data[data.length - 1].equity = 10000
  return data
}

const EQUITY_DATA = generateEquityData()

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function EquityTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="card-glass px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white font-bold">${payload[0].value.toLocaleString()}</p>
    </div>
  )
}

export default function Overview() {
  const { kpis, positions, signals, accountBalance, dailyPnL, weeklyPnL, monthlyPnL } = useTradingStore()

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fadeIn">
      {/* ── Row 1: KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Account Balance"
          value={formatCurrencyPlain(accountBalance)}
          subtitle="FTMO 10K Challenge"
          trend={monthlyPnL}
          trendLabel={formatPct(monthlyPnL / 10000 * 100)}
          icon="💼"
          highlight
        />
        <KpiCard
          title="Daily P&L"
          value={`${dailyPnL >= 0 ? '+' : ''}${dailyPnL.toFixed(2)}`}
          subtitle={`Weekly: ${weeklyPnL >= 0 ? '+' : ''}$${weeklyPnL.toFixed(2)}`}
          trend={dailyPnL}
          trendLabel={formatPctPlain(dailyPnL / accountBalance * 100)}
          icon="📈"
          valueColor={getPnlColor(dailyPnL)}
        />
        <KpiCard
          title="Win Rate"
          value={formatPctPlain(kpis.winrate)}
          subtitle={`${kpis.totalTrades} total trades`}
          trend={kpis.winrate - 50}
          trendLabel="vs 50%"
          icon="🎯"
          valueColor="text-emerald-400"
        />
        <KpiCard
          title="Profit Factor"
          value={kpis.profitFactor.toFixed(2)}
          subtitle={`Avg R:R ${kpis.avgRR.toFixed(2)}`}
          trend={kpis.profitFactor - 1}
          trendLabel={kpis.profitFactor >= 1.5 ? 'Good' : 'Low'}
          icon="⚡"
          valueColor={kpis.profitFactor >= 1.5 ? 'text-emerald-400' : 'text-amber-400'}
        />
      </div>

      {/* ── Row 2: Equity Chart + Side Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Equity Chart */}
        <div className="lg:col-span-2 card-glass p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-200">Equity Curve</h2>
            <span className="badge-open text-xs">30 Days</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={EQUITY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#4b5563', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fill: '#4b5563', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip content={<EquityTooltip />} />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#equityGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Side Stats */}
        <div className="flex flex-col gap-3">
          <div className="card-glass p-4 flex-1">
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Sharpe Ratio</p>
            <p className="text-xl font-bold text-white">{kpis.sharpeRatio.toFixed(2)}</p>
            <div className="progress-bar mt-2">
              <div className="progress-fill-blue" style={{ width: `${Math.min(kpis.sharpeRatio / 3 * 100, 100)}%` }}></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">Target ≥ 1.5</p>
          </div>
          <div className="card-glass p-4 flex-1">
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Max Drawdown</p>
            <p className="text-xl font-bold text-red-400">-{kpis.maxDrawdown.toFixed(1)}%</p>
            <div className="progress-bar mt-2">
              <div className="progress-fill-red" style={{ width: `${Math.min(kpis.maxDrawdown / 10 * 100, 100)}%` }}></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">FTMO limit: -10%</p>
          </div>
          <div className="card-glass p-4 flex-1">
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Expectancy</p>
            <p className="text-xl font-bold text-emerald-400">+${kpis.expectancy.toFixed(2)}</p>
            <p className="text-xs text-gray-600 mt-1">Per trade average</p>
          </div>
        </div>
      </div>

      {/* ── Row 3: Positions + Signals + Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Open Positions Mini-Table */}
        <div className="card-glass">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
            <h2 className="text-sm font-semibold text-gray-200">Open Positions</h2>
            <span className="badge-open">{positions.length} open</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table-dark w-full">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th>P&L</th>
                  <th>SL / TP</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold text-gray-200">{p.symbol}</td>
                    <td>
                      <span className={getSideBadgeClass(p.side)}>{p.side}</span>
                    </td>
                    <td className={`font-mono-numbers font-semibold ${getPnlColor(p.pnl)}`}>
                      {p.pnl >= 0 ? '+' : ''}{p.pnl.toFixed(2)}
                    </td>
                    <td className="text-xs text-gray-500 font-mono-numbers">
                      {formatPrice(p.symbol, p.sl)} / {formatPrice(p.symbol, p.tp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Signals */}
        <div className="card-glass">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
            <h2 className="text-sm font-semibold text-gray-200">Live Signals</h2>
            <span className="flex items-center gap-1.5">
              <span className="status-dot-green"></span>
              <span className="text-xs text-emerald-400 font-medium">Scanning</span>
            </span>
          </div>
          <div className="divide-y divide-gray-800/30">
            {signals.map((sig) => (
              <div key={sig.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-200">{sig.symbol}</span>
                    <span className="text-xs text-gray-500">{sig.timeframe}</span>
                    <span className={getSideBadgeClass(sig.side)}>{sig.side}</span>
                  </div>
                  <span className={`text-sm font-bold font-mono-numbers ${getStrengthColor(sig.strength)}`}>
                    {sig.strength}%
                  </span>
                </div>
                <div className="progress-bar mb-1.5">
                  <div
                    className={sig.strength >= 75 ? 'progress-fill-emerald' : 'progress-fill-blue'}
                    style={{ width: `${sig.strength}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Entry: {formatPrice(sig.symbol, sig.entryZone[0])}</span>
                  <span>{formatTimeAgo(sig.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <AlertPanel maxHeight="260px" />
      </div>
    </div>
  )
}
