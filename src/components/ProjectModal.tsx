import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { X, Calculator, Edit3, FolderPlus, Save } from 'lucide-react';

type Project = {
  id: string
  user_id: string
  name: string
  description: string | null
  priority: string
  cost: number
  cost_mode: string
  start_date: string | null
  end_date: string | null
  status: string
  completed_at: string | null
  created_at: string
  updated_at: string
};

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ProjectModal({ project, onClose, onSave }: ProjectModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [costMode, setCostMode] = useState<'auto_sum' | 'custom'>('auto_sum');
  const [cost, setCost] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setPriority(project.priority as 'low' | 'medium' | 'high');
      setCostMode(project.cost_mode as 'auto_sum' | 'custom');
      setCost(project.cost.toString());
      setStartDate(project.start_date || '');
      setEndDate(project.end_date || '');
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const projectData = {
        user_id: user?.id!,
        name,
        description: description || null,
        priority,
        cost_mode: costMode,
        cost: costMode === 'custom' ? parseFloat(cost) : 0,
        start_date: startDate || null,
        end_date: endDate || null,
        status: project?.status || 'active',
        updated_at: new Date().toISOString(),
      };

      if (project) {
        const { error: updateError } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', project.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('projects')
          .insert(projectData);

        if (insertError) throw insertError;
      }

      onSave();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (p: string, isSelected: boolean) => {
    if (!isSelected) return 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500';

    switch (p) {
      case 'high':
        return 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'medium':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
      case 'low':
        return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
      default:
        return 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-20 z-[100] animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl md:max-w-3xl lg:max-w-4xl w-full max-h-[85vh] my-auto overflow-hidden animate-scaleIn">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <FolderPlus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {project ? 'Edit Project' : 'New Project'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 animate-scaleIn">
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div>
            <label className="label">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input"
              placeholder="e.g., Office Building Construction"
            />
          </div>

          <div>
            <label className="label">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input resize-y min-h-[100px]"
              placeholder="Describe the project scope and objectives"
            />
          </div>

          <div>
            <label className="label">
              Priority <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${getPriorityColor(p, priority === p)}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">
              Cost Tracking Mode <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCostMode('auto_sum')}
                className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
                  costMode === 'auto_sum'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <Calculator className="w-5 h-5" />
                <span>Auto-Sum from Tasks</span>
              </button>
              <button
                type="button"
                onClick={() => setCostMode('custom')}
                className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
                  costMode === 'custom'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <Edit3 className="w-5 h-5" />
                <span>Custom Amount</span>
              </button>
            </div>

            {costMode === 'custom' && (
              <div className="mt-4 animate-fadeIn">
                <label className="label">
                  Budget Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    required={costMode === 'custom'}
                    className="input pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-accent flex-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {project ? 'Update Project' : 'Create Project'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
