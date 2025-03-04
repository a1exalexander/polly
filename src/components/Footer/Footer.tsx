import { signOutAction } from '@/app/actions';
import { Button } from '@/components';
import { StoryStatusTypes } from '@/components/RoomPage/RoomPage.store';
import { Sound } from '@/components/Sound';
import styles from './Footer.module.css';

export interface FooterProps {
    storyStatus?: StoryStatusTypes;
}

export const Footer = ({storyStatus}: FooterProps) => {
    return (
        <footer className={styles.footer}>
            <p className={styles.copy}>© 2024 Polly – Real-Time Task Estimation and Voting Platform</p>
            <div className={styles.row}>
                <form className={styles.form}>
                    <Button
                        className={styles.button}
                        variant="secondary"
                        size="s"
                        formAction={signOutAction}>
                        Sign Out
                    </Button>
                </form>
                {storyStatus && <Sound storyStatus={storyStatus} />}
            </div>
        </footer>
    )
}
