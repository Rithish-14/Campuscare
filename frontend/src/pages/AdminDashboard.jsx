import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, 
  FileText, 
  Activity, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowRight,
  Loader,
  AlertTriangle,
  FolderOpen,
  Calendar
} from 'lucide-react';

const STATUS_BADGES = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50',
  ASSIGNED: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/50',
  IN_PROGRESS: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/50',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50',
  CLOSED: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/20 dark:text-slate-400 dark:border-slate-800/50'
};

const PRIORITY_BADGES = {
  LOW: 'bg-blue-50 text-blue-700 border-blue-150 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40',
  MEDIUM: 'bg-orange-50 text-orange-700 border-orange-150 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/40',
  HIGH: 'bg-rose-50 text-rose-700 border-rose-150 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40'
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);

      // Fetch complaints
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (searchTerm) params.search = searchTerm;
      
      const complaintsRes = await api.get('/admin/complaints', { params });
      setComplaints(complaintsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch admin dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDashboardData();
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          Administration Console
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Global view, staff assignment tracking, and campus complaint analytics</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-sm font-medium animate-slide-up">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Analytics Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Registered Users', value: stats.totalUsers, icon: Users, color: 'text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20' },
            { label: 'Total Complaints', value: stats.totalComplaints, icon: FileText, color: 'text-sky-655 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20' },
            { label: 'Active Open Issues', value: stats.openIssues, icon: Activity, color: 'text-amber-650 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20' },
            { label: 'Resolved Today', value: stats.resolvedToday, icon: CheckCircle2, color: 'text-emerald-655 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-455 dark:text-slate-500 uppercase tracking-wider">{card.label}</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{card.value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Visual Charts section */}
      {stats && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Categories Chart Bar List */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-455 dark:text-slate-500 pl-0.5">Complaints by Category</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {stats.categoryStats.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">No data reported.</p>
              ) : (
                stats.categoryStats.map((item, idx) => {
                  const maxVal = Math.max(...stats.categoryStats.map(c => c.count)) || 1;
                  const pct = Math.round((item.count / maxVal) * 100);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-350">{item.category}</span>
                        <span className="font-bold text-slate-550 dark:text-slate-400">{item.count} tickets</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Status Ratio Indicators */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-455 dark:text-slate-500 pl-0.5">Ticket Status Ratios</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {stats.statusStats.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">No data logged.</p>
              ) : (
                stats.statusStats.map((item, idx) => {
                  const total = stats.totalComplaints || 1;
                  const pct = Math.round((item.count / total) * 100);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-350">{item.status}</span>
                        <span className="font-bold text-slate-550 dark:text-slate-400">{item.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Complaints Table Log */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white pl-0.5 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-500" />
            Global Complaints Log
          </h3>

          {/* Table search forms */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto shrink-0">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap gap-3 items-center text-xs">
          <span className="font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Category & Status filters:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Hostel">Hostel</option>
            <option value="Classroom">Classroom</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Library">Library</option>
            <option value="Transport">Transport</option>
            <option value="Canteen">Canteen</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Electricity">Electricity</option>
            <option value="Internet/Wi-Fi">Internet/Wi-Fi</option>
            <option value="Sports">Sports</option>
            <option value="Others">Others</option>
          </select>
        </div>

        {/* Complaints Table Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
            <span className="text-xs">Fetching complaint log...</span>
          </div>
        ) : complaints.length === 0 ? (
          <p className="text-center py-8 text-sm text-slate-400 dark:text-slate-550 italic">No tickets found.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-850">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-850">
                  <th className="p-3 font-semibold">ID</th>
                  <th className="p-3 font-semibold">Title</th>
                  <th className="p-3 font-semibold hidden md:table-cell">Reporter</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Priority</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold hidden md:table-cell">Assignee</th>
                  <th className="p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                    <td className="p-3 font-bold text-slate-400">#{c.id}</td>
                    <td className="p-3 font-bold text-slate-700 dark:text-slate-300 max-w-[150px] truncate">{c.title}</td>
                    <td className="p-3 hidden md:table-cell">
                      <div className="font-semibold text-slate-700 dark:text-slate-350">{c.student.name}</div>
                      <div className="text-[10px] text-slate-400">{c.student.department || 'Student'}</div>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{c.category}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full ${PRIORITY_BADGES[c.priority]}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full ${STATUS_BADGES[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 hidden md:table-cell text-slate-600 dark:text-slate-400">
                      {c.staff ? (
                        <div className="font-semibold">{c.staff.name}</div>
                      ) : (
                        <span className="italic text-amber-500">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Link
                        to={`/complaints/${c.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-950/60 rounded-xl transition-all cursor-pointer"
                      >
                        Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
