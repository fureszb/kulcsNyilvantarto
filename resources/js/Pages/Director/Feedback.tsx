import DirectorLayout from '../../Layouts/DirectorLayout';

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

interface FeedbackItem {
    id: number;
    content: string;
    created_at: string;
    is_new: boolean;
}

interface Props {
    welcomeName: string;
    feedback: FeedbackItem[];
    unreadCount: number;
}

export default function DirectorFeedback({ feedback }: Props) {
    return (
        <DirectorLayout title="Névtelen visszajelzések">
            {/* Hero */}
            <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden rounded-2xl mb-8 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                <div className="relative z-10 px-8 py-8 flex items-center justify-between gap-6">
                    <div>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Területi Igazgató Portál</p>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Névtelen visszajelzések</h1>
                        <p className="text-slate-400 mt-1 text-sm">A dolgozók által névtelenül beküldött visszajelzések</p>
                    </div>
                    <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                        <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                    </div>
                </div>
                <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.038, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }}/>
            </div>

            <div className="max-w-[73rem] mx-auto">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h2 className="font-bold text-slate-800">Beérkezett visszajelzések</h2>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{feedback.length} visszajelzés</span>
                    </div>

                    {feedback.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-400">
                            <svg className="w-10 h-10 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-sm font-medium">Még nem érkezett névtelen visszajelzés</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-50">
                            {feedback.map((f, i) => (
                                <li key={f.id} style={{ animationDelay: `${i * 45}ms` }} className="animate-fade-in px-6 py-5 hover:bg-slate-50/80 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <span className="text-sm font-semibold text-slate-800">Névtelen visszajelzés</span>
                                                {f.is_new && (
                                                    <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">Új</span>
                                                )}
                                                <span className="text-xs text-slate-400">{f.created_at}</span>
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{f.content}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </DirectorLayout>
    );
}
