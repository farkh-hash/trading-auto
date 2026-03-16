// ─── Trade & Position ────────────────────────────────────────────────────────

export type TradeSide = 'BUY' | 'SELL'
export type TradeStatus = 'open' | 'closed' | 'cancelled'

export interface IndicatorSnapshot {
  rsi: number
  macdLine: number
  macdSignal: number
  macdHistogram: number
  bbUpper: number
  bbMiddle: number
  bbLower: number
  atr: number
  ema20: number
  ema50: number
  ema200: number
}

export interface Trade {
  id: string
  symbol: string
  side: TradeSide
  entryPrice: number
  currentPrice: number
  exitPrice?: number
  qty: number
  pnl: number
  pnlPct: number
  sl: number
  tp: number
  openedAt: string   // ISO date string
  closedAt?: string  // ISO date string
  status: TradeStatus
  reason?: string    // close reason e.g. "TP hit", "SL hit", "Manual", "Strategy reversal"
  indicators?: IndicatorSnapshot
}

export type Position = Trade & { status: 'open' }

// ─── Signal ──────────────────────────────────────────────────────────────────

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D'

export interface Signal {
  id: string
  symbol: string
  timeframe: Timeframe
  side: TradeSide
  strength: number   // 0-100
  entryZone: [number, number]
  sl: number
  tp: number
  indicators: IndicatorSnapshot
  createdAt: string
}

// ─── KPIs ────────────────────────────────────────────────────────────────────

export interface KPIs {
  winrate: number          // 0-100 percent
  profitFactor: number
  sharpeRatio: number
  maxDrawdown: number      // percent, positive value
  totalTrades: number
  totalPnL: number
  avgWin: number
  avgLoss: number          // positive value
  consecutiveLosses: number
  consecutiveWins: number
  expectancy: number
  avgRR: number
}

// ─── Alert ───────────────────────────────────────────────────────────────────

export type AlertType = 'critical' | 'important' | 'info'

export interface Alert {
  id: string
  type: AlertType
  message: string
  timestamp: string
  read: boolean
}

// ─── Strategy Config ─────────────────────────────────────────────────────────

export interface IndicatorConfig {
  rsiPeriod: number
  macdFast: number
  macdSlow: number
  macdSignal: number
  bbPeriod: number
  bbStdDev: number
  atrPeriod: number
  ema1: number
  ema2: number
  ema3: number
}

export interface AlertChannels {
  email: boolean
  discord: boolean
  telegram: boolean
}

export interface StrategyConfig {
  enabled: boolean
  riskPerTrade: number       // percent of account
  maxDailyRisk: number       // percent of account
  maxPositions: number
  maxConsecutiveLosses: number
  instruments: string[]
  indicators: IndicatorConfig
  alertChannels: AlertChannels
}

// ─── App State ───────────────────────────────────────────────────────────────

export type TabId = 'overview' | 'positions' | 'history' | 'analysis' | 'settings'
export type TradingMode = 'live' | 'paper'

// ─── Chart Data ──────────────────────────────────────────────────────────────

export interface EquityPoint {
  date: string
  equity: number
  drawdown: number
}

export interface DailyPnLPoint {
  date: string
  pnl: number
}

export interface HourlyPnLPoint {
  hour: number
  pnl: number
  trades: number
}
