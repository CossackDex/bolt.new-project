import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import {
  Plus,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Circle,
  CheckCircle2,
  Clock,
  Eye,
  DollarSign,
  AlertTriangle,
  ListChecks,
  Pencil,
  Trash2
} from 'lucide-react';
import TaskModal from './TaskModal';

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

interface TaskViewProps {
  selectedProjectId: string | null;
  onBack: () => void;
}

interface TaskWithChildren extends Task {
  children?: TaskWithChildren[];
  calculatedCost?: number;
}

export default function TaskView({ selectedProjectId, onBack }: TaskViewProps) {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (selectedProjectId) {
      loadProject();
      loadTasks();
    } else if (user) {
      loadAllTasks();
    }
  }, [selectedProjectId, user]);

  const loadProject = async () => {
    if (!selectedProjectId) return;

    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', selectedProjectId)
      .maybeSingle();

    if (data) {
      setProject(data);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    const query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (selectedProjectId) {
      query.eq('project_id', selectedProjectId);
    }

    const { data, error } = await query;

    if (data && !error) {
      const tasksWithCost = await calculateTaskCosts(data);
      const tree = buildTaskTree(tasksWithCost);
      setTasks(tree);

      const newExpanded = new Set<string>();
      const expandAllTasks = (taskList: TaskWithChildren[]) => {
        taskList.forEach(task => {
          if (task.children && task.children.length > 0) {
            newExpanded.add(task.id);
            expandAllTasks(task.children);
          }
        });
      };
      expandAllTasks(tree);
      setExpandedTasks(newExpanded);
    }
    setLoading(false);
  };

  const loadAllTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      const tasksWithCost = await calculateTaskCosts(data);
      const tree = buildTaskTree(tasksWithCost);
      setTasks(tree);

      const newExpanded = new Set<string>();
      const expandAllTasks = (taskList: TaskWithChildren[]) => {
        taskList.forEach(task => {
          if (task.children && task.children.length > 0) {
            newExpanded.add(task.id);
            expandAllTasks(task.children);
          }
        });
      };
      expandAllTasks(tree);
      setExpandedTasks(newExpanded);
    }
    setLoading(false);
  };

  const calculateTaskCosts = async (taskList: Task[]): Promise<TaskWithChildren[]> => {
    const tasksMap = new Map<string, TaskWithChildren>();
    taskList.forEach(task => tasksMap.set(task.id, { ...task, calculatedCost: Number(task.cost) }));

    const calculateCost = (task: TaskWithChildren): number => {
      if (task.cost_mode === 'custom') {
        return Number(task.cost);
      }

      const children = taskList.filter(t => t.parent_task_id === task.id);
      if (children.length === 0) {
        return Number(task.cost);
      }

      const childrenCost = children.reduce((sum, child) => {
        const childTask = tasksMap.get(child.id);
        return sum + (childTask ? calculateCost(childTask) : 0);
      }, 0);

      task.calculatedCost = childrenCost;
      return childrenCost;
    };

    taskList.filter(t => !t.parent_task_id).forEach(task => {
      const taskObj = tasksMap.get(task.id);
      if (taskObj) calculateCost(taskObj);
    });

    return Array.from(tasksMap.values());
  };

  const buildTaskTree = (taskList: TaskWithChildren[]): TaskWithChildren[] => {
    const taskMap = new Map<string, TaskWithChildren>();
    const rootTasks: TaskWithChildren[] = [];

    taskList.forEach(task => {
      taskMap.set(task.id, { ...task, children: [] });
    });

    taskList.forEach(task => {
      const taskObj = taskMap.get(task.id)!;
      if (task.parent_task_id) {
        const parent = taskMap.get(task.parent_task_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(taskObj);
        }
      } else {
        rootTasks.push(taskObj);
      }
    });

    return rootTasks;
  };

  const handleAddTask = (parentId: string | null = null) => {
    setEditingTask(null);
    setParentTaskId(parentId);
    setShowModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setParentTaskId(task.parent_task_id);
    setShowModal(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Delete this task and all its sub-tasks? This cannot be undone.')) {
      return;
    }

    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (!error) {
      loadTasks();
      if (selectedProjectId) loadProject();
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id);

    if (!error) {
      loadTasks();
      if (selectedProjectId) loadProject();
    }
  };

  const handleSaveTask = () => {
    setShowModal(false);
    loadTasks();
    if (selectedProjectId) loadProject();
  };

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'review':
        return <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Circle className="w-5 h-5 text-slate-400 dark:text-slate-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'badge-danger';
      case 'medium':
        return 'badge-warning';
      case 'low':
        return 'badge-success';
      default:
        return 'badge';
    }
  };

  const isOverdue = (deadline: string | null) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const filterTasks = (taskList: TaskWithChildren[]): TaskWithChildren[] => {
    if (filterStatus === 'all') return taskList;
    return taskList
      .filter(task => task.status === filterStatus)
      .map(task => ({
        ...task,
        children: task.children ? filterTasks(task.children) : []
      }));
  };

  const renderTask = (task: TaskWithChildren, depth: number = 0) => {
    const hasChildren = task.children && task.children.length > 0;
    const isExpanded = expandedTasks.has(task.id);
    const overdue = isOverdue(task.deadline);
    const displayCost = task.calculatedCost ?? Number(task.cost);

    return (
      <div key={task.id} className="mb-3">
        <div
          className={`card hover-lift ${
            overdue ? 'border-red-500 dark:border-red-600' : ''
          } ${
            depth > 0 ? 'ml-12 border-l-4 border-l-blue-500 dark:border-l-blue-400' : ''
          }`}
        >
          <div className="p-5">
            <div className="flex items-start gap-3">
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(task.id)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  )}
                </button>
              ) : (
                <div className="w-8 flex-shrink-0" />
              )}

              <button
                onClick={() => handleToggleStatus(task)}
                className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
              >
                {getStatusIcon(task.status)}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3
                    className={`font-semibold text-slate-900 dark:text-white text-lg ${
                      task.status === 'completed' ? 'line-through text-slate-500 dark:text-slate-400' : ''
                    }`}
                  >
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge ${getPriorityBadge(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    {overdue && (
                      <div className="flex items-center gap-1 badge badge-danger">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-xs">Overdue</span>
                      </div>
                    )}
                  </div>
                </div>

                {task.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ${displayCost.toFixed(2)}
                    </span>
                    {task.cost_mode === 'auto_sum' && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">(auto)</span>
                    )}
                  </div>

                  {task.deadline && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                      overdue
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    }`}>
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                  )}

                  {hasChildren && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <ListChecks className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {task.children?.length} sub-task{task.children?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAddTask(task.id)}
                    className="btn-ghost text-xs px-3 py-1.5 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Sub-task
                  </button>
                  <button
                    onClick={() => handleEditTask(task)}
                    className="btn-secondary text-xs px-3 py-1.5 rounded-lg"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="btn-danger text-xs px-3 py-1.5 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-3 animate-fadeIn">
            {task.children?.map(child => renderTask(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredTasks = filterTasks(tasks);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-4 border-slate-200 dark:border-slate-700" />
            <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 space-y-4">
        {selectedProjectId && (
          <button
            onClick={onBack}
            className="btn-ghost rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {project ? project.name : 'All Tasks'}
            </h2>
            {project?.description && (
              <p className="text-slate-600 dark:text-slate-400">{project.description}</p>
            )}
          </div>
          <button
            onClick={() => handleAddTask(null)}
            className="btn-accent rounded-xl"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'todo', 'in_progress', 'review', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-lg shadow-amber-500/25'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="card text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-600">
          <div className="bg-slate-100 dark:bg-slate-700 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Plus className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {filterStatus === 'all' ? 'No tasks yet' : `No ${filterStatus.replace('_', ' ')} tasks`}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {filterStatus === 'all'
              ? 'Get started by creating your first task'
              : 'Try selecting a different filter'}
          </p>
          {filterStatus === 'all' && (
            <button
              onClick={() => handleAddTask(null)}
              className="btn-accent rounded-xl"
            >
              Create Your First Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => renderTask(task))}
        </div>
      )}

      {showModal && (
        <TaskModal
          task={editingTask}
          projectId={selectedProjectId}
          parentTaskId={parentTaskId}
          onClose={() => setShowModal(false)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}
