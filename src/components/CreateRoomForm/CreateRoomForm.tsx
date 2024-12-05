'use client';

import { MdMeetingRoom } from "react-icons/md";
import { createRoomAction } from '@/app/actions';
import { Button } from '@/components';
import styles from './CreateRoomForm.module.css';

export const CreateRoomForm = () => {
    return (
        <form className={styles.form}>
            <div className={styles.field}>
                <label className={styles.label} htmlFor="title">Room name</label>
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
            <Button
                icon={<MdMeetingRoom />}
                className={styles.button}
                formAction={createRoomAction}
                variant="inverted">
                Create room
            </Button>
        </form>
    );
};
