import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Shield, Loader, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT'); // STUDENT, STAFF, ADMIN
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const userData = await login(email, password);
      if (userData.role !== role) {
        logout();
        setError(`Access denied. Your account is registered as '${userData.role}', not '${role}'.`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-slate-100 via-slate-50 to-indigo-50/50 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/20">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-xl bg-white/75 dark:bg-slate-900/70 border border-white/40 dark:border-slate-800/60 animate-fade-in">
        {/* Brand/Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome to CampusCare</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-medium">Log in to manage your campus issues</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 mb-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-sm font-medium animate-slide-up">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Portal Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">Login Portal</label>
            <div className="grid grid-cols-3 gap-2">
              {['STUDENT', 'STAFF', 'ADMIN'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 rounded-xl font-bold text-[10px] tracking-wider uppercase border transition-all cursor-pointer ${
                    role === r
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-500 dark:text-indigo-400'
                      : 'bg-white/50 border-slate-200 text-slate-600 dark:bg-slate-950/20 dark:border-slate-800 dark:text-slate-400'
                  }`}
                >
                  {r.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="email@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                required
              />
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
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 dark:shadow-none hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          New to CampusCare?{' '}
          <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
