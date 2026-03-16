import { useTradingStore } from '../../store/tradingStore'
import { formatTimeAgo } from '../../utils/formatters'
import type { Alert } from '../../types'

const ALERT_ICONS: Record<string, string> = {
  critical: '🔴',
  important: '🟡',
  info: '🔵',
}

function AlertItem({ alert }: { alert: Alert }) {
  const { markAlertRead } = useTradingStore()

  return (
    <div
      className={`flex gap-3 px-4 py-3 border-b border-gray-800/30 transition-colors cursor-pointer hover:bg-gray-800/20
        ${!alert.read ? 'bg-blue-500/[0.04]' : ''}`}
      onClick={() => !alert.read && markAlertRead(alert.id)}
    >
      <span className="text-sm mt-0.5 shrink-0">{ALERT_ICONS[alert.type]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`badge badge-${alert.type}`}>{alert.type.toUpperCase()}</span>
          {!alert.read && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
          )}
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">{alert.message}</p>
        <p className="text-xs text-gray-600 mt-1">{formatTimeAgo(alert.timestamp)}</p>
      </div>
    </div>
  )
}

interface AlertPanelProps {
  maxHeight?: string
  showHeader?: boolean
}

export default function AlertPanel({ maxHeight = '360px', showHeader = true }: AlertPanelProps) {
  const { alerts, markAllAlertsRead } = useTradingStore()
  const unread = alerts.filter((a) => !a.read).length

  return (
    <div className="card-glass flex flex-col h-full">
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-200">Alerts</span>
            {unread > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
                {unread}
              </span>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={markAllAlertsRead}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      <div
        className="overflow-y-auto flex-1"
        style={{ maxHeight }}
      >
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-600 text-sm">
            No alerts
          </div>
        ) : (
          alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))
        )}
      </div>
    </div>
  )
}
