import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { 
  Menu, 
  Sun, 
  Moon, 
  Bell, 
  CheckCheck, 
  CircleDot,
  Loader
} from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications read:', error);
    }
  };

  const markOneAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      {/* Left section: Hamburger & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden sm:block">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Welcome Back</p>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</h2>
        </div>
      </div>

      {/* Right section: Theme, Notifications, Avatar */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200 cursor-pointer"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchNotifications();
            }}
            className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200 cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 max-w-sm rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-150 dark:border-slate-700/60 overflow-hidden animate-slide-up">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/50">
                <h3 className="font-semibold text-xs text-slate-600 dark:text-slate-300 uppercase tracking-wider">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Read All
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                {loading && notifications.length === 0 ? (
                  <div className="flex items-center justify-center p-8 text-slate-400">
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    <span className="text-sm">Loading notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                    <CircleDot className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm">No notifications found.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => !notif.isRead && markOneAsRead(notif.id)}
                      className={`flex gap-3 p-3.5 transition-colors cursor-pointer text-left ${
                        notif.isRead 
                          ? 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/30' 
                          : 'bg-indigo-50/40 hover:bg-indigo-50/70 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/30'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.isRead ? 'bg-slate-300 dark:bg-slate-600' : 'bg-indigo-600 dark:bg-indigo-400'}`} />
                      <div className="flex-1">
                        <p className={`text-xs leading-relaxed ${notif.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
