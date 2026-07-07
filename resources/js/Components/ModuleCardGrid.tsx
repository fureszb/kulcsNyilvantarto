import { Link } from '@inertiajs/react';

export interface ModuleCardDef {
    href: string;
    title: string;
    description: string;
    iconPath: string;
    accent: 'blue' | 'indigo' | 'amber' | 'teal' | 'orange' | 'rose';
    features: string[];
    actionLabel: string;
}

interface AccentConfig {
    iconBg: string;
    titleHover: string;
    gradient: string;
    shadow: string;
    border: string;
    footerText: string;
    arrowBg: string;
    arrowHover: string;
    arrowIcon: string;
    check: string;
}

const ACCENT: Record<string, AccentConfig> = {
    blue: {
        iconBg: 'bg-blue-50 border-blue-100 text-blue-600',
        titleHover: 'group-hover:text-blue-700',
        gradient: 'from-blue-600 to-blue-400',
        shadow: 'hover:shadow-blue-100/80',
        border: 'hover:border-blue-200',
        footerText: 'text-blue-600 group-hover:text-blue-700',
        arrowBg: 'bg-blue-50 border-blue-100',
        arrowHover: 'group-hover:bg-blue-600 group-hover:border-blue-600',
        arrowIcon: 'text-blue-500 group-hover:text-white',
        check: 'text-blue-400',
    },
    indigo: {
        iconBg: 'bg-indigo-50 border-indigo-100 text-indigo-600',
        titleHover: 'group-hover:text-indigo-700',
        gradient: 'from-indigo-600 to-violet-400',
        shadow: 'hover:shadow-indigo-100/80',
        border: 'hover:border-indigo-200',
        footerText: 'text-indigo-600 group-hover:text-indigo-700',
        arrowBg: 'bg-indigo-50 border-indigo-100',
        arrowHover: 'group-hover:bg-indigo-600 group-hover:border-indigo-600',
        arrowIcon: 'text-indigo-500 group-hover:text-white',
        check: 'text-indigo-400',
    },
    amber: {
        iconBg: 'bg-amber-50 border-amber-100 text-amber-600',
        titleHover: 'group-hover:text-amber-700',
        gradient: 'from-amber-500 to-amber-400',
        shadow: 'hover:shadow-amber-100/80',
        border: 'hover:border-amber-200',
        footerText: 'text-amber-600 group-hover:text-amber-700',
        arrowBg: 'bg-amber-50 border-amber-100',
        arrowHover: 'group-hover:bg-amber-500 group-hover:border-amber-500',
        arrowIcon: 'text-amber-500 group-hover:text-white',
        check: 'text-amber-400',
    },
    teal: {
        iconBg: 'bg-teal-50 border-teal-100 text-teal-600',
        titleHover: 'group-hover:text-teal-700',
        gradient: 'from-teal-600 to-teal-400',
        shadow: 'hover:shadow-teal-100/80',
        border: 'hover:border-teal-200',
        footerText: 'text-teal-600 group-hover:text-teal-700',
        arrowBg: 'bg-teal-50 border-teal-100',
        arrowHover: 'group-hover:bg-teal-600 group-hover:border-teal-600',
        arrowIcon: 'text-teal-500 group-hover:text-white',
        check: 'text-teal-400',
    },
    orange: {
        iconBg: 'bg-orange-50 border-orange-100 text-orange-600',
        titleHover: 'group-hover:text-orange-700',
        gradient: 'from-orange-500 to-orange-400',
        shadow: 'hover:shadow-orange-100/80',
        border: 'hover:border-orange-200',
        footerText: 'text-orange-600 group-hover:text-orange-700',
        arrowBg: 'bg-orange-50 border-orange-100',
        arrowHover: 'group-hover:bg-orange-500 group-hover:border-orange-500',
        arrowIcon: 'text-orange-500 group-hover:text-white',
        check: 'text-orange-400',
    },
    rose: {
        iconBg: 'bg-rose-50 border-rose-100 text-rose-600',
        titleHover: 'group-hover:text-rose-700',
        gradient: 'from-rose-600 to-rose-400',
        shadow: 'hover:shadow-rose-100/80',
        border: 'hover:border-rose-200',
        footerText: 'text-rose-600 group-hover:text-rose-700',
        arrowBg: 'bg-rose-50 border-rose-100',
        arrowHover: 'group-hover:bg-rose-500 group-hover:border-rose-500',
        arrowIcon: 'text-rose-500 group-hover:text-white',
        check: 'text-rose-400',
    },
};

function ModuleCard({ def, index }: { def: ModuleCardDef; index: number }) {
    const ac = ACCENT[def.accent];
    return (
        <div className="app-page-enter h-full" style={{ animationDelay: `${index * 90}ms` }}>
            <Link
                href={def.href}
                className={`group relative overflow-hidden border rounded-2xl shadow-sm hover:shadow-xl ${ac.shadow} ${ac.border} transition-shadow duration-300 flex flex-col h-full bg-white border-slate-200`}
            >
                <div className={`h-1 bg-gradient-to-r ${ac.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="p-6 flex flex-col flex-1">
                    <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center border ${ac.iconBg} transition-all duration-300`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={def.iconPath} />
                        </svg>
                    </div>
                    <h3 className={`text-base font-bold text-slate-900 ${ac.titleHover} transition-colors duration-200`}>{def.title}</h3>
                    <p className="text-slate-500 text-xs mt-1.5 flex-1 leading-relaxed">{def.description}</p>
                    <ul className="mt-3 space-y-1">
                        {def.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <svg className={`w-3 h-3 shrink-0 ${ac.check}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                                {f}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className={`text-xs font-semibold ${ac.footerText} transition-colors`}>{def.actionLabel}</span>
                        <div className={`w-7 h-7 rounded-full border flex items-center justify-center ${ac.arrowBg} ${ac.arrowHover} transition-all duration-300`}>
                            <svg className={`w-3.5 h-3.5 ${ac.arrowIcon} transition-all duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default function ModuleCardGrid({ modules }: { modules: ModuleCardDef[] }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((m, i) => <ModuleCard key={m.href} def={m} index={i} />)}
        </div>
    );
}
