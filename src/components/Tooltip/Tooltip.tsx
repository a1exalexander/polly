'use client';

import clsx from 'clsx';
import { ReactNode, useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.css';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
    children: ReactNode;
    text: string;
    position?: TooltipPosition;
    className?: string;
}

const OFFSET = 8;

export const Tooltip = ({
    children,
    text,
    position = 'top',
    className,
}: TooltipProps) => {
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLSpanElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const calculatePosition = useCallback(() => {
        if (!triggerRef.current || !tooltipRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        let top = 0;
        let left = 0;

        switch (position) {
            case 'top':
                top = triggerRect.top - tooltipRect.height - OFFSET;
                left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = triggerRect.bottom + OFFSET;
                left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
                left = triggerRect.left - tooltipRect.width - OFFSET;
                break;
            case 'right':
                top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
                left = triggerRect.right + OFFSET;
                break;
        }

        setCoords({ top, left });
    }, [position]);

    const handleMouseEnter = useCallback(() => {
        setIsVisible(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsVisible(false);
    }, []);

    useEffect(() => {
        if (isVisible) {
            calculatePosition();
        }
    }, [isVisible, calculatePosition]);

    const tooltip = (
        <span
            ref={tooltipRef}
            className={clsx(styles.tooltip, styles[position], {
                [styles.visible]: isVisible,
            })}
            style={{ top: coords.top, left: coords.left }}
            role="tooltip"
        >
            {text}
        </span>
    );

    return (
        <div
            ref={triggerRef}
            className={clsx(styles.container, className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {mounted && createPortal(tooltip, document.body)}
        </div>
    );
};
