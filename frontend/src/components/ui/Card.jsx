export function Card({ as = 'section', className = '', children, ...rest }) {
  const Component = as
  return (
    <Component
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-2xs ${className}`.trim()}
      {...rest}
    >
      {children}
    </Component>
  )
}

export function CardHeader({ className = '', children }) {
  return (
    <div className={`border-b border-slate-100 px-6 py-5 ${className}`.trim()}>{children}</div>
  )
}

export function CardContent({ className = '', children }) {
  return <div className={`p-6 ${className}`.trim()}>{children}</div>
}

export function CardFooter({ className = '', children }) {
  return (
    <div
      className={`rounded-b-2xl border-t border-slate-100 bg-slate-50/70 px-6 py-4 ${className}`.trim()}
    >
      {children}
    </div>
  )
}
