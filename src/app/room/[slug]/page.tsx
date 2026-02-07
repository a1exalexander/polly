import { getRoomMetadata, joinRoomAction } from '@/app/actions';
import { RoomPage } from '@/components/RoomPage';
import { Metadata } from 'next';


type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const { slug } = await params;
    const { title } = await getRoomMetadata(slug);

    return {
        title: `${title} | Polly` || `Room ${slug} | Polly`,
    }
}

export default async function Home({ params }: Props) {
    const { slug } = await params;
    const { serverUser } = await joinRoomAction(slug);

    return (
        <RoomPage
            roomId={Number(slug)}
            serverUser={serverUser} />
    );
}

