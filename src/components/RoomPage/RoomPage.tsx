'use client';

import { Footer, Navbar, TimeGrid } from '@/components';
import { MemberList } from '@/components/MemberList';
import { RoomPageService } from '@/components/RoomPage/RoomPage.service';
import { User } from '@/types';
import { createClient } from '@/utils/supabase/client';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import styles from './RoomPage.module.css';
import { realtime } from './RoomPage.realtime';
import { ActionTypes, createInitialState, getters, reducer } from './RoomPage.store';

export interface RoomPageProps {
    roomId: number;
    serverUser: User;
    timeValues: number[];
}

export const RoomPage = ({
    roomId,
    serverUser,
    timeValues,
}: RoomPageProps) => {
    const router = useRouter();
    const posthog = usePostHog();
    const [roomPageService, setRoomPageService] = useState<RoomPageService | null>(null);
    const [
        state,
        dispatch,
    ] = useReducer(reducer, {
        room: null,
        users: [],
        story: null,
        usersOnStory: [],
        roomLoading: true,
        usersLoading: true,
        storyLoading: true,
        usersOnStoryLoading: false,
        storiesCount: 0,
    }, createInitialState);

    const activeUsers = useMemo(() => state.users.filter(({ active }) => active), [state.users]);
    const host = useMemo(() => getters.getHost(state), [state]);
    const usersWithVotes = useMemo(() => getters.getUsersWithVotes(state), [state]);
    const isHost = useMemo(() => host?.id === serverUser.id, [host, serverUser.id]);
    const storyId = useMemo(() => state.story?.id || null, [state]);
    const story = useMemo(() => state?.story, [state]);
    const currentUser = useMemo(() => state.users.find(({ id }) => id === serverUser.id), [state, serverUser.id]);
    const selectedTime = useMemo(() => {
        const userOnStory = state.usersOnStory.find(
            ({ public_user_id, story_id }) => {
                return public_user_id === serverUser.id && story?.id === story_id;
            },
        );
        return userOnStory?.value || null;
    }, [state.usersOnStory, serverUser.id, story]);
    const isVotingDisabled = useMemo(
        () => !story?.started_at || !currentUser?.active,
        [story, currentUser],
    );
    const isVotingInProgress = useMemo(() => !!story?.started_at && !story?.finished_at, [story]);
    const allUsersVoted = useMemo(() => {
        if (!story || story?.finished_at || !activeUsers.length) {
            return false;
        }
        return activeUsers.every(({ id }) => {
            return state.usersOnStory.some(({ public_user_id, value }) => public_user_id === id && value !== null);
        });
    }, [state.usersOnStory, activeUsers, story]);
    const average = useMemo(() => getters.averageStoryValue(state), [state]);
    const isStoryFinished = useMemo(() => getters.isStoryFinished(state), [state]);

    const fetchPageData = useCallback(async () => {
        if (!roomPageService) {
            return;
        }
        dispatch({ type: ActionTypes.ROOM_FETCH });
        dispatch({ type: ActionTypes.USERS_FETCH });
        dispatch({ type: ActionTypes.STORY_FETCH });
        const [
            room,
            users,
            story,
            storiesCount,
        ] = await Promise.all([
            roomPageService.getRoom(),
            roomPageService.getUsers(),
            roomPageService.getStory(),
            roomPageService.getStoriesCount(),
        ]);
        if (room) {
            dispatch({ type: ActionTypes.ROOM_FETCHED, payload: room });
        }
        if (users) {
            dispatch({ type: ActionTypes.USERS_FETCHED, payload: users });
        }
        dispatch({ type: ActionTypes.STORY_FETCHED, payload: story || null });
        dispatch({ type: ActionTypes.STORIES_COUNT_FETCHED, payload: storiesCount });
    }, [roomPageService]);

    const fetchUsersOnStory = useCallback(async () => {
        if (!roomPageService || !state?.story?.id) {
            return;
        }
        dispatch({ type: ActionTypes.USERS_ON_STORY_FETCH });
        const usersOnStory = await roomPageService.getUsersOnStory(state.story.id);
        dispatch({ type: ActionTypes.USERS_ON_STORY_FETCHED, payload: usersOnStory });
    }, [roomPageService, state?.story?.id]);

    const startStory = useCallback(async () => {
        if (!roomPageService || !state?.story?.id) {
            return;
        }
        return roomPageService.startStory(state?.story?.id);
    }, [roomPageService, state?.story?.id]);

    const nextStory = useCallback(async () => {
        if (!roomPageService || !story) {
            return;
        }
        await roomPageService.nextStory(story, state.storiesCount + 1);
        dispatch({ type: ActionTypes.STORIES_COUNT_UPDATED, payload: state.storiesCount + 1 });
    }, [roomPageService, story, state.storiesCount]);

    const stopStory = useCallback(async () => {
        if (!roomPageService || !state?.story?.id) {
            return;
        }
        return roomPageService.stopStory(state.story.id);
    }, [roomPageService, state?.story?.id]);

    const selectTime = useCallback(async (value: number) => {
        if (!roomPageService || !story?.id) {
            return;
        }
        return roomPageService.selectTime(story?.id, serverUser.id, value);
    }, [roomPageService, story, serverUser.id]);

    const exit = useCallback(async () => {
        if (!roomPageService || !serverUser.id) {
            return;
        }
        await roomPageService.removeUserFromRoom(serverUser.id);
        router.push('/');
    }, [router, roomPageService, serverUser.id]);

    const removeUserFromRoom = useCallback(async (userId: number) => {
        if (!roomPageService) {
            return;
        }
        return roomPageService.removeUserFromRoom(userId);
    }, [roomPageService]);

    const changeUserActivity = useCallback(async (active: boolean) => {
        if (!roomPageService || !serverUser.id) {
            return;
        }
        return roomPageService.changeUserActivity(serverUser.id, active);
    }, [roomPageService, serverUser.id]);

    useEffect(() => {
        posthog.capture('room_joined', {
            roomId,
            roomTitle: state.room?.title,
            userName: serverUser.name,
            userId: serverUser.user_id,
        })
    }, [posthog, roomId, state.room?.title, serverUser]);

    useEffect(() => {
        const roomPageService = new RoomPageService(roomId);
        setRoomPageService(roomPageService);
    }, [roomId]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    useEffect(() => {
        fetchUsersOnStory();
    }, [fetchUsersOnStory]);

    useEffect(() => {
        if (!roomPageService || !roomId) {
            return;
        }
        const supabase = createClient();
        const channel = realtime({
            roomPageService,
            roomId,
            dispatch,
            channel: supabase.channel(`realtime ${roomId}}`),
            storyId,
        });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, dispatch, storyId, roomPageService]);

    useEffect(() => {
        if (allUsersVoted) {
            stopStory();
        }
    }, [allUsersVoted, stopStory]);

    useEffect(() => {
        const onPageBack = () => {
            if (document.visibilityState === 'visible') {
                console.log('Page is back');
                fetchPageData();
            }
        }
        document.addEventListener('visibilitychange', onPageBack);
        return () => {
            document.removeEventListener('visibilitychange', onPageBack);
        }
    }, [fetchPageData]);

    return (
        <>
            <div className={clsx(styles.page, { [styles.isHost]: isHost })}>
                <Navbar
                    startTime={story?.started_at}
                    title={state?.room?.title}
                    finishTime={story?.finished_at}
                    onStart={startStory}
                    onNext={nextStory}
                    onStop={stopStory}
                    onExit={exit}
                    isHost={isHost}
                    onChangeActivity={changeUserActivity}
                    isUserActive={currentUser?.active}
                    story={story?.title}
                />
                <TimeGrid
                    className={styles.timeGrid}
                    isDisabled={isVotingDisabled}
                    selectedTime={selectedTime}
                    onSelect={selectTime}
                    values={timeValues}
                />
                <MemberList
                    className={styles.memberList}
                    isHost={isHost}
                    inProgress={isVotingInProgress}
                    storyId={state?.story?.id}
                    roomId={roomId}
                    members={usersWithVotes}
                    hostId={host?.id}
                    average={average}
                    isFinished={isStoryFinished}
                    onRemoveUser={removeUserFromRoom}
                />
            </div>
            <Footer />
        </>
    );
};

