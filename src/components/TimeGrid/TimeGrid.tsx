'use client';

import { TimeCard } from '@/components';
import { VoteValuesType, VoteValuesTypes } from '@/constants/VoteValues';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import styles from './TimeGrid.module.css';

export interface TimeGridProps {
    className?: string;
    values: number[];
    type: VoteValuesType;
    selectedTime: number | null;
    isDisabled?: boolean;
    onSelect?: (value: number) => void | Promise<unknown>;
}

export const TimeGrid = ({
    className,
    values,
    type,
    isDisabled,
    selectedTime,
    onSelect,
}: TimeGridProps) => {
    const [selected, setSelected] = useState<number | null>(null);

    useEffect(() => {
        setSelected(selectedTime);
    }, [selectedTime]);

    const handleSelect = (value: number) => {
        setSelected(value);
        onSelect?.(value);
    }

    return <div id="time-grid" className={clsx(styles.grid, styles[type], className)}>
        {values.map((value) => (
            <TimeCard
                isSelected={selected === value}
                className={styles.item}
                key={value}
                type={type}
                displayValue={type === VoteValuesTypes.boolean ? (value ? 'Yes' : 'No') : undefined}
                isDisabled={isDisabled}
                value={value}
                onSelect={handleSelect} />
        ))}
    </div>;
};
