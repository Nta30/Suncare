# UI decisions for Suncare (starter guidance)

Two contexts, one reusable design system:
- Patient: accessible, reassuring booking flows, plain-language steps, clear date/shift vs online slot selection, no false assurances about payment or results.
- Doctor/Lab/Head/Cashier/Admin: information-dense but legible tables/forms, real task navigation, explicit state, visible source/time information, careful confirmations on irreversible actions.
- Language: Vietnamese UI; API and code identifiers in English. VND formatting and local Asia/Saigon timestamps; show timezone context on exported/date-sensitive views.
- Design system proposal required before implementing many pages: define semantic tokens, type scale, spacing, radii, data table standards, status vocabulary, alert patterns, sidebar/nav and mobile responsive behavior. Review brief first; don't invent Suncare logo/brand colors as approved requirements.
- Components: Tailwind CSS + optional shadcn/ui components in **JavaScript** (`tsx:false`). Patient shell and staff shell can differ visually while sharing controls, icons and feedback behavior.
- Every async screen supports `loading`, `empty`, `error`, `success`, keyboard usage, focus states, large-data pagination, 403 access denied, 409 race conflicts.
- Do not show demo counters as live hospital KPIs. If mock data are used during foundation, label them 'DEMO' and isolate from production clients.
- Critical microcopy: online hold expires after 5 minutes; receipt/QR is not proof of payment; onsite booking has no doctor selection; CLS deferral does not extend validity; financial document is internal, not a tax invoice.
- Accessibility: labels, contrast, validation messages, screen-reader-friendly errors, keyboard navigation, visible focus, reduced-motion consideration. Verify browser behavior at desktop/tablet/mobile.
