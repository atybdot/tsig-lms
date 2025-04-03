import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
    } else {
      const admin = JSON.parse(localStorage.getItem('adminData'));
      setUserData(admin);
    }
  }, []);

  const handleLogout = () => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      localStorage.removeItem('userData');
      navigate('/');
    } else {
      localStorage.removeItem('adminData');
      navigate('/admin');
    }
    setUserData(null);
  };

  const menuItems = [
    { 
      path: location.pathname.includes('/dashboard') ? `/dashboard/${userData?.id}` : `/admin/${userData?.fullname}`,
      label: 'Dashboard',
      isActive: location.pathname === `/dashboard/${userData?.id}` || location.pathname === `/admin/${userData?.fullname}`
    },
    { 
      path: location.pathname.includes('/dashboard') ? `/dashboard/tasks` : `/admin/tasks`, 
      label: 'Tasks',
      isActive: location.pathname === '/dashboard/tasks' || location.pathname === '/admin/tasks'
    },
    { 
      path: location.pathname.includes('/dashboard') ? `/dashboard/users` : `/admin/users`, 
      label: 'Users',
      isActive: location.pathname === '/dashboard/users' || location.pathname === '/admin/users'
    },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white shadow-lg transition-transform duration-300 w-full ${isOpen ? 'sm:w-full lg:w-64 md:w-64' : 'w-64 md:w-64 lg:w-64'} ${isOpen ? 'translate-x-0' : '-translate-x-[135%]'} md:translate-x-0`}>
      {/* Close Button for Mobile */}
      <button onClick={toggleSidebar} className="absolute top-4 right-4 md:hidden">
        <span className="text-gray-600">✖</span>
      </button>

      {/* Logo/Brand */}
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800">TSIG CMS</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              {item.isActive ? (
                <span className="flex items-center space-x-2 rounded-lg bg-blue-50 p-2 text-blue-600 hover:cursor-pointer">
                  <span>{item.label}</span>
                </span>
              ) : (
                <NavLink
                  to={item.path}
                  onClick={toggleSidebar}
                  className="flex items-center space-x-2 rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <span className='hover:cursor-pointer'>{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="absolute bottom-0 w-full border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-600">
                  {userData?.fullname?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            <div>
              <p className="text-sm font-medium">
                {userData?.fullname || 'Guest'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded px-2 py-1 text-sm bg-red-50 text-red-600 hover:bg-red-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;