import { Button } from '@/components';
import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import { BsFillPatchCheckFill } from 'react-icons/bs';
import { FaStar } from 'react-icons/fa';
import { HiUserRemove } from 'react-icons/hi';
import { useBoolean } from 'usehooks-ts';
import styles from './Member.module.css';

export interface MemberProps {
    className?: string;
    id: number;
    isValueVisible?: boolean;
    name: string | null;
    value: number | string | null;
    isCurrentUserHost?: boolean;
    isMemberHost?: boolean;
    isDisabled?: boolean;
    onRemoveUser?: (userId: number) => void | Promise<unknown>;
}

export const Member = ({
    id, className, name, value, isValueVisible, isCurrentUserHost, isMemberHost, isDisabled, onRemoveUser,
}: MemberProps) => {
    const removingLoading = useBoolean(false);

    const handleRemoveUser = useCallback(async () => {
        removingLoading.setTrue();
        await onRemoveUser?.(id);
        removingLoading.setFalse();
    }, [onRemoveUser, id, removingLoading]);

    const valueContent = useMemo(() => {
        switch (true) {
            case !isValueVisible && !!value && !isDisabled:
                return <BsFillPatchCheckFill className={styles.icon} />;
            case !isValueVisible && !value && !isDisabled:
                return null;
            case isDisabled:
                return <span className={styles.value} />;
            default:
                return <span className={styles.value}>{value}</span>;
        }
    }, [isDisabled, isValueVisible, value]);

    return (
        <div data-ph="member" className={clsx(styles.container, { [styles.isDisabled]: isDisabled }, className)}>
            <div className={styles.head}>
                <span className={styles.name}>{name}</span>
                {isMemberHost && <FaStar className={styles.star} />}
            </div>
            <div className={styles.tail}>
                {isCurrentUserHost && <Button
                    data-ph="remove-user"
                    variant="danger-inverted"
                    onClick={handleRemoveUser}
                    isLoading={removingLoading.value}
                    size="xs"
                    icon={<HiUserRemove />}
                >Remove</Button>}
                <div className={styles.valueSlot}>
                    {valueContent}
                </div>
            </div>
        </div>
    );
};
