import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { X, Calculator, Edit3, CheckSquare, Save, AlertCircle } from 'lucide-react';

type Task = {
  id: string
  project_id: string
  parent_task_id: string | null
  user_id: string
  title: string
  description: string | null
  status: string
  priority: string
  cost: number
  cost_mode: string
  deadline: string | null
  created_at: string
  updated_at: string
};

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
  created_at: string
  updated_at: string
};

interface TaskModalProps {
  task: Task | null;
  projectId: string | null;
  parentTaskId: string | null;
  onClose: () => void;
  onSave: () => void;
}

export default function TaskModal({ task, projectId, parentTaskId, onClose, onSave }: TaskModalProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'review' | 'completed'>('todo');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [costMode, setCostMode] = useState<'auto_sum' | 'custom'>('custom');
  const [cost, setCost] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProjects = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      console.error('Error loading projects:', error);
      setError('Failed to load projects. Please try again.');
      return;
    }

    if (data) {
      setProjects(data);
      if (!projectId && data.length > 0) {
        setSelectedProjectId(data[0].id);
      }
    }
  }, [user, projectId]);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
    if (task) {
      setSelectedProjectId(task.project_id);
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status as 'todo' | 'in_progress' | 'review' | 'completed');
      setPriority(task.priority as 'low' | 'medium' | 'high');
      setCostMode(task.cost_mode as 'auto_sum' | 'custom');
      setCost(task.cost.toString());
      setDeadline(task.deadline || '');
    } else if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [task, projectId, user, loadProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedProjectId) {
      setError('Please select a project');
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        user_id: user?.id!,
        project_id: selectedProjectId,
        parent_task_id: parentTaskId,
        title,
        description: description || null,
        status,
        priority,
        cost_mode: costMode,
        cost: costMode === 'custom' ? parseFloat(cost) : 0,
        deadline: deadline || null,
        updated_at: new Date().toISOString(),
      };

      if (task) {
        const { error: updateError } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', task.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('tasks')
          .insert(taskData);

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-20 z-[100] animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl md:max-w-3xl lg:max-w-4xl w-full max-h-[85vh] my-auto overflow-hidden animate-scaleIn">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {task ? 'Edit Task' : parentTaskId ? 'New Sub-task' : 'New Task'}
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
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div>
            <label className="label">
              Project <span className="text-red-500">*</span>
            </label>
            {projects.length === 0 && !projectId ? (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-semibold mb-1">No projects available</p>
                  <p>Please create a project first before adding tasks. Close this dialog and click "New Project" to get started.</p>
                </div>
              </div>
            ) : (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                required
                disabled={!!projectId}
                className="input disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Select a project</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="label">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input"
              placeholder="e.g., Install electrical wiring"
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
              placeholder="Describe the task details"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'todo' | 'in_progress' | 'review' | 'completed')}
                className="input"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="label">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
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
                <span>Auto-Sum</span>
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
                  Cost Amount <span className="text-red-500">*</span>
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

          <div>
            <label className="label">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="input"
            />
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
                  {task ? 'Update Task' : 'Create Task'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
