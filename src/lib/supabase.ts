import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          subscription_tier: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          project_limit: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          subscription_tier?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          project_limit?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          subscription_tier?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          project_limit?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          priority: string
          cost: number
          cost_mode: string
          start_date: string | null
          end_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          priority?: string
          cost?: number
          cost_mode?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          priority?: string
          cost?: number
          cost_mode?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      tasks: {
        Row: {
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
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          parent_task_id?: string | null
          user_id: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          cost?: number
          cost_mode?: string
          deadline?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          parent_task_id?: string | null
          user_id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          cost?: number
          cost_mode?: string
          deadline?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          task_id: string | null
          content: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          task_id?: string | null
          content: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          task_id?: string | null
          content?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      stripe_user_subscriptions: {
        Row: {
          customer_id: string
          subscription_id: string | null
          subscription_status: string
          price_id: string | null
          current_period_start: number | null
          current_period_end: number | null
          cancel_at_period_end: boolean | null
          payment_method_brand: string | null
          payment_method_last4: string | null
        }
      }
    }
  }
}