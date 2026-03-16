import { useState, useEffect } from 'react'
import { useTradingStore } from '../../store/tradingStore'
import { formatCurrencyPlain, getPnlColor, formatPct } from '../../utils/formatters'

const PAGE_TITLES: Record<string, string> = {
  overview: 'Overview',
  positions: 'Open Positions',
  history: 'Trade History',
  analysis: 'Performance Analysis',
  settings: 'Strategy Settings',
}

function isMarketOpen(): boolean {
  const now = new Date()
  const utcHour = now.getUTCHours()
  const day = now.getUTCDay()
  if (day === 0) return false // Sunday
  if (day === 6) return false // Saturday
  // Forex roughly open 22:00 Sun - 22:00 Fri UTC
  return !(day === 5 && utcHour >= 22)
}

export default function TopBar() {
  const { activeTab, alerts, accountBalance, dailyPnL, markAllAlertsRead } = useTradingStore()
  const [time, setTime] = useState<string>('')
  const [showAlerts, setShowAlerts] = useState(false)

  const unreadCount = alerts.filter((a) => !a.read).length
  const marketOpen = isMarketOpen()

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      )
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const title = PAGE_TITLES[activeTab] ?? 'Dashboard'
  const dailyColor = getPnlColor(dailyPnL)

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 lg:px-6 py-3 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/60">
      {/* Left — Page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-gray-100">{title}</h1>
      </div>

      {/* Right — stats + clock + bell */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* Account Balance */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-gray-500 font-medium leading-none mb-0.5">Balance</span>
          <span className="text-sm font-bold text-white font-mono-numbers">
            {formatCurrencyPlain(accountBalance)}
          </span>
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-7 bg-gray-800"></div>

        {/* Daily PnL */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-gray-500 font-medium leading-none mb-0.5">Daily P&L</span>
          <span className={`text-sm font-bold font-mono-numbers ${dailyColor}`}>
            {formatPct(dailyPnL / accountBalance * 100, 2, true)}&nbsp;
            <span className="text-xs opacity-80">
              ({dailyPnL >= 0 ? '+' : ''}{dailyPnL.toFixed(2)})
            </span>
          </span>
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-7 bg-gray-800"></div>

        {/* Market Status */}
        <div className="flex items-center gap-1.5">
          <span
            className={`status-dot ${marketOpen ? 'status-dot-green' : 'status-dot-gray'}`}
          ></span>
          <span
            className={`text-xs font-semibold ${marketOpen ? 'text-emerald-400' : 'text-gray-500'}`}
          >
            {marketOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
          </span>
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-7 bg-gray-800"></div>

        {/* Clock */}
        <span className="hidden md:block text-sm font-mono-numbers text-gray-300 tabular-nums tracking-wider">
          {time}
        </span>

        {/* Alert Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts((v) => !v)}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-all duration-200"
          >
            <span className="text-base">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Alert dropdown */}
          {showAlerts && (
            <div className="absolute right-0 top-full mt-2 w-80 card-glass z-50 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
                <span className="text-sm font-semibold text-gray-200">Notifications</span>
                <button
                  onClick={() => { markAllAlertsRead(); setShowAlerts(false) }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-800/30">
                {alerts.slice(0, 6).map((alert) => (
                  <div
                    key={alert.id}
                    className={`px-4 py-3 ${!alert.read ? 'bg-blue-500/5' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`badge badge-${alert.type} shrink-0 mt-0.5`}>
                        {alert.type.toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-300 leading-relaxed">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {showAlerts && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAlerts(false)}
        ></div>
      )}
    </header>
  )
}
