import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import AdminDashboard from '../pages/AdminDashboard';
import AdminLogin from '../pages/AdminLogin';
import AdminAuthWrapper from '../components/AdminAuthWrapper';

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
    path: '/admin',
    // element: <AdminAuthWrapper><DashboardLayout /></AdminAuthWrapper>,
    children: [
      {
        index: true,
        element: <Navigate to="login" replace />,
      },
      {
        path: 'login',
        element: <AdminAuthWrapper notUser={false}><AdminLogin /></AdminAuthWrapper>
      },
      {
        path: ':adminId',
        element: <AdminAuthWrapper><DashboardLayout /></AdminAuthWrapper>,
        children: [
          {
            path: '',
            element: <AdminDashboard />
          }
        ]
      },
    ]
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