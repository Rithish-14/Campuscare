import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  User, 
  Send, 
  UserCheck, 
  CheckCircle2, 
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  Briefcase,
  AlertCircle
} from 'lucide-react';

const STATUS_STEPS = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const STATUS_LABELS = {
  PENDING: 'Pending',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed'
};

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

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Comments
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Admin Actions
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Staff Actions
  const [selectedStatus, setSelectedStatus] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data);
      setSelectedStatus(res.data.status);
      if (res.data.staffId) {
        setSelectedStaffId(res.data.staffId.toString());
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    if (user && user.role === 'ADMIN') {
      try {
        const res = await api.get('/admin/staff');
        setStaffList(res.data);
      } catch (err) {
        console.error('Failed to load staff list:', err);
      }
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
    fetchStaffList();
  }, [id, user]);

  // Comment Submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const res = await api.post('/comments', {
        complaintId: id,
        message: newComment
      });
      // Append comment to local state
      setComplaint(prev => ({
        ...prev,
        comments: [...prev.comments, { ...res.data, user: { id: user.id, name: user.name, role: user.role } }]
      }));
      setNewComment('');
    } catch (err) {
      console.error(err);
      alert('Failed to post comment.');
    } finally {
      setCommentLoading(false);
    }
  };

  // Admin Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) return;

    setAssignLoading(true);
    try {
      const res = await api.put(`/admin/complaints/${id}/assign`, {
        staffId: selectedStaffId
      });
      setComplaint(prev => ({
        ...prev,
        staffId: res.data.staffId,
        staff: res.data.staff,
        status: res.data.status
      }));
      setSelectedStatus(res.data.status);
      alert('Complaint assigned successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to assign staff.');
    } finally {
      setAssignLoading(false);
    }
  };

  // Staff Status Update
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setStatusLoading(true);
    try {
      const res = await api.put(`/staff/complaints/${id}/status`, {
        status: selectedStatus,
        resolutionNote: resolutionNote
      });
      
      // Update details to get the new status and the comments logged by resolutionNote
      await fetchComplaintDetails();
      setResolutionNote('');
      alert('Ticket status updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  // Student Close Ticket Confirmation
  const handleStudentClose = async () => {
    if (window.confirm('Are you sure you want to CLOSE this ticket? This marks the issue as resolved and finalized.')) {
      try {
        const res = await api.put(`/complaints/${id}/close`);
        setComplaint(prev => ({
          ...prev,
          status: res.data.status
        }));
        setSelectedStatus(res.data.status);
        alert('Ticket closed successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to close ticket.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="text-sm">Loading ticket details...</span>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Error Loading Ticket</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">{error || 'Ticket not found.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentStatusIndex = STATUS_STEPS.indexOf(complaint.status);

  return (
    <div className="space-y-6">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ticket Details</span>
          <h1 className="text-xl font-extrabold text-slate-850 dark:text-white tracking-tight flex items-center gap-2">
            Complaint #{complaint.id}
          </h1>
        </div>
      </div>

      {/* Status Progress Timeline */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 pl-1">Ticket Progress Timeline</h3>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4">
          {/* Connecting line */}
          <div className="absolute left-4 top-2 bottom-2 md:left-2 md:right-2 md:top-4 md:h-0.5 bg-slate-200 dark:bg-slate-800 -z-0 hidden md:block w-[95%]"></div>
          
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStatusIndex;
            const isActive = idx === currentStatusIndex;
            return (
              <div key={step} className="relative z-1 flex md:flex-col items-center gap-3.5 md:gap-2.5 w-full md:w-auto text-left md:text-center">
                <div className={`
                  w-9 h-9 rounded-full flex items-center justify-center border font-bold text-sm transition-all duration-300
                  ${isActive 
                    ? 'bg-indigo-600 text-white border-indigo-600 scale-110 shadow-xs' 
                    : isCompleted 
                      ? 'bg-emerald-500 text-white border-emerald-500' 
                      : 'bg-white dark:bg-slate-950 text-slate-400 border-slate-250 dark:border-slate-800'}
                `}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <div>
                  <p className={`text-xs font-bold ${isCompleted ? 'text-slate-700 dark:text-slate-250' : 'text-slate-400 dark:text-slate-500'}`}>
                    {STATUS_LABELS[step]}
                  </p>
                  {isActive && (
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mt-0.5">Active</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core information grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Side: Ticket Metadata */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card info */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold border dark:bg-slate-950/40">{complaint.category}</span>
              <div className="flex gap-2">
                <span className={`px-2.5 py-0.5 border text-xs font-bold rounded-full ${PRIORITY_BADGES[complaint.priority]}`}>
                  {complaint.priority} Urgency
                </span>
                <span className={`px-2.5 py-0.5 border text-xs font-bold rounded-full ${STATUS_BADGES[complaint.status]}`}>
                  {STATUS_LABELS[complaint.status]}
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-snug">{complaint.title}</h2>
            
            <div className="p-4.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/40 text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </div>

            {/* Proof Attachment Image */}
            {complaint.image && (
              <div className="space-y-1.5 pt-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 pl-0.5">Uploaded proof attachment</h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 max-h-96 flex items-center justify-center">
                  <img 
                    src={`/uploads/${complaint.image}`} 
                    alt="Complaint Proof" 
                    className="object-contain max-h-96 w-full"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>
            )}

            {/* Requester & Assignee Cards */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
              {/* Requester Student details */}
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Reported By</p>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-350 truncate">{complaint.student.name}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{complaint.student.department || 'Student'}</p>
                </div>
              </div>

              {/* Staff details */}
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Assigned Staff</p>
                  {complaint.staff ? (
                    <>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-350 truncate">{complaint.staff.name}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{complaint.staff.department || 'Campus Staff'}</p>
                    </>
                  ) : (
                    <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-500 italic">Awaiting Assignment</h4>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Comments section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              Activity Updates & Comments ({complaint.comments.length})
            </h3>
            
            {/* Comment list */}
            <div className="space-y-4.5 max-h-96 overflow-y-auto pr-1">
              {complaint.comments.length === 0 ? (
                <p className="text-center py-6 text-sm text-slate-400 dark:text-slate-500 italic">No updates logged yet.</p>
              ) : (
                complaint.comments.map((comment) => {
                  const isResolution = comment.message.startsWith('[Resolution Note');
                  return (
                    <div 
                      key={comment.id} 
                      className={`p-4 rounded-2xl border text-sm leading-relaxed transition-all ${
                        isResolution 
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400'
                          : comment.user.role === 'ADMIN'
                            ? 'bg-indigo-50/20 dark:bg-indigo-950/5 border-indigo-100/30 dark:border-indigo-900/10'
                            : 'bg-slate-50/30 dark:bg-slate-850/40 border-slate-100 dark:border-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                          {comment.user.name} 
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase tracking-wider font-bold ${
                            comment.user.role === 'ADMIN' 
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400' 
                              : comment.user.role === 'STAFF' 
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                                : 'bg-slate-200 text-slate-650 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {comment.user.role.toLowerCase()}
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {new Date(comment.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-655 dark:text-slate-350 whitespace-pre-wrap">{comment.message}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Post comment input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2 items-end pt-2">
              <textarea
                rows={2}
                placeholder="Post a query, log updates, or message assignee..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
                required
              />
              <button
                type="submit"
                disabled={commentLoading || !newComment.trim()}
                className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow-md transition-all disabled:opacity-50 cursor-pointer h-11 flex items-center justify-center shrink-0"
              >
                {commentLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Role-Specific Action Panels */}
        <div className="space-y-6">
          {/* Admin Panel: Assignment */}
          {user.role === 'ADMIN' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <UserCheck className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Admin Assignment Center</h3>
              </div>
              
              <form onSubmit={handleAssignSubmit} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 pl-0.5">Assign Complaint Staff</label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer"
                    required
                  >
                    <option value="" disabled className="dark:bg-slate-900">Select Staff Member</option>
                    {staffList.map(staff => (
                      <option key={staff.id} value={staff.id} className="dark:bg-slate-900">
                        {staff.name} ({staff.department || 'Campus Care'})
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {assignLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Assign to Staff'}
                </button>
              </form>
            </div>
          )}

          {/* Staff Panel: Status and resolution comments */}
          {user.role === 'STAFF' && complaint.staffId === user.id && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Briefcase className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Staff Actions Portal</h3>
              </div>

              <form onSubmit={handleStatusSubmit} className="space-y-4.5 pt-1">
                {/* Status Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 pl-0.5">Ticket Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer"
                    required
                  >
                    <option value="ASSIGNED" className="dark:bg-slate-900">Assigned / Backlog</option>
                    <option value="IN_PROGRESS" className="dark:bg-slate-900">In Progress</option>
                    <option value="RESOLVED" className="dark:bg-slate-900">Resolved (Fixed)</option>
                    <option value="CLOSED" className="dark:bg-slate-900">Closed (Complete)</option>
                  </select>
                </div>

                {/* Resolution Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 pl-0.5">Resolution Notes / Action Taken</label>
                  <textarea
                    rows={3}
                    placeholder="Describe how this issue was fixed. (e.g. Changed light bulb, replaced router wire). This logs as a resolution note."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={statusLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {statusLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Update Ticket Status'}
                </button>
              </form>
            </div>
          )}

          {/* Student Panel: Close option when Resolved */}
          {user.role === 'STUDENT' && complaint.status === 'RESOLVED' && (
            <div className="p-6 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-250 dark:border-emerald-900/40 shadow-2xs space-y-4">
              <div className="flex gap-2 items-center text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Resolve Ticket Confirmation</h3>
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed">
                The staff has marked this complaint as **RESOLVED**. Please verify the fix. If it is resolved to your satisfaction, close this ticket.
              </p>
              
              <button
                type="button"
                onClick={handleStudentClose}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Close Complaint
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
