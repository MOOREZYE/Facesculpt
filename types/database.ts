// Auto-generated Supabase DB types — regenerate with:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

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
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'student' | 'admin'
          stripe_customer_id: string | null
          access_expires_at: string | null
          enrolled_at: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'student' | 'admin'
          stripe_customer_id?: string | null
          access_expires_at?: string | null
          enrolled_at?: string
          created_at?: string
        }
        Update: {
          email?: string
          full_name?: string
          role?: 'student' | 'admin'
          stripe_customer_id?: string | null
          access_expires_at?: string | null
        }
      }
      modules: {
        Row: {
          id: string
          title: string
          description: string | null
          order_index: number
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          order_index: number
          is_published?: boolean
        }
        Update: {
          title?: string
          description?: string | null
          order_index?: number
          is_published?: boolean
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          order_index: number
          type: 'theory' | 'video' | 'quiz' | 'download' | 'info'
          content_html: string | null
          video_url: string | null
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          order_index: number
          type: 'theory' | 'video' | 'quiz' | 'download' | 'info'
          content_html?: string | null
          video_url?: string | null
          is_published?: boolean
        }
        Update: {
          title?: string
          order_index?: number
          type?: 'theory' | 'video' | 'quiz' | 'download' | 'info'
          content_html?: string | null
          video_url?: string | null
          is_published?: boolean
        }
      }
      lesson_resources: {
        Row: {
          id: string
          lesson_id: string
          label: string
          file_path: string
          file_name: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          label: string
          file_path: string
          file_name: string
          order_index?: number
        }
        Update: {
          label?: string
          file_path?: string
          file_name?: string
          order_index?: number
        }
      }
      quizzes: {
        Row: {
          id: string
          lesson_id: string
          pass_mark: number
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          pass_mark?: number
        }
        Update: {
          pass_mark?: number
        }
      }
      quiz_questions: {
        Row: {
          id: string
          quiz_id: string
          question_text: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          question_text: string
          order_index: number
        }
        Update: {
          question_text?: string
          order_index?: number
        }
      }
      quiz_options: {
        Row: {
          id: string
          question_id: string
          option_text: string
          is_correct: boolean
          order_index: number
        }
        Insert: {
          id?: string
          question_id: string
          option_text: string
          is_correct?: boolean
          order_index?: number
        }
        Update: {
          option_text?: string
          is_correct?: boolean
          order_index?: number
        }
      }
      student_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          status: 'not_started' | 'in_progress' | 'complete'
          quiz_attempts: number
          quiz_passed: boolean
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          status?: 'not_started' | 'in_progress' | 'complete'
          quiz_attempts?: number
          quiz_passed?: boolean
          completed_at?: string | null
        }
        Update: {
          status?: 'not_started' | 'in_progress' | 'complete'
          quiz_attempts?: number
          quiz_passed?: boolean
          completed_at?: string | null
        }
      }
      student_onboarding: {
        Row: {
          user_id: string
          full_name: string | null
          country: string | null
          years_experience: string | null
          offers_facials: string | null
          primary_goal: string | null
          work_setting: string | null
          heard_about: string | null
          biggest_challenge: string | null
          completed_at: string
        }
        Insert: {
          user_id: string
          full_name?: string | null
          country?: string | null
          years_experience?: string | null
          offers_facials?: string | null
          primary_goal?: string | null
          work_setting?: string | null
          heard_about?: string | null
          biggest_challenge?: string | null
        }
        Update: Record<string, never>
      }
      lesson_notes: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          content: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          content?: string
        }
        Update: {
          content?: string
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          issued_at: string
          pdf_path: string | null
        }
        Insert: {
          id?: string
          user_id: string
          pdf_path?: string | null
        }
        Update: {
          pdf_path?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      get_role: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
  }
}
