'use client';

import { TimeCard } from '@/components';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import styles from './TimeGrid.module.css';

export interface TimeGridProps {
    className?: string;
    values: number[];
    selectedTime?: number | null;
    isDisabled?: boolean;
    onSelect?: (value: number) => void | Promise<unknown>;
}

export const TimeGrid = ({
    className,
    values,
    isDisabled,
    selectedTime,
    onSelect,
}: TimeGridProps) => {
    const [selected, setSelected] = useState<number | null>(null);

    useEffect(() => {
        setSelected?.(selectedTime || null);
    }, [selectedTime]);

    const handleSelect = (value: number) => {
        setSelected(value);
        onSelect?.(value);
    }

    return <div id="time-grid" className={clsx(styles.grid, className)}>
        {values.map((value) => (
            <TimeCard
                isSelected={selected === value}
                className={styles.item}
                key={value}
                isDisabled={isDisabled}
                value={value}
                onSelect={handleSelect} />
        ))}
    </div>;
};
