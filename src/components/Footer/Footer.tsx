import { signOutAction } from '@/app/actions';
import { Button } from '@/components';
import styles from './Footer.module.css';

export const Footer = () => {

    return (
        <footer className={styles.footer}>
            <p className={styles.copy}>© 2024 Polly – Real-Time Task Estimation and Voting Platform</p>
            <form className={styles.form}>
                <Button
                    className={styles.button}
                    variant="secondary"
                    formAction={signOutAction}>
                    Sign Out
                </Button>
            </form>
        </footer>
    )
}
