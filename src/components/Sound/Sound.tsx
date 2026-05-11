'use client';

import { StoryStatusTypes } from '@/components/RoomPage/RoomPage.store';
import { useEffect, useRef } from 'react';
import { useBoolean, useLocalStorage } from 'usehooks-ts';

interface SoundProps {
    storyStatus: StoryStatusTypes;
}

export const Sound = ({ storyStatus }: SoundProps) => {
    const [isSoundOn] = useLocalStorage('sound-state', true);
    const finishSoundOn = useBoolean(false);
    const previousStoryStatus = useRef<StoryStatusTypes>(storyStatus);

    useEffect(() => {
        if (isSoundOn && previousStoryStatus.current === StoryStatusTypes.ACTIVE && storyStatus === StoryStatusTypes.FINISHED) {
            finishSoundOn.setTrue();
        } else {
            finishSoundOn.setFalse();
        }
        previousStoryStatus.current = storyStatus;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storyStatus]);

    if (!finishSoundOn.value) return null;

    return (
        <audio autoPlay>
            <source src="/success.wav" type="audio/mpeg" />
            Your browser does not support the audio element.
        </audio>
    );
};
