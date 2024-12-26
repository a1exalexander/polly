'use client';

import clsx from 'clsx';
import { FiLoader } from 'react-icons/fi';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import styles from './Button.module.css';

export interface ButtonProps {
    id?: string;
    className?: string;
    icon?: ReactNode;
    onClick?: () => void | Promise<void>;
    children?: ReactNode;
    ariaLabel?: string;
    isLoading?: boolean;
    isDisabled?: boolean;
    size?: 'xs' | 's' | 'm';
    variant?: 'primary' | 'secondary' | 'inverted' | 'ghost' | 'ghost-inverted' | 'danger' | 'danger-inverted';
    formAction?: ButtonHTMLAttributes<HTMLButtonElement>['formAction'];
    type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
    bordered?: boolean;
    "data-ph"?: string;
}

export const Button = ({
    id,
    isLoading,
    icon,
    className,
    onClick,
    children,
    isDisabled,
    type,
    formAction,
    variant = 'primary',
    ariaLabel,
    size = 'm',
    bordered,
    "data-ph": dataPh,
}: ButtonProps) => {
    const { pending } = useFormStatus();

    return (
        <button
            data-ph={dataPh}
            id={id}
            aria-label={ariaLabel}
            title={ariaLabel}
            disabled={isDisabled || isLoading}
            aria-disabled={pending}
            formAction={formAction}
            className={clsx(
                styles.button,
                {
                    [styles.isLoading]: pending || isLoading,
                    [styles.isOnlyIcon]: icon && !children,
                    [styles.isBordered]: bordered,
                },
                styles[variant],
                styles[size],
                className,
            )}
            type={type}
            onClick={onClick}>
            {(pending || isLoading) && <FiLoader className={styles.loader} />}
            {!!icon && <span className={styles.icon}>{icon}</span>}
            {children && <span className={styles.text}>{children}</span>}
        </button>
    );
};
