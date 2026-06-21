import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, 
  Search, 
  Loader, 
  AlertTriangle,
  User,
  Mail,
  Calendar,
  BookOpen
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users on client side
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          <Users className="w-8 h-8 text-indigo-500" />
          User Directory
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium font-sans">View and manage registered accounts including students, staff, and admin accounts</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-sm font-medium animate-slide-up">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
          />
        </div>

        {/* Role Dropdown */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-slate-250 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer appearance-none"
        >
          <option value="">All Roles</option>
          <option value="STUDENT">Student</option>
          <option value="STAFF">Staff Member</option>
          <option value="ADMIN">Administrator</option>
        </select>
      </div>

      {/* User Directory Log */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
          <span className="text-xs">Loading directory...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-center py-8 text-sm text-slate-400 dark:text-slate-550 italic">No users found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((u) => (
            <div 
              key={u.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs space-y-4 hover:shadow-sm hover:border-slate-350 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400 text-sm">
                  {u.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{u.name}</h3>
                  <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    u.role === 'ADMIN' 
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400' 
                      : u.role === 'STAFF' 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {u.role.toLowerCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800/60 pt-3 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{u.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{u.department || 'Not Assigned'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Joined: {new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
