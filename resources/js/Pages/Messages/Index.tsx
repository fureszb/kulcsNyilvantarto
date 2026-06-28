import { useState, useEffect } from 'react';
import { Link, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { getEcho } from '../../echo';
import type { PmMessage, PmMessageReply, PaginatedData, PageProps } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    messages: PaginatedData<PmMessage>;
}

function ReplyForm({ messageId, onSuccess }: { messageId: number; onSuccess: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({ content: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('messages.reply', messageId), {
            onSuccess: () => { reset(); onSuccess(); },
        });
    }

    return (
        <form onSubmit={submit} className="mt-3 flex gap-2 items-end">
            <div className="flex-1">
                <textarea
                    value={data.content}
                    onChange={e => setData('content', e.target.value)}
                    rows={2}
                    required
                    maxLength={2000}
                    placeholder="Írj választ a PM-nek…"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition resize-none"
                />
                {errors.content && <p className="text-xs text-rose-500 mt-1">{errors.content}</p>}
            </div>
            <button
                type="submit"
                disabled={processing || !data.content.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors shrink-0 cursor-pointer"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                {processing ? 'Küldés…' : 'Küldés'}
            </button>
        </form>
    );
}

function ReplyList({ replies }: { replies: PmMessageReply[] }) {
    if (replies.length === 0) return null;
    return (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
            {replies.map(r => (
                <div key={r.id} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-blue-600">{r.sender_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-700">{r.sender_name}</span>
                            <span className="text-[10px] text-slate-400">
                                {new Date(r.created_at).toLocaleString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{r.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function MessagesIndex({ messages }: Props) {
    const { props: { auth, tenant } } = usePage<PageProps>();
    const [openReplyId, setOpenReplyId] = useState<number | null>(null);

    useEffect(() => {
        if (!tenant?.slug || !auth.user?.id) return;
        const channel = getEcho(tenant.slug).private(`tenant.${tenant.slug}.${auth.user.id}`);
        channel.listen('.new-pm-message', () => router.reload({ only: ['messages'] }));
        return () => { channel.stopListening('.new-pm-message'); };
    }, [tenant?.slug, auth.user?.id]);

    return (
        <AppLayout title="PM üzenetek">
            <div className="max-w-7xl mx-auto space-y-5">

                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-orange-800/10 rounded-full blur-3xl pointer-events-none" />
                    <div
                        className="absolute inset-0 opacity-[0.025] pointer-events-none"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)',
                            backgroundSize: '32px 32px',
                        }}
                    />
                    <div className="relative px-8 py-7 flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Property Manager üzenetek</p>
                            <h1 className="text-2xl font-extrabold text-white tracking-tight">PM értesítések</h1>
                            <p className="text-slate-400 text-sm mt-1">Kérések és üzenetek a Property Managertől</p>
                        </div>
                        <Link
                            href={route('home')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Vissza
                        </Link>
                    </div>
                </div>

                {/* Üzenetlista */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="font-bold text-slate-800">Beérkezett üzenetek</h2>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{messages.total} üzenet</span>
                    </div>

                    {messages.data.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-400">
                            <svg className="w-10 h-10 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm font-medium">Nincs PM üzeneted</p>
                        </div>
                    ) : (
                        <>
                            <ul className="divide-y divide-slate-50">
                                {messages.data.map((message, i) => (
                                    <li key={message.id} style={{ animationDelay: `${i * 45}ms` }} className="animate-fade-in px-6 py-5 hover:bg-slate-50/80 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                                    <span className="text-sm font-semibold text-slate-800">{message.sent_by_name ?? 'Property Manager'}</span>
                                                    {message.send_to_all ? (
                                                        <span className="text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Mindenki</span>
                                                    ) : (
                                                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">Neked szól</span>
                                                    )}
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(message.created_at).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </span>
                                                    {(message.replies?.length ?? 0) > 0 && (
                                                        <span className="text-xs text-slate-400">{message.replies!.length} válasz</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{message.content}</p>

                                                <ReplyList replies={message.replies ?? []} />

                                                {openReplyId === message.id ? (
                                                    <ReplyForm
                                                        messageId={message.id}
                                                        onSuccess={() => setOpenReplyId(null)}
                                                    />
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenReplyId(message.id)}
                                                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                                                        </svg>
                                                        Válasz
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {messages.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-1">
                                    {messages.links.map((link, idx) => (
                                        link.url ? (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${link.active ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 bg-white border border-slate-200 cursor-default"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        </AppLayout>
    );
}
