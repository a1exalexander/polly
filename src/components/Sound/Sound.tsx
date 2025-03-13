'use client';

import { Button } from '@/components';
import { StoryStatusTypes } from '@/components/RoomPage/RoomPage.store';
import { useEffect, useRef } from 'react';
import { RiMusic2Fill } from 'react-icons/ri';
import { TbMusicOff } from 'react-icons/tb';
import { useBoolean, useLocalStorage } from 'usehooks-ts';

interface SoundProps {
    storyStatus: StoryStatusTypes;
}

export const Sound = ({ storyStatus }: SoundProps) => {
    const [isSoundOn, setSound] = useLocalStorage('sound-state', true);
    const finishSoundOn = useBoolean(false);
    const previousStoryStatus = useRef<StoryStatusTypes>(storyStatus);

    useEffect(() => {
        if (isSoundOn && previousStoryStatus.current === StoryStatusTypes.ACTIVE && storyStatus === StoryStatusTypes.FINISHED) {
            finishSoundOn.setTrue();
        } else {
            finishSoundOn.setFalse();
        }
        previousStoryStatus.current = storyStatus;
    }, [storyStatus]);

    return (
        <>
            {!isSoundOn && <Button
                size="s"
                type="button"
                variant="danger"
                onClick={() => setSound(true)}
                icon={<TbMusicOff />}></Button>}
            {isSoundOn && <Button
                size="s"
                type="button"
                variant="secondary"
                onClick={() => setSound(false)}
                bordered
                icon={<RiMusic2Fill />}></Button>}
            {finishSoundOn.value && <audio
                autoPlay>
                <source
                    src="/success.wav"
                    type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>}
        </>
    );
};
