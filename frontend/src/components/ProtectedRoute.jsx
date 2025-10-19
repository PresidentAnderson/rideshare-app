import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, profile } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (role && profile?.role !== role) {
    return <Navigate to="/dashboard" />
  }

  return children
}

export default ProtectedRoute