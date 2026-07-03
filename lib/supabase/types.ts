export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      employment_type: {
        Row: {
          active: boolean
          created_at: string
          id: number
          type: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: number
          type: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: number
          type?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          date: string
          href: string | null
          id: string
          location: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          date: string
          href?: string | null
          id?: string
          location?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          date?: string
          href?: string | null
          id?: string
          location?: string | null
          title?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          apply_url: string
          company: string
          created_at: string
          employment_type: string | null
          experience_level: string | null
          has_alumni_referral: boolean
          id: string
          location: string | null
          posted_by: string | null
          referrer_id: string | null
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          apply_url: string
          company: string
          created_at?: string
          employment_type?: string | null
          experience_level?: string | null
          has_alumni_referral?: boolean
          id?: string
          location?: string | null
          posted_by?: string | null
          referrer_id?: string | null
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          apply_url?: string
          company?: string
          created_at?: string
          employment_type?: string | null
          experience_level?: string | null
          has_alumni_referral?: boolean
          id?: string
          location?: string | null
          posted_by?: string | null
          referrer_id?: string | null
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      login_history: {
        Row: {
          action: string
          created_at: string
          id: number
          user_email: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: number
          user_email: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: number
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      member_memberships: {
        Row: {
          created_at: string
          end_date: string | null
          id: number
          membership_id: string | null
          membership_type: string
          Mode: string | null
          params: string | null
          Payment: number | null
          Received_by: string | null
          Received_date: string | null
          start_date: string
          user_email: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: number
          membership_id?: string | null
          membership_type: string
          Mode?: string | null
          params?: string | null
          Payment?: number | null
          Received_by?: string | null
          Received_date?: string | null
          start_date: string
          user_email: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: number
          membership_id?: string | null
          membership_type?: string
          Mode?: string | null
          params?: string | null
          Payment?: number | null
          Received_by?: string | null
          Received_date?: string | null
          start_date?: string
          user_email?: string
        }
        Relationships: []
      }
      membership_privilege: {
        Row: {
          active: boolean
          created_at: string
          edit: boolean
          execute: boolean
          id: number
          membership_type: string
          privilege: string
          view: boolean
        }
        Insert: {
          active?: boolean
          created_at?: string
          edit?: boolean
          execute?: boolean
          id?: number
          membership_type: string
          privilege: string
          view?: boolean
        }
        Update: {
          active?: boolean
          created_at?: string
          edit?: boolean
          execute?: boolean
          id?: number
          membership_type?: string
          privilege?: string
          view?: boolean
        }
        Relationships: []
      }
      membership_type: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: number
          PAID: boolean
          type: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description: string
          id?: number
          PAID?: boolean
          type: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: number
          PAID?: boolean
          type?: string
        }
        Relationships: []
      }
      memoirs: {
        Row: {
          active: boolean | null
          batch: number | null
          branch: string | null
          created_at: string
          date_approved: string | null
          email: string | null
          id: number
          message: string
          name: string | null
          priority_seq: number
          role_company: string | null
          show_on_main_page: boolean
        }
        Insert: {
          active?: boolean | null
          batch?: number | null
          branch?: string | null
          created_at?: string
          date_approved?: string | null
          email?: string | null
          id?: number
          message: string
          name?: string | null
          priority_seq?: number
          role_company?: string | null
          show_on_main_page?: boolean
        }
        Update: {
          active?: boolean | null
          batch?: number | null
          branch?: string | null
          created_at?: string
          date_approved?: string | null
          email?: string | null
          id?: number
          message?: string
          name?: string | null
          priority_seq?: number
          role_company?: string | null
          show_on_main_page?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accepted_terms_at: string | null
          approved_by_email: string | null
          approved_date: string | null
          avatar_url: string | null
          branch: string | null
          city: string | null
          company: string | null
          company_url: string | null
          consent_directory_show_contacts: boolean
          consent_directory_visible: boolean
          consent_terms_privacy: boolean
          country: string | null
          created_at: string
          degree: string | null
          designation: string | null
          email: string
          employment_type: string | null
          full_name: string
          gender: string | null
          graduation_year: number
          id: string
          interests: string[]
          is_approved: boolean
          is_public: boolean
          onboarded: boolean
          phone_e164: string | null
          roll_number: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          accepted_terms_at?: string | null
          approved_by_email?: string | null
          approved_date?: string | null
          avatar_url?: string | null
          branch?: string | null
          city?: string | null
          company?: string | null
          company_url?: string | null
          consent_directory_show_contacts?: boolean
          consent_directory_visible?: boolean
          consent_terms_privacy?: boolean
          country?: string | null
          created_at?: string
          degree?: string | null
          designation?: string | null
          email: string
          employment_type?: string | null
          full_name: string
          gender?: string | null
          graduation_year: number
          id: string
          interests?: string[]
          is_approved?: boolean
          is_public?: boolean
          onboarded?: boolean
          phone_e164?: string | null
          roll_number?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          accepted_terms_at?: string | null
          approved_by_email?: string | null
          approved_date?: string | null
          avatar_url?: string | null
          branch?: string | null
          city?: string | null
          company?: string | null
          company_url?: string | null
          consent_directory_show_contacts?: boolean
          consent_directory_visible?: boolean
          consent_terms_privacy?: boolean
          country?: string | null
          created_at?: string
          degree?: string | null
          designation?: string | null
          email?: string
          employment_type?: string | null
          full_name?: string
          gender?: string | null
          graduation_year?: number
          id?: string
          interests?: string[]
          is_approved?: boolean
          is_public?: boolean
          onboarded?: boolean
          phone_e164?: string | null
          roll_number?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_signin_pivot_last_10_days: {
        Row: {
          branch: string | null
          day_0: number | null
          day_1: number | null
          day_2: number | null
          day_3: number | null
          day_4: number | null
          day_5: number | null
          day_6: number | null
          day_7: number | null
          day_8: number | null
          day_9: number | null
          full_name: string | null
          graduation_year: number | null
          total: number | null
          user_email: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      app_is_active_admin: { Args: { p_email: string }; Returns: boolean }
      get_active_privileges: {
        Args: { p_email: string }
        Returns: {
          edit: boolean
          execute: boolean
          membership_type: string
          privilege: string
          view: boolean
        }[]
      }
      get_user_privileges: {
        Args: { _email: string }
        Returns: {
          edit: boolean
          execute: boolean
          privilege: string
          view: boolean
        }[]
      }
      has_privilege: {
        Args: { caller_email: string; privilege_name: string }
        Returns: boolean
      }
      has_privilege_for_year: {
        Args: {
          caller_email: string
          privilege_name: string
          target_year: number
        }
        Returns: boolean
      }
      set_terms_if_null: { Args: { p_user_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
