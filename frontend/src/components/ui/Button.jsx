const VARIANT_CLASSES = {
  patient:
    'bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 border border-transparent shadow-2xs',
  staff:
    'bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 border border-transparent shadow-2xs',
  primary:
    'bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 border border-transparent shadow-2xs',
  secondary:
    'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200/80',
  outline:
    'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-300 shadow-2xs',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-transparent shadow-2xs',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent',
}

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-2.5 text-sm sm:text-base rounded-xl',
}

export function Button({
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md
  const isDisabled = disabled || isLoading

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading ? 'true' : undefined}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${variantClass} ${sizeClass} ${className}`.trim()}
      {...rest}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      <span className="inline-flex items-center gap-2">{children}</span>
    </button>
  )
}
