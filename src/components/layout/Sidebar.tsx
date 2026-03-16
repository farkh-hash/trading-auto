import { useTradingStore } from '../../store/tradingStore'
import type { TabId } from '../../types'

interface NavItem {
  id: TabId
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: '⬡' },
  { id: 'positions', label: 'Positions', icon: '◈' },
  { id: 'history', label: 'History', icon: '◎' },
  { id: 'analysis', label: 'Analysis', icon: '◉' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar() {
  const { activeTab, setActiveTab, strategyConfig, tradingMode } = useTradingStore()

  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-gray-950 border-r border-gray-800/60 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800/60">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl text-white font-black text-sm select-none"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            boxShadow: '0 0 20px rgba(59,130,246,0.4)',
          }}>
          ATD
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-wide">AutoTrader</div>
          <div className="text-xs text-gray-500 font-medium">Dashboard v2.0</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 mb-3">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-widest">
            Navigation
          </span>
        </div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item w-full text-left ${activeTab === item.id ? 'active' : ''}`}
          >
            <span className="text-base w-5 text-center leading-none">{item.icon}</span>
            <span>{item.label}</span>
            {item.id === 'positions' && (
              <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                3
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* System Status */}
      <div className="px-3 py-4 border-t border-gray-800/60 space-y-3">
        <div className="px-3 mb-2">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-widest">
            System
          </span>
        </div>

        {/* API Status */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-900/40">
          <span className="text-xs text-gray-500 font-medium">API</span>
          <div className="flex items-center gap-2">
            <span className="status-dot-green"></span>
            <span className="text-xs text-emerald-400 font-semibold">Connected</span>
          </div>
        </div>

        {/* Trading Mode */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-900/40">
          <span className="text-xs text-gray-500 font-medium">Mode</span>
          <span className={tradingMode === 'live' ? 'badge-live text-xs' : 'badge-paper text-xs'}>
            {tradingMode === 'live' ? 'LIVE' : 'PAPER'}
          </span>
        </div>

        {/* Strategy */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-900/40">
          <span className="text-xs text-gray-500 font-medium">Strategy</span>
          <div className="flex items-center gap-2">
            <span
              className={`status-dot ${strategyConfig.enabled ? 'status-dot-green' : 'status-dot-red'}`}
            ></span>
            <span
              className={`text-xs font-semibold ${strategyConfig.enabled ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {strategyConfig.enabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Version */}
        <div className="px-3 pt-1">
          <p className="text-xs text-gray-700 text-center">
            AutoTrader &copy; 2025
          </p>
        </div>
      </div>
    </aside>
  )
}
