# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production 
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run types` - Generate Supabase TypeScript types from database schema

## Architecture Overview

This is a real-time planning poker application built with Next.js 15, Supabase, and TypeScript.

### Core Technologies
- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Styling**: CSS Modules
- **State Management**: useReducer with custom store patterns
- **Real-time**: Supabase Realtime channels
- **Analytics**: PostHog, Sentry for error tracking
- **Fonts**: Montserrat variable font

### Project Structure
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable React components (each with own CSS module)
- `src/utils/supabase/` - Supabase client configuration and utilities
- `src/constants/VoteValues.ts` - Voting system configuration (days/weeks/boolean)
- `src/types.ts` - TypeScript type definitions derived from database schema
- `database.types.ts` - Auto-generated Supabase types

### Key Components
- **RoomPage**: Main planning poker room with real-time voting
- **RoomList**: List of available rooms with real-time updates
- **TimeGrid**: Voting interface with different estimation scales
- **MemberList**: Shows participants and their voting status

### Database Schema
Primary tables: Rooms, Users, Stories, UsersOnRooms, UsersOnStories, StoriesOnRooms

### State Management Patterns
- Uses useReducer with action-based updates
- Real-time updates via Supabase channels
- Service classes handle data operations (e.g., RoomPageService)
- Store files contain reducers, actions, and getters

### Voting System
Supports three estimation types:
- Days: 0-10 with quarter increments
- Weeks: 1-12 with half increments  
- Boolean: 0 or 1

### Real-time Features
- Live voting updates
- User presence tracking
- Story status changes
- Automatic story completion when all vote