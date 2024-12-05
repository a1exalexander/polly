import styles from './TimeCard.module.css';
import clsx from 'clsx';

export interface TimeCardProps {
    className?: string;
    value: number;
    onSelect: (value: number) => void;
    isSelected: boolean;
    isDisabled?: boolean;
}

export const TimeCard = ({
    className,
    onSelect,
    value,
    isSelected,
    isDisabled,
}: TimeCardProps) => {
    const onClick = () => onSelect(value);
    return (
        <button
            disabled={isSelected || isDisabled}
            className={clsx(
                styles.button,
                { [styles.isSelected]: isSelected, [styles.isDisabled]: isDisabled },
                className,
            )}
            type="button"
            onClick={onClick}>
            {value}
        </button>
    );
};
