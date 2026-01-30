import { permanentRedirect } from 'next/navigation';

export default function SignInRedirect() {
    permanentRedirect('/start');
}
