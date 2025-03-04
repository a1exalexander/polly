'use client';

import { Button, TimeCard } from '@/components';
import { StoryStatusTypes } from '@/components/RoomPage/RoomPage.store';
import { VoteValuesType, VoteValuesTypes } from '@/constants/VoteValues';
import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { MdOutlineHowToVote } from 'react-icons/md';
import { TbPlayerPlay } from 'react-icons/tb';
import { useBoolean } from 'usehooks-ts';
import styles from './TimeGrid.module.css';

export interface TimeGridProps {
    className?: string;
    values: number[];
    type: VoteValuesType;
    selectedTime: number | null;
    isDisabled?: boolean;
    onSelect?: (value: number) => void | Promise<unknown>;
    onStartAction: () => void | Promise<unknown>;
    storyStatus: StoryStatusTypes;
    isHost?: boolean;
    isUserActive?: boolean;
    onParticipateAction: () => void | Promise<unknown>;
}

export const TimeGrid = ({
    className,
    values,
    type,
    isDisabled,
    selectedTime,
    onSelect,
    onStartAction,
    storyStatus,
    isHost,
    isUserActive,
    onParticipateAction,
}: TimeGridProps) => {
    const [selected, setSelected] = useState<number | null>(null);
    const startLoading = useBoolean(false);
    const activityLoading = useBoolean(false);

    useEffect(() => {
        setSelected(selectedTime);
    }, [selectedTime]);

    const handleSelect = (value: number) => {
        setSelected(value);
        onSelect?.(value);
    };

    const handleStart = useCallback(async () => {
        startLoading.setTrue();
        await onStartAction?.();
        startLoading.setFalse();
    }, [onStartAction, startLoading]);

    const handleParticipate = useCallback(async () => {
        activityLoading.setTrue();
        await onParticipateAction?.();
        activityLoading.setFalse();
    }, [onParticipateAction, activityLoading]);

    return <div
        id="time-grid"
        className={clsx(styles.grid, styles[type], className)}>
        {
            storyStatus === StoryStatusTypes.IDLE && isHost && (
                <div className={styles.buttonWrapper}>
                    <Button
                        className={styles.button}
                        isLoading={startLoading.value}
                        size="m"
                        icon={<TbPlayerPlay />}
                        variant="primary"
                        onClick={handleStart}>Start story</Button>
                </div>
            )
        }
        {
            !isUserActive && (!isHost || (isHost && storyStatus !== StoryStatusTypes.IDLE)) && (
                <div className={styles.buttonWrapper}>
                    <Button
                        className={styles.button}
                        isLoading={activityLoading.value}
                        size="m"
                        bordered
                        icon={<MdOutlineHowToVote />}
                        variant="warning"
                        onClick={handleParticipate}>Participate</Button>
                </div>
            )
        }
        {values.map((value) => (
            <TimeCard
                isSelected={selected === value}
                className={clsx(styles.item, { [styles.itemInactive]: storyStatus === StoryStatusTypes.FINISHED && selected !== value })}
                key={value}
                type={type}
                displayValue={type === VoteValuesTypes.boolean ? (value ? 'Yes' : 'No') : undefined}
                isDisabled={isDisabled}
                value={value}
                onSelect={handleSelect} />
        ))}
    </div>;
};
