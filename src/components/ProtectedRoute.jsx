import {
  Navigate,
  useLocation,
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({
  children,
}) {
  const {
    authenticated,
    loading,
  } = useAuth()

  const location = useLocation()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        Loading NurseLink...
      </div>
    )
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname,
        }}
        replace
      />
    )
  }

  return children
}