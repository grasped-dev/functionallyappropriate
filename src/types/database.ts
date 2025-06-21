export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          grade: string
          program: string
          case_manager_id: string
          next_review_date: string | null
          progress_percentage: number
          goals_met: number
          total_goals: number
          status: 'active' | 'inactive' | 'graduated'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          grade: string
          program: string
          case_manager_id: string
          next_review_date?: string | null
          progress_percentage?: number
          goals_met?: number
          total_goals?: number
          status?: 'active' | 'inactive' | 'graduated'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          grade?: string
          program?: string
          case_manager_id?: string
          next_review_date?: string | null
          progress_percentage?: number
          goals_met?: number
          total_goals?: number
          status?: 'active' | 'inactive' | 'graduated'
        }
      }
      goals: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          student_id: string
          area: string
          description: string
          baseline: string
          target_date: string
          status: 'draft' | 'active' | 'completed' | 'discontinued'
          progress_notes: string | null
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          student_id: string
          area: string
          description: string
          baseline: string
          target_date: string
          status?: 'draft' | 'active' | 'completed' | 'discontinued'
          progress_notes?: string | null
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          student_id?: string
          area?: string
          description?: string
          baseline?: string
          target_date?: string
          status?: 'draft' | 'active' | 'completed' | 'discontinued'
          progress_notes?: string | null
          created_by?: string
        }
      }
      reports: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          student_id: string
          name: string
          type: string
          content: string | null
          status: 'draft' | 'in_progress' | 'completed'
          created_by: string
          template_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          student_id: string
          name: string
          type: string
          content?: string | null
          status?: 'draft' | 'in_progress' | 'completed'
          created_by: string
          template_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          student_id?: string
          name?: string
          type?: string
          content?: string | null
          status?: 'draft' | 'in_progress' | 'completed'
          created_by?: string
          template_id?: string | null
        }
      }
      meetings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          student_id: string
          student_name: string
          meeting_type: string
          custom_meeting_type: string | null
          date: string | null
          time: string | null
          duration_minutes: number | null
          status: 'pending_scheduling' | 'scheduled' | 'completed' | 'cancelled'
          notes: string | null
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          student_id: string
          student_name: string
          meeting_type: string
          custom_meeting_type?: string | null
          date?: string | null
          time?: string | null
          duration_minutes?: number | null
          status?: 'pending_scheduling' | 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          student_id?: string
          student_name?: string
          meeting_type?: string
          custom_meeting_type?: string | null
          date?: string | null
          time?: string | null
          duration_minutes?: number | null
          status?: 'pending_scheduling' | 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          created_by?: string
        }
      }
      meeting_participants: {
        Row: {
          id: string
          meeting_id: string
          team_member_id: string
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          team_member_id: string
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          team_member_id?: string
          created_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          role: string
          email: string
          weekly_schedule: Json
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          role: string
          email: string
          weekly_schedule: Json
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          role?: string
          email?: string
          weekly_schedule?: Json
          is_active?: boolean
        }
      }
      templates: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string
          content: string
          is_custom: boolean
          placeholder_keys: string[] | null
          created_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description: string
          content: string
          is_custom?: boolean
          placeholder_keys?: string[] | null
          created_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          content?: string
          is_custom?: boolean
          placeholder_keys?: string[] | null
          created_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
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