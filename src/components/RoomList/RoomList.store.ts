import { Room, UserOnRoom } from '@/types';
import { createLightweightPostHogMiddleware } from '@/utils/posthogMiddleware';
import { extractRoomListMetrics } from '@/utils/sanitizeState';
import type { PostHog } from 'posthog-js';
import { Reducer } from 'react';

export interface RecentlyVisitedRoom extends Room {
    last_visited_at: string | null;
}

export interface IState {
    rooms: Room[];
    usersOnRooms: UserOnRoom[];
    recentlyVisitedRooms: RecentlyVisitedRoom[];
}

export enum ActionTypes {
    ROOMS_FETCHED = 'ROOMS_FETCHED',
    ROOM_CREATED = 'ROOM_CREATED',
    ROOM_DELETED = 'ROOM_DELETED',
    ROOM_UPDATED = 'ROOM_UPDATED',
    USER_ON_ROOMS_FETCHED = 'USER_ON_ROOMS_FETCHED',
    USER_ON_ROOM_CREATED = 'USER_ON_ROOM_CREATED',
    USER_ON_ROOM_DELETED = 'USER_ON_ROOM_DELETED',
    USER_ON_ROOM_UPDATED = 'USER_ON_ROOM_UPDATED',
    RECENTLY_VISITED_ROOMS_FETCHED = 'RECENTLY_VISITED_ROOMS_FETCHED',
}

export type IAction = {
    type: ActionTypes.ROOMS_FETCHED;
    payload: Room[];
} | {
    type: ActionTypes.ROOM_CREATED;
    payload: Room;
} | {
    type: ActionTypes.ROOM_DELETED;
    payload: Room;
} | {
    type: ActionTypes.ROOM_UPDATED;
    payload: Room;
} | {
    type: ActionTypes.USER_ON_ROOMS_FETCHED;
    payload: UserOnRoom[];
} |{
    type: ActionTypes.USER_ON_ROOM_CREATED;
    payload: UserOnRoom;
} | {
    type: ActionTypes.USER_ON_ROOM_DELETED;
    payload: UserOnRoom;
} | {
    type: ActionTypes.USER_ON_ROOM_UPDATED;
    payload: UserOnRoom;
} | {
    type: ActionTypes.RECENTLY_VISITED_ROOMS_FETCHED;
    payload: RecentlyVisitedRoom[];
}

export type DispatchType = (args: IAction) => void;

export const reducer= (state: IState, action: IAction) => {
    switch (action.type) {
        case ActionTypes.ROOMS_FETCHED:
            return { ...state, rooms: action.payload };
        case ActionTypes.ROOM_CREATED:
            return { ...state, rooms: [...state.rooms, action.payload] };
        case ActionTypes.ROOM_DELETED: {
            const shallowCopy = [...state.rooms];
            const roomIdx = shallowCopy.findIndex(({ id }) => id === action.payload.id);
            if (roomIdx !== -1) {
                shallowCopy.splice(roomIdx, 1);
            }
            return { ...state, rooms: shallowCopy };
        }
        case ActionTypes.ROOM_UPDATED: {
            const shallowCopy = [...state.rooms];
            const roomIdx = shallowCopy.findIndex(({ id }) => id === action.payload.id);
            if (roomIdx !== -1) {
                shallowCopy.splice(roomIdx, 1, action.payload);
            }
            return { ...state, rooms: shallowCopy };
        }
        case ActionTypes.USER_ON_ROOMS_FETCHED:
            return { ...state, usersOnRooms: action.payload };
        case ActionTypes.USER_ON_ROOM_CREATED: {
            return { ...state, usersOnRooms: [...state.usersOnRooms, action.payload] };
        }
        case ActionTypes.USER_ON_ROOM_DELETED: {
            const shallowCopy = [...state.usersOnRooms];
            const userOnRoomIdx = shallowCopy.findIndex(({ public_user_id }) => public_user_id === action.payload.public_user_id);
            if (userOnRoomIdx !== -1) {
                shallowCopy.splice(userOnRoomIdx, 1);
            }
            return { ...state, usersOnRooms: shallowCopy };
        }
        case ActionTypes.USER_ON_ROOM_UPDATED: {
            const shallowCopy = [...state.usersOnRooms];
            const userOnRoomIdx = shallowCopy.findIndex(({ public_user_id }) => public_user_id === action.payload.public_user_id);
            if (userOnRoomIdx !== -1) {
                shallowCopy.splice(userOnRoomIdx, 1, action.payload);
            }
            return { ...state, usersOnRooms: shallowCopy };
        }
        case ActionTypes.RECENTLY_VISITED_ROOMS_FETCHED:
            return { ...state, recentlyVisitedRooms: action.payload };
        default:
            return state;
    }
}

export const createInitialState = (initData: IState): IState => {
    return {
        rooms: initData.rooms,
        usersOnRooms: initData.usersOnRooms,
        recentlyVisitedRooms: initData.recentlyVisitedRooms,
    }
}

export const getters = {
    isRoomsEmpty: (state: IState) => {
        return state.rooms.length === 0;
    },
    getUsersOnRoom: (state: IState, roomId: number) => {
        return state.usersOnRooms.filter(({ room_id }) => room_id === roomId);
    },
    isRecentlyVisitedRoomsEmpty: (state: IState) => {
        return state.recentlyVisitedRooms.length === 0;
    },
}

/**
 * Create enhanced reducer with PostHog logging
 * @param posthog - PostHog instance for logging
 * @returns Enhanced reducer
 */
export function createEnhancedReducer(
    posthog: PostHog | undefined
): Reducer<IState, IAction> {
    return createLightweightPostHogMiddleware(
        reducer,
        () => posthog,
        {
            eventPrefix: 'room_list',
            extractMetrics: (state: IState) => extractRoomListMetrics(state),
            // Skip high-frequency fetch actions to reduce noise
            skipActions: [],
        }
    );
}
