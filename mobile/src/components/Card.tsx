import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

// A webes `.card` osztály (resources/css/app.css @layer components) 1:1
// másolata, hogy a mobil felület vizuálisan konzisztens maradjon a webes appal.
export function Card({ children, className = '', ...rest }: CardProps) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`} {...rest}>
            {children}
        </div>
    );
}
