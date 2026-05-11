'use client';

import { createRoomAction } from '@/app/actions';
import { Button, Tag } from '@/components';
import { tagTypesByVoteType, VoteValues, VoteValuesType } from '@/constants/VoteValues';
import { usePostHog } from 'posthog-js/react';
import { FormEvent, useCallback, useMemo, useState } from 'react';
import { MdMeetingRoom } from 'react-icons/md';
import styles from './CreateRoomForm.module.css';

export const CreateRoomForm = () => {
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const posthog = usePostHog();
    const onSubmit = useCallback((event: FormEvent) => {
        const formData = new FormData(event.target as HTMLFormElement);
        const serialized = Object.fromEntries(formData.entries());
        posthog?.capture?.('create_room', {
            formData: serialized,
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
                return <span className={styles.dots} key="dots">…</span>;
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
            <div>
                <div className={styles.eyebrow}>New room</div>
                <h2 className={styles.heading}>Spin up an estimation room</h2>
                <p className={styles.tagline}>Give it a name, pick a scale, share the link. No setup.</p>
            </div>

            <div className={styles.inner}>
                <div className={styles.field}>
                    <label
                        className={styles.label}
                        htmlFor="title">Title</label>
                    <input
                        className={styles.input}
                        placeholder="e.g. Sprint 48 grooming"
                        id="title"
                        name="title"
                        type="text"
                        minLength={2}
                        maxLength={400}
                        required />
                </div>
                <div className={styles.field}>
                    <span className={styles.label}>Estimation scale</span>
                    <div className={styles.tags}>
                        {(Object.keys(VoteValues) as VoteValuesType[]).map((value) => (
                            <Tag
                                type={tagTypesByVoteType[value]}
                                key={value}
                                value={value}
                                onChange={setSelectedType}
                                checked={selectedType === value}
                                name="type">{value}</Tag>
                        ))}
                    </div>
                </div>
                {!!selectedType && (
                    <div className={styles.typeDemo}>
                        <span className={styles.previewLabel}>Preview</span>
                        {demoList}
                    </div>
                )}
                <Button
                    icon={<MdMeetingRoom />}
                    className={styles.button}
                    formAction={createRoomAction}
                    variant="accent">
                    Create room
                </Button>
            </div>
        </form>
    );
};
