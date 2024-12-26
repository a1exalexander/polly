'use client';

import { Button, Loader } from '@/components';
import clsx from 'clsx';
import { differenceInMilliseconds, format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { IoExit } from 'react-icons/io5';
import { LuCoffee } from 'react-icons/lu';
import { MdOutlineHowToVote } from 'react-icons/md';
import { TbPlayerPlay, TbPlayerStop, TbPlayerTrackNext } from 'react-icons/tb';
import { useBoolean, useInterval } from 'usehooks-ts';
import styles from './Navbar.module.css';

export interface NavbarProps {
    title?: string | null;
    isHost?: boolean;
    isUserActive?: boolean;
    story?: string | null;
    startTime?: null | Date | string;
    finishTime?: null | Date | string;
    onStart?: () => void | Promise<unknown>;
    onNext?: () => void | Promise<unknown>;
    onStop?: () => void | Promise<unknown>;
    onExit?: () => void | Promise<unknown>;
    onChangeActivity?: (active: boolean) => void | Promise<unknown>;
}

export const Navbar = ({
    startTime,
    finishTime,
    title,
    story,
    onStart,
    onNext,
    onStop,
    isHost,
    isUserActive,
    onExit,
    onChangeActivity,
}: NavbarProps) => {
    const [time, setTime] = useState<Date | null>(null);
    const activityState = useBoolean(false);

    const startLoading = useBoolean(false);
    const nextLoading = useBoolean(false);
    const stopLoading = useBoolean(false);
    const exitLoading = useBoolean(false);
    const activityLoading = useBoolean(false);

    const handleStart = useCallback(async () => {
        startLoading.setTrue();
        await onStart?.();
        startLoading.setFalse();
    }, [onStart, startLoading]);

    const handleNext = useCallback(async () => {
        nextLoading.setTrue();
        await onNext?.();
        nextLoading.setFalse();
    }, [onNext, nextLoading]);

    const handleStop = useCallback(async () => {
        stopLoading.setTrue();
        await onStop?.();
        stopLoading.setFalse();
    }, [onStop, stopLoading]);

    const handleExit = useCallback(async () => {
        exitLoading.setTrue();
        await onStop?.();
        await onExit?.();
        exitLoading.setFalse();
    }, [onExit, onStop, exitLoading]);

    const handleChangeActivity = useCallback(async () => {
        activityLoading.setTrue();
        activityState.toggle();
        await onChangeActivity?.(!isUserActive);
        activityLoading.setFalse();
    }, [onChangeActivity, isUserActive, activityState, activityLoading]);

    useEffect(() => {
        activityState.setValue(!!isUserActive);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isUserActive]);

    useEffect(() => {
        if (!startTime) {
            setTime(null);
            return;
        }
        setTime(new Date(differenceInMilliseconds(finishTime || new Date(), startTime)));
    }, [startTime, finishTime]);

    useInterval(
        () => {
            if (!startTime) {
                setTime(null);
                return;
            }
            setTime(new Date(differenceInMilliseconds(new Date(), startTime)));
        },
        startTime && !finishTime ? 1000 : null,
    );

    const isHeaderReady = !!title;
    const isTimeVisible = !!time;
    const isInProgress = !!startTime && !finishTime;
    const isFinished = !!finishTime;
    const isDisabled = startLoading.value || nextLoading.value || stopLoading.value || exitLoading.value;
    const isIdle = !isInProgress && !isFinished;

    return (
        <div className={clsx(styles.wrapper, { [styles.expanded]: isHeaderReady, [styles.isHost]: isHost })}>
            <header
                className={clsx(styles.container, {
                    [styles.isFinished]: isFinished,
                    [styles.isInProgress]: isInProgress,
                })}
            >
                {!isHeaderReady && <Loader
                    className={styles.loader}
                    isOverlay
                    size="large"
                />}
                {isHost && <div className={styles.controls}>
                    {isIdle && <Button
                        id="start-story"
                        onClick={handleStart}
                        icon={<TbPlayerPlay />}
                        size="xs"
                        isLoading={startLoading.value}
                        isDisabled={isDisabled}
                        variant={isIdle ? 'secondary' : 'primary'}
                        className={styles.button}
                    >
                        Start Story
                    </Button>}
                    {isInProgress && <Button
                        id="stop-story"
                        onClick={handleStop}
                        icon={<TbPlayerStop />}
                        size="xs"
                        isLoading={stopLoading.value}
                        variant="primary"
                        className={styles.button}
                    >
                        Finish Story
                    </Button>}
                    {(isIdle || isFinished) && <Button
                        id="next-story"
                        onClick={handleNext}
                        icon={<TbPlayerTrackNext />}
                        size="xs"
                        isLoading={nextLoading.value}
                        variant="primary"
                        bordered={!isFinished}
                        className={styles.button}
                    >
                        Next Story
                    </Button>}
                </div>}
                <div className={styles.head}>
                    <span className={clsx(styles.text, styles.title)}>{title}</span>
                    <div className={clsx(styles.timeWrapper, { [styles.isTimeVisible]: isTimeVisible })}>
                        <span className={styles.divider}></span>
                        {!!time && <span className={styles.time}>{time ? format(time, 'mm:ss') : '00:00'}</span>}
                        <span className={styles.divider}></span>
                    </div>
                    <span className={clsx(styles.text, styles.story)}>{story}</span>
                </div>
                <div className={styles.footer}>
                    <Button
                        id="change-activity"
                        onClick={handleChangeActivity}
                        icon={activityState.value ? <LuCoffee /> : <MdOutlineHowToVote />}
                        size="xs"
                        isLoading={activityLoading.value}
                        isDisabled={isDisabled}
                        variant={isIdle ? 'ghost-inverted' : 'ghost'}
                        bordered
                        className={styles.button}
                    >
                        {activityState.value ? 'Just watch' : 'Participate'}
                    </Button>
                    <Button
                        id="exit-room"
                        onClick={handleExit}
                        icon={<IoExit />}
                        size="xs"
                        isLoading={exitLoading.value}
                        isDisabled={isDisabled}
                        variant="danger"
                        className={styles.button}
                    >
                        Exit
                    </Button>
                </div>
            </header>
        </div>
    );
};
