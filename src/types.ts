import { Database } from '../database.types';

export type Room = Database['public']['Tables']['Rooms']['Row'];
export type RoomInsert = Database['public']['Tables']['Rooms']['Insert'];
export type RoomUpdate = Database['public']['Tables']['Rooms']['Update'];
export type User = Database['public']['Tables']['Users']['Row'];
export type UserInsert = Database['public']['Tables']['Users']['Insert'];
export type UserUpdate = Database['public']['Tables']['Users']['Update'];
export type UserOnRoom = Database['public']['Tables']['UsersOnRooms']['Row'];
export type UserOnRoomInsert = Database['public']['Tables']['UsersOnRooms']['Insert'];
export type UserOnRoomUpdate = Database['public']['Tables']['UsersOnRooms']['Update'];
export type Story = Database['public']['Tables']['Stories']['Row'];
export type StoryInsert = Database['public']['Tables']['Stories']['Insert'];
export type StoryUpdate = Database['public']['Tables']['Stories']['Update'];
export type StoryOnRoom = Database['public']['Tables']['StoriesOnRooms']['Row'];
export type StoryOnRoomInsert = Database['public']['Tables']['StoriesOnRooms']['Insert'];
export type StoryOnRoomUpdate = Database['public']['Tables']['StoriesOnRooms']['Update'];
export type UserOnStory = Database['public']['Tables']['UsersOnStories']['Row'];
export type UserOnStoryInsert = Database['public']['Tables']['UsersOnStories']['Insert'];
export type UserOnStoryUpdate = Database['public']['Tables']['UsersOnStories']['Update'];

export type UserWithVote = User & { value: number | null };
export type UserWithActivity = User & { active: boolean };
