import { signOutAction } from '@/app/actions';
import { Button } from '@/components';
import styles from './Footer.module.css';

export const Footer = () => {

    return (
        <footer className={styles.footer}>
            <Button
                className={styles.button}
                variant="inverted"
                onClick={signOutAction}>
                Sign Out
            </Button>
            <p className={styles.copy}>© 2024 Planning Poker App</p>
        </footer>
    )
}
