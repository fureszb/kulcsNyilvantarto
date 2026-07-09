import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import { useOwnLayout } from '../../hooks/useOwnLayout';

declare function route(name: string, params?: unknown): string;

interface Props {
    title: string;
    subtitle?: string;
    icon: LucideIcon;
    children: ReactNode;
}

/** Közös hero + kártya-keret az összes dokumentum-létrehozó űrlaphoz — ugyanaz
 *  a vizuális nyelv, mint a Documents/Index.tsx és Show.tsx (sötét gradient
 *  hero, amber akcent, aurora blobok). */
export default function FormShell({ title, subtitle, icon: Icon, children }: Props) {
    const Layout = useOwnLayout();

    return (
        <Layout title={title}>
            <>
                <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-orange-700/10 rounded-full blur-3xl pointer-events-none" />
                    <div
                        className="absolute inset-0 opacity-[0.025] pointer-events-none"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)',
                            backgroundSize: '32px 32px',
                        }}
                    />
                    <div className="relative px-4 py-6 sm:px-8 sm:py-7 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3.5">
                            <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                                <Icon className="w-6 h-6 text-amber-300" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Új dokumentum</p>
                                <h1 className="text-xl font-extrabold text-white tracking-tight sm:text-2xl">{title}</h1>
                                {subtitle && <p className="text-slate-400 mt-1 text-sm">{subtitle}</p>}
                            </div>
                        </div>
                        <Link
                            href={route('documents.index')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Vissza
                        </Link>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-7">
                    {children}
                </div>
            </>
        </Layout>
    );
}
