'use client';

import { Button } from '@/components';
import { StoryStatusTypes } from '@/components/RoomPage/RoomPage.store';
import { useEffect, useRef } from 'react';
import { RiMusic2Fill } from 'react-icons/ri';
import { TbMusicOff } from 'react-icons/tb';
import { useBoolean, useEventListener, useLocalStorage } from 'usehooks-ts';

interface SoundProps {
    storyStatus: StoryStatusTypes;
}

export const Sound = ({ storyStatus }: SoundProps) => {
    const ref = useRef<HTMLAudioElement>(null);
    const interactionState = useBoolean(false);
    const [isSoundOn, setSound] = useLocalStorage('sound', true);
    const finishSoundOn = useBoolean(false);
    const previousStoryStatus = useRef<StoryStatusTypes>(storyStatus);

    const isPlaying = isSoundOn && storyStatus === StoryStatusTypes.ACTIVE;

    useEventListener('click', () => {
        if (interactionState.value) {
            return;
        }
        if (isPlaying) {
            ref.current?.play();
            interactionState.setTrue();
        }
    });

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
            {isSoundOn && storyStatus === StoryStatusTypes.ACTIVE && <audio
                ref={ref}
                autoPlay
                loop>
                <source
                    src="/clock.mp3"
                    type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>}
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
