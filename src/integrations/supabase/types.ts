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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activation_codes: {
        Row: {
          code: string
          code_type: Database["public"]["Enums"]["code_type"]
          created_at: string
          created_by: string | null
          id: string
          linked_email: string | null
          room_id: string | null
          uses_remaining: number
        }
        Insert: {
          code: string
          code_type?: Database["public"]["Enums"]["code_type"]
          created_at?: string
          created_by?: string | null
          id?: string
          linked_email?: string | null
          room_id?: string | null
          uses_remaining?: number
        }
        Update: {
          code?: string
          code_type?: Database["public"]["Enums"]["code_type"]
          created_at?: string
          created_by?: string | null
          id?: string
          linked_email?: string | null
          room_id?: string | null
          uses_remaining?: number
        }
        Relationships: [
          {
            foreignKeyName: "activation_codes_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_captain: boolean
          name: string
          room_id: string
          team: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_captain?: boolean
          name: string
          room_id: string
          team: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_captain?: boolean
          name?: string
          room_id?: string
          team?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          is_developer: boolean | null
          purchase_code: string | null
          purchase_verified: boolean | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_developer?: boolean | null
          purchase_code?: string | null
          purchase_verified?: boolean | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_developer?: boolean | null
          purchase_code?: string | null
          purchase_verified?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          board: Json | null
          buzzer_state: string
          buzzer_team: string | null
          cooldown_expires_at: string | null
          created_at: string
          current_hex_index: number | null
          current_turn: string
          host_id: string | null
          host_name: string
          id: string
          pin: string
          rebound_expires_at: string | null
          room_code: string | null
          status: string
          team1_color: string
          team1_name: string
          team1_score: number
          team2_color: string
          team2_name: string
          team2_score: number
        }
        Insert: {
          board?: Json | null
          buzzer_state?: string
          buzzer_team?: string | null
          cooldown_expires_at?: string | null
          created_at?: string
          current_hex_index?: number | null
          current_turn?: string
          host_id?: string | null
          host_name?: string
          id?: string
          pin: string
          rebound_expires_at?: string | null
          room_code?: string | null
          status?: string
          team1_color?: string
          team1_name?: string
          team1_score?: number
          team2_color?: string
          team2_name?: string
          team2_score?: number
        }
        Update: {
          board?: Json | null
          buzzer_state?: string
          buzzer_team?: string | null
          cooldown_expires_at?: string | null
          created_at?: string
          current_hex_index?: number | null
          current_turn?: string
          host_id?: string | null
          host_name?: string
          id?: string
          pin?: string
          rebound_expires_at?: string | null
          room_code?: string | null
          status?: string
          team1_color?: string
          team1_name?: string
          team1_score?: number
          team2_color?: string
          team2_name?: string
          team2_score?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_activation_code: { Args: { p_code: string }; Returns: Json }
      generate_room_code: { Args: never; Returns: string }
    }
    Enums: {
      code_type: "HOST" | "PLAYER" | "DEBUG"
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
    Enums: {
      code_type: ["HOST", "PLAYER", "DEBUG"],
    },
  },
} as const
