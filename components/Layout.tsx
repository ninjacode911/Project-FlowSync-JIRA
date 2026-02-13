import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Trello,
  ListTodo,
  Settings,
  Search,
  Bell,
  Plus,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import IssueModal from './IssueModal';
import NotificationsDropdown from './NotificationsDropdown';

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-sm font-medium transition-colors rounded-md group ${isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`
    }
  >
    <span className="mr-3">{icon}</span>
    {label}
  </NavLink>
);

const Layout: React.FC = () => {
  const { currentUser, projects, currentProjectId, searchQuery, setSearchQuery } = useProject();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const currentProject = projects.find(p => p.id === currentProjectId);
  const [isIssueModalOpen, setIssueModalOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Clear search when navigating away from pages that support it
  useEffect(() => {
    const searchPages = ['/board', '/backlog'];
    if (!searchPages.includes(location.pathname)) {
      setSearchQuery('');
    }
  }, [location.pathname, setSearchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/board': return 'Kanban Board';
      case '/backlog': return 'Backlog';
      case '/settings': return 'Project Settings';
      default: return 'FlowSync';
    }
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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-slate-200 bg-white">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">FlowSync</span>
            <button
              className="ml-auto lg:hidden text-slate-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Project Info */}
          <div className="px-6 py-6">
            <div className="flex items-center space-x-3 mb-6">
              {currentProject?.avatarUrl ? (
                <img
                  src={currentProject.avatarUrl}
                  alt="Project"
                  className="w-10 h-10 rounded-md object-cover shadow-sm border border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">
                    {currentProject?.name?.charAt(0) || 'P'}
                  </span>
                </div>
              )}
              <div className="overflow-hidden">
                <h2 className="text-sm font-semibold text-slate-900 truncate">{currentProject?.name}</h2>
                <p className="text-xs text-slate-500 truncate">Software Project</p>
              </div>
            </div>

            <nav className="space-y-1">
              <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
              <SidebarLink to="/board" icon={<Trello size={20} />} label="Board" />
              <SidebarLink to="/backlog" icon={<ListTodo size={20} />} label="Backlog" />
              <SidebarLink to="/settings" icon={<Settings size={20} />} label="Settings" />

              {user?.role === 'ADMIN' && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Admin
                  </p>
                  <SidebarLink
                    to="/admin/dashboard"
                    icon={<LayoutDashboard size={18} />}
                    label="Admin Panel"
                  />
                </div>
              )}
            </nav>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 mx-6" />

          {/* Bottom Actions */}
          <div className="p-6 mt-auto">
            <button
              onClick={() => setIssueModalOpen(true)}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <Plus size={18} className="mr-2" />
              Create Issue
            </button>
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
            <h1 className="text-xl font-semibold text-slate-800 hidden md:block">{getPageTitle()}</h1>

            {(location.pathname === '/board' || location.pathname === '/backlog') && (
              <div className="ml-8 max-w-md w-full hidden md:block relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search issues..."
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <NotificationsDropdown />
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <img
                  src={user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default'}
                  alt="User"
                  className="w-9 h-9 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-700">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
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
          <Outlet context={{ openCreateIssue: () => setIssueModalOpen(true) }} />
        </main>
      </div>

      <IssueModal isOpen={isIssueModalOpen} onClose={() => setIssueModalOpen(false)} />
    </div>
  );
};

export default Layout;