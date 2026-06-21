import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Briefcase, 
  Inbox, 
  AlertTriangle,
  ClipboardList
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

const StaffDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAssignedComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await api.get('/staff/complaints', { params });
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load assigned complaints. Please check backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedComplaints();
  }, [statusFilter, categoryFilter]);

  // Client-side search filtering
  const filteredComplaints = complaints.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics calculation
  const stats = {
    total: complaints.length,
    assigned: complaints.filter(c => c.status === 'ASSIGNED').length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    completed: complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          <Briefcase className="w-8 h-8 text-indigo-500" />
          Staff Operations Center
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage and resolve campus complaints assigned to your department</p>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Assigned Issues', value: stats.total, color: 'text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20' },
          { label: 'Pending Start', value: stats.assigned, color: 'text-amber-650 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-violet-650 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20' },
          { label: 'Completed Resolutions', value: stats.completed, color: 'text-emerald-650 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' }
        ].map((card, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-455 dark:text-slate-500 uppercase tracking-wider">{card.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{card.value}</h3>
            </div>
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${card.color}`}>
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap w-full md:w-auto gap-3 items-center">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase pl-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white appearance-none cursor-pointer pr-8 relative"
          >
            <option value="">All Statuses</option>
            <option value="ASSIGNED">Assigned / Backlog</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white appearance-none cursor-pointer"
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

      {/* Main List */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-sm font-medium animate-slide-up">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span className="text-sm">Fetching assigned tasks...</span>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-2xs">
          <Inbox className="w-12 h-12 mx-auto mb-4 text-slate-350 dark:text-slate-700" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-lg">No Tasks Assigned</h3>
          <p className="text-slate-455 dark:text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter || categoryFilter
              ? "No assigned tickets match your search parameters."
              : "Excellent work! There are currently no unresolved complaints assigned to you."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((complaint) => (
            <Link 
              key={complaint.id}
              to={`/complaints/${complaint.id}`}
              className="group flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-200"
            >
              <div>
                {/* Meta details */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    #{complaint.id} &middot; {complaint.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full ${PRIORITY_BADGES[complaint.priority]}`}>
                      {complaint.priority}
                    </span>
                    <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full ${STATUS_BADGES[complaint.status]}`}>
                      {complaint.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {complaint.title}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {complaint.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 mt-4 pt-3 text-[10px] text-slate-455 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(complaint.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                  Student: {complaint.student.name.split(' ')[0]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
