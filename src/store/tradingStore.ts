import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Trade,
  Position,
  Signal,
  KPIs,
  Alert,
  StrategyConfig,
  TabId,
  TradingMode,
  IndicatorSnapshot,
} from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeId(): string {
  return Math.random().toString(36).substring(2, 11)
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function hoursAgo(n: number): string {
  const d = new Date()
  d.setHours(d.getHours() - n)
  return d.toISOString()
}

function minutesAgo(n: number): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - n)
  return d.toISOString()
}

function mockIndicators(rsi: number): IndicatorSnapshot {
  return {
    rsi,
    macdLine: parseFloat((Math.random() * 0.002 - 0.001).toFixed(5)),
    macdSignal: parseFloat((Math.random() * 0.002 - 0.001).toFixed(5)),
    macdHistogram: parseFloat((Math.random() * 0.0005).toFixed(5)),
    bbUpper: 1.1050 + Math.random() * 0.005,
    bbMiddle: 1.0980 + Math.random() * 0.003,
    bbLower: 1.0910 + Math.random() * 0.003,
    atr: parseFloat((0.0008 + Math.random() * 0.0004).toFixed(5)),
    ema20: 1.0975 + Math.random() * 0.002,
    ema50: 1.0960 + Math.random() * 0.002,
    ema200: 1.0920 + Math.random() * 0.003,
  }
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_CLOSED_TRADES: Trade[] = [
  {
    id: makeId(), symbol: 'EURUSD', side: 'BUY', entryPrice: 1.08420, currentPrice: 1.08780,
    exitPrice: 1.08780, qty: 0.5, pnl: 180.00, pnlPct: 1.66, sl: 1.08100, tp: 1.08900,
    openedAt: daysAgo(28), closedAt: daysAgo(27), status: 'closed', reason: 'TP hit',
    indicators: mockIndicators(38),
  },
  {
    id: makeId(), symbol: 'GBPUSD', side: 'SELL', entryPrice: 1.27850, currentPrice: 1.27420,
    exitPrice: 1.27420, qty: 0.3, pnl: 129.00, pnlPct: 1.70, sl: 1.28200, tp: 1.27300,
    openedAt: daysAgo(27), closedAt: daysAgo(26), status: 'closed', reason: 'TP hit',
    indicators: mockIndicators(68),
  },
  {
    id: makeId(), symbol: 'XAUUSD', side: 'BUY', entryPrice: 2318.50, currentPrice: 2345.80,
    exitPrice: 2345.80, qty: 0.1, pnl: 273.00, pnlPct: 1.18, sl: 2305.00, tp: 2348.00,
    openedAt: daysAgo(26), closedAt: daysAgo(25), status: 'closed', reason: 'TP hit',
    indicators: mockIndicators(42),
  },
  {
    id: makeId(), symbol: 'USDJPY', side: 'BUY', entryPrice: 151.420, currentPrice: 150.820,
    exitPrice: 150.820, qty: 0.4, pnl: -241.60, pnlPct: -1.58, sl: 150.800, tp: 152.400,
    openedAt: daysAgo(25), closedAt: daysAgo(24), status: 'closed', reason: 'SL hit',
    indicators: mockIndicators(55),
  },
  {
    id: makeId(), symbol: 'EURUSD', side: 'SELL', entryPrice: 1.09120, currentPrice: 1.08640,
    exitPrice: 1.08640, qty: 0.5, pnl: 240.00, pnlPct: 2.20, sl: 1.09450, tp: 1.08500,
    openedAt: daysAgo(23), closedAt: daysAgo(22), status: 'closed', reason: 'TP hit',
    indicators: mockIndicators(71),
  },
  {
    id: makeId(), symbol: 'BTCUSD', side: 'BUY', entryPrice: 67420.00, currentPrice: 68850.00,
    exitPrice: 68850.00, qty: 0.01, pnl: 143.00, pnlPct: 2.12, sl: 66500.00, tp: 69000.00,
    openedAt: daysAgo(22), closedAt: daysAgo(21), status: 'closed', reason: 'TP hit',
    indicators: mockIndicators(44),
  },
  {
    id: makeId(), symbol: 'NAS100', side: 'BUY', entryPrice: 18240.00, currentPrice: 18080.00,
    exitPrice: 18080.00, qty: 0.05, pnl: -80.00, pnlPct: -0.88, sl: 18050.00, tp: 18600.00,
    openedAt: daysAgo(21), closedAt: daysAgo(20), status: 'closed', reason: 'SL hit',
    indicators: mockIndicators(52),
  },
  {
    id: makeId(), symbol: 'GBPUSD', side: 'BUY', entryPrice: 1.26540, currentPrice: 1.27120,
    exitPrice: 1.27120, qty: 0.4, pnl: 232.00, pnlPct: 1.83, sl: 1.26100, tp: 1.27200,
    openedAt: daysAgo(19), closedAt: daysAgo(18), status: 'closed', reason: 'TP hit',
    indicators: mockIndicators(35),
  },
  {
    id: makeId(), symbol: 'XAUUSD', side: 'SELL', entryPrice: 2362.40, currentPrice: 2390.20,
    exitPrice: 2390.20, qty: 0.1, pnl: -278.00, pnlPct: -1.18, sl: 2390.00, tp: 2320.00,
    openedAt: daysAgo(18), closedAt: daysAgo(17), status: 'closed', reason: 'SL hit',
    indicators: mockIndicators(62),
  },
  {
    id: makeId(), symbol: 'EURUSD', side: 'BUY', entryPrice: 1.07880, currentPrice: 1.08340,
    exitPrice: 1.08340, qty: 0.6, pnl: 276.00, pnlPct: 2.14, sl: 1.07520, tp: 1.08400,
    openedAt: daysAgo(17), closedAt: daysAgo(16), status: 'closed', reason: 'TP hit',
    indicators: mockIndicators(39),
  },
  {
    id: makeId(), symbol: 'SP500', side: 'BUY', entryPrice: 5320.00, currentPrice: 5390.00,
    exitPrice: 5390.00, qty: 0.1, pnl: 70.00, pnlPct: 1.32, sl: 5280.00, tp: 5400.00,
    openedAt: daysAgo(15), closedAt: daysAgo(14), status: 'closed', reason: 'TP hit',
    indicators: mockIndicators(47),
  },
  {
    id: makeId(), symbol: 'USDJPY', side: 'SELL', entryPrice: 152.840, currentPrice: 152.120,
    exitPrice: 152.120, qty: 0.5, pnl: 236.95, pnlPct: 1.88, sl: 153.250, tp: 152.000,
    openedAt: daysAgo(14), closedAt: daysAgo(13), status: 'closed', reason: 'TP hit',
    indicators: mockIndicators(73),
  },
  {
    id: makeId(), symbol: 'BTCUSD', side: 'SELL', entryPrice: 69800.00, currentPrice: 68400.00,
    exitPrice: 68400.00, qty: 0.01, pnl: 140.00, pnlPct: 2.00, sl: 70500.00, tp: 68200.00,
    openedAt: daysAgo(13), closedAt: daysAgo(12), status: 'closed', reason: 'TP hit',
    indicators: mockIndicators(69),
  },
  {
    id: makeId(), symbol: 'GBPUSD', side: 'SELL', entryPrice: 1.27640, currentPrice: 1.27890,
    exitPrice: 1.27890, qty: 0.3, pnl: -75.00, pnlPct: -0.78, sl: 1.27900, tp: 1.27100,
    openedAt: daysAgo(11), closedAt: daysAgo(10), status: 'closed', reason: 'SL hit',
    indicators: mockIndicators(48),
  },
  {
    id: makeId(), symbol: 'NAS100', side: 'BUY', entryPrice: 18540.00, currentPrice: 18820.00,
    exitPrice: 18820.00, qty: 0.05, pnl: 140.00, pnlPct: 1.51, sl: 18350.00, tp: 18850.00,
    openedAt: daysAgo(10), closedAt: daysAgo(9), status: 'closed', reason: 'TP hit',
    indicators: mockIndicators(41),
  },
  {
    id: makeId(), symbol: 'EURUSD', side: 'BUY', entryPrice: 1.08150, currentPrice: 1.08610,
    exitPrice: 1.08610, qty: 0.5, pnl: 230.00, pnlPct: 2.13, sl: 1.07820, tp: 1.08650,
    openedAt: daysAgo(8), closedAt: daysAgo(7), status: 'closed', reason: 'TP hit',
    indicators: mockIndicators(36),
  },
  {
    id: makeId(), symbol: 'XAUUSD', side: 'BUY', entryPrice: 2378.20, currentPrice: 2410.50,
    exitPrice: 2410.50, qty: 0.1, pnl: 323.00, pnlPct: 1.36, sl: 2360.00, tp: 2415.00,
    openedAt: daysAgo(6), closedAt: daysAgo(5), status: 'closed', reason: 'TP hit',
    indicators: mockIndicators(33),
  },
  {
    id: makeId(), symbol: 'USDJPY', side: 'BUY', entryPrice: 153.240, currentPrice: 152.840,
    exitPrice: 152.840, qty: 0.4, pnl: -159.64, pnlPct: -1.04, sl: 152.800, tp: 154.200,
    openedAt: daysAgo(5), closedAt: daysAgo(4), status: 'closed', reason: 'SL hit',
    indicators: mockIndicators(56),
  },
  {
    id: makeId(), symbol: 'BTCUSD', side: 'BUY', entryPrice: 66200.00, currentPrice: 67800.00,
    exitPrice: 67800.00, qty: 0.01, pnl: 160.00, pnlPct: 2.42, sl: 65400.00, tp: 67900.00,
    openedAt: daysAgo(3), closedAt: daysAgo(2), status: 'closed', reason: 'TP hit',
    indicators: mockIndicators(43),
  },
  {
    id: makeId(), symbol: 'GBPUSD', side: 'BUY', entryPrice: 1.26820, currentPrice: 1.27240,
    exitPrice: 1.27240, qty: 0.4, pnl: 168.00, pnlPct: 1.32, sl: 1.26440, tp: 1.27300,
    openedAt: daysAgo(2), closedAt: daysAgo(1), status: 'closed', reason: 'TP hit',
    indicators: mockIndicators(40),
  },
]

const MOCK_POSITIONS: Position[] = [
  {
    id: makeId(), symbol: 'EURUSD', side: 'BUY', entryPrice: 1.08340, currentPrice: 1.08520,
    qty: 0.5, pnl: 90.00, pnlPct: 0.83, sl: 1.07980, tp: 1.08900,
    openedAt: hoursAgo(4), status: 'open',
    indicators: mockIndicators(42),
  } as Position,
  {
    id: makeId(), symbol: 'XAUUSD', side: 'BUY', entryPrice: 2388.40, currentPrice: 2394.80,
    qty: 0.1, pnl: 64.00, pnlPct: 0.27, sl: 2372.00, tp: 2420.00,
    openedAt: hoursAgo(2), status: 'open',
    indicators: mockIndicators(38),
  } as Position,
  {
    id: makeId(), symbol: 'USDJPY', side: 'SELL', entryPrice: 153.640, currentPrice: 153.280,
    qty: 0.3, pnl: 70.42, pnlPct: 0.94, sl: 154.100, tp: 152.800,
    openedAt: minutesAgo(45), status: 'open',
    indicators: mockIndicators(67),
  } as Position,
]

const MOCK_SIGNALS: Signal[] = [
  {
    id: makeId(), symbol: 'GBPUSD', timeframe: '1h', side: 'BUY', strength: 78,
    entryZone: [1.26580, 1.26640], sl: 1.26220, tp: 1.27180,
    indicators: mockIndicators(34), createdAt: minutesAgo(5),
  },
  {
    id: makeId(), symbol: 'BTCUSD', timeframe: '4h', side: 'BUY', strength: 85,
    entryZone: [66800, 67200], sl: 65400, tp: 70000,
    indicators: mockIndicators(41), createdAt: minutesAgo(12),
  },
  {
    id: makeId(), symbol: 'NAS100', timeframe: '1h', side: 'SELL', strength: 62,
    entryZone: [18680, 18720], sl: 18900, tp: 18200,
    indicators: mockIndicators(72), createdAt: minutesAgo(28),
  },
]

const MOCK_ALERTS: Alert[] = [
  {
    id: makeId(), type: 'critical',
    message: 'Daily risk limit at 72% — 2 more trades available before auto-pause.',
    timestamp: minutesAgo(8), read: false,
  },
  {
    id: makeId(), type: 'important',
    message: 'USDJPY approaching TP target. Current: 153.280 / TP: 152.800.',
    timestamp: minutesAgo(15), read: false,
  },
  {
    id: makeId(), type: 'info',
    message: 'New signal detected: GBPUSD BUY on 1H — strength 78/100.',
    timestamp: minutesAgo(28), read: false,
  },
  {
    id: makeId(), type: 'important',
    message: 'EURUSD position +0.83% floating — consider moving SL to breakeven.',
    timestamp: minutesAgo(45), read: true,
  },
  {
    id: makeId(), type: 'info',
    message: 'Strategy scan completed: 3 pairs scanned, 2 signals generated.',
    timestamp: hoursAgo(1), read: true,
  },
  {
    id: makeId(), type: 'info',
    message: 'Paper trading session started — all trades are simulated.',
    timestamp: hoursAgo(3), read: true,
  },
]

const MOCK_KPIS: KPIs = {
  winrate: 62.0,
  profitFactor: 1.87,
  sharpeRatio: 1.65,
  maxDrawdown: 8.3,
  totalTrades: 20,
  totalPnL: 1902.73,
  avgWin: 187.44,
  avgLoss: 166.81,
  consecutiveLosses: 2,
  consecutiveWins: 4,
  expectancy: 62.34,
  avgRR: 1.94,
}

const DEFAULT_STRATEGY_CONFIG: StrategyConfig = {
  enabled: true,
  riskPerTrade: 1.0,
  maxDailyRisk: 3.0,
  maxPositions: 3,
  maxConsecutiveLosses: 3,
  instruments: ['EURUSD', 'GBPUSD', 'XAUUSD', 'USDJPY', 'BTCUSD'],
  indicators: {
    rsiPeriod: 14,
    macdFast: 12,
    macdSlow: 26,
    macdSignal: 9,
    bbPeriod: 20,
    bbStdDev: 2,
    atrPeriod: 14,
    ema1: 20,
    ema2: 50,
    ema3: 200,
  },
  alertChannels: {
    email: false,
    discord: false,
    telegram: false,
  },
}

// ─── Store Types ─────────────────────────────────────────────────────────────

interface TradingState {
  trades: Trade[]
  positions: Position[]
  signals: Signal[]
  kpis: KPIs
  alerts: Alert[]
  strategyConfig: StrategyConfig
  activeTab: TabId
  tradingMode: TradingMode
  accountBalance: number
  dailyPnL: number
  weeklyPnL: number
  monthlyPnL: number
  // Actions
  setActiveTab: (tab: TabId) => void
  addTrade: (trade: Trade) => void
  closeTrade: (id: string, exitPrice: number, reason: string) => void
  updatePosition: (id: string, updates: Partial<Position>) => void
  addAlert: (alert: Omit<Alert, 'id' | 'read'>) => void
  markAlertRead: (id: string) => void
  markAllAlertsRead: () => void
  updateStrategyConfig: (config: Partial<StrategyConfig>) => void
  setTradingMode: (mode: TradingMode) => void
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useTradingStore = create<TradingState>()(
  persist(
    (set) => ({
      // Initial state
      trades: MOCK_CLOSED_TRADES,
      positions: MOCK_POSITIONS,
      signals: MOCK_SIGNALS,
      kpis: MOCK_KPIS,
      alerts: MOCK_ALERTS,
      strategyConfig: DEFAULT_STRATEGY_CONFIG,
      activeTab: 'overview',
      tradingMode: 'paper',
      accountBalance: 10_000,
      dailyPnL: 224.42,
      weeklyPnL: 587.15,
      monthlyPnL: 1902.73,

      // Actions
      setActiveTab: (tab) => set({ activeTab: tab }),

      addTrade: (trade) =>
        set((state) => ({ trades: [trade, ...state.trades] })),

      closeTrade: (id, exitPrice, reason) =>
        set((state) => {
          const pos = state.positions.find((p) => p.id === id)
          if (!pos) return state
          const pnl = pos.side === 'BUY'
            ? (exitPrice - pos.entryPrice) * pos.qty * 100000
            : (pos.entryPrice - exitPrice) * pos.qty * 100000
          const closedTrade: Trade = {
            ...pos,
            exitPrice,
            currentPrice: exitPrice,
            pnl,
            pnlPct: (pnl / (pos.entryPrice * pos.qty * 100000)) * 100,
            closedAt: new Date().toISOString(),
            status: 'closed',
            reason,
          }
          return {
            positions: state.positions.filter((p) => p.id !== id),
            trades: [closedTrade, ...state.trades],
          }
        }),

      updatePosition: (id, updates) =>
        set((state) => ({
          positions: state.positions.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      addAlert: (alert) =>
        set((state) => ({
          alerts: [
            { ...alert, id: makeId(), read: false },
            ...state.alerts,
          ],
        })),

      markAlertRead: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, read: true } : a
          ),
        })),

      markAllAlertsRead: () =>
        set((state) => ({
          alerts: state.alerts.map((a) => ({ ...a, read: true })),
        })),

      updateStrategyConfig: (config) =>
        set((state) => ({
          strategyConfig: { ...state.strategyConfig, ...config },
        })),

      setTradingMode: (mode) => set({ tradingMode: mode }),
    }),
    {
      name: 'trading-auto-store',
      partialize: (state) => ({
        strategyConfig: state.strategyConfig,
        activeTab: state.activeTab,
        tradingMode: state.tradingMode,
      }),
    }
  )
)
