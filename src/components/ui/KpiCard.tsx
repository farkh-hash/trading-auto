interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  trend?: number       // positive = up, negative = down
  trendLabel?: string
  icon?: string
  valueColor?: string  // tailwind text color class
  highlight?: boolean  // adds a glow border
}

export default function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  valueColor = 'text-white',
  highlight = false,
}: KpiCardProps) {
  const trendUp = trend !== undefined ? trend >= 0 : undefined
  const trendColor = trendUp === true ? 'text-emerald-400' : trendUp === false ? 'text-red-400' : 'text-gray-400'
  const trendArrow = trendUp === true ? '▲' : trendUp === false ? '▼' : ''

  return (
    <div className={`card-glass p-4 flex flex-col gap-2 ${highlight ? 'border-blue-500/30 glow-blue' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        {icon && <span className="text-lg opacity-60">{icon}</span>}
      </div>

      {/* Value */}
      <div className="flex items-end gap-2">
        <span className={`text-2xl font-bold font-mono-numbers tracking-tight ${valueColor}`}>
          {value}
        </span>
        {trend !== undefined && (
          <span className={`text-xs font-semibold mb-0.5 ${trendColor} flex items-center gap-0.5`}>
            <span className="text-[10px]">{trendArrow}</span>
            {trendLabel}
          </span>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-gray-500 leading-relaxed">{subtitle}</p>
      )}
    </div>
  )
}
