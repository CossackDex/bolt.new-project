import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../lib/supabase'
import { SubscriptionStatus } from '../components/SubscriptionStatus'
import ProjectList from '../components/ProjectList'
import TaskView from '../components/TaskView'
import {
  Building2,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  LayoutDashboard,
  CreditCard,
  User,
  ChevronRight
} from 'lucide-react'

interface UserSubscription {
  subscription_tier: 'free' | 'premium'
  project_limit: number
}

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { resolvedTheme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (user) {
      loadSubscription()
    }
  }, [user])

  const loadSubscription = async () => {
    setLoading(true)

    const { data: existingSub, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching subscription:', fetchError)
      setLoading(false)
      return
    }

    if (existingSub) {
      setSubscription({
        subscription_tier: existingSub.subscription_tier as 'free' | 'premium',
        project_limit: existingSub.project_limit
      })
    } else {
      const { data: newSub, error: createError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user?.id,
          subscription_tier: 'free',
          project_limit: 3
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating subscription:', createError)
      } else if (newSub) {
        setSubscription({
          subscription_tier: newSub.subscription_tier as 'free' | 'premium',
          project_limit: newSub.project_limit
        })
      }
    }

    setLoading(false)
  }

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId)
  }

  const handleBackToProjects = () => {
    setSelectedProjectId(null)
  }

  const handleUpgradeClick = () => {
    navigate('/pricing')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-4 border-slate-200 dark:border-slate-700" />
            <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Construction Manager
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">
                  Project Management
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="btn-ghost p-2.5 rounded-xl"
                title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[180px]">
                    {user?.email}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {subscription?.subscription_tier === 'premium' ? 'Premium Plan' : 'Free Plan'}
                  </p>
                </div>

                <button
                  onClick={() => navigate('/account')}
                  className="btn-ghost p-2.5 rounded-xl"
                  title="Account Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>

                <button
                  onClick={signOut}
                  className="btn-ghost p-2.5 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden btn-ghost p-2.5 rounded-xl"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 animate-fadeIn">
            <div className="px-4 py-4 space-y-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {subscription?.subscription_tier === 'premium' ? 'Premium Plan' : 'Free Plan'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Dashboard</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { navigate('/pricing'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Pricing</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { navigate('/account'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Dark Mode</span>
                  <button
                    onClick={toggleTheme}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      resolvedTheme === 'dark' ? 'bg-blue-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      resolvedTheme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => { signOut(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-fadeIn">
          <div className="mb-8">
            <SubscriptionStatus />
          </div>

          {selectedProjectId ? (
            <TaskView
              selectedProjectId={selectedProjectId}
              onBack={handleBackToProjects}
            />
          ) : (
            <ProjectList
              subscription={subscription}
              onSelectProject={handleSelectProject}
              onUpgradeClick={handleUpgradeClick}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
