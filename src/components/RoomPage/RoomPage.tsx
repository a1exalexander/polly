'use client';

import { Button, Footer, Navbar, RoomPageSkeleton, Tag, TimeGrid } from '@/components';
import { MemberList } from '@/components/MemberList';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { MdOutlineRemoveRedEye, MdOutlineSchedule } from 'react-icons/md';
import { TbPlayerTrackNext } from 'react-icons/tb';

const Sound = dynamic(() => import('@/components/Sound').then(m => m.Sound), { ssr: false });
import { RoomPageService } from '@/components/RoomPage/RoomPage.service';
import { useFavicon } from '@/hooks/useFavicon';
import { VoteValues, VoteValuesType, VoteValuesTypes } from '@/constants/VoteValues';
import { storiesService } from '@/services';
import { User } from '@/types';
import { isNumber } from '@/utils/isNumber';
import { createClient } from '@/utils/supabase/client';
import { updateRoomVisit } from '@/utils/updateRoomVisit';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import styles from './RoomPage.module.css';
import { realtime } from './RoomPage.realtime';
import { ActionTypes, getters, reducer, StoryStatusTypes } from './RoomPage.store';
import { useBoolean } from 'usehooks-ts';

export interface RoomPageProps {
    roomId: number;
    serverUser: User;
}

