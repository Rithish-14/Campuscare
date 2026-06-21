import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, BookOpen, Shield, Loader, AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Business Administration',
  'Sciences & Humanities',
  'Hostel & Mess Management',
  'Estate & Maintenance',
  'Library Administration',
  'Sports & Athletics'
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT'); // STUDENT or STAFF
  const [department, setDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !department) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, role, department);
      navigate('/dashboard');
    } catch (err) {
      setError(err || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-slate-100 via-slate-50 to-indigo-50/50 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/20">
      <div className="w-full max-w-lg glass-panel p-8 rounded-3xl shadow-xl bg-white/75 dark:bg-slate-900/70 border border-white/40 dark:border-slate-800/60 animate-fade-in my-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Join CampusCare</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-medium">Create a new student or staff account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 mb-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-sm font-medium animate-slide-up">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">Sign up as</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { r: 'STUDENT', label: 'Student' },
                { r: 'STAFF', label: 'Staff' },
                { r: 'ADMIN', label: 'Admin' }
              ].map(({ r, label }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === r
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-500 dark:text-indigo-400'
                      : 'bg-white/50 border-slate-200 text-slate-600 dark:bg-slate-950/20 dark:border-slate-800 dark:text-slate-400'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${role === r ? 'opacity-100' : 'opacity-0'}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="johndoe@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                required
              />
            </div>
          </div>

          {/* Department Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">College Department</label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white appearance-none cursor-pointer"
                required
              >
                <option value="" disabled className="dark:bg-slate-900">Select Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="dark:bg-slate-900">{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 mt-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 dark:shadow-none hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Registering Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
