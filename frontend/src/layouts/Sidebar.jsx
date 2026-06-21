import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Users, 
  CheckSquare, 
  LogOut,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const links = {
    STUDENT: [
      { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
      { to: '/complaints/new', label: 'File Complaint', icon: PlusCircle }
    ],
    STAFF: [
      { to: '/dashboard', label: 'Assigned Issues', icon: Briefcase }
    ],
    ADMIN: [
      { to: '/dashboard', label: 'Overview Stats', icon: LayoutDashboard },
      { to: '/admin/complaints', label: 'Manage Complaints', icon: CheckSquare },
      { to: '/admin/users', label: 'User Directory', icon: Users },
      { to: '/admin/reports', label: 'Analytics Reports', icon: FileText }
    ]
  };

  const currentLinks = links[user.role] || [];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 flex flex-col w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xl shadow-md shadow-indigo-200 dark:shadow-none">
            C
          </div>
          <div>
            <h1 className="font-semibold text-slate-800 dark:text-white leading-tight">CampusCare</h1>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">College Portal</span>
          </div>
        </div>

        {/* User Card */}
        <div className="mx-4 my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center font-semibold text-indigo-700 dark:text-indigo-400">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{user.name}</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 capitalize flex items-center gap-1 mt-0.5">
                {user.role === 'ADMIN' && <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />}
                {user.role.toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1 py-2 overflow-y-auto">
          {currentLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                  ${isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={logout}
            className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl font-medium text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
