import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import AdminDashboard from '../pages/AdminDashboard';
import AdminLogin from '../pages/AdminLogin';

// Helper functions to work with different storage keys
const auth = {
  getUser: () => {
    return JSON.parse(localStorage.getItem('userData')) || null;
  },
  getAdmin: () => {
    return JSON.parse(localStorage.getItem('adminData')) || null;
  },
  isUserLoggedIn: () => {
    return localStorage.getItem('userData') !== null;
  },
  isAdminLoggedIn: () => {
    return localStorage.getItem('adminData') !== null;
  },
  logout: (type) => {
    if (type === 'user' || type === 'all') localStorage.removeItem('userData');
    if (type === 'admin' || type === 'all') localStorage.removeItem('adminData');
  }
};

// User auth component
const RequireUserAuth = ({ children, redirectTo = '/' }) => {
  if (!auth.isUserLoggedIn()) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
};

// Admin auth component
const RequireAdminAuth = ({ children, redirectTo = '/admin/login' }) => {
  if (!auth.isAdminLoggedIn()) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
};

// Redirect if user logged in
const RedirectIfUserLoggedIn = ({ children, redirectTo = '/dashboard' }) => {
  const user = auth.getUser();
  if (user) {
    return <Navigate to={`${redirectTo}/${user.id}`} replace />;
  }
  return children;
};

// Redirect if admin logged in
const RedirectIfAdminLoggedIn = ({ children, redirectTo = '/admin' }) => {
  const admin = auth.getAdmin();
  if (admin) {
    return <Navigate to={`${redirectTo}/${admin.fullname}`} replace />;
  }
  return children;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <RedirectIfUserLoggedIn><Login /></RedirectIfUserLoggedIn>,
  },
  {
    path: '/dashboard',
    element: <RequireUserAuth><DashboardLayout /></RequireUserAuth>,
    children: [
      {
        path: ':userId',
        element: <RequireUserAuth><Dashboard /></RequireUserAuth>,
      },
    ],
  },
  {
    path: '/admin',
    children: [
      {
        index: true,
        element: <Navigate to="login" replace />,
      },
      {
        path: 'login',
        element: <RedirectIfAdminLoggedIn><AdminLogin /></RedirectIfAdminLoggedIn>
      },
      {
        path: ':adminId',
        element: <RequireAdminAuth><DashboardLayout /></RequireAdminAuth>,
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

export default router;