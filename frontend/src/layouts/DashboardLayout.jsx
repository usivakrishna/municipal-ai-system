import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ mode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const citizenLinks = [
    { label: 'Citizen Dashboard', to: '/citizen', end: true },
    { label: 'Submit Complaint', to: '/citizen/submit' },
    { label: 'My Complaints', to: '/citizen/complaints' }
  ];

  const adminLinks = [
    { label: 'Admin Dashboard', to: '/admin', end: true },
    { label: 'Complaint List', to: '/admin/complaints' },
    { label: 'Delayed Complaints', to: '/admin/delayed' },
    { label: 'Analytics Dashboard', to: '/admin/analytics' },
    { label: 'Clustered Issues', to: '/admin/clusters' }
  ];

  const links = mode === 'admin' ? adminLinks : citizenLinks;

  const title = useMemo(() => {
    if (location.pathname.includes('/submit')) return 'Submit Municipal Complaint';
    if (location.pathname.includes('/complaints')) return mode === 'admin' ? 'All Complaints' : 'My Complaints';
    if (location.pathname.includes('/delayed')) return 'Delayed Complaints';
    if (location.pathname.includes('/analytics')) return 'Analytics Dashboard';
    if (location.pathname.includes('/clusters')) return 'Clustered Issues';
    return mode === 'admin' ? 'Admin Dashboard' : 'Citizen Dashboard';
  }, [location.pathname, mode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell min-h-screen">
      <Sidebar links={links} open={sidebarOpen} setOpen={setSidebarOpen} mode={mode} />
      <div className="lg:ml-72">
        <Topbar
          title={title}
          user={user}
          workspace={mode}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onLogout={handleLogout}
        />
        <main className="px-4 py-6 sm:px-6 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
