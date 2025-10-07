import { Outlet } from 'react-router';
import Sidebar from '../components/Sidebar';
import { useState } from 'react';

const DashboardLayout = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar visibility


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}/>

      {/* Main Content */}
      <main className="sm:ml-2 lg:ml-64 md:ml-64 p-8">
        <Outlet context={{setIsSidebarOpen: () => {setIsSidebarOpen(!isSidebarOpen)}}}/>
      </main>
    </div>
  );
};

export default DashboardLayout; 