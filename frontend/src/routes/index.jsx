import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthWrapper notUser={false}><Login /></AuthWrapper>,
  },
  {
    path: '/dashboard',
    element: <AuthWrapper><DashboardLayout /></AuthWrapper>,
    children: [
      {
        path: ':userId',
        element: <AuthWrapper><Dashboard /></AuthWrapper>,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

function AuthWrapper({ children, path = '/dashboard', notUser = true }) {
  const user = JSON.parse(localStorage.getItem('userData'));
  if (notUser) {
    if (!user) return <Navigate to="/" replace />;
    // if (path === '/') return <Navigate to={`/dashboard/${user.id}`} replace />;
  } else {
    if (user) return <Navigate to={`/dashboard/${user.id}`} replace />;
    // if (path === '/') return <Navigate to="/" replace />;
  }
  return children;
}

export default router;