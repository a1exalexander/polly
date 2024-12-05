'use server';

import { joinRoomAction } from '@/app/actions';
import { RoomPage } from '@/components/RoomPage';

const timeValues = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

export default async function Home({ params }: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const { serverUser } = await joinRoomAction(slug);

    return (
        <RoomPage
            roomId={Number(slug)}
            serverUser={serverUser}
            timeValues={timeValues} />
    );
}

