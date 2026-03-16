import { useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { useTradingStore } from '../../store/tradingStore'
import {
  formatPrice, getPnlColor, getSideBadgeClass,
  formatDuration, formatDate
} from '../../utils/formatters'
import type { Position } from '../../types'

// ─── Mock candlestick / volume data ──────────────────────────────────────────

function generateCandleData(entryPrice: number, symbol: string) {
  const isJpy = symbol.includes('JPY')
  const isCrypto = symbol === 'BTCUSD'
  const spread = isCrypto ? 200 : isJpy ? 0.15 : 0.0015
  const data = []
  let price = entryPrice - spread * 10
  for (let i = 0; i < 24; i++) {
    const open = price
    const delta = (Math.random() - 0.48) * spread * 2
    const close = open + delta
    const high = Math.max(open, close) + Math.random() * spread
    const low = Math.min(open, close) - Math.random() * spread
    price = close
    data.push({
      time: `${i}:00`,
      open: parseFloat(open.toFixed(isJpy ? 3 : isCrypto ? 0 : 5)),
      close: parseFloat(close.toFixed(isJpy ? 3 : isCrypto ? 0 : 5)),
      high: parseFloat(high.toFixed(isJpy ? 3 : isCrypto ? 0 : 5)),
      low: parseFloat(low.toFixed(isJpy ? 3 : isCrypto ? 0 : 5)),
      volume: Math.floor(800 + Math.random() * 1200),
      bullish: close >= open,
    })
  }
  return data
}

// ─── Support / Resistance ────────────────────────────────────────────────────

function getLevels(symbol: string, price: number) {
  const isJpy = symbol.includes('JPY')
  const isCrypto = symbol === 'BTCUSD'
  const spread = isCrypto ? 300 : isJpy ? 0.2 : 0.002
  return {
    resistance2: parseFloat((price + spread * 2.5).toFixed(isJpy ? 3 : isCrypto ? 0 : 5)),
    resistance1: parseFloat((price + spread * 1.2).toFixed(isJpy ? 3 : isCrypto ? 0 : 5)),
    support1: parseFloat((price - spread * 1.2).toFixed(isJpy ? 3 : isCrypto ? 0 : 5)),
    support2: parseFloat((price - spread * 2.5).toFixed(isJpy ? 3 : isCrypto ? 0 : 5)),
  }
}

// ─── Edit SL/TP Modal ────────────────────────────────────────────────────────

function EditModal({
  position,
  onClose,
}: {
  position: Position
  onClose: () => void
}) {
  const { updatePosition } = useTradingStore()
  const [sl, setSl] = useState(String(position.sl))
  const [tp, setTp] = useState(String(position.tp))

  const handleSave = () => {
    updatePosition(position.id, {
      sl: parseFloat(sl),
      tp: parseFloat(tp),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card-glass w-full max-w-sm p-6 animate-fadeIn">
        <h3 className="text-base font-semibold text-gray-200 mb-4">
          Edit SL / TP — {position.symbol}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
              Stop Loss
            </label>
            <input
              type="number"
              value={sl}
              onChange={(e) => setSl(e.target.value)}
              className="input-dark"
              step="0.00001"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
              Take Profit
            </label>
            <input
              type="number"
              value={tp}
              onChange={(e) => setTp(e.target.value)}
              className="input-dark"
              step="0.00001"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
          <button className="btn-primary flex-1" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Positions() {
  const { positions, closeTrade } = useTradingStore()
  const [selectedId, setSelectedId] = useState<string | null>(positions[0]?.id ?? null)
  const [editPos, setEditPos] = useState<Position | null>(null)
  const [confirmClose, setConfirmClose] = useState<string | null>(null)

  const selected = positions.find((p) => p.id === selectedId) ?? null
  const candleData = selected ? generateCandleData(selected.entryPrice, selected.symbol) : []
  const levels = selected ? getLevels(selected.symbol, selected.currentPrice) : null

  const handleClose = (id: string) => {
    const pos = positions.find((p) => p.id === id)
    if (!pos) return
    closeTrade(id, pos.currentPrice, 'Manual close')
    setConfirmClose(null)
    if (selectedId === id) setSelectedId(positions.find((p) => p.id !== id)?.id ?? null)
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fadeIn">
      {/* Positions Table */}
      <div className="card-glass">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
          <h2 className="text-sm font-semibold text-gray-200">Open Positions</h2>
          <span className="badge-open">{positions.length} active</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-dark w-full">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Side</th>
                <th>Qty</th>
                <th>Entry</th>
                <th>Current</th>
                <th>SL</th>
                <th>TP</th>
                <th>P&L €</th>
                <th>P&L %</th>
                <th>Duration</th>
                <th>Opened</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center text-gray-600 py-8">
                    No open positions
                  </td>
                </tr>
              ) : (
                positions.map((pos) => (
                  <tr
                    key={pos.id}
                    className={`cursor-pointer ${selectedId === pos.id ? 'bg-blue-500/10' : ''}`}
                    onClick={() => setSelectedId(pos.id)}
                  >
                    <td className="font-semibold text-gray-200">{pos.symbol}</td>
                    <td><span className={getSideBadgeClass(pos.side)}>{pos.side}</span></td>
                    <td className="font-mono-numbers">{pos.qty.toFixed(2)}</td>
                    <td className="font-mono-numbers">{formatPrice(pos.symbol, pos.entryPrice)}</td>
                    <td className="font-mono-numbers text-white">{formatPrice(pos.symbol, pos.currentPrice)}</td>
                    <td className="font-mono-numbers text-red-400">{formatPrice(pos.symbol, pos.sl)}</td>
                    <td className="font-mono-numbers text-emerald-400">{formatPrice(pos.symbol, pos.tp)}</td>
                    <td className={`font-mono-numbers font-semibold ${getPnlColor(pos.pnl)}`}>
                      {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                    </td>
                    <td className={`font-mono-numbers font-semibold ${getPnlColor(pos.pnlPct)}`}>
                      {pos.pnlPct >= 0 ? '+' : ''}{pos.pnlPct.toFixed(2)}%
                    </td>
                    <td className="text-gray-500 text-xs">{formatDuration(pos.openedAt)}</td>
                    <td className="text-gray-500 text-xs">{formatDate(pos.openedAt)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-ghost px-2 py-1 text-xs"
                          onClick={() => setEditPos(pos)}
                        >
                          ✎ Edit
                        </button>
                        <button
                          className="btn-danger px-2 py-1 text-xs"
                          onClick={() => setConfirmClose(pos.id)}
                        >
                          ✕ Close
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Simulated Chart */}
          <div className="lg:col-span-2 card-glass p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-200">
                {selected.symbol} — Price Action (24h)
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-emerald-400 inline-block"></span>
                  Bullish
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-red-400 inline-block"></span>
                  Bearish
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={candleData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']}
                  tickFormatter={(v) => formatPrice(selected.symbol, v)} width={65} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="card-glass px-3 py-2 text-xs">
                        <p className="text-gray-400 mb-1">{d.time}</p>
                        <p className="text-gray-300">O: {formatPrice(selected.symbol, d.open)}</p>
                        <p className="text-gray-300">H: {formatPrice(selected.symbol, d.high)}</p>
                        <p className="text-gray-300">L: {formatPrice(selected.symbol, d.low)}</p>
                        <p className="text-white font-bold">C: {formatPrice(selected.symbol, d.close)}</p>
                        <p className="text-blue-400">Vol: {d.volume}</p>
                      </div>
                    )
                  }}
                />
                {/* Entry price line */}
                <ReferenceLine
                  y={selected.entryPrice}
                  stroke="#3b82f6"
                  strokeDasharray="4 3"
                  label={{ value: 'Entry', fill: '#3b82f6', fontSize: 10, position: 'right' }}
                />
                {/* SL line */}
                <ReferenceLine
                  y={selected.sl}
                  stroke="#ef4444"
                  strokeDasharray="4 3"
                  label={{ value: 'SL', fill: '#ef4444', fontSize: 10, position: 'right' }}
                />
                {/* TP line */}
                <ReferenceLine
                  y={selected.tp}
                  stroke="#10b981"
                  strokeDasharray="4 3"
                  label={{ value: 'TP', fill: '#10b981', fontSize: 10, position: 'right' }}
                />
                <Bar dataKey="volume" fill="#3b82f6" fillOpacity={0.15} yAxisId={1} />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke={candleData.length && candleData[candleData.length - 1].close >= candleData[0].close ? '#10b981' : '#ef4444'}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Support / Resistance + Info */}
          <div className="flex flex-col gap-3">
            <div className="card-glass p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Key Levels — {selected.symbol}
              </h4>
              {levels && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-red-500/10">
                    <span className="text-xs text-red-400 font-medium">R2</span>
                    <span className="font-mono-numbers text-sm text-red-400">{formatPrice(selected.symbol, levels.resistance2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-red-500/5">
                    <span className="text-xs text-red-300 font-medium">R1</span>
                    <span className="font-mono-numbers text-sm text-red-300">{formatPrice(selected.symbol, levels.resistance1)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="text-xs text-blue-400 font-medium">NOW</span>
                    <span className="font-mono-numbers text-sm text-blue-400 font-bold">{formatPrice(selected.symbol, selected.currentPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-emerald-500/5">
                    <span className="text-xs text-emerald-300 font-medium">S1</span>
                    <span className="font-mono-numbers text-sm text-emerald-300">{formatPrice(selected.symbol, levels.support1)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-emerald-500/10">
                    <span className="text-xs text-emerald-400 font-medium">S2</span>
                    <span className="font-mono-numbers text-sm text-emerald-400">{formatPrice(selected.symbol, levels.support2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Position Summary */}
            <div className="card-glass p-4 space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Position Info
              </h4>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Symbol</span>
                <span className="text-gray-200 font-semibold">{selected.symbol}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Direction</span>
                <span className={getSideBadgeClass(selected.side)}>{selected.side}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Lot Size</span>
                <span className="font-mono-numbers text-gray-200">{selected.qty.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Entry</span>
                <span className="font-mono-numbers text-gray-200">{formatPrice(selected.symbol, selected.entryPrice)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">P&L</span>
                <span className={`font-mono-numbers font-bold ${getPnlColor(selected.pnl)}`}>
                  {selected.pnl >= 0 ? '+' : ''}{selected.pnl.toFixed(2)} ({selected.pnlPct >= 0 ? '+' : ''}{selected.pnlPct.toFixed(2)}%)
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Duration</span>
                <span className="text-gray-400">{formatDuration(selected.openedAt)}</span>
              </div>
              {selected.indicators && (
                <>
                  <div className="divider my-1"></div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">RSI(14)</span>
                    <span className={`font-mono-numbers ${selected.indicators.rsi < 30 ? 'text-emerald-400' : selected.indicators.rsi > 70 ? 'text-red-400' : 'text-gray-300'}`}>
                      {selected.indicators.rsi.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">ATR(14)</span>
                    <span className="font-mono-numbers text-gray-300">{selected.indicators.atr.toFixed(5)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editPos && <EditModal position={editPos} onClose={() => setEditPos(null)} />}

      {/* Confirm Close Dialog */}
      {confirmClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card-glass w-full max-w-xs p-6 animate-fadeIn text-center">
            <p className="text-2xl mb-3">⚠️</p>
            <h3 className="text-base font-semibold text-gray-200 mb-2">Close Position?</h3>
            <p className="text-sm text-gray-500 mb-5">
              This will close the position at market price.
            </p>
            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => setConfirmClose(null)}>Cancel</button>
              <button className="btn-danger flex-1" onClick={() => handleClose(confirmClose)}>Close Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
