'use client';

import { createRoomAction } from '@/app/actions';
import { Button, Tag } from '@/components';
import { tagTypesByVoteType, VoteValues, VoteValuesType } from '@/constants/VoteValues';
import clsx from 'clsx';
import { usePostHog } from 'posthog-js/react';
import { FormEvent, useCallback, useMemo, useState } from 'react';
import { MdMeetingRoom } from 'react-icons/md';
import styles from './CreateRoomForm.module.css';

export const CreateRoomForm = () => {
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const posthog = usePostHog();
    const onSubmit = useCallback((event: FormEvent) => {
        const formData = new FormData(event.target as HTMLFormElement);
        posthog.capture('create_room', {
            title: formData.get('title'),
        });
    }, [posthog]);

    const demoList = useMemo(() => {
        if (!selectedType) {
            return null;
        }
        let list: (string | number)[] = Object.values(VoteValues[selectedType as VoteValuesType]);

        if (list.length > 10) {
            list = [...list.slice(0, 5), '...', ...list.slice(-5)];
        }

        if (selectedType === 'boolean') {
            list = ['No', 'Yes'];
        }

        return list.map((value) => {
            if (value === '...') {
                return <span className={styles.dots} key="dots">...</span>;
            }
            return <span
                key={String(value)}
                className={styles.miniCard}>{String(value)}</span>;
        });
    }, [selectedType]);

    return (
        <form
            onSubmit={onSubmit}
            className={styles.form}>
            <div className={styles.inner}>
                <div className={clsx(styles.field, styles.inputField)}>
                    <label
                        className={styles.label}
                        htmlFor="title">Room name</label>
                    <input
                        className={styles.input}
                        placeholder="My new room"
                        id="title"
                        name="title"
                        type="text"
                        minLength={2}
                        maxLength={400}
                        required />
                </div>
                <div className={styles.field}>
                    <label
                        className={styles.label}
                        htmlFor="title">Values type</label>
                    <div className={styles.tags}>
                        {
                            (Object.keys(VoteValues) as VoteValuesType[]).map((value) => {
                                return <Tag
                                    type={tagTypesByVoteType[value]}
                                    key={value}
                                    value={value}
                                    onChange={setSelectedType}
                                    name="type">{value}</Tag>;
                            })
                        }
                    </div>
                </div>
                <Button
                    icon={<MdMeetingRoom />}
                    className={styles.button}
                    formAction={createRoomAction}
                    variant="inverted">
                    Create room
                </Button>
            </div>
            {!!selectedType && <div className={styles.typeDemo}>{demoList}</div>}
        </form>
    );
};
