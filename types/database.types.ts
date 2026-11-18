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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_creations: {
        Row: {
          created_at: string
          generated_set_id: string | null
          id: string
          palette: Json | null
          prompt: string
          response_summary: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_set_id?: string | null
          id?: string
          palette?: Json | null
          prompt: string
          response_summary?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          generated_set_id?: string | null
          id?: string
          palette?: Json | null
          prompt?: string
          response_summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_creations_generated_set_id_fkey"
            columns: ["generated_set_id"]
            isOneToOne: false
            referencedRelation: "nail_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      nail_sets: {
        Row: {
          backdrop: string | null
          category: string
          chair_minutes: number
          created_at: string
          id: string
          is_curated: boolean
          is_public: boolean
          likes_count: number
          nails: Json
          passport_code: string
          photo_url: string
          skin_tone_id: string | null
          subtitle: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          backdrop?: string | null
          category?: string
          chair_minutes?: number
          created_at?: string
          id?: string
          is_curated?: boolean
          is_public?: boolean
          likes_count?: number
          nails: Json
          passport_code: string
          photo_url: string
          skin_tone_id?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          backdrop?: string | null
          category?: string
          chair_minutes?: number
          created_at?: string
          id?: string
          is_curated?: boolean
          is_public?: boolean
          likes_count?: number
          nails?: Json
          passport_code?: string
          photo_url?: string
          skin_tone_id?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          custom_hand_url: string | null
          display_name: string
          email: string | null
          hand_orientation: string
          id: string
          preferred_length: string
          preferred_shape: string
          skin_tone_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          custom_hand_url?: string | null
          display_name?: string
          email?: string | null
          hand_orientation?: string
          id: string
          preferred_length?: string
          preferred_shape?: string
          skin_tone_id?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          custom_hand_url?: string | null
          display_name?: string
          email?: string | null
          hand_orientation?: string
          id?: string
          preferred_length?: string
          preferred_shape?: string
          skin_tone_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      try_on_history: {
        Row: {
          created_at: string
          id: string
          image_url: string
          mode: string
          overlay_offset_y: number | null
          overlay_scale: number | null
          set_id: string | null
          skin_tone_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          mode: string
          overlay_offset_y?: number | null
          overlay_scale?: number | null
          set_id?: string | null
          skin_tone_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          mode?: string
          overlay_offset_y?: number | null
          overlay_scale?: number | null
          set_id?: string | null
          skin_tone_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "try_on_history_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "nail_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          set_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          set_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          set_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "nail_sets"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
