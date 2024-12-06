"use server";

import { FcGoogle } from "react-icons/fc";
import { Button } from '@/components';
import { signInAction } from '../../actions';
import styles from './page.module.css';

export default async function Login() {
    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Polly</h1>
            <p className={styles.description}>Real-Time Task Estimation and Voting Platform</p>
            <form className={styles.fanorm}>
                <Button
                    icon={<FcGoogle />}
                    type="submit"
                    formAction={signInAction}>
                    Login by Google
                </Button>
            </form>
        </div>
    );
}
