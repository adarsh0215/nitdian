// lib/supabase/types.ts
export type Json =
  | string | number | boolean | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfilesRow = {
  id: string;
  email: string;
  full_name: string;
  phone_e164: string | null;
  city: string | null;
  country: string | null;
  graduation_year: number | null;
  degree: string | null;
  branch: string | null;
  roll_number: string | null;
  employment_type: string | null;
  company: string | null;
  designation: string | null;
  avatar_url: string | null;
  interests: string[];
  onboarded: boolean;
  is_public: boolean;
  is_approved: boolean;
  consent_terms_privacy: boolean;
  consent_directory_visible: boolean;
  consent_directory_show_contacts: boolean;
  accepted_terms_at: string | null;   // ISO
  created_at: string;
  updated_at: string;
};

export type AdminsRow = {
  id: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: Record<string, unknown>;
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, string>;
  };
};
