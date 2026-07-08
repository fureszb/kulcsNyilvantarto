import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function Card({ children, className = '', ...rest }: CardProps) {
    return (
        <div className={`card ${className}`} {...rest}>
            {children}
        </div>
    );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function CardHeader({ children, className = '', ...rest }: CardHeaderProps) {
    return (
        <div className={`px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between ${className}`} {...rest}>
            {children}
        </div>
    );
}
