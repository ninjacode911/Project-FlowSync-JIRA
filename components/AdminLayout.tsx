import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCircle2,
  FolderKanban,
  Settings,
  FileSearch,
  BarChart3,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({
  to,
  icon,
  label,
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-sm font-medium transition-colors rounded-md group ${
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`
    }
  >
    <span className="mr-3">{icon}</span>
    {label}
  </NavLink>
);

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    if (location.pathname.startsWith('/admin/users')) return 'Users';
    if (location.pathname.startsWith('/admin/teams')) return 'Teams';
    if (location.pathname.startsWith('/admin/projects')) return 'Projects';
    if (location.pathname.startsWith('/admin/settings')) return 'Workspace Settings';
    if (location.pathname.startsWith('/admin/audit-log')) return 'Audit Log';
    if (location.pathname.startsWith('/admin/reports')) return 'Reports';
    return 'Admin Dashboard';
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-50 border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Title */}
          <div className="flex items-center h-16 px-6 border-b border-slate-200 bg-white">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-800 tracking-tight">FlowSync</span>
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                Admin Panel
              </span>
            </div>
            <button
              className="ml-auto lg:hidden text-slate-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <div className="px-6 py-6 flex-1 overflow-y-auto">
            <nav className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Overview
                </p>
                <div className="space-y-1">
                  <SidebarLink
                    to="/admin/dashboard"
                    icon={<LayoutDashboard size={20} />}
                    label="Dashboard"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Management
                </p>
                <div className="space-y-1">
                  <SidebarLink to="/admin/users" icon={<Users size={20} />} label="Users" />
                  <SidebarLink
                    to="/admin/teams"
                    icon={<UserCircle2 size={20} />}
                    label="Teams"
                  />
                  <SidebarLink
                    to="/admin/projects"
                    icon={<FolderKanban size={20} />}
                    label="Projects"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Workspace
                </p>
                <div className="space-y-1">
                  <SidebarLink
                    to="/admin/settings"
                    icon={<Settings size={20} />}
                    label="Settings"
                  />
                  <SidebarLink
                    to="/admin/audit-log"
                    icon={<FileSearch size={20} />}
                    label="Audit Log"
                  />
                  <SidebarLink
                    to="/admin/reports"
                    icon={<BarChart3 size={20} />}
                    label="Reports"
                  />
                </div>
              </div>
            </nav>
          </div>

          {/* Bottom section */}
          <div className="p-6 border-t border-slate-200 mt-auto">
            <button
              onClick={() => navigate('/')}
              className="w-full mb-3 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md px-4 py-2 transition-colors"
            >
              Back to Workspace
            </button>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold text-[10px] uppercase tracking-wide">
                  Admin
                </span>
                <span className="truncate max-w-[140px]">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 z-10">
          <div className="flex items-center flex-1">
            <button
              className="mr-4 text-slate-500 lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-slate-800 hidden md:block">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <img
                  src={user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'}
                  alt="Admin"
                  className="w-9 h-9 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-700">{user?.name}</p>
                  <p className="text-xs text-slate-500">Workspace Admin</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

