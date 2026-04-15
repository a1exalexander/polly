'use client';

import clsx from 'clsx';
import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiLoader } from 'react-icons/fi';
import styles from './DropdownMenu.module.css';

export interface DropdownMenuItem {
    id: string;
    label: string;
    icon?: ReactNode;
    variant?: 'default' | 'danger';
    isDisabled?: boolean;
    onClick: () => void | Promise<unknown>;
}

export interface DropdownMenuProps {
    items: DropdownMenuItem[];
    ariaLabel?: string;
    className?: string;
    triggerClassName?: string;
    'data-ph'?: string;
}

const MENU_OFFSET = 6;

export const DropdownMenu = ({
    items,
    ariaLabel = 'Open menu',
    className,
    triggerClassName,
    'data-ph': dataPh,
}: DropdownMenuProps) => {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const close = useCallback(() => setIsOpen(false), []);

    const updatePosition = useCallback(() => {
        if (!triggerRef.current || !menuRef.current) {
            return;
        }
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = triggerRect.right - menuRect.width;
        let top = triggerRect.bottom + MENU_OFFSET;

        if (left < 8) left = 8;
        if (left + menuRect.width > viewportWidth - 8) {
            left = viewportWidth - menuRect.width - 8;
        }
        if (top + menuRect.height > viewportHeight - 8) {
            top = triggerRect.top - menuRect.height - MENU_OFFSET;
        }

        setCoords({ top, left });
    }, []);

    useLayoutEffect(() => {
        if (!isOpen) return;
        updatePosition();
    }, [isOpen, updatePosition]);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                menuRef.current?.contains(target) ||
                triggerRef.current?.contains(target)
            ) {
                return;
            }
            close();
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                close();
                triggerRef.current?.focus();
            }
        };

        const handleReposition = () => updatePosition();

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('scroll', handleReposition, true);
        window.addEventListener('resize', handleReposition);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('scroll', handleReposition, true);
            window.removeEventListener('resize', handleReposition);
        };
    }, [isOpen, close, updatePosition]);

    const handleToggle = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const handleItemClick = useCallback(
        async (item: DropdownMenuItem) => {
            if (item.isDisabled || loadingItemId) return;
            setLoadingItemId(item.id);
            try {
                await item.onClick();
            } finally {
                setLoadingItemId(null);
                close();
            }
        },
        [close, loadingItemId],
    );

    const menu = (
        <div
            ref={menuRef}
            role="menu"
            aria-hidden={!isOpen}
            className={clsx(styles.menu, { [styles.open]: isOpen }, className)}
            style={{ top: coords.top, left: coords.left }}
        >
            {items.map((item) => {
                const isLoading = loadingItemId === item.id;
                const isBusy = loadingItemId !== null && !isLoading;
                return (
                    <button
                        key={item.id}
                        type="button"
                        role="menuitem"
                        disabled={item.isDisabled || isBusy || isLoading}
                        aria-busy={isLoading || undefined}
                        onClick={() => handleItemClick(item)}
                        className={clsx(styles.item, { [styles.danger]: item.variant === 'danger' })}
                    >
                        {isLoading ? (
                            <span className={clsx(styles.itemIcon, styles.itemIconLoading)}>
                                <FiLoader />
                            </span>
                        ) : (
                            item.icon && <span className={styles.itemIcon}>{item.icon}</span>
                        )}
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className={styles.wrapper}>
            <button
                ref={triggerRef}
                type="button"
                onClick={handleToggle}
                aria-label={ariaLabel}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                className={clsx(styles.trigger, triggerClassName)}
                data-ph={dataPh}
            >
                <BsThreeDotsVertical />
            </button>
            {mounted && createPortal(menu, document.body)}
        </div>
    );
};