export const RoomPage = ({
    roomId,
    serverUser,
}: RoomPageProps) => {
    const fetchState = useBoolean(false);
    const router = useRouter();
    const posthog = usePostHog();
    const joinState = useBoolean(false);
    const [roomPageService, setRoomPageService] = useState<RoomPageService | null>(null);
    const [
        state,
        dispatch,
    ] = useReducer(
        reducer,
        {
            users: [],
            story: null,
            usersOnStory: [],
            room: null,
            roomLoading: true,
            usersLoading: true,
            storyLoading: true,
            usersOnStoryLoading: false,
            storiesCount: 0,
        },
    );

    const activeUsers = useMemo(() => state.users.filter(({ active }) => active), [state.users]);
    const host = useMemo(() => getters.getHost(state), [state]);
    const usersWithVotes = useMemo(() => getters.getUsersWithVotes(state), [state]);
    const isHost = useMemo(() => host?.id === serverUser.id, [host, serverUser.id]);
    const storyId = useMemo(() => state.story?.id || null, [state]);
    const story = useMemo(() => state?.story, [state]);
    const currentUser = useMemo(() => state.users.find(({ id }) => id === serverUser.id), [state, serverUser.id]);
    const isCurrentUserAdmin = useMemo(() => !!currentUser?.isAdmin, [currentUser]);
    const canManageRoom = useMemo(() => isHost || isCurrentUserAdmin, [isHost, isCurrentUserAdmin]);
    const selectedTime = useMemo(() => {
        const userOnStory = state.usersOnStory.find(
            ({ public_user_id, story_id }) => {
                return public_user_id === serverUser.id && story?.id === story_id;
            },
        );
        return isNumber(userOnStory?.value) ? userOnStory?.value : null;
    }, [state.usersOnStory, serverUser.id, story]);
    const isVotingDisabled = useMemo(
        () => !story?.started_at || !currentUser?.active,
        [story, currentUser],
    );
    const isVotingInProgress = useMemo(() => !!story?.started_at && !story?.finished_at, [story]);
    const allUsersVoted = useMemo(() => {
        if (!story || story?.finished_at || activeUsers.length < 1 || state.usersOnStory.length < activeUsers.length) {
            return false;
        }
        return activeUsers.every(({ id }) => {
            return state.usersOnStory.some(({ public_user_id, value }) => public_user_id === id && isNumber(value));
        });
    }, [state.usersOnStory, activeUsers, story]);
    const average = useMemo(() => getters.averageStoryValue(state), [state]);
    const isStoryFinished = useMemo(() => getters.isStoryFinished(state), [state]);
    const roomType = (state.room?.type || VoteValuesTypes.days) as VoteValuesType;
    const timeValues = VoteValues[roomType];

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
            storyData,
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
        dispatch({ type: ActionTypes.STORY_FETCHED, payload: storyData || null });
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
        posthog?.capture?.('story_started', {
            userData: serverUser,
            state: state,
        });
        return roomPageService.startStory(state?.story?.id);
    }, [roomPageService, posthog, serverUser, state]);

    const nextStory = useCallback(async () => {
        if (!roomPageService || !story) {
            return;
        }
        posthog?.capture?.('story_next', {
            userData: serverUser,
            state: state,
        });
        await roomPageService.nextStory(story, state.storiesCount + 1);
        dispatch({ type: ActionTypes.STORIES_COUNT_UPDATED, payload: state.storiesCount + 1 });
    }, [roomPageService, story, posthog, serverUser, state]);

    const stopStory = useCallback(async () => {
        if (!roomPageService || !state?.story?.id || !state.story?.started_at) {
            return;
        }
        posthog?.capture?.('story_stopped', {
            userData: serverUser,
            state: state,
            activeUsers: activeUsers,
            allUsersVoted
        });
        
        return roomPageService.stopStory(state.story.id);
    }, [roomPageService, state, serverUser, posthog, activeUsers, allUsersVoted]);

    const selectTime = useCallback(async (value: number) => {
        if (!roomPageService || !story?.id) {
            return;
        }
        posthog?.capture?.('story_time_selected', {
            userData: serverUser,
            state: state,
        });
        await roomPageService.selectTime(story.id, serverUser.id, value);

        // Trigger auto-complete check via API
        posthog?.capture?.('story_auto_complete_check', {
            storyId: story.id,
            roomId,
            userData: serverUser,
        });

        const result = await storiesService.checkAutoComplete(story.id, roomId);

        if (result?.autoCompleted) {
            posthog?.capture?.('story_auto_completed', {
                storyId: story.id,
                roomId,
                userData: serverUser,
            });
        }
    }, [roomPageService, story, serverUser, roomId, posthog, state]);

    const exit = useCallback(() => {
        if (!roomPageService || !serverUser.id) {
            return;
        }
        // Navigate first so the user never sees the room re-rendered without them.
        router.push('/');

        posthog?.capture?.('room_exit', {
            userData: serverUser,
            state: state,
        });

        // Fire-and-forget DB delete + auto-complete check.
        roomPageService.removeUserFromRoom(serverUser.id).catch(() => {});

        if (story?.id && story?.started_at && !story?.finished_at) {
            storiesService.checkAutoComplete(story.id, roomId)
                .then((result) => {
                    if (result?.autoCompleted) {
                        posthog?.capture?.('story_auto_completed', {
                            storyId: story.id,
                            roomId,
                            userData: serverUser,
                            trigger: 'user_exit',
                        });
                    }
                })
                .catch(() => {});
        }
    }, [router, roomPageService, serverUser, story, roomId, posthog, state]);

    const removeUserFromRoom = useCallback(async (userId: number) => {
        if (!roomPageService) {
            return;
        }
        posthog?.capture?.('room_user_removed', {
            userData: serverUser,
            state: state,
        });
        await roomPageService.removeUserFromRoom(userId);

        // Check if story should auto-complete after removing a user
        if (story?.id && story?.started_at && !story?.finished_at) {
            const result = await storiesService.checkAutoComplete(story.id, roomId);
            if (result?.autoCompleted) {
                posthog?.capture?.('story_auto_completed', {
                    storyId: story.id,
                    roomId,
                    userData: serverUser,
                    trigger: 'user_removed',
                });
            }
        }
    }, [roomPageService, story, roomId, posthog, serverUser, state]);

    const toggleUserAdmin = useCallback(async (userId: number, nextIsAdmin: boolean) => {
        if (!roomPageService) {
            return;
        }
        posthog?.capture?.('room_user_admin_toggled', {
            userData: serverUser,
            targetUserId: userId,
            nextIsAdmin,
        });
        await roomPageService.setUserAdmin(userId, nextIsAdmin);
    }, [roomPageService, posthog, serverUser]);

    const changeUserActivity = useCallback(async (active: boolean) => {
        if (!roomPageService || !serverUser.id) {
            return;
        }
        posthog?.capture?.('room_user_activity_changed', {
            userData: serverUser,
            state: state,
            active,
        });
        await roomPageService.changeUserActivity(serverUser.id, active);

        // Check if story should auto-complete when user becomes inactive
        if (!active && story?.id && story?.started_at && !story?.finished_at) {
            const result = await storiesService.checkAutoComplete(story.id, roomId);
            if (result?.autoCompleted) {
                posthog?.capture?.('story_auto_completed', {
                    storyId: story.id,
                    roomId,
                    userData: serverUser,
                    trigger: 'user_became_inactive',
                });
            }
        }
    }, [roomPageService, serverUser, story, roomId, posthog, state]);

    const storyStatus = getters.storyStatus(state);

    useFavicon(storyStatus);

    // Reflect story state on <body> so the warm-tinted gradient
    // (idle → active → finished) covers the full viewport.
    useEffect(() => {
        document.body.dataset.storyState = storyStatus;
        return () => {
            delete document.body.dataset.storyState;
        };
    }, [storyStatus]);

    useEffect(() => {
        if (posthog && roomId && fetchState.value && state.room && !joinState.value) {
            posthog?.capture?.('room_joined', {
                serverUserData: serverUser,
                state: state,
            });
            joinState.setTrue();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, fetchState.value, state.room]);

    // Track room visit for recently visited rooms feature
    useEffect(() => {
        const trackVisit = async () => {            
            await updateRoomVisit(roomId, serverUser.id);
        };
        
        if (roomId && serverUser.id) trackVisit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId]);

    useEffect(() => {
        if (state.room && state.users.length && state.users.every(({ id }) => id !== serverUser.id)) {
            router.push('/');
        }
    }, [router, state.room, state.users, serverUser.id]);

    useEffect(() => {
        const service = new RoomPageService(roomId);
        setRoomPageService(service);
        
        return () => {
            setRoomPageService(null);
        };
    }, [roomId]);

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
        fetchState.setFalse();
        const fetchAllData = async () => {
            await fetchPageData();
            await fetchUsersOnStory();
            fetchState.setTrue();
        };
        fetchAllData();
        const onPageBack = async () => {
            if (document.visibilityState === 'visible') {
                await fetchAllData();
            }
        };
        document.addEventListener('visibilitychange', onPageBack);
        return () => {
            document.removeEventListener('visibilitychange', onPageBack);
            fetchState.setFalse();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchPageData, fetchUsersOnStory]); // fetchState intentionally excluded to prevent infinite loop

    const showRevealSummary = storyStatus === StoryStatusTypes.FINISHED && roomType !== VoteValuesTypes.boolean;
    const numericVotes = state.usersOnStory
        .filter(({ public_user_id, value }) => isNumber(value) && activeUsers.some(u => u.id === public_user_id))
        .map(u => u.value as number);
    const minVote = numericVotes.length ? Math.min(...numericVotes) : null;
    const maxVote = numericVotes.length ? Math.max(...numericVotes) : null;
    const modeVote = (() => {
        if (!numericVotes.length) return null;
        const tally = numericVotes.reduce<Record<string, number>>((acc, v) => {
            acc[v] = (acc[v] ?? 0) + 1;
            return acc;
        }, {});
        return Object.entries(tally).sort((a, b) => b[1] - a[1] || Number(b[0]) - Number(a[0]))[0]?.[0] ?? null;
    })();
    const consensusRate = (() => {
        if (!numericVotes.length || average == null) return null;
        const tolerance = roomType === VoteValuesTypes.weeks ? 0.5 : 0.25;
        const inside = numericVotes.filter(v => Math.abs(v - Number(average)) <= tolerance).length;
        return Math.round((inside / numericVotes.length) * 100);
    })();
    const unit = roomType === VoteValuesTypes.weeks ? 'w' : 'd';

    if (!state.room) {
        return (
            <div className={styles.shell}>
                <RoomPageSkeleton />
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.shell}>
            <Navbar
                startTime={story?.started_at}
                title={state?.room?.title}
                story={story?.title}
                storyType={state.room?.type ?? null}
                finishTime={story?.finished_at}
                onStart={startStory}
                onNext={nextStory}
                onStop={stopStory}
                onExit={exit}
                average={average}
                isHost={canManageRoom}
                onChangeActivity={changeUserActivity}
                isUserActive={currentUser?.active}
                roomLinkPath={`/room/${roomId}`}
            />
            <div
                className={clsx(styles.body, {
                    [styles.isColumn]: roomType === VoteValuesTypes.boolean,
                })}
            >
                <main className={styles.voteArea}>
                    <div className={styles.voteAreaInner}>
                        <AnimatePresence>
                            {storyStatus === StoryStatusTypes.IDLE && !canManageRoom && (
                                <motion.div
                                    key="banner-idle"
                                    className={styles.banner}
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.22, ease: 'easeOut' }}
                                >
                                    <Tag type="info"><MdOutlineSchedule className={styles.bannerTagIcon} aria-label="Idle" /></Tag>
                                    <div>
                                        <div className={styles.bannerTitle}>Waiting for the host to start</div>
                                        <div className={styles.bannerCopy}>Once they hit start, your cards will light up.</div>
                                    </div>
                                </motion.div>
                            )}
                            {!!state.room && currentUser && !currentUser.active && storyStatus !== StoryStatusTypes.IDLE && (
                                <motion.div
                                    key="banner-observer"
                                    className={clsx(styles.banner, styles.warm)}
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.22, ease: 'easeOut' }}
                                >
                                    <Tag type="warning"><MdOutlineRemoveRedEye className={styles.bannerTagIcon} aria-label="Observer" /></Tag>
                                    <div>
                                        <div className={styles.bannerTitle}>You&apos;re watching this round</div>
                                        <div className={styles.bannerCopy}>Switch to participate to cast a vote.</div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {!!state.room && (
                            <TimeGrid
                                className={styles.timeGrid}
                                isDisabled={isVotingDisabled}
                                type={roomType}
                                storyStatus={storyStatus}
                                selectedTime={selectedTime}
                                onSelect={selectTime}
                                onStartAction={startStory}
                                values={timeValues}
                                isHost={canManageRoom}
                                isUserActive={currentUser?.active}
                                onParticipateAction={() => changeUserActivity(true)}
                            />
                        )}
                        <AnimatePresence>
                        {showRevealSummary && (
                            <motion.div
                                key="reveal"
                                className={styles.revealCard}
                                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
                            >
                                <div className={styles.revealRow}>
                                    <div className={styles.revealStat}>
                                        <div className={styles.revealLabel}>Average</div>
                                        <div className={styles.revealBig}>
                                            {average ?? '—'}
                                            {average != null && <span className={styles.revealUnit}>{unit}</span>}
                                        </div>
                                    </div>
                                    <div className={styles.revealDivider} />
                                    <div className={styles.revealStat}>
                                        <div className={styles.revealLabel}>Spread</div>
                                        <div className={clsx(styles.revealBig, styles.revealBigSpread)}>
                                            {minVote != null && maxVote != null ? `${minVote} → ${maxVote}` : '—'}
                                        </div>
                                    </div>
                                    <div className={styles.revealDivider} />
                                    <div className={styles.revealStat}>
                                        <div className={styles.revealLabel}>Most common</div>
                                        <div className={styles.revealBig}>
                                            {modeVote ?? '—'}
                                            {modeVote != null && <span className={styles.revealUnit}>{unit}</span>}
                                        </div>
                                    </div>
                                    <div className={styles.revealDivider} />
                                    <div className={styles.revealStat}>
                                        <div className={styles.revealLabel}>Consensus</div>
                                        <div className={styles.revealBig}>
                                            {consensusRate != null ? `${consensusRate}%` : '—'}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.revealFoot}>
                                    <span className={styles.revealHint}>
                                        Discuss the outliers, then move on to the next story.
                                    </span>
                                    {canManageRoom && (
                                        <Button
                                            size="s"
                                            icon={<TbPlayerTrackNext />}
                                            variant="warning"
                                            onClick={nextStory}
                                        >
                                            Next story
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                </main>
                {!!state.room && (
                    <aside className={styles.members}>
                        <MemberList
                            isHost={isHost}
                            currentUserId={serverUser.id}
                            isCurrentUserAdmin={isCurrentUserAdmin}
                            roomType={roomType}
                            inProgress={isVotingInProgress}
                            storyId={state?.story?.id}
                            roomId={roomId}
                            members={usersWithVotes}
                            hostId={host?.id}
                            average={average}
                            isFinished={isStoryFinished}
                            onRemoveUser={removeUserFromRoom}
                            onSelfLeave={exit}
                            onToggleAdmin={isHost ? toggleUserAdmin : undefined}
                        />
                    </aside>
                )}
            </div>
            <Footer />
            <Sound storyStatus={storyStatus} />
        </div>
    );
};

