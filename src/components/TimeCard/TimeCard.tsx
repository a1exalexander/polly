import { VoteValuesType, VoteValuesTypes } from '@/constants/VoteValues';
import styles from './TimeCard.module.css';
import clsx from 'clsx';
import { isNumber } from '@/utils/isNumber';

export interface TimeCardProps {
    className?: string;
    value: number;
    type: VoteValuesType;
    displayValue?: string;
    onSelect: (value: number) => void;
    isSelected: boolean;
    isCardActive?: boolean;
    selectedValue?: number | null;
    isDisabled?: boolean;
}

const SUB_VALUES = [0.25, 0.5, 0.75] as const;

export const TimeCard = ({
    className,
    onSelect,
    value,
    type,
    displayValue,
    isSelected,
    isCardActive,
    selectedValue,
    isDisabled,
}: TimeCardProps) => {
    const hasSubs = type === VoteValuesTypes.days;
    const onClick = () => {
        onSelect(value)
    };

    const isIntegerSelected = isNumber(selectedValue) && selectedValue === value;

    return (
        <div className={clsx(
            styles.card,
            styles[type],
            { 
                [styles.hasSubValues]: hasSubs,
                [styles.isCardSelected]: isCardActive || isSelected
            },
            className,
        )}>
            <button
                disabled={isDisabled || isIntegerSelected}
                className={clsx(
                    styles.button,
                    styles[type],
                    {
                        [styles.isSelected]: isSelected,
                        [styles.isActive]: isCardActive && !isSelected,
                        [styles.isDisabled]: isDisabled
                    },
                )}
                type="button"
                onClick={onClick}>
                {displayValue || value}
            </button>
            {hasSubs && (
                <div className={styles.subValues}>
                    {SUB_VALUES.map((sub) => {
                        const subValue = value + sub;
                        const isSubSelected = selectedValue === subValue;
                        return (
                            <button
                                key={sub}
                                disabled={isSubSelected || isDisabled}
                                className={clsx(
                                    styles.subButton,
                                    { 
                                        [styles.isSelected]: isSubSelected,
                                        [styles.isDisabled]: isDisabled || isSubSelected
                                    },
                                )}
                                type="button"
                                onClick={() => {                                    
                                    onSelect(subValue)
                                }}>
                                .{String(sub).split('.')[1]}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
