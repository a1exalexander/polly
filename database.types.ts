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
          public_user_id: number
          room_id: number
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          public_user_id: number
          room_id: number
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
