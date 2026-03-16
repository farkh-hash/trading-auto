import { useTradingStore } from './store/tradingStore'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import Overview from './components/pages/Overview'
import Positions from './components/pages/Positions'
import History from './components/pages/History'
import Analysis from './components/pages/Analysis'
import Settings from './components/pages/Settings'
import type { TabId } from './types'

// ─── Bottom Nav for Mobile ────────────────────────────────────────────────────

const NAV_ITEMS: { id: TabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '⬡' },
  { id: 'positions', label: 'Positions', icon: '◈' },
  { id: 'history', label: 'History', icon: '◎' },
  { id: 'analysis', label: 'Analysis', icon: '◉' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

function BottomNav() {
  const { activeTab, setActiveTab } = useTradingStore()
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800/60 flex">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
            activeTab === item.id ? 'text-blue-400' : 'text-gray-600'
          }`}
        >
          <span className="text-lg leading-none">{item.icon}</span>
          <span className="text-[10px]">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

// ─── Page Renderer ────────────────────────────────────────────────────────────

function ActivePage() {
  const { activeTab } = useTradingStore()
  switch (activeTab) {
    case 'overview': return <Overview />
    case 'positions': return <Positions />
    case 'history': return <History />
    case 'analysis': return <Analysis />
    case 'settings': return <Settings />
    default: return <Overview />
  }
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <ActivePage />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  )
}
