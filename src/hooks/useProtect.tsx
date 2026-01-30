import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const useProtect = async () => {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/start');
    }
}
