import { useState, useMemo } from 'react'
import { useTradingStore } from '../../store/tradingStore'
import {
  formatDate, formatPrice, getPnlColor,
  getSideBadgeClass, getStatusBadgeClass, formatDuration
} from '../../utils/formatters'
import type { TradeSide, Trade } from '../../types'

// ─── Stats by symbol ─────────────────────────────────────────────────────────

interface SymbolStats {
  symbol: string
  trades: number
  wins: number
  winrate: number
  totalPnL: number
}

function buildSymbolStats(trades: Trade[]): SymbolStats[] {
  const map = new Map<string, SymbolStats>()
  for (const t of trades) {
    if (!map.has(t.symbol)) {
      map.set(t.symbol, { symbol: t.symbol, trades: 0, wins: 0, winrate: 0, totalPnL: 0 })
    }
    const s = map.get(t.symbol)!
    s.trades++
    if (t.pnl > 0) s.wins++
    s.totalPnL += t.pnl
  }
  for (const s of map.values()) {
    s.winrate = s.trades > 0 ? (s.wins / s.trades) * 100 : 0
    s.totalPnL = parseFloat(s.totalPnL.toFixed(2))
  }
  return Array.from(map.values()).sort((a, b) => b.totalPnL - a.totalPnL)
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

interface Filters {
  side: 'all' | TradeSide
  symbol: string
  from: string
  to: string
  status: 'all' | 'closed' | 'cancelled'
}

export default function History() {
  const { trades } = useTradingStore()
  const [filters, setFilters] = useState<Filters>({
    side: 'all',
    symbol: '',
    from: '',
    to: '',
    status: 'all',
  })
  const [sortKey, setSortKey] = useState<'openedAt' | 'pnl' | 'symbol'>('openedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = useMemo(() => {
    let list = [...trades]
    if (filters.side !== 'all') list = list.filter((t) => t.side === filters.side)
    if (filters.status !== 'all') list = list.filter((t) => t.status === filters.status)
    if (filters.symbol) list = list.filter((t) => t.symbol.toLowerCase().includes(filters.symbol.toLowerCase()))
    if (filters.from) list = list.filter((t) => new Date(t.openedAt) >= new Date(filters.from))
    if (filters.to) list = list.filter((t) => new Date(t.openedAt) <= new Date(filters.to + 'T23:59:59'))
    list.sort((a, b) => {
      let diff = 0
      if (sortKey === 'openedAt') diff = new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime()
      if (sortKey === 'pnl') diff = a.pnl - b.pnl
      if (sortKey === 'symbol') diff = a.symbol.localeCompare(b.symbol)
      return sortDir === 'asc' ? diff : -diff
    })
    return list
  }, [trades, filters, sortKey, sortDir])

  const symbolStats = useMemo(() => buildSymbolStats(trades), [trades])

  const totalPnL = filtered.reduce((s, t) => s + t.pnl, 0)
  const wins = filtered.filter((t) => t.pnl > 0).length
  const winrate = filtered.length > 0 ? (wins / filtered.length) * 100 : 0

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortIcon = ({ k }: { k: typeof sortKey }) => {
    if (sortKey !== k) return <span className="text-gray-700 ml-1">⇅</span>
    return <span className="text-blue-400 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fadeIn">
      {/* ── Filter Bar ── */}
      <div className="card-glass p-4">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Side Filter */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Direction</label>
            <div className="flex gap-1">
              {(['all', 'BUY', 'SELL'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilters((f) => ({ ...f, side: s }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filters.side === s
                      ? s === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : s === 'SELL' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-800/40 text-gray-500 border border-gray-700/30'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
            <div className="flex gap-1">
              {(['all', 'closed', 'cancelled'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilters((f) => ({ ...f, status: s }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                    filters.status === s
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-800/40 text-gray-500 border border-gray-700/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Symbol Search */}
          <div className="flex-1 min-w-32">
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Symbol</label>
            <input
              type="text"
              placeholder="EURUSD…"
              value={filters.symbol}
              onChange={(e) => setFilters((f) => ({ ...f, symbol: e.target.value }))}
              className="input-dark"
            />
          </div>

          {/* Date From */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">From</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
              className="input-dark"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">To</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
              className="input-dark"
            />
          </div>

          {/* Reset */}
          <button
            className="btn-ghost"
            onClick={() => setFilters({ side: 'all', symbol: '', from: '', to: '', status: 'all' })}
          >
            ✕ Reset
          </button>
        </div>
      </div>

      {/* ── Trade Table ── */}
      <div className="card-glass">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
          <h2 className="text-sm font-semibold text-gray-200">Trade History</h2>
          <span className="text-xs text-gray-500">{filtered.length} trades</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-dark w-full">
            <thead>
              <tr>
                <th>
                  <button onClick={() => toggleSort('symbol')} className="flex items-center gap-1">
                    Symbol <SortIcon k="symbol" />
                  </button>
                </th>
                <th>Side</th>
                <th>Qty</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>SL</th>
                <th>TP</th>
                <th>
                  <button onClick={() => toggleSort('pnl')} className="flex items-center gap-1">
                    P&L <SortIcon k="pnl" />
                  </button>
                </th>
                <th>P&L %</th>
                <th>Duration</th>
                <th>
                  <button onClick={() => toggleSort('openedAt')} className="flex items-center gap-1">
                    Opened <SortIcon k="openedAt" />
                  </button>
                </th>
                <th>Closed</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={14} className="text-center text-gray-600 py-8">
                    No trades match the current filters
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id}>
                    <td className="font-semibold text-gray-200">{t.symbol}</td>
                    <td><span className={getSideBadgeClass(t.side)}>{t.side}</span></td>
                    <td className="font-mono-numbers">{t.qty.toFixed(2)}</td>
                    <td className="font-mono-numbers">{formatPrice(t.symbol, t.entryPrice)}</td>
                    <td className="font-mono-numbers">{t.exitPrice ? formatPrice(t.symbol, t.exitPrice) : '—'}</td>
                    <td className="font-mono-numbers text-red-400 text-xs">{formatPrice(t.symbol, t.sl)}</td>
                    <td className="font-mono-numbers text-emerald-400 text-xs">{formatPrice(t.symbol, t.tp)}</td>
                    <td className={`font-mono-numbers font-semibold ${getPnlColor(t.pnl)}`}>
                      {t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(2)}
                    </td>
                    <td className={`font-mono-numbers ${getPnlColor(t.pnlPct)}`}>
                      {t.pnlPct >= 0 ? '+' : ''}{t.pnlPct.toFixed(2)}%
                    </td>
                    <td className="text-gray-500 text-xs">{formatDuration(t.openedAt, t.closedAt)}</td>
                    <td className="text-gray-500 text-xs">{formatDate(t.openedAt)}</td>
                    <td className="text-gray-500 text-xs">{t.closedAt ? formatDate(t.closedAt) : '—'}</td>
                    <td><span className={getStatusBadgeClass(t.status)}>{t.status}</span></td>
                    <td className="text-gray-500 text-xs">{t.reason ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary row */}
        <div className="flex flex-wrap items-center gap-6 px-4 py-3 border-t border-gray-800/50 bg-gray-900/30">
          <div className="text-xs text-gray-500">
            Total Trades: <span className="text-gray-300 font-semibold">{filtered.length}</span>
          </div>
          <div className="text-xs text-gray-500">
            Win Rate: <span className="text-emerald-400 font-semibold">{winrate.toFixed(1)}%</span>
          </div>
          <div className="text-xs text-gray-500">
            Total P&L:{' '}
            <span className={`font-semibold font-mono-numbers ${getPnlColor(totalPnL)}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Avg P&L:{' '}
            <span className={`font-semibold font-mono-numbers ${getPnlColor(filtered.length ? totalPnL / filtered.length : 0)}`}>
              {filtered.length ? (totalPnL / filtered.length >= 0 ? '+' : '') + (totalPnL / filtered.length).toFixed(2) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats by Symbol ── */}
      <div className="card-glass">
        <div className="px-4 py-3 border-b border-gray-800/50">
          <h2 className="text-sm font-semibold text-gray-200">Performance by Instrument</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-dark w-full">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Trades</th>
                <th>Wins</th>
                <th>Win Rate</th>
                <th>Total P&L</th>
              </tr>
            </thead>
            <tbody>
              {symbolStats.map((s) => (
                <tr key={s.symbol}>
                  <td className="font-semibold text-gray-200">{s.symbol}</td>
                  <td className="font-mono-numbers">{s.trades}</td>
                  <td className="font-mono-numbers text-emerald-400">{s.wins}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-16">
                        <div
                          className={s.winrate >= 50 ? 'progress-fill-emerald' : 'progress-fill-red'}
                          style={{ width: `${s.winrate}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-mono-numbers ${s.winrate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {s.winrate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className={`font-mono-numbers font-semibold ${getPnlColor(s.totalPnL)}`}>
                    {s.totalPnL >= 0 ? '+' : ''}${s.totalPnL.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
