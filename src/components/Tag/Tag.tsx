import clsx from 'clsx';
import React, { ReactNode } from 'react';
import styles from './Tag.module.css';

export interface TagProps {
    className?: string;
    children: ReactNode;
    checked?: boolean;
    value?: string;
    type?: 'info' | 'warning' | 'danger';
    onChange?: (value: string) => void;
    name?: string;
}

export const Tag = ({ className, children, checked, onChange, value, name, type = 'info' }: TagProps) => {
    const onClick = () => {
        if (value) {
            onChange?.(value);
        }
    };

    const tagClassName = clsx(styles.tag, styles[type]);

    if (value) {
        return (
            <label
                onClick={onClick}
                className={clsx(className, styles.label, { [styles.isChecked]: checked })}>
                <input required className={styles.input} type="radio" name={name} value={value} />
                <span className={tagClassName}>{children}</span>
            </label>
        );
    }

    return (
        <span className={clsx(className, styles.textTag, tagClassName)}>
            {children}
        </span>
    );
};
