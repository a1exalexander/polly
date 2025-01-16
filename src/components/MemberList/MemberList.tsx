'use client';

import { VoteValuesType, VoteValuesTypes } from '@/constants/VoteValues';
import { UserWithActivity, UserWithVote } from '@/types';
import { isNumber } from '@/utils/isNumber';
import clsx from 'clsx';
import { useMemo } from 'react';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';
import { useBoolean } from 'usehooks-ts';
import { Member } from '../Member';
import styles from './MemberList.module.css';

export interface MemberListProps {
    className?: string;
    members: (UserWithVote & UserWithActivity)[];
    isHost: boolean;
    roomType?: VoteValuesType;
    hostId?: number;
    inProgress?: boolean;
    roomId: number;
    storyId?: number | null;
    average?: number | null;
    isFinished?: boolean;
    onRemoveUser?: (userId: number) => void | Promise<unknown>;
}

export const MemberList = ({
    members, className, isHost, hostId, inProgress, average, isFinished, onRemoveUser, roomType,
}: MemberListProps) => {
    const visibility = useBoolean(false);

    const isHostInProgress = isHost && inProgress;

    const voted = useMemo(
        () => members?.filter(({ value, active }) => active && value !== null).length || 0,
        [members],
    );
    const amount = useMemo(
        () => members?.filter(({ active }) => active)?.length || 0,
        [members],
    );

    const progress = useMemo(() => {
        if (!amount) {
            return '0%';
        }
        return `${voted / amount * 100}%`;
    }, [amount, voted]);

    const yesAmount = members?.filter(({ active, value }) => value === 1 && active)?.length;
    const noAmount = members?.filter(({ active, value }) => value === 0 && active)?.length;

    return (
        <div
            className={clsx(styles.list, {
                [styles.visible]: isHostInProgress && visibility.value,
                [styles.isHost]: isHost,
            }, className)}
        >
            <div
                className={clsx(
                    styles.status,
                    { [styles.isVisible]: inProgress || isFinished, [styles.result]: isFinished },
                )}
            >
                <div
                    style={{ width: progress }}
                    className={styles.progress}
                />
                {inProgress && <span className={styles.progressValue}>{voted}/{amount}</span>}
                {isFinished && roomType !== VoteValuesTypes.boolean &&
                    <span className={styles.progressValue}>Average: {average}</span>}
                {isFinished && roomType === VoteValuesTypes.boolean &&
                    <span className={styles.progressValue}>Yes: {yesAmount} | No: {noAmount}</span>}
            </div>

            <div className={styles.container}>
                {isHostInProgress && (
                    <>
                        <button
                            id="toggle-visibility"
                            onClick={visibility.toggle}
                            className={styles.button}
                        >
                            {visibility.value
                                ? <BsFillEyeFill className={styles.buttonIcon} />
                                : <BsFillEyeSlashFill className={styles.buttonIcon} />
                            }
                        </button>
                        <div className={styles.bluredOverlay} />
                    </>
                )}
                {members?.map(({ id, name, value, active }) => (
                    <Member
                        id={id}
                        onRemoveUser={onRemoveUser}
                        isValueVisible={visibility.value || !inProgress}
                        className={styles.item}
                        key={id}
                        isDisabled={!active}
                        isCurrentUserHost={isHost}
                        isMemberHost={hostId === id}
                        name={name}
                        value={roomType === VoteValuesTypes.boolean && isNumber(value) ?
                            (value
                                    ? 'Yes'
                                    : 'No'
                            ) : value}
                    />
                ))}
            </div>
        </div>
    );
};
