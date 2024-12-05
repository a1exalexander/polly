"use server";

import { FcGoogle } from "react-icons/fc";
import { Button } from '@/components';
import { signInAction } from '../../actions';
import styles from './page.module.css';

export default async function Login() {
    return (
        <div className={styles.page}>
            <form className={styles.form}>
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
