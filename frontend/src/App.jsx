import { AppShell } from '@/app/AppShell'
import { HomePage } from '@/app/pages/HomePage'
import { NotFoundPage } from '@/app/pages/NotFoundPage'
import { SystemStatusPage } from '@/app/pages/SystemStatusPage'
import { RouterProvider, RouteView } from '@/app/router'

const APP_ROUTES = [
  { path: '/', element: <HomePage /> },
  { path: '/system-status', element: <SystemStatusPage /> },
  { path: '*', element: <NotFoundPage /> },
]

function App() {
  return (
    <RouterProvider>
      <AppShell>
        <RouteView routes={APP_ROUTES} />
      </AppShell>
    </RouterProvider>
  )
}

export default App
