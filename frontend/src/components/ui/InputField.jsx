export function InputField({
  id,
  label,
  type = 'text',
  required = false,
  error = null,
  hint = null,
  as = 'input',
  options = [],
  rightSlot = null,
  className = '',
  inputClassName = '',
  ...rest
}) {
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint ? `${id}-hint` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const baseControlClasses = `block w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:ring-2 focus:ring-teal-500/15 focus:outline-hidden ${
    error
      ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/15'
      : 'border-slate-300 hover:border-slate-400'
  } disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed ${
    rightSlot ? 'pr-16' : ''
  } ${inputClassName}`.trim()

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && (
            <span className="ml-1 text-red-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {as === 'select' ? (
          <select
            id={id}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            className={baseControlClasses}
            {...rest}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : as === 'textarea' ? (
          <textarea
            id={id}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            className={baseControlClasses}
            {...rest}
          />
        ) : (
          <input
            id={id}
            type={type}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            className={baseControlClasses}
            {...rest}
          />
        )}

        {rightSlot && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">{rightSlot}</div>
        )}
      </div>

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
