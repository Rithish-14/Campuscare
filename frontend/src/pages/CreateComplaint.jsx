import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Sparkles, 
  Upload, 
  ChevronLeft, 
  Loader, 
  AlertTriangle, 
  CheckCircle,
  FileImage,
  X
} from 'lucide-react';

const CATEGORIES = [
  'Hostel',
  'Classroom',
  'Laboratory',
  'Library',
  'Transport',
  'Canteen',
  'Water Supply',
  'Electricity',
  'Internet/Wi-Fi',
  'Sports',
  'Others'
];

const CreateComplaint = () => {
  const navigate = useNavigate();

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // AI states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const debounceTimerRef = useRef(null);

  // General States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Trigger AI prediction when title and description are filled
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (title.trim().length > 5 && description.trim().length > 15) {
      setAiLoading(true);
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const res = await api.post('/complaints/predict', { title, description });
          setAiPrediction(res.data);
        } catch (error) {
          console.error('AI Prediction error:', error);
        } finally {
          setAiLoading(false);
        }
      }, 1000); // 1-second debounce delay
    } else {
      setAiPrediction(null);
      setAiLoading(false);
    }

    return () => clearTimeout(debounceTimerRef.current);
  }, [title, description]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large (maximum 5MB).');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
  };

  const applyPrediction = () => {
    if (aiPrediction) {
      setCategory(aiPrediction.category);
      setPriority(aiPrediction.priority);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !category || !priority) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('priority', priority);
      if (image) {
        formData.append('image', image);
      }

      await api.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit complaint. Server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">File Campus Issue</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Submit details of maintenance, transport, or utility errors</p>
        </div>
      </div>

      {/* Main Error Alert */}
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-sm font-medium animate-slide-up">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Form Container */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Body */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-2xs space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Water leakage in Room 204 or Wi-Fi Router offline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">
              Describe the Issue <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Provide specific details. (e.g., location, time observed, exact errors). Typing a detailed message helps our AI assistant accurately identify the urgency!"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
              required
            />
          </div>

          {/* Core Fields Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer"
                required
              >
                <option value="" disabled className="dark:bg-slate-900">Select Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="dark:bg-slate-900">{cat}</option>
                ))}
              </select>
            </div>

            {/* Priority Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">
                Priority Level <span className="text-rose-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer"
                required
              >
                <option value="" disabled className="dark:bg-slate-900">Select Priority</option>
                <option value="LOW" className="dark:bg-slate-900">LOW (Feedback/Cosmetic)</option>
                <option value="MEDIUM" className="dark:bg-slate-900">MEDIUM (Functional disruption)</option>
                <option value="HIGH" className="dark:bg-slate-900">HIGH (Physical hazard/Flooding)</option>
              </select>
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">
              Attach Proof Photo (Optional)
            </label>
            {!imagePreview ? (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors duration-200 relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Click or drag image file here</p>
                <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG, WEBP (Max 5MB)</p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-52 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <img src={imagePreview} alt="Upload preview" className="object-contain max-h-52" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Action buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'File Complaint'
              )}
            </button>
          </div>
        </form>

        {/* AI Predictive Companion Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-violet-950/10 border border-indigo-100/70 dark:border-indigo-900/40 shadow-xs flex flex-col justify-between min-h-60">
            <div>
              <div className="flex items-center gap-2.5 text-indigo-700 dark:text-indigo-400">
                <Sparkles className="w-5 h-5 animate-pulse shrink-0" />
                <h3 className="font-bold text-sm uppercase tracking-wider">AI Copilot Analysis</h3>
              </div>
              
              <div className="mt-4 space-y-3">
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <Loader className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
                    <p className="text-xs font-medium">Scanning complaint details...</p>
                  </div>
                ) : aiPrediction ? (
                  <div className="space-y-4.5 animate-fade-in">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Suggested Category</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{aiPrediction.category}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Urgency prediction</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{aiPrediction.priority}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">AI Explanation</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                        {aiPrediction.explanation}
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={applyPrediction}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold text-xs border border-indigo-200/50 dark:border-indigo-900/50 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Apply AI Suggestions
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                    <FileImage className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    <p className="text-xs leading-relaxed max-w-[200px] mx-auto">
                      Fill out the title and description to see the AI suggest the category and urgency level.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateComplaint;
