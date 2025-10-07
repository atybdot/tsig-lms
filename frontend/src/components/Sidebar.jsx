import {  useNavigate, useLocation,NavLink } from 'react-router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import tsiglogo from '/favicon.ico'
import { 
  ChartBarIcon, 
  UserIcon, 
  CalendarIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check if user or admin is logged in
    const user = localStorage.getItem('userData');
    const admin = localStorage.getItem('adminData');
    
    if (user) {
      setUserData(JSON.parse(user));
      setIsAdmin(false);
    } else if (admin) {
      setUserData(JSON.parse(admin));
      setIsAdmin(true);
    }
  }, []);

  const handleLogout = () => {
    if (isAdmin) {
      localStorage.removeItem('adminData');
      navigate('/admin/login');
    } else {
      localStorage.removeItem('userData');
      navigate('/');
    }
    setUserData(null);
  };

  const getIcon = (label) => {
    switch(label.toLowerCase()) {
      case 'dashboard': return <ChartBarIcon className="h-5 w-5" />;
      case 'attendance': return <CalendarIcon className="h-5 w-5" />;
      case 'users': return <UserIcon className="h-5 w-5" />;
      default: return <ChartBarIcon className="h-5 w-5" />;
    }
  };

  const menuItems = isAdmin ? ([
    { 
      path: `/admin/${userData?.fullname}`,
      label: 'Dashboard',
      isActive: location.pathname === `/dashboard/${userData?.id}` || location.pathname === `/admin/${userData?.fullname}`
    },
    { 
      path: `/admin/attendance`,  
      label: 'Attendance',
      isActive: location.pathname === '/admin/attendance'
    }
  ]) : ([
    {
      path: `/dashboard/${userData?.id}`,
      label: 'Dashboard',
      isActive: location.pathname === `/dashboard/${userData?.id}`
    }
  ]);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
      
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-30 md:hidden bg-white rounded-full p-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6 text-gray-600" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-gray-600" />
        )}
      </button>
      
      {/* Sidebar */}
      <motion.aside 
        className={`fixed left-0 top-0 h-screen bg-white z-30 shadow-xl border-r border-gray-100 ${
          isOpen ? 'block' : 'hidden md:block'
        } w-72 md:w-64`}
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ ease: "easeOut", duration: 0.3 }}
      >
        {/* Logo/Brand */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-r from-slate-950 to-slate-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl"><img className='p-2' src={tsiglogo} alt="" /></span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-500 to-slate-700 bg-clip-text text-transparent">
              TSIG CMS
            </h1>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-4 mt-4">
          <p className="text-xs font-medium text-gray-400 mb-2 px-3 uppercase tracking-wider">
            Main Menu
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive ? 
                    'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium shadow-sm' : 
                    'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <motion.div 
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {getIcon(item.label)}
                </motion.div>
                <span>{item.label}</span>
                
                {item.isActive && (
                  <motion.div 
                    className="w-1.5 h-6 bg-blue-500 rounded-full ml-auto"
                    layoutId="sidebar-active-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6 mx-4" />
        
        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                  <span className="text-white font-medium">
                    {userData?.fullname?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                  isAdmin ? 'bg-amber-500' : 'bg-emerald-500'
                }`}></span>
              </div>
              
              <div className="flex flex-col">
                <p className="text-sm font-medium line-clamp-1">
                  {userData?.fullname || 'Guest'}
                </p>
                <p className="text-xs text-gray-500">
                  {isAdmin ? 'Administrator' : 'User'}
                </p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-1 group hover:bg-red-500 rounded-full p-2 text-sm transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-500 group-hover:text-white" />
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;