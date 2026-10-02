/**
 * Database type definitions for Eco Campus Bot.
 * These mirror the Supabase tables defined in supabase/schema.sql
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          created_at?: string
        }
        Update: {
          content?: string
        }
        Relationships: []
      }
      waste_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string | null
          icon: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string | null
          icon?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          color?: string | null
          icon?: string | null
        }
        Relationships: []
      }
      disposal_points: {
        Row: {
          id: string
          name: string
          location_description: string
          building: string
          floor: string | null
          accepts: string[]
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          location_description: string
          building: string
          floor?: string | null
          accepts?: string[]
          is_active?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          location_description?: string
          building?: string
          floor?: string | null
          accepts?: string[]
          is_active?: boolean
        }
        Relationships: []
      }
      eco_actions: {
        Row: {
          id: string
          user_id: string
          action_type: string
          description: string | null
          category_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action_type: string
          description?: string | null
          category_id?: string | null
          created_at?: string
        }
        Update: {
          description?: string | null
        }
        Relationships: []
      }
      campus_stats: {
        Row: {
          id: string
          stat_key: string
          value: number
          label: string
          suffix: string
          trend: string
          bar: number
          updated_at: string
        }
        Insert: {
          id?: string
          stat_key: string
          value: number
          label: string
          suffix?: string
          trend?: string
          bar?: number
          updated_at?: string
        }
        Update: {
          value?: number
          trend?: string
          bar?: number
          updated_at?: string
        }
        Relationships: []
      }
      eco_points: {
        Row: {
          id: string
          user_id: string
          action_type: 'waste_classification' | 'snap_and_sort' | 'report_waste' | 'eco_challenge'
          points: number
          description: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action_type: 'waste_classification' | 'snap_and_sort' | 'report_waste' | 'eco_challenge'
          points: number
          description: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          points?: number
          description?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      waste_reports: {
        Row: {
          id: string
          user_id: string
          title: string
          location_name: string
          issue_type: 'overflowing_bin' | 'damaged_bin' | 'litter_hotspot' | 'hazardous_waste' | 'other'
          description: string | null
          status: 'reported' | 'in_progress' | 'resolved'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          location_name: string
          issue_type: 'overflowing_bin' | 'damaged_bin' | 'litter_hotspot' | 'hazardous_waste' | 'other'
          description?: string | null
          status?: 'reported' | 'in_progress' | 'resolved'
          created_at?: string
        }
        Update: {
          title?: string
          location_name?: string
          status?: 'reported' | 'in_progress' | 'resolved'
          description?: string | null
        }
        Relationships: []
      }
      eco_challenges: {
        Row: {
          id: string
          title: string
          description: string
          points: number
          icon: string
          category: string
        }
        Insert: {
          id: string
          title: string
          description: string
          points?: number
          icon?: string
          category?: string
        }
        Update: {
          title?: string
          description?: string
          points?: number
          icon?: string
          category?: string
        }
        Relationships: []
      }
      user_challenge_completions: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          completed_at?: string
        }
        Update: {
          id?: string
          completed_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      campus_leaderboard: {
        Row: {
          user_id: string
          display_name: string
          avatar_url: string | null
          total_points: number
          total_actions: number
          last_active_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
