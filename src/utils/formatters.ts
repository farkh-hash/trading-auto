import type { TradeStatus, TradeSide } from '../types'

// ─── Currency ────────────────────────────────────────────────────────────────

export function formatCurrency(value: number, decimals = 2): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : value > 0 ? '+' : ''
  return `${sign}$${absValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

export function formatCurrencyPlain(value: number, decimals = 2): string {
  return `$${Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

export function formatEuro(value: number, decimals = 2): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : value > 0 ? '+' : ''
  return `${sign}€${absValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

// ─── Percentage ──────────────────────────────────────────────────────────────

export function formatPct(value: number, decimals = 2, showSign = true): string {
  const sign = showSign ? (value >= 0 ? '+' : '') : ''
  return `${sign}${value.toFixed(decimals)}%`
}

export function formatPctPlain(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`
}

// ─── Price ───────────────────────────────────────────────────────────────────

export function formatPrice(symbol: string, price: number): string {
  if (symbol.includes('JPY')) return price.toFixed(3)
  if (symbol === 'XAUUSD' || symbol === 'BTCUSD') return price.toFixed(2)
  if (symbol.includes('100') || symbol.includes('500') || symbol === 'US30') return price.toFixed(1)
  return price.toFixed(5)
}

// ─── Date ────────────────────────────────────────────────────────────────────

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return isoString
  }
}

export function formatDateShort(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
  } catch {
    return isoString
  }
}

export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return isoString
  }
}

export function formatTimeAgo(isoString: string): string {
  try {
    const now = new Date()
    const then = new Date(isoString)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  } catch {
    return isoString
  }
}

export function formatDuration(openedAt: string, closedAt?: string): string {
  try {
    const start = new Date(openedAt)
    const end = closedAt ? new Date(closedAt) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const hours = Math.floor(diffMs / 3600000)
    const minutes = Math.floor((diffMs % 3600000) / 60000)
    if (hours >= 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  } catch {
    return '-'
  }
}

// ─── Color helpers ───────────────────────────────────────────────────────────

export function getPnlColor(pnl: number): string {
  if (pnl > 0) return 'text-emerald-400'
  if (pnl < 0) return 'text-red-400'
  return 'text-gray-400'
}

export function getPnlBgColor(pnl: number): string {
  if (pnl > 0) return 'bg-emerald-500/10 text-emerald-400'
  if (pnl < 0) return 'bg-red-500/10 text-red-400'
  return 'bg-gray-500/10 text-gray-400'
}

export function getSideColor(side: TradeSide): string {
  return side === 'BUY' ? 'text-emerald-400' : 'text-red-400'
}

export function getSideBadgeClass(side: TradeSide): string {
  return side === 'BUY' ? 'badge-buy' : 'badge-sell'
}

export function getStatusBadgeClass(status: TradeStatus): string {
  switch (status) {
    case 'open': return 'badge-open'
    case 'closed': return 'badge-closed'
    case 'cancelled': return 'badge-cancelled'
    default: return 'badge-closed'
  }
}

export function getStrengthColor(strength: number): string {
  if (strength >= 75) return 'text-emerald-400'
  if (strength >= 50) return 'text-amber-400'
  return 'text-red-400'
}

export function getStrengthBarColor(strength: number): string {
  if (strength >= 75) return 'progress-fill-emerald'
  if (strength >= 50) return 'bg-amber-500'
  return 'progress-fill-red'
}

// ─── Number formatting ───────────────────────────────────────────────────────

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatQty(qty: number): string {
  return qty.toFixed(2) + ' lot'
}
