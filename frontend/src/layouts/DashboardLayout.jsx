import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { X, Mail, Building, ShieldCheck } from 'lucide-react';

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Initializing Session...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar Layout */}
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        onProfileClick={() => setProfileOpen(true)} 
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar 
          toggleSidebar={toggleSidebar} 
          onProfileClick={() => setProfileOpen(true)} 
        />

        {/* Dynamic Nested Content */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-7xl mx-auto w-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Profile Details Modal */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800/80 overflow-hidden transform scale-100 transition-all duration-300">
            {/* Header pattern banner */}
            <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"></div>
            
            {/* Close button */}
            <button 
              onClick={() => setProfileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/35 text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Avatar overlapping the banner */}
            <div className="absolute top-12 left-6">
              <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-900 bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400 text-3xl shadow-md">
                {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'}
              </div>
            </div>

            {/* Modal Body */}
            <div className="pt-10 px-6 pb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{user.name}</h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider mt-1">{user.role}</p>
              </div>

              <div className="mt-6 space-y-4">
                {/* Email Row */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/20">
                  <Mail className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Email Address</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Department Row (if exists or role is Student/Staff) */}
                {(user.role === 'STUDENT' || user.role === 'STAFF' || user.department) && (
                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/20">
                    <Building className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Department</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                        {user.department || 'Not Assigned'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Role/Access Level Row */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/20">
                  <ShieldCheck className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Access Level</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 capitalize">
                      {user.role.toLowerCase()} Portal
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setProfileOpen(false)}
                className="mt-6 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all duration-200 cursor-pointer shadow-md shadow-indigo-200 dark:shadow-none"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
