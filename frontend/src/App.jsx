import { AppShell } from '@/app/AppShell'
import { HomePage } from '@/app/pages/HomePage'
import { NotFoundPage } from '@/app/pages/NotFoundPage'
import { SystemStatusPage } from '@/app/pages/SystemStatusPage'
import { RouterProvider, RouteView } from '@/app/router'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { PatientRegisterPage } from '@/features/auth/pages/PatientRegisterPage'
import { PatientWorkspacePage } from '@/features/auth/pages/PatientWorkspacePage'
import { StaffWorkspacePage } from '@/features/auth/pages/StaffWorkspacePage'
import { GuestOnlyRoute, ProtectedRoute } from '@/features/auth/RouteGuard'

const APP_ROUTES = [
  { path: '/', element: <HomePage /> },
  { path: '/system-status', element: <SystemStatusPage /> },
  {
    path: '/login',
    element: (
      <GuestOnlyRoute>
        <LoginPage />
      </GuestOnlyRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestOnlyRoute>
        <PatientRegisterPage />
      </GuestOnlyRoute>
    ),
  },

  // Patient portal routes (Context 1)
  {
    path: '/patient',
    element: (
      <ProtectedRoute requiredAccountType="PATIENT" requiredRoles={['PATIENT']}>
        <PatientWorkspacePage section="overview" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patient/booking-onsite',
    element: (
      <ProtectedRoute
        requiredAccountType="PATIENT"
        requiredPermissions={['APPOINTMENT_CREATE_SELF']}
      >
        <PatientWorkspacePage section="booking-onsite" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patient/booking-online',
    element: (
      <ProtectedRoute
        requiredAccountType="PATIENT"
        requiredPermissions={['APPOINTMENT_CREATE_SELF']}
      >
        <PatientWorkspacePage section="booking-online" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patient/records',
    element: (
      <ProtectedRoute requiredAccountType="PATIENT" requiredPermissions={['EMR_READ_SELF']}>
        <PatientWorkspacePage section="records" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patient/profile',
    element: (
      <ProtectedRoute requiredAccountType="PATIENT" requiredPermissions={['PROFILE_EDIT_SELF']}>
        <PatientWorkspacePage section="profile" />
      </ProtectedRoute>
    ),
  },

  // Clinical & operations staff workspace routes (Context 2)
  {
    path: '/staff',
    element: (
      <ProtectedRoute requiredAccountType="STAFF">
        <StaffWorkspacePage section="overview" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff/encounters',
    element: (
      <ProtectedRoute
        requiredAccountType="STAFF"
        requiredRoles={['DOCTOR']}
        requiredPermissions={['ENCOUNTER_WRITE_ASSIGNED']}
      >
        <StaffWorkspacePage section="encounters" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff/lab',
    element: (
      <ProtectedRoute
        requiredAccountType="STAFF"
        requiredRoles={['LAB_STAFF']}
        requiredPermissions={['RESULT_WRITE_ASSIGNED']}
      >
        <StaffWorkspacePage section="lab" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff/scheduling',
    element: (
      <ProtectedRoute
        requiredAccountType="STAFF"
        requiredRoles={['DEPARTMENT_HEAD', 'DOCTOR', 'LAB_STAFF']}
        requiredPermissions={['SCHEDULE_READ_SELF']}
      >
        <StaffWorkspacePage section="scheduling" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff/billing',
    element: (
      <ProtectedRoute requiredAccountType="STAFF" requiredRoles={['CASHIER', 'DOCTOR']}>
        <StaffWorkspacePage section="billing" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff/admin',
    element: (
      <ProtectedRoute
        requiredAccountType="STAFF"
        requiredRoles={['SYSTEM_ADMIN']}
        requiredPermissions={['ACCOUNT_MANAGE']}
      >
        <StaffWorkspacePage section="admin" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff/reports',
    element: (
      <ProtectedRoute
        requiredAccountType="STAFF"
        requiredRoles={['DOCTOR', 'DEPARTMENT_HEAD', 'CASHIER', 'SYSTEM_ADMIN']}
      >
        <StaffWorkspacePage section="reports" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff/profile',
    element: (
      <ProtectedRoute requiredAccountType="STAFF" requiredPermissions={['PROFILE_EDIT_SELF']}>
        <StaffWorkspacePage section="profile" />
      </ProtectedRoute>
    ),
  },

  { path: '*', element: <NotFoundPage /> },
]

function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppShell>
          <RouteView routes={APP_ROUTES} />
        </AppShell>
      </AuthProvider>
    </RouterProvider>
  )
}

export default App
