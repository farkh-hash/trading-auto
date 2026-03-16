import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell
} from 'recharts'
import { useMemo } from 'react'
import { useTradingStore } from '../../store/tradingStore'
import { getPnlColor, formatDate } from '../../utils/formatters'
import type { Trade } from '../../types'

// ─── Data generators ──────────────────────────────────────────────────────────

function generateMonthlyEquity() {
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
  let equity = 8200
  return months.map((m) => {
    const delta = (Math.random() - 0.35) * 600
    equity = Math.max(7000, equity + delta)
    return { month: m, equity: parseFloat(equity.toFixed(2)) }
  })
}

function generateDailyPnL(trades: Trade[]) {
  const byDate = new Map<string, number>()
  for (const t of trades) {
    const d = new Date(t.openedAt)
    const key = `${d.getMonth() + 1}/${d.getDate()}`
    byDate.set(key, (byDate.get(key) ?? 0) + t.pnl)
  }
  return Array.from(byDate.entries())
    .map(([date, pnl]) => ({ date, pnl: parseFloat(pnl.toFixed(2)) }))
    .slice(-20)
}

function generateDrawdown() {
  const data = []
  let equity = 10000
  let peak = 10000
  for (let i = 0; i < 30; i++) {
    const change = (Math.random() - 0.4) * 150
    equity = Math.max(8000, equity + change)
    peak = Math.max(peak, equity)
    const dd = ((equity - peak) / peak) * 100
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    data.push({
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      drawdown: parseFloat(dd.toFixed(2)),
    })
  }
  return data
}

function generateWinrateOverTime() {
  const data = []
  let running = 0
  let wins = 0
  for (let i = 1; i <= 20; i++) {
    running++
    if (Math.random() > 0.38) wins++
    data.push({
      trade: i,
      winrate: parseFloat(((wins / running) * 100).toFixed(1)),
    })
  }
  return data
}

function generateHourlyPnL() {
  return Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    pnl: parseFloat(((Math.random() - 0.38) * 180).toFixed(2)),
    trades: Math.floor(Math.random() * 8),
  }))
}

