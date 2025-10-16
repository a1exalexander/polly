import { Room, Story, UserOnStory, UserWithActivity, UserWithVote } from '@/types';
import { isNumber } from '@/utils/isNumber';
import { round } from '@/utils/round';
import { Reducer } from 'react';
import { createLightweightPostHogMiddleware } from '@/utils/posthogMiddleware';
import { extractRoomPageMetrics } from '@/utils/sanitizeState';
import type { PostHog } from 'posthog-js';

export enum StoryStatusTypes {
    IDLE = 'idle',
    ACTIVE = 'active',
    FINISHED = 'finished',
}

export interface IState {
    users: UserWithActivity[];
    story: Story | null;
    usersOnStory: UserOnStory[];
    room: Room | null;
    usersLoading: boolean;
    storyLoading: boolean;
    usersOnStoryLoading: boolean;
    roomLoading: boolean;
    storiesCount: number;
}

export enum ActionTypes {
    USERS_FETCH = 'USERS_FETCH',
    USERS_FETCHED = 'USERS_FETCHED',
    USER_CREATED = 'USER_CREATED',
    USER_DELETED = 'USER_DELETED',
    USER_UPDATED = 'USER_UPDATED',
    STORY_FETCH = 'STORY_FETCH',
    STORY_FETCHED = 'STORY_FETCHED',
    STORY_CREATED = 'STORY_CREATED',
    STORY_UPDATED = 'STORY_UPDATED',
    ROOM_FETCH = 'ROOM_FETCH',
    ROOM_FETCHED = 'ROOM_FETCHED',
    ROOM_UPDATED = 'ROOM_UPDATED',
    USERS_ON_STORY_FETCH = 'USERS_ON_STORY_FETCH',
    USERS_ON_STORY_FETCHED = 'USERS_ON_STORY_FETCHED',
    USER_ON_STORY_CREATED = 'USER_ON_STORY_CREATED',
    USER_ON_STORY_UPDATED = 'USER_ON_STORY_UPDATED',
    STORIES_COUNT_FETCH = 'STORIES_COUNT_FETCH',
    STORIES_COUNT_FETCHED = 'STORIES_COUNT_FETCHED',
    STORIES_COUNT_UPDATED = 'STORIES_COUNT_UPDATED',
}

export type IAction = {
    type: ActionTypes.USERS_FETCHED;
    payload: UserWithActivity[];
} | {
    type: ActionTypes.USER_CREATED;
    payload: UserWithActivity;
} | {
    type: ActionTypes.USER_DELETED;
    payload: { id: number }
} | {
    type: ActionTypes.USER_UPDATED;
    payload: Partial<UserWithActivity>;
} | {
    type: ActionTypes.STORY_FETCHED;
    payload: Story | null;
} | {
    type: ActionTypes.STORY_CREATED;
    payload: Story;
} | {
    type: ActionTypes.STORY_UPDATED;
    payload: Story;
} | {
    type: ActionTypes.ROOM_FETCHED;
    payload: Room;
} | {
    type: ActionTypes.ROOM_UPDATED;
    payload: Room;
} | {
    type: ActionTypes.USERS_ON_STORY_FETCHED;
    payload: UserOnStory[];
} | {
    type: ActionTypes.USER_ON_STORY_CREATED;
    payload: UserOnStory;
} | {
    type: ActionTypes.USER_ON_STORY_UPDATED;
    payload: UserOnStory;
} | {
    type: ActionTypes.USERS_FETCH;
} | {
    type: ActionTypes.STORY_FETCH;
} | {
    type: ActionTypes.ROOM_FETCH;
} | {
    type: ActionTypes.USERS_ON_STORY_FETCH;
} | {
    type: ActionTypes.STORIES_COUNT_FETCHED;
    payload: number;
} | {
    type: ActionTypes.STORIES_COUNT_UPDATED;
    payload: number;
} | {
    type: ActionTypes.STORIES_COUNT_FETCH;
}

export type DispatchType = (args: IAction) => void;

