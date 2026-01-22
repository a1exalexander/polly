'use client';

import clsx from 'clsx';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components';
import styles from './ConfirmModal.module.css';

export interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message?: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    isLoading?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
}

const ANIMATION_DURATION = 200;

export const ConfirmModal = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) => {
    const [mounted, setMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle open/close with animation
    useEffect(() => {
        if (isOpen) {
            // Store the currently focused element
            previousActiveElement.current = document.activeElement as HTMLElement;
            setShouldRender(true);
            // Small delay to trigger CSS transition
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsVisible(true);
                });
            });
        } else {
            setIsVisible(false);
            // Wait for animation to complete before unmounting
            const timer = setTimeout(() => {
                setShouldRender(false);
                // Restore focus to the previously focused element
                previousActiveElement.current?.focus();
            }, ANIMATION_DURATION);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Focus trap implementation
    const handleTabKey = useCallback((e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !modalRef.current) return;

        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const isActiveElementInModal = modalRef.current.contains(document.activeElement);

        // If focus is outside modal, bring it inside
        if (!isActiveElementInModal) {
            e.preventDefault();
            firstElement.focus();
            return;
        }

        if (e.shiftKey) {
            // Shift + Tab: if on first element, go to last
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab: if on last element, go to first
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isLoading) {
            onCancel();
        }
        handleTabKey(e);
    }, [onCancel, isLoading, handleTabKey]);

    // Set initial focus when modal opens
    useEffect(() => {
        if (isVisible && modalRef.current) {
            // Use setTimeout to ensure DOM is fully ready
            const timer = setTimeout(() => {
                const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
                    'button:not([disabled]), [href], input:not([disabled])'
                );
                firstFocusable?.focus();
            }, 10);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    useEffect(() => {
        if (shouldRender) {
            document.addEventListener('keydown', handleKeyDown);
            // Calculate scrollbar width and add padding to prevent layout shift
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.documentElement.style.setProperty('--scrollbar-compensation', `${scrollbarWidth}px`);
            document.documentElement.style.overflow = 'hidden';
            document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.documentElement.style.removeProperty('--scrollbar-compensation');
            document.documentElement.style.overflow = '';
            document.documentElement.style.paddingRight = '';
        };
    }, [shouldRender, handleKeyDown]);

    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            onCancel();
        }
    }, [onCancel, isLoading]);

    if (!mounted || !shouldRender) return null;

    const modal = (
        <div
            className={clsx(styles.overlay, { [styles.visible]: isVisible })}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
        >
            <div
                ref={modalRef}
                className={clsx(styles.modal, { [styles.visible]: isVisible })}
            >
                <h2 id="confirm-modal-title" className={styles.title}>
                    {title}
                </h2>
                {message && (
                    <div className={styles.message}>
                        {message}
                    </div>
                )}
                <div className={styles.actions}>
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                        isDisabled={isLoading}
                        size="m"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={onConfirm}
                        isLoading={isLoading}
                        size="m"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
};
