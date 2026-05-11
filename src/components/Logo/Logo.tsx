export interface LogoProps {
    size?: number;
    className?: string;
    'aria-hidden'?: boolean;
}

export const Logo = ({ size = 28, className, ...rest }: LogoProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...rest}
        >
            <circle cx="16" cy="16" r="14" fill="var(--cool)" />
            <circle cx="22" cy="13" r="6" fill="var(--warm)" />
            <circle cx="14" cy="20" r="4" fill="white" />
        </svg>
    );
};