export const reducer: Reducer<IState, IAction> = (state, action) => {
    switch (action.type) {
        case ActionTypes.USERS_FETCHED:
            return { ...state, users: action.payload, usersLoading: false };
        case ActionTypes.USER_CREATED:
            return { ...state, users: [...state.users, action.payload] };
        case ActionTypes.USER_DELETED: {
            const shallowCopy = [...state.users];
            const userIdx = shallowCopy.findIndex(({ id }) => id === action.payload.id);
            if (userIdx !== -1) {
                shallowCopy.splice(userIdx, 1);
            }
            return { ...state, users: shallowCopy };
        }
        case ActionTypes.USER_UPDATED: {
            const shallowCopy = [...state.users];
            const userIdx = shallowCopy.findIndex(({ id }) => id === action.payload.id);
            if (userIdx !== -1) {
                shallowCopy.splice(userIdx, 1, { ...shallowCopy[userIdx], ...action.payload });
            }
            return { ...state, users: shallowCopy };
        }
        case ActionTypes.STORY_FETCHED: {
            return { ...state, story: action.payload, usersOnStory: action.payload?.users || [], storyLoading: false };
        }
        case ActionTypes.STORY_CREATED:
            return { ...state, story: action.payload, usersOnStory: [] };
        case ActionTypes.STORY_UPDATED: {
            return { ...state, story: action.payload };
        }
        case ActionTypes.ROOM_FETCHED:
            return { ...state, room: action.payload, roomLoading: false };
        case ActionTypes.ROOM_UPDATED:
            return { ...state, room: action.payload };
        case ActionTypes.USERS_ON_STORY_FETCHED:
            return { ...state, usersOnStory: action.payload, usersOnStoryLoading: false };
        case ActionTypes.USER_ON_STORY_CREATED:
            return { ...state, usersOnStory: [...state.usersOnStory, action.payload] };
        case ActionTypes.USER_ON_STORY_UPDATED: {
            const shallowCopy = [...state.usersOnStory];
            const userOnStoryIdx = shallowCopy.findIndex(({ id }) => id === action.payload.id);
            if (userOnStoryIdx !== -1) {
                shallowCopy.splice(userOnStoryIdx, 1, action.payload);
            }
            return { ...state, usersOnStory: shallowCopy };
        }
        case ActionTypes.USERS_FETCH:
            return { ...state, usersLoading: true };
        case ActionTypes.STORY_FETCH:
            return { ...state, storyLoading: true };
        case ActionTypes.ROOM_FETCH:
            return { ...state, roomLoading: true };
        case ActionTypes.USERS_ON_STORY_FETCH:
            return { ...state, usersOnStoryLoading: true };
        case ActionTypes.STORIES_COUNT_FETCHED:
            return { ...state, storiesCount: action.payload };
        case ActionTypes.STORIES_COUNT_UPDATED:
            return { ...state, storiesCount: action.payload };
        default:
            return state;
    }
};

export const createInitialState = (initData: IState): IState => {
    return {
        ...initData,
    };
};

export const getters = {
    getHost: (state: IState): UserWithActivity | null => {
        return state.users.find(({ id }) => id === state?.room?.public_user_id) || null;
    },
    getUsersWithVotes: (state: IState): (UserWithVote & UserWithActivity)[] => {
        return state.users.map((user) => {
            const userOnStory = state.usersOnStory.find(({ public_user_id, story_id }) => {
                return public_user_id === user.id && story_id === state.story?.id;
            });
            return {
                ...user,
                value: isNumber(userOnStory?.value) ? userOnStory.value : null,
            };
        });
    },
    averageStoryValue: (state: IState): number | null => {
        if (!state.story?.finished_at) {
            return null;
        }
        const average = state.usersOnStory.reduce((acc, { value, public_user_id }) => {
            const user = state.users.find(({ id }) => id === public_user_id);
            if (value === null || !user?.active) {
                return acc;
            }
            return acc + value;
        }, 0) / (state.usersOnStory.length || 1);

        return round(average, 2);
    },
    isStoryFinished: (state: IState): boolean => {
        return !!state.story?.finished_at;
    },
    storyStatus: (state: IState): StoryStatusTypes => {
        if (!state.story?.finished_at && !state.story?.started_at) {
            return StoryStatusTypes.IDLE;
        }
        if (state.story?.started_at && !state.story?.finished_at) {
            return StoryStatusTypes.ACTIVE;
        }
        return StoryStatusTypes.FINISHED;
    }
};

/**
 * Create enhanced reducer with PostHog logging
 * @param posthog - PostHog instance for logging
 * @param userId - Current user ID for context
 * @returns Enhanced reducer
 */
export function createEnhancedReducer(
    posthog: PostHog | undefined,
    userId?: number
): Reducer<IState, IAction> {
    return createLightweightPostHogMiddleware(
        reducer,
        () => posthog,
        {
            eventPrefix: 'room_page',
            extractMetrics: (state: IState) => {
                const metrics = extractRoomPageMetrics(state);
                // Add is_host information if userId is provided
                if (userId) {
                    metrics.is_host = state.room?.public_user_id === userId;
                }
                return metrics;
            },
            // Skip high-frequency fetch actions to reduce noise
            skipActions: [],
        }
    );
}
