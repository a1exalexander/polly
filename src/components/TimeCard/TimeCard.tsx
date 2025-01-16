import { VoteValuesType } from '@/constants/VoteValues';
import styles from './TimeCard.module.css';
import clsx from 'clsx';

export interface TimeCardProps {
    className?: string;
    value: number;
    type: VoteValuesType;
    displayValue?: string;
    onSelect: (value: number) => void;
    isSelected: boolean;
    isDisabled?: boolean;
}

export const TimeCard = ({
    className,
    onSelect,
    value,
    type,
    displayValue,
    isSelected,
    isDisabled,
}: TimeCardProps) => {
    const onClick = () => onSelect(value);
    return (
        <button
            disabled={isSelected || isDisabled}
            className={clsx(
                styles.button,
                styles[type],
                { [styles.isSelected]: isSelected, [styles.isDisabled]: isDisabled },
                className,
            )}
            type="button"
            onClick={onClick}>
            {displayValue || value}
        </button>
    );
};
