import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  ArrowRight,
  Loader,
  AlertTriangle,
  Inbox
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

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/admin/complaints', { params });
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch complaint database records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          <ClipboardList className="w-8 h-8 text-indigo-500" />
          Manage Complaints
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Browse, review detail histories, assign staff and follow tickets status</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-sm font-medium animate-slide-up">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full md:max-w-xs flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search details, title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            Go
          </button>
        </form>

        {/* Dropdowns */}
        <div className="flex flex-wrap w-full md:w-auto gap-3 items-center">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase pl-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer appearance-none"
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
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer appearance-none"
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
      </div>

      {/* Main Grid table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
          <Loader className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></Loader>
          <span className="text-sm">Fetching complaint logs...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-2xs">
          <Inbox className="w-12 h-12 mx-auto mb-4 text-slate-350 dark:text-slate-700" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-lg">No records matched</h3>
          <p className="text-slate-455 dark:text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Try clearing filters or reducing query search terms.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((c) => (
            <div 
              key={c.id}
              className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs hover:shadow-md transition-all"
            >
              <div>
                {/* Meta details */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    #{c.id} &middot; {c.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full ${PRIORITY_BADGES[c.priority]}`}>
                      {c.priority}
                    </span>
                    <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full ${STATUS_BADGES[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-bold text-slate-850 dark:text-white line-clamp-1">{c.title}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
              </div>

              {/* Card Actions / Footer */}
              <div className="flex flex-col gap-2 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    Student: {c.student.name.split(' ')[0]}
                  </span>
                </div>
                
                <div className="flex items-center justify-between gap-2 pt-2">
                  <span className="text-[10px] text-slate-455">
                    {c.staff ? `Assigned: ${c.staff.name}` : <span className="text-amber-500 italic">Unassigned</span>}
                  </span>
                  <Link
                    to={`/complaints/${c.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-950/60 rounded-xl transition-all cursor-pointer text-[10px]"
                  >
                    View & Action
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
