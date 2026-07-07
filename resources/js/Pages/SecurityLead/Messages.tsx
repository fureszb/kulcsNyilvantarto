import SecurityLeadLayout from '../../Layouts/SecurityLeadLayout';

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

interface InboxMessage {
    id: number;
    content: string;
    from_name: string;
    created_at: string;
    is_new: boolean;
}

interface Props {
    welcomeName: string;
    messages: InboxMessage[];
}

export default function SecurityLeadMessages({ messages }: Props) {
    return (
        <SecurityLeadLayout title="Igazgatói üzenetek">
            {/* Hero */}
            <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden rounded-2xl mb-8 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)', backgroundSize: '32px 32px' }}/>
                <div className="relative z-10 px-8 py-8 flex items-center justify-between gap-6">
                    <div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Biztonsági Vezető Portál</p>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Igazgatói üzenetek</h1>
                        <p className="text-slate-400 mt-1 text-sm">A területi igazgatódtól kapott üzenetek</p>
                    </div>
                    <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                        <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                    </div>
                </div>
                <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.038, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }}/>
            </div>

            <div className="space-y-3">
                {messages.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-400">
                        Még nem érkezett üzenet az igazgatótól.
                    </div>
                ) : messages.map(m => (
                    <div key={m.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${m.is_new ? 'border-blue-300 ring-1 ring-blue-200' : 'border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-purple-700">{m.from_name.charAt(0)}</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-700">{m.from_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {m.is_new && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">Új</span>
                                )}
                                <span className="text-[11px] text-slate-400">{m.created_at}</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    </div>
                ))}
            </div>
        </SecurityLeadLayout>
    );
}
