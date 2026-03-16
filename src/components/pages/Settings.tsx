import { useState } from 'react'
import { useTradingStore } from '../../store/tradingStore'
import type { StrategyConfig, TradingMode } from '../../types'

const ALL_INSTRUMENTS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD', 'NAS100', 'US30', 'SP500']

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        className="toggle-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-slider"></span>
    </label>
  )
}

export default function Settings() {
  const { strategyConfig, updateStrategyConfig, tradingMode, setTradingMode, addAlert } = useTradingStore()

  // Local form state — mirrors strategyConfig
  const [form, setForm] = useState<StrategyConfig>({ ...strategyConfig })
  const [saved, setSaved] = useState(false)
  const [killConfirm, setKillConfirm] = useState(false)

  const updateForm = <K extends keyof StrategyConfig>(key: K, value: StrategyConfig[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    updateStrategyConfig(form)
    setSaved(true)
    addAlert({ type: 'info', message: 'Strategy configuration saved successfully.', timestamp: new Date().toISOString() })
    setTimeout(() => setSaved(false), 2500)
  }

  const handleKillSwitch = () => {
    updateStrategyConfig({ enabled: false })
    setForm((prev) => ({ ...prev, enabled: false }))
    setKillConfirm(false)
    addAlert({
      type: 'critical',
      message: 'KILL SWITCH ACTIVATED — Strategy disabled. All pending orders cancelled.',
      timestamp: new Date().toISOString(),
    })
  }

  const toggleInstrument = (instr: string) => {
    const current = form.instruments
    const updated = current.includes(instr)
      ? current.filter((i) => i !== instr)
      : [...current, instr]
    updateForm('instruments', updated)
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fadeIn max-w-4xl">
      {/* ── Strategy Master Toggle ── */}
      <div className="card-glass p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-200 mb-1">Strategy Engine</h2>
            <p className="text-xs text-gray-500">Enable or disable automated trading globally.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm font-bold ${form.enabled ? 'text-emerald-400' : 'text-red-400'}`}>
              {form.enabled ? 'ACTIVE' : 'INACTIVE'}
            </span>
            <Toggle checked={form.enabled} onChange={(v) => updateForm('enabled', v)} />
          </div>
        </div>
      </div>

      {/* ── Trading Mode ── */}
      <div className="card-glass p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-4">Trading Mode</h2>
        <div className="flex gap-3">
          {(['live', 'paper'] as TradingMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setTradingMode(mode)
                updateForm('enabled', mode === 'live' ? form.enabled : form.enabled)
              }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all border ${
                tradingMode === mode
                  ? mode === 'live'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 glow-emerald'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-gray-800/40 border-gray-700/30 text-gray-500 hover:text-gray-300'
              }`}
            >
              {mode === 'live' ? '🟢' : '📄'}&nbsp;&nbsp;{mode.toUpperCase()} Trading
            </button>
          ))}
        </div>
        {tradingMode === 'live' && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-400 text-sm">⚠️</span>
            <p className="text-xs text-amber-300">
              <strong>Live mode active.</strong> Real funds will be used. Ensure your broker API keys are configured correctly.
            </p>
          </div>
        )}
      </div>

      {/* ── Risk Parameters ── */}
      <div className="card-glass p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-4">Risk Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">
              Risk per Trade (%)
            </label>
            <input
              type="number"
              min="0.1"
              max="5"
              step="0.1"
              value={form.riskPerTrade}
              onChange={(e) => updateForm('riskPerTrade', parseFloat(e.target.value))}
              className="input-dark"
            />
            <p className="text-xs text-gray-600 mt-1">Recommended: 0.5% – 2%</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">
              Max Daily Risk (%)
            </label>
            <input
              type="number"
              min="0.5"
              max="10"
              step="0.5"
              value={form.maxDailyRisk}
              onChange={(e) => updateForm('maxDailyRisk', parseFloat(e.target.value))}
              className="input-dark"
            />
            <p className="text-xs text-gray-600 mt-1">FTMO limit: 5%</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">
              Max Simultaneous Positions
            </label>
            <input
              type="number"
              min="1"
              max="10"
              step="1"
              value={form.maxPositions}
              onChange={(e) => updateForm('maxPositions', parseInt(e.target.value))}
              className="input-dark"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">
              Max Consecutive Losses
            </label>
            <input
              type="number"
              min="1"
              max="10"
              step="1"
              value={form.maxConsecutiveLosses}
              onChange={(e) => updateForm('maxConsecutiveLosses', parseInt(e.target.value))}
              className="input-dark"
            />
            <p className="text-xs text-gray-600 mt-1">Pauses strategy after N losses</p>
          </div>
        </div>
      </div>

      {/* ── Indicator Parameters ── */}
      <div className="card-glass p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-4">Indicator Parameters</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">RSI Period</label>
            <input type="number" min="5" max="50" value={form.indicators.rsiPeriod}
              onChange={(e) => updateForm('indicators', { ...form.indicators, rsiPeriod: parseInt(e.target.value) })}
              className="input-dark" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">MACD Fast</label>
            <input type="number" min="5" max="50" value={form.indicators.macdFast}
              onChange={(e) => updateForm('indicators', { ...form.indicators, macdFast: parseInt(e.target.value) })}
              className="input-dark" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">MACD Slow</label>
            <input type="number" min="10" max="100" value={form.indicators.macdSlow}
              onChange={(e) => updateForm('indicators', { ...form.indicators, macdSlow: parseInt(e.target.value) })}
              className="input-dark" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">MACD Signal</label>
            <input type="number" min="3" max="20" value={form.indicators.macdSignal}
              onChange={(e) => updateForm('indicators', { ...form.indicators, macdSignal: parseInt(e.target.value) })}
              className="input-dark" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">BB Period</label>
            <input type="number" min="10" max="50" value={form.indicators.bbPeriod}
              onChange={(e) => updateForm('indicators', { ...form.indicators, bbPeriod: parseInt(e.target.value) })}
              className="input-dark" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">BB Std Dev</label>
            <input type="number" min="1" max="4" step="0.1" value={form.indicators.bbStdDev}
              onChange={(e) => updateForm('indicators', { ...form.indicators, bbStdDev: parseFloat(e.target.value) })}
              className="input-dark" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">ATR Period</label>
            <input type="number" min="5" max="50" value={form.indicators.atrPeriod}
              onChange={(e) => updateForm('indicators', { ...form.indicators, atrPeriod: parseInt(e.target.value) })}
              className="input-dark" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">EMA Fast</label>
            <input type="number" min="5" max="50" value={form.indicators.ema1}
              onChange={(e) => updateForm('indicators', { ...form.indicators, ema1: parseInt(e.target.value) })}
              className="input-dark" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">EMA Mid</label>
            <input type="number" min="20" max="100" value={form.indicators.ema2}
              onChange={(e) => updateForm('indicators', { ...form.indicators, ema2: parseInt(e.target.value) })}
              className="input-dark" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">EMA Slow</label>
            <input type="number" min="100" max="500" value={form.indicators.ema3}
              onChange={(e) => updateForm('indicators', { ...form.indicators, ema3: parseInt(e.target.value) })}
              className="input-dark" />
          </div>
        </div>
      </div>

      {/* ── Instruments ── */}
      <div className="card-glass p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-4">Trading Instruments</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ALL_INSTRUMENTS.map((instr) => {
            const active = form.instruments.includes(instr)
            return (
              <button
                key={instr}
                onClick={() => toggleInstrument(instr)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                  active
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                    : 'bg-gray-800/40 border-gray-700/30 text-gray-500 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${active ? 'bg-blue-400' : 'bg-gray-600'}`}></span>
                {instr}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-600 mt-3">
          {form.instruments.length} instrument{form.instruments.length !== 1 ? 's' : ''} selected
        </p>
      </div>

      {/* ── Alert Channels ── */}
      <div className="card-glass p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-4">Alert Channels</h2>
        <div className="space-y-3">
          {([
            { key: 'email', label: 'Email', icon: '📧', desc: 'Send alerts to your registered email' },
            { key: 'discord', label: 'Discord', icon: '💬', desc: 'Post to Discord webhook' },
            { key: 'telegram', label: 'Telegram', icon: '✈️', desc: 'Send via Telegram bot' },
          ] as const).map(({ key, label, icon, desc }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="text-base">{icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-300">{label}</p>
                  <p className="text-xs text-gray-600">{desc}</p>
                </div>
              </div>
              <Toggle
                checked={form.alertChannels[key]}
                onChange={(v) => updateForm('alertChannels', { ...form.alertChannels, [key]: v })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Save */}
        <button
          className={`btn-primary px-6 py-3 ${saved ? 'opacity-80' : ''}`}
          onClick={handleSave}
        >
          {saved ? '✓ Saved!' : '💾 Save Configuration'}
        </button>

        {/* Kill Switch */}
        <div className="sm:ml-auto">
          {!killConfirm ? (
            <button className="btn-kill" onClick={() => setKillConfirm(true)}>
              ⚡ KILL SWITCH — Stop All Trading
            </button>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-300 font-medium">Confirm stop all?</p>
              <button className="btn-ghost text-xs px-3 py-1.5" onClick={() => setKillConfirm(false)}>Cancel</button>
              <button className="btn-danger text-xs px-3 py-1.5" onClick={handleKillSwitch}>Confirm</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