function generateMonthlyCalendar() {
  const days: { day: number; pnl: number }[] = []
  for (let d = 1; d <= 31; d++) {
    if (d <= 28) {
      const r = Math.random()
      days.push({
        day: d,
        pnl: r > 0.6 ? parseFloat((Math.random() * 250 + 20).toFixed(2))
          : r > 0.25 ? parseFloat((-Math.random() * 180 - 10).toFixed(2))
          : 0,
      })
    } else {
      days.push({ day: d, pnl: 0 })
    }
  }
  return days
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

function SimpleTooltip({ active, payload, label, prefix = '' }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string; prefix?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="card-glass px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className={p.value >= 0 ? 'text-emerald-400' : 'text-red-400'}>
          {prefix}{p.value >= 0 ? '+' : ''}{p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Analysis() {
  const { trades } = useTradingStore()

  const monthlyEquity = useMemo(() => generateMonthlyEquity(), [])
  const dailyPnL = useMemo(() => generateDailyPnL(trades), [trades])
  const drawdownData = useMemo(() => generateDrawdown(), [])
  const winrateData = useMemo(() => generateWinrateOverTime(), [])
  const hourlyData = useMemo(() => generateHourlyPnL(), [])
  const calendarData = useMemo(() => generateMonthlyCalendar(), [])

  const sortedByPnl = useMemo(
    () => [...trades].sort((a, b) => b.pnl - a.pnl),
    [trades]
  )
  const bestTrades = sortedByPnl.slice(0, 5)
  const worstTrades = sortedByPnl.slice(-5).reverse()

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fadeIn">
      {/* ── Row 1: Equity + P&L Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Equity */}
        <div className="card-glass p-4">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">Monthly Equity Curve</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyEquity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#4b5563', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip content={<SimpleTooltip prefix="$" />} />
              <Line type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily P&L Bar */}
        <div className="card-glass p-4">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">Daily P&L Distribution</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyPnL} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<SimpleTooltip prefix="$" />} />
              <ReferenceLine y={0} stroke="#374151" />
              <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                {dailyPnL.map((entry, index) => (
                  <Cell key={index} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 2: Drawdown + Winrate Over Time ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Drawdown */}
        <div className="card-glass p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-200">Drawdown</h2>
            <span className="badge-critical text-xs">Max: -8.3%</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={drawdownData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${v}%`} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="card-glass px-3 py-2 text-xs">
                    <p className="text-gray-400 mb-1">{label}</p>
                    <p className="text-red-400">{(payload[0].value as number)?.toFixed(2)}%</p>
                  </div>
                )
              }} />
              <ReferenceLine y={-10} stroke="#ef4444" strokeDasharray="4 3" label={{ value: 'FTMO -10%', fill: '#ef4444', fontSize: 10 }} />
              <Area type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={1.5} fill="url(#ddGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Winrate over time */}
        <div className="card-glass p-4">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">Win Rate Evolution</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={winrateData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="trade" tick={{ fill: '#4b5563', fontSize: 11 }} tickLine={false} axisLine={false}
                label={{ value: 'Trade #', fill: '#4b5563', fontSize: 10, position: 'insideBottom', dy: 10 }} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="card-glass px-3 py-2 text-xs">
                    <p className="text-gray-400 mb-1">Trade #{label}</p>
                    <p className="text-blue-400">WR: {payload[0].value}%</p>
                  </div>
                )
              }} />
              <ReferenceLine y={50} stroke="#4b5563" strokeDasharray="4 3" />
              <Line type="monotone" dataKey="winrate" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 3: Best/Worst + Hourly ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Best Trades */}
        <div className="card-glass">
          <div className="px-4 py-3 border-b border-gray-800/50">
            <h2 className="text-sm font-semibold text-emerald-400">🏆 Best Trades</h2>
          </div>
          <div className="divide-y divide-gray-800/30">
            {bestTrades.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xs text-gray-600 w-4 font-bold">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-200">{t.symbol}</span>
                    <span className="text-sm font-bold font-mono-numbers text-emerald-400">
                      +${t.pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`badge text-[10px] ${t.side === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>{t.side}</span>
                    <span className="text-xs text-gray-600">{formatDate(t.openedAt)}</span>
                    <span className="text-xs text-gray-600">{t.reason}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worst Trades */}
        <div className="card-glass">
          <div className="px-4 py-3 border-b border-gray-800/50">
            <h2 className="text-sm font-semibold text-red-400">💔 Worst Trades</h2>
          </div>
          <div className="divide-y divide-gray-800/30">
            {worstTrades.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xs text-gray-600 w-4 font-bold">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-200">{t.symbol}</span>
                    <span className={`text-sm font-bold font-mono-numbers ${getPnlColor(t.pnl)}`}>
                      {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`badge text-[10px] ${t.side === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>{t.side}</span>
                    <span className="text-xs text-gray-600">{formatDate(t.openedAt)}</span>
                    <span className="text-xs text-gray-600">{t.reason}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly P&L */}
        <div className="card-glass p-4">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">Profitable Hours (UTC)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourlyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: '#4b5563', fontSize: 9 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${v}h`} interval={3} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="card-glass px-3 py-2 text-xs">
                    <p className="text-gray-400 mb-1">{label}:00 UTC</p>
                    <p className={d.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      P&L: {d.pnl >= 0 ? '+' : ''}${d.pnl}
                    </p>
                    <p className="text-gray-500">Trades: {d.trades}</p>
                  </div>
                )
              }} />
              <ReferenceLine y={0} stroke="#374151" />
              <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                {hourlyData.map((entry, index) => (
                  <Cell key={index} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} fillOpacity={0.75} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Monthly Calendar ── */}
      <div className="card-glass p-4">
        <h2 className="text-sm font-semibold text-gray-200 mb-4">Monthly Performance — March 2025</h2>
        <div className="grid grid-cols-7 gap-1.5">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="text-center text-xs text-gray-600 font-semibold pb-1">{d}</div>
          ))}
          {/* Offset for March 2025 starting Saturday (col 6) */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`empty-${i}`}></div>
          ))}
          {calendarData.map((d) => (
            <div
              key={d.day}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all
                ${d.pnl > 0
                  ? 'bg-emerald-500/20 border border-emerald-500/20 text-emerald-400'
                  : d.pnl < 0
                  ? 'bg-red-500/20 border border-red-500/20 text-red-400'
                  : 'bg-gray-800/30 border border-gray-700/20 text-gray-600'
                }`}
            >
              <span className="font-semibold leading-tight">{d.day}</span>
              {d.pnl !== 0 && (
                <span className="text-[9px] leading-tight font-mono-numbers">
                  {d.pnl > 0 ? '+' : ''}{d.pnl > 0 ? d.pnl.toFixed(0) : d.pnl.toFixed(0)}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 justify-end">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded bg-emerald-500/30"></span> Profitable
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded bg-red-500/30"></span> Loss
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded bg-gray-700/50"></span> No trade
          </div>
        </div>
      </div>
    </div>
  )
}
