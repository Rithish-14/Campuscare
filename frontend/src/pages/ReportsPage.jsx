import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  Loader, 
  AlertTriangle,
  ClipboardList
} from 'lucide-react';

const ReportsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      
      const res = await api.get('/admin/complaints', { params });
      
      // Additional client filter for priority since it's client-side report
      let data = res.data;
      if (priorityFilter) {
        data = data.filter(c => c.priority === priorityFilter);
      }
      setComplaints(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch report logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable Area Styling */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          aside, header, nav, button, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-container {
            display: block !important;
            width: 100% !important;
          }
          .print-header {
            border-bottom: 2px solid #000;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
        }
      `}</style>

      {/* Screen Page Header (Hidden during printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-8 h-8 text-indigo-500" />
            Report Generator
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Export administrative reports and download audit PDF logs</p>
        </div>
        <button
          onClick={handlePrint}
          disabled={complaints.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export PDF / Print
        </button>
      </div>

      {/* Filter Options (Hidden during printing) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs space-y-4 no-print">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
          <Filter className="w-4.5 h-4.5" />
          <h3 className="font-bold text-xs uppercase tracking-wider">Report Log Filters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Status */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/20 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Filter by Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/20 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer"
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

          {/* Priority */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Filter by Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/20 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-sm font-medium animate-slide-up no-print">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Main Reports Table / Printable Document layout */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs space-y-6">
        {/* Print Only Header (Visible only when exporting/printing) */}
        <div className="hidden print-header print-container">
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-950">CampusCare Report Log</h1>
              <p className="text-xs text-slate-500">Official Campus Complaint & Issue tracking audits</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <p>Scope: {categoryFilter || 'All Categories'} &middot; {statusFilter || 'All Statuses'}</p>
            </div>
          </div>
        </div>

        {/* Info stats bar */}
        <div className="flex items-center justify-between no-print border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">
            Report Records ({complaints.length} tickets matched)
          </h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 no-print">
            <Loader className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
            <span className="text-xs">Compiling logs...</span>
          </div>
        ) : complaints.length === 0 ? (
          <p className="text-center py-8 text-sm text-slate-400 dark:text-slate-550 italic no-print">No records matched the active filters.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3 font-bold">Ticket ID</th>
                  <th className="p-3 font-bold">Title</th>
                  <th className="p-3 font-bold">Category</th>
                  <th className="p-3 font-bold">Urgency</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 font-bold">Reported By</th>
                  <th className="p-3 font-bold">Staff Assignee</th>
                  <th className="p-3 font-bold">Date Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                    <td className="p-3 font-bold text-slate-400">#{c.id}</td>
                    <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{c.title}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{c.category}</td>
                    <td className="p-3 font-semibold">{c.priority}</td>
                    <td className="p-3 font-semibold">{c.status}</td>
                    <td className="p-3">{c.student.name}</td>
                    <td className="p-3 text-slate-500">{c.staff ? c.staff.name : 'Unassigned'}</td>
                    <td className="p-3 text-slate-550">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Print Only Signatures (Visible only when printing) */}
        <div className="hidden print-container mt-12 pt-8 border-t border-dashed border-slate-400 text-xs">
          <div className="flex justify-between">
            <div className="text-center w-40">
              <div className="h-10 border-b border-slate-800 mb-2"></div>
              <p className="font-semibold">Prepared By</p>
              <p className="text-slate-500 font-medium">CampusCare Administrator</p>
            </div>
            <div className="text-center w-40">
              <div className="h-10 border-b border-slate-800 mb-2"></div>
              <p className="font-semibold">Approved By</p>
              <p className="text-slate-500 font-medium">College Principal / Dean</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
