import { ConfirmModal, DropdownMenu, Tooltip, type DropdownMenuItem } from '@/components';
import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import { BsFillPatchCheckFill } from 'react-icons/bs';
import { FaStar } from 'react-icons/fa';
import { HiUserRemove } from 'react-icons/hi';
import { MdOutlineAdminPanelSettings, MdOutlineRemoveModerator } from 'react-icons/md';
import { useBoolean } from 'usehooks-ts';
import styles from './Member.module.css';

export interface MemberProps {
    className?: string;
    id: number;
    isValueVisible?: boolean;
    name: string | null;
    value: number | string | null;
    isCurrentUserHost?: boolean;
    isCurrentUserAdmin?: boolean;
    isMemberHost?: boolean;
    isMemberAdmin?: boolean;
    isSelf?: boolean;
    isDisabled?: boolean;
    isInProgress?: boolean;
    menuClass?: string;
    onRemoveUser?: (userId: number) => void | Promise<unknown>;
    onToggleAdmin?: (userId: number, nextIsAdmin: boolean) => void | Promise<unknown>;
}

export function Member({
    id,
    className,
    name,
    value,
    isValueVisible,
    isCurrentUserHost,
    isCurrentUserAdmin,
    isMemberHost,
    isMemberAdmin,
    isSelf,
    isDisabled,
    onRemoveUser,
    onToggleAdmin,
    isInProgress,
    menuClass,
}: MemberProps) {
    const removingLoading = useBoolean(false);
    const confirmModalOpen = useBoolean(false);

    const handleRemoveUser = useCallback(async () => {
        removingLoading.setTrue();
        await onRemoveUser?.(id);
        removingLoading.setFalse();
        confirmModalOpen.setFalse();
    }, [onRemoveUser, id, removingLoading, confirmModalOpen]);

    const handleToggleAdmin = useCallback(async () => {
        await onToggleAdmin?.(id, !isMemberAdmin);
    }, [onToggleAdmin, id, isMemberAdmin]);

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

    // The room owner can grant/revoke admin rights and remove anyone (except the host).
    // Admins can only remove other non-host members.
    // Every member can remove themselves from the room.
    const canManageOthers = !isSelf && !isMemberHost && (isCurrentUserHost || isCurrentUserAdmin);
    const canOpenMenu = (isCurrentUserHost || !!isCurrentUserAdmin) && (!!isSelf || canManageOthers);

    const menuItems = useMemo<DropdownMenuItem[]>(() => {
        const items: DropdownMenuItem[] = [];
        if (canManageOthers && isCurrentUserHost) {
            items.push({
                id: 'toggle-admin',
                label: isMemberAdmin ? 'Revoke admin' : 'Make admin',
                icon: isMemberAdmin ? <MdOutlineRemoveModerator /> : <MdOutlineAdminPanelSettings />,
                onClick: handleToggleAdmin,
            });
        }
        items.push({
            id: 'remove-user',
            label: isSelf ? 'Leave room' : 'Remove',
            icon: <HiUserRemove />,
            variant: 'danger',
            onClick: confirmModalOpen.setTrue,
        });
        return items;
    }, [canManageOthers, isCurrentUserHost, isMemberAdmin, handleToggleAdmin, confirmModalOpen.setTrue, isSelf]);

    return (
        <div
            data-ph="member"
            className={clsx(styles.container, { [styles.isDisabled]: isDisabled }, className)}>
            <div className={styles.head}>
                <span className={styles.name}>{name}</span>
                {isMemberHost && (
                    <Tooltip text="Room owner" position="top">
                        <FaStar className={styles.star} aria-label="Room owner" />
                    </Tooltip>
                )}
                {!isMemberHost && isMemberAdmin && (
                    <Tooltip text="Admin — can manage the session" position="top">
                        <MdOutlineAdminPanelSettings className={styles.adminBadge} aria-label="Admin" />
                    </Tooltip>
                )}
            </div>
            <div className={clsx(styles.tail, { [styles.noMenu]: !canOpenMenu })}>
                <div className={styles.valueSlot}>
                    {valueContent}
                </div>
                {canOpenMenu && (
                    <DropdownMenu
                        ariaLabel={`Manage ${name ?? 'member'}`}
                        data-ph="member-menu"
                        triggerClassName={clsx(styles.menuTrigger, { [styles.isInProgress]: isInProgress }, menuClass)}
                        items={menuItems}
                    />
                )}
            </div>
            <ConfirmModal
                isOpen={confirmModalOpen.value}
                title={isSelf ? 'Leave room' : 'Remove user'}
                message={isSelf
                    ? <>Are you sure you want to leave this room?</>
                    : <>Are you sure you want to remove <strong>{name}</strong> from this room?</>
                }
                confirmText={isSelf ? 'Leave room' : 'Remove'}
                cancelText="Cancel"
                variant="danger"
                isLoading={removingLoading.value}
                onConfirm={handleRemoveUser}
                onCancel={confirmModalOpen.setFalse}
            />
        </div>
    );
};
