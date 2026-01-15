import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import {
  Plus,
  Trash2,
  Edit,
  Calendar,
  DollarSign,
  CheckCircle2,
  Crown,
  FolderOpen,
  ArrowUpRight,
  Clock,
  TrendingUp
} from 'lucide-react';
import ProjectModal from './ProjectModal';

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

interface ProjectListProps {
  subscription: {
    subscription_tier: 'free' | 'premium';
    project_limit: number;
  } | null;
  onSelectProject: (id: string) => void;
  onUpgradeClick: () => void;
}

export default function ProjectList({ subscription, onSelectProject, onUpgradeClick }: ProjectListProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [taskCounts, setTaskCounts] = useState<Record<string, { total: number; completed: number }>>({});
  const [calculatedCosts, setCalculatedCosts] = useState<Record<string, number>>({});
  const [activeFilter, setActiveFilter] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user, activeFilter]);

  const loadProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user?.id)
      .eq('status', activeFilter)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setProjects(data);
      await loadProjectStats(data);
    }
    setLoading(false);
  };

  const loadProjectStats = async (projectList: Project[]) => {
    const counts: Record<string, { total: number; completed: number }> = {};
    const costs: Record<string, number> = {};

    for (const project of projectList) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status, cost, parent_task_id')
        .eq('project_id', project.id);

      if (tasks) {
        const topLevelTasks = tasks.filter(t => !t.parent_task_id);
        counts[project.id] = {
          total: topLevelTasks.length,
          completed: topLevelTasks.filter(t => t.status === 'completed').length,
        };

        const totalCost = topLevelTasks.reduce((sum, task) => sum + Number(task.cost), 0);
        costs[project.id] = totalCost;
      }
    }

    setTaskCounts(counts);
    setCalculatedCosts(costs);
  };

  const handleAddProject = () => {
    if (subscription?.subscription_tier === 'free' && projects.length >= subscription.project_limit) {
      setShowUpgradePrompt(true);
      return;
    }
    setEditingProject(null);
    setShowModal(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) {
      return;
    }

    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (!error) {
      loadProjects();
    }
  };

  const handleSaveProject = async () => {
    setShowModal(false);
    loadProjects();
  };

  const handleToggleProjectStatus = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();

    const newStatus = project.status === 'active' ? 'completed' : 'active';
    const completed_at = newStatus === 'completed' ? new Date().toISOString() : null;

    const { error } = await supabase
      .from('projects')
      .update({
        status: newStatus,
        completed_at,
        updated_at: new Date().toISOString()
      })
      .eq('id', project.id);

    if (!error) {
      loadProjects();
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
          indicator: 'bg-red-500'
        };
      case 'medium':
        return {
          badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
          indicator: 'bg-amber-500'
        };
      case 'low':
        return {
          badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
          indicator: 'bg-emerald-500'
        };
      default:
        return {
          badge: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600',
          indicator: 'bg-slate-500'
        };
    }
  };

  const getProjectCost = (project: Project) => {
    if (project.cost_mode === 'custom') {
      return Number(project.cost);
    }
    return calculatedCosts[project.id] || 0;
  };

  const getCompletionPercentage = (projectId: string) => {
    const counts = taskCounts[projectId];
    if (!counts || counts.total === 0) return 0;
    return Math.round((counts.completed / counts.total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Your Projects
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {projects.length} {activeFilter} project{projects.length !== 1 ? 's' : ''}
            {subscription?.subscription_tier === 'free' && (
              <span className="ml-1">
                (Limit: {subscription.project_limit})
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === 'active'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === 'completed'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Completed
            </button>
          </div>

          <button
            onClick={handleAddProject}
            className="btn-accent"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        </div>
      </div>

      {showUpgradePrompt && (
        <div className="card-elevated p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 animate-scaleIn">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-1">
                Upgrade to Premium
              </h3>
              <p className="text-amber-800 dark:text-amber-200/80 text-sm mb-4">
                You've reached your limit of {subscription?.project_limit} projects on the free plan.
                Upgrade to Premium for unlimited projects and exclusive features.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onUpgradeClick}
                  className="btn-accent"
                >
                  Upgrade Now
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowUpgradePrompt(false)}
                  className="btn-secondary"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No {activeFilter} projects
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
            {activeFilter === 'active'
              ? 'Get started by creating your first construction project'
              : 'Completed projects will appear here'}
          </p>
          {activeFilter === 'active' && (
            <button
              onClick={handleAddProject}
              className="btn-accent"
            >
              <Plus className="w-4 h-4" />
              Create Your First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project, index) => {
            const completion = getCompletionPercentage(project.id);
            const cost = getProjectCost(project);
            const priorityStyles = getPriorityStyles(project.priority);

            return (
              <div
                key={project.id}
                className="card hover-lift cursor-pointer group overflow-hidden opacity-0 animate-fadeInUp"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                onClick={() => onSelectProject(project.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${priorityStyles.indicator}`} />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {project.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${priorityStyles.badge}`}>
                          {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                        </span>
                        {project.status === 'completed' && (
                          <span className="badge-success">
                            <CheckCircle2 className="w-3 h-3" />
                            Done
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    {project.status === 'completed' && project.completed_at && (
                      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed {new Date(project.completed_at).toLocaleDateString()}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      {project.start_date && (
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(project.start_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="font-semibold text-slate-900 dark:text-white">
                          ${cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <TrendingUp className="w-4 h-4" />
                          <span>Progress</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{completion}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          {taskCounts[project.id]?.completed || 0} of {taskCounts[project.id]?.total || 0} tasks complete
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={(e) => handleToggleProjectStatus(project, e)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      project.status === 'active'
                        ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                        : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {project.status === 'active' ? 'Complete' : 'Reactivate'}
                  </button>
                  <div className="w-px bg-slate-100 dark:bg-slate-700" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProject(project);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <div className="w-px bg-slate-100 dark:bg-slate-700" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editingProject}
          onClose={() => setShowModal(false)}
          onSave={handleSaveProject}
        />
      )}
    </div>
  );
}
