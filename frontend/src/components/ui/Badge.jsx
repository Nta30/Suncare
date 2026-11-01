const TONE_CLASSES = {
  patient: 'bg-teal-50 text-teal-800 border-teal-200',
  staff: 'bg-teal-50 text-teal-900 border-teal-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
}

const DOT_CLASSES = {
  patient: 'bg-teal-600',
  staff: 'bg-teal-700',
  success: 'bg-emerald-600',
  warning: 'bg-amber-500',
  danger: 'bg-red-600',
  neutral: 'bg-slate-400',
}

export function Badge({ tone = 'neutral', dot = false, className = '', children }) {
  const toneClass = TONE_CLASSES[tone] || TONE_CLASSES.neutral
  const dotClass = DOT_CLASSES[tone] || DOT_CLASSES.neutral
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5 ${toneClass} ${className}`.trim()}
    >
      {dot && <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />}
      {children}
    </span>
  )
}
