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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      RecentlyVisitedRooms: {
        Row: {
          id: number
          last_visited_at: string
          public_user_id: number
          room_id: number
        }
        Insert: {
          id?: number
          last_visited_at?: string
          public_user_id: number
          room_id: number
        }
        Update: {
          id?: number
          last_visited_at?: string
          public_user_id?: number
          room_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "RecentlyVisitedRooms_public_user_id_fkey"
            columns: ["public_user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "RecentlyVisitedRooms_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "Rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      Rooms: {
        Row: {
          created_at: string
          id: number
          public_user_id: number | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          public_user_id?: number | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          public_user_id?: number | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Rooms_public_user_id_fkey"
            columns: ["public_user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Stories: {
        Row: {
          created_at: string
          finished_at: string | null
          id: number
          public_user_Id: number | null
          started_at: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          finished_at?: string | null
          id?: number
          public_user_Id?: number | null
          started_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          finished_at?: string | null
          id?: number
          public_user_Id?: number | null
          started_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Stories_public_user_Id_fkey"
            columns: ["public_user_Id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      StoriesOnRooms: {
        Row: {
          created_at: string
          room_id: number
          story_id: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          room_id: number
          story_id: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          room_id?: number
          story_id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "StoryOnRoom_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "Rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StoryOnRoom_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "Stories"
            referencedColumns: ["id"]
          },
        ]
      }
      Users: {
        Row: {
          created_at: string
          email: string | null
          id: number
          name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      UsersOnRooms: {
        Row: {
          active: boolean | null
          created_at: string
          last_visited_at: string | null
          public_user_id: number
          room_id: number
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          last_visited_at?: string | null
          public_user_id: number
          room_id: number
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          last_visited_at?: string | null
          public_user_id?: number
          room_id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "UserOnRoom_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "Rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "UsersOnRooms_public_user_id_fkey"
            columns: ["public_user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      UsersOnStories: {
        Row: {
          created_at: string
          id: number
          public_user_id: number
          story_id: number
          value: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          public_user_id: number
          story_id: number
          value?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          public_user_id?: number
          story_id?: number
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "UserOnStory_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "Stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "UsersOnStories_public_user_id_fkey"
            columns: ["public_user_id"]
            isOneToOne: false
            referencedRelation: "Users"
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
