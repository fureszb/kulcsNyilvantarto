import type { ReactNode } from 'react';

type Tone = 'blue' | 'emerald' | 'indigo' | 'amber' | 'slate' | 'red' | 'teal';

const TONE_CLASSES: Record<Tone, { bg: string; icon: string }> = {
    blue:    { bg: 'bg-blue-50 border-blue-100',       icon: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50 border-emerald-100', icon: 'text-emerald-600' },
    indigo:  { bg: 'bg-indigo-50 border-indigo-100',   icon: 'text-indigo-600' },
    amber:   { bg: 'bg-amber-50 border-amber-100',     icon: 'text-amber-600' },
    slate:   { bg: 'bg-slate-100 border-slate-200',    icon: 'text-slate-600' },
    red:     { bg: 'bg-red-50 border-red-100',         icon: 'text-red-600' },
    teal:    { bg: 'bg-teal-50 border-teal-100',       icon: 'text-teal-600' },
};

interface IconBadgeProps {
    tone: Tone;
    size?: 'sm' | 'md';
    children: ReactNode;
    className?: string;
}

// Ismétlődő "színes ikon-jelvény" minta (stat kártyák, gyorsműveletek) egy
// helyen — a tone csak a MÁR élő bg/border/text árnyalatokat nevesíti.
export function IconBadge({ tone, size = 'md', children, className = '' }: IconBadgeProps) {
    const t = TONE_CLASSES[tone];
    const sizeCss = size === 'md' ? 'w-12 h-12 rounded-2xl' : 'w-8 h-8 rounded-xl';
    return (
        <div className={`${sizeCss} border flex items-center justify-center shrink-0 ${t.bg} ${t.icon} ${className}`}>
            {children}
        </div>
    );
}
