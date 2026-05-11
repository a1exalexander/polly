import { ConfirmModal, DropdownMenu, Tooltip, type DropdownMenuItem } from '@/components';
import { getAvatarColor, getInitials } from '@/utils/avatar';
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
    avatarUrl?: string | null;
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
    onSelfLeave?: () => void;
    onToggleAdmin?: (userId: number, nextIsAdmin: boolean) => void | Promise<unknown>;
}

export function Member({
    id,
    className,
    name,
    avatarUrl,
    value,
    isValueVisible,
    isCurrentUserHost,
    isCurrentUserAdmin,
    isMemberHost,
    isMemberAdmin,
    isSelf,
    isDisabled,
    onRemoveUser,
    onSelfLeave,
    onToggleAdmin,
    isInProgress,
    menuClass,
}: MemberProps) {
    const removingLoading = useBoolean(false);
    const confirmModalOpen = useBoolean(false);

    const handleRemoveUser = useCallback(async () => {
        // Self-leave is fire-and-forget so the route can change before any
        // post-delete state lands and re-renders the room without us.
        if (isSelf) {
            confirmModalOpen.setFalse();
            onSelfLeave?.();
            return;
        }
        removingLoading.setTrue();
        await onRemoveUser?.(id);
        removingLoading.setFalse();
        confirmModalOpen.setFalse();
    }, [isSelf, onSelfLeave, onRemoveUser, id, removingLoading, confirmModalOpen]);

    const handleToggleAdmin = useCallback(async () => {
        await onToggleAdmin?.(id, !isMemberAdmin);
    }, [onToggleAdmin, id, isMemberAdmin]);

    const hasVote = value !== null && value !== undefined && value !== '';

    const valueContent = useMemo(() => {
        if (isDisabled) {
            return <span className={styles.value}>—</span>;
        }
        if (!isValueVisible && hasVote) {
            return (
                <span className={clsx(styles.value, styles.valueVoted)}>
                    <BsFillPatchCheckFill className={styles.icon} />
                </span>
            );
        }
        if (!isValueVisible && !hasVote) {
            return <span className={clsx(styles.value, styles.valueEmpty)} />;
        }
        if (hasVote) {
            return <span className={clsx(styles.value, styles.valueRevealed)}>{value}</span>;
        }
        return <span className={clsx(styles.value, styles.valueEmpty)} />;
    }, [isDisabled, isValueVisible, value, hasVote]);

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
            className={clsx(styles.container, { [styles.isDisabled]: isDisabled }, className)}
        >
            {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={avatarUrl}
                    alt=""
                    className={styles.avatar}
                    referrerPolicy="no-referrer"
                />
            ) : (
                <span
                    className={styles.avatar}
                    style={{ backgroundColor: getAvatarColor(id) }}
                    aria-hidden="true"
                >
                    {getInitials(name)}
                </span>
            )}
            <div className={styles.head}>
                <div className={styles.name}>
                    <Tooltip text={name ?? ''} position="top" className={styles.nameTooltip}>
                        {name}
                    </Tooltip>
                    {isMemberHost && (
                        <Tooltip text="Room owner" position="top">
                            <span className={clsx(styles.badge, styles.badgeOwner)} aria-label="Room owner">
                                <FaStar className={styles.star} />
                            </span>
                        </Tooltip>
                    )}
                    {!isMemberHost && isMemberAdmin && (
                        <Tooltip text="Admin — can manage the session" position="top">
                            <span className={clsx(styles.badge, styles.badgeAdmin)} aria-label="Admin">
                                <MdOutlineAdminPanelSettings className={styles.adminBadge} />
                            </span>
                        </Tooltip>
                    )}
                </div>
            </div>
            <div className={styles.tail}>
                <div className={styles.valueSlot}>{valueContent}</div>
                {canOpenMenu ? (
                    <DropdownMenu
                        ariaLabel={`Manage ${name ?? 'member'}`}
                        data-ph="member-menu"
                        triggerClassName={clsx(styles.menuTrigger, { [styles.isInProgress]: isInProgress }, menuClass)}
                        items={menuItems}
                    />
                ) : (
                    <span className={styles.menuPlaceholder} aria-hidden="true" />
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
