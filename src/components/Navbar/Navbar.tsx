'use client';

import { Button, Loader, Logo, Tag, Tooltip } from '@/components';
import clsx from 'clsx';
import { differenceInMilliseconds, format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';
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
    storyType?: string | null;
    startTime?: null | Date | string;
    finishTime?: null | Date | string;
    onStart?: () => void | Promise<unknown>;
    onNext?: () => void | Promise<unknown>;
    onStop?: () => void | Promise<unknown>;
    onExit?: () => void | Promise<unknown>;
    onChangeActivity?: (active: boolean) => void | Promise<unknown>;
    average?: number | null;
    roomLinkPath?: string;
}

export const Navbar = ({
    startTime,
    finishTime,
    title,
    story,
    storyType,
    onStart,
    onNext,
    onStop,
    isHost,
    isUserActive,
    onExit,
    onChangeActivity,
    average,
    roomLinkPath,
}: NavbarProps) => {
    const [time, setTime] = useState<Date | null>(null);
    const [host, setHost] = useState('');
    const activityState = useBoolean(false);
    const copied = useBoolean(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHost(window.location.host);
        }
    }, []);

    const handleCopyLink = useCallback(async () => {
        if (!roomLinkPath || typeof window === 'undefined') return;
        try {
            await navigator.clipboard.writeText(`${window.location.origin}${roomLinkPath}`);
            copied.setTrue();
            setTimeout(() => copied.setFalse(), 1500);
        } catch {
            // clipboard might be blocked; silently noop
        }
    }, [roomLinkPath, copied]);

    const linkLabel = roomLinkPath && host ? `${host}${roomLinkPath}` : roomLinkPath ?? '';

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
        onExit?.();
    }, [onExit, exitLoading]);

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
    const isInProgress = !!startTime && !finishTime;
    const isFinished = !!finishTime;
    const isIdle = !isInProgress && !isFinished;
    const isDisabled = startLoading.value || nextLoading.value || stopLoading.value || exitLoading.value;

    const stateLabel = isIdle ? 'Waiting to start' : isInProgress ? 'In progress' : 'Revealed';

    const isObserver = !activityState.value;

    return (
        <header
            className={clsx(styles.header, {
                [styles.isInProgress]: isInProgress,
                [styles.isFinished]: isFinished,
            })}
        >
            {!isHeaderReady && (
                <div className={styles.loaderHost}>
                    <Loader size="large" />
                </div>
            )}
            {isHeaderReady && (
                <>
                    <div className={styles.left}>
                        <div className={styles.brand} aria-label="Polly">
                            <Logo size={24} aria-hidden />
                            <span>Polly</span>
                        </div>
                        <span className={styles.sep} aria-hidden="true">/</span>
                        <div className={styles.titleBlock}>
                            <span className={styles.title} title={title ?? ''}>{title}</span>
                            <div className={styles.meta}>
                                {storyType && (
                                    <Tag type={storyType === 'weeks' ? 'warning' : storyType === 'boolean' ? 'danger' : 'info'}>
                                        {storyType}
                                    </Tag>
                                )}
                                {roomLinkPath && (
                                    <button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className={styles.roomLink}
                                        aria-label="Copy room link"
                                        title={copied.value ? 'Copied!' : 'Copy room link'}
                                    >
                                        {copied.value ? <FiCheck /> : <FiCopy />}
                                        <span>{copied.value ? 'Copied!' : linkLabel}</span>
                                    </button>
                                )}
                                {story && <span className={styles.story}>{story}</span>}
                            </div>
                        </div>
                    </div>

                    <div className={styles.right}>
                        <div className={styles.statusBlock}>
                            <span className={styles.statusTitle}>
                                {isFinished ? 'Story finished' : isInProgress ? 'Voting now' : 'Story'}
                            </span>
                            <div className={styles.statusMeta}>
                                <span className={clsx(styles.dot, {
                                    [styles.dotActive]: isInProgress,
                                    [styles.dotFinished]: isFinished,
                                })} />
                                <span>{stateLabel}</span>
                                {!!time && !isFinished && (
                                    <span className={styles.timer}>{format(time, 'mm:ss')}</span>
                                )}
                                {isFinished && (
                                    <>
                                        <span>· Average</span>
                                        <span className={styles.avg}>{String(average)}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {isHost && (
                            <div className={styles.controls}>
                                {isIdle && (
                                    <Button
                                        id="start-story"
                                        onClick={handleStart}
                                        icon={<TbPlayerPlay />}
                                        size="s"
                                        isLoading={startLoading.value}
                                        isDisabled={isDisabled}
                                        variant="accent"
                                    >
                                        Start story
                                    </Button>
                                )}
                                {isInProgress && (
                                    <Button
                                        id="stop-story"
                                        onClick={handleStop}
                                        icon={<TbPlayerStop />}
                                        size="s"
                                        isLoading={stopLoading.value}
                                        variant="primary"
                                    >
                                        Finish story
                                    </Button>
                                )}
                                {(isIdle || isFinished) && (
                                    <Button
                                        id="next-story"
                                        onClick={handleNext}
                                        icon={<TbPlayerTrackNext />}
                                        size="s"
                                        isLoading={nextLoading.value}
                                        variant={isFinished ? 'warning' : 'secondary'}
                                        bordered={!isFinished}
                                    >
                                        Next story
                                    </Button>
                                )}
                            </div>
                        )}

                        <Tooltip
                            text={isObserver ? 'Switch to voting mode' : 'Switch to observer mode'}
                            position="bottom"
                        >
                            <button
                                id="change-activity"
                                aria-label={isObserver ? 'Participate' : 'Just watch'}
                                disabled={isDisabled || activityLoading.value}
                                onClick={handleChangeActivity}
                                className={clsx(styles.iconBtn, { [styles.observerOn]: !isObserver })}
                                type="button"
                            >
                                {isObserver ? <MdOutlineHowToVote /> : <LuCoffee />}
                            </button>
                        </Tooltip>

                        <Tooltip text="Leave room" position="bottom">
                            <button
                                id="exit-room"
                                aria-label="Leave room"
                                disabled={isDisabled || exitLoading.value}
                                onClick={handleExit}
                                className={clsx(styles.iconBtn, styles.iconBtnDanger)}
                                type="button"
                            >
                                <IoExit />
                            </button>
                        </Tooltip>
                    </div>
                </>
            )}
        </header>
    );
};
