import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
    KeyRound, GraduationCap, Trophy, MessageSquare, Send, Bot, ShieldCheck, CalendarClock,
    Phone, ChevronRight, Bell, LogOut, Menu, X, Building2, User,
} from 'lucide-react';

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

// A valós Portal.tsx nav-linkjei
const NAV_LINKS = ['Kezdőlap', 'Napi Jelentés', 'Váltóüzenetek', 'PM üzenetek', 'AI', 'Vezénylés'];

// A valós Portal.tsx "Helyszínek a házban" widget mintaadatai
const LOCATIONS = [
    { name: 'H2O Offices — A épület', items: 24 },
    { name: 'H2O Offices — B épület', items: 18 },
    { name: 'Duna Tower', items: 31 },
    { name: 'Vízpart Irodaház', items: 12 },
];

// A valós Portal.tsx ALL_MODULES listája — ugyanaz a 8 modul, Komoot-paletta szerint tónusozva
const MODULES = [
    { icon: KeyRound, color: '#3b6e91', title: 'Kulcsnyilvántartó', desc: 'Kulcsok és belépőkártyák jelenlétének ellenőrzése helyszínenként.', features: ['Helyszínenkénti áttekintés', 'Gyors státusz ellenőrzés', 'Ellenőrzési előzmények'], cta: 'Ellenőrzés indítása' },
    { icon: GraduationCap, color: '#7c6fd4', title: 'Oktatások', desc: 'Interaktív képzési anyagok és oktatások elvégzése.', features: ['Interaktív tananyagok', 'Tudásellenőrző tesztek', 'Haladási nyomkövetés'], cta: 'Oktatások megtekintése' },
    { icon: Trophy, color: '#b45309', title: 'Vizsgák', desc: 'Tudáspróba vizsgák elvégzése eredményértékeléssel.', features: ['Tudáspróba vizsgák', 'Eredményértékelés', 'Vizsgaelőzmények'], cta: 'Vizsgák megtekintése' },
    { icon: MessageSquare, color: '#0d9488', title: 'Váltóüzenetek', desc: 'Privát üzenetek kollégák között műszakváltáskor.', features: ['Privát üzenetváltás', 'Műszakváltási jegyzetek', 'Olvasatlan jelzők'], cta: 'Üzenetek megtekintése' },
    { icon: Send, color: '#c2652b', title: 'PM üzenetek', desc: 'A Property Manager kérései és értesítései neked.', features: ['PM értesítések', 'Feladatkövetés', 'Válaszlehetőség'], cta: 'Üzenetek megnyitása' },
    { icon: Bot, color: '#7c6fd4', title: 'AI Asszisztens', desc: 'Töltsön fel dokumentumokat, és kérdezzen rájuk.', features: ['Dokumentum-tudásbázis', 'Valós idejű AI chat', 'Forrásmegjelölés'], cta: 'Chat megnyitása' },
    { icon: ShieldCheck, color: '#a13f4c', title: 'Napi Jelentés', desc: 'Biztonsági szolgálat napi jelentésének digitális kitöltése.', features: ['Napi biztonsági jelentés', 'Digitális aláírás', 'Jelentési előzmények'], cta: 'Jelentés kitöltése' },
    { icon: CalendarClock, color: '#5c6e35', title: 'Vezénylés', desc: 'Havi beosztás rögzítése és a 24 órás szolgálatok pótlásának tervezése.', features: ['Havi beosztás-tábla', 'Túlóra-pótlás tervezés', 'Változásnapló'], cta: 'Vezénylés megnyitása' },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

function LiveClock() {
    const [time, setTime] = useState('');
    useEffect(() => {
        const tick = () => setTime(new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }));
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
    }, []);
    return <span className="text-xs font-semibold text-[#64748b] tabular-nums hidden sm:inline">{time}</span>;
}

function CountUp({ target, duration = 900 }: { target: number; duration?: number }) {
    const [val, setVal] = useState(0);
    const started = useRef(false);
    useEffect(() => {
        if (started.current) return;
        started.current = true;
        let start: number | null = null;
        function step(ts: number) {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            setVal(Math.round(p * target));
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }, [target, duration]);
    return <>{val}</>;
}

export default function KomootPortal() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] antialiased" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
            <title>Kezdőlap — demo (Komoot stílus)</title>

            {/* ── Sticky nav (a valós Portal.tsx fejléce, Komoot "app-mode" stílusban) ── */}
            <header className="sticky top-0 z-30 bg-[#f8fafc]/90 backdrop-blur-md border-b border-[#e2e8f0]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
                    <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-2 shrink-0">
                        <div className="w-7 h-7 rounded-full bg-[#5c6e35] flex items-center justify-center">
                            <KeyRound className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="font-extrabold text-[#0f172a] hidden sm:block">kulcsnyilvántartó</span>
                    </a>

                    <nav className="hidden lg:flex items-center gap-1">
                        {NAV_LINKS.map((l, i) => (
                            <a key={l} href="#" onClick={e => e.preventDefault()}
                                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${i === 0 ? 'bg-[#e9e4d4] text-[#0f172a]' : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]'}`}>
                                {l}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 shrink-0">
                        <LiveClock />
                        <button className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-[#64748b] hover:bg-[#f1f5f9] transition-colors">
                            <Bell className="w-4 h-4" />
                        </button>
                        <a href="#" onClick={e => e.preventDefault()} className="hidden sm:flex items-center gap-1.5 bg-white border border-[#e2e8f0] rounded-full pl-1 pr-3 py-1 hover:bg-[#f1f5f9] transition-colors">
                            <div className="w-6 h-6 rounded-full bg-[#c8d96f] flex items-center justify-center">
                                <User className="w-3.5 h-3.5 text-[#1b2a15]" />
                            </div>
                            <span className="text-xs font-semibold text-[#0f172a]">Kovács Anna</span>
                        </a>
                        <button className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-[#64748b] hover:bg-[#f1f5f9] transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                        <button onClick={() => setMobileOpen(o => !o)} className="lg:hidden p-2 text-[#0f172a]">
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                {mobileOpen && (
                    <div className="lg:hidden px-4 pb-3 flex flex-col gap-1 border-t border-[#e2e8f0]">
                        {NAV_LINKS.map(l => (
                            <a key={l} href="#" onClick={e => e.preventDefault()} className="text-[#0f172a] text-sm py-2.5 border-b border-[#e2e8f0]">{l}</a>
                        ))}
                    </div>
                )}
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

                {/* ── Hero (üdvözlés + statisztika-chipek, mint a valós Portal.tsx-en) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="relative overflow-hidden rounded-3xl mb-6 shadow-sm"
                    style={{ background: 'linear-gradient(135deg,#0d1829 0%,#0f1f3d 40%,#0d1829 100%)' }}
                >
                    <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full blur-3xl pointer-events-none aurora-blob-1" style={{ background: 'rgba(37,99,235,0.45)' }} />
                    <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full blur-3xl pointer-events-none aurora-blob-2" style={{ background: 'rgba(13,58,105,0.5)' }} />
                    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.05, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }} />

                    <div className="relative z-10 px-8 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div>
                            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="relative inline-flex">
                                    <span className="absolute -inset-1.5 rounded-full bg-[#c8d96f]/50 animate-ping" />
                                    <span className="relative inline-block w-2.5 h-2.5 rounded-full bg-[#c8d96f]" />
                                </span>
                                Üdvözlöm, Kovács Anna
                            </p>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">H2O Offices</h1>
                            <p className="text-white/60 mt-2 text-sm">Válasszon modult a folytatáshoz</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-3 bg-white/[0.12] border border-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
                                <div className="w-8 h-8 rounded-lg bg-[#3b6e91]/25 border border-[#3b6e91]/40 flex items-center justify-center shrink-0">
                                    <KeyRound className="w-4 h-4 text-[#7fb1d6]" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/50 leading-none mb-1">Ma ellenőrzött</p>
                                    <p className="text-xl font-extrabold text-white leading-none"><CountUp target={7} /></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/[0.12] border border-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
                                <div className="w-8 h-8 rounded-lg bg-[#7c6fd4]/25 border border-[#7c6fd4]/40 flex items-center justify-center shrink-0">
                                    <GraduationCap className="w-4 h-4 text-[#b3a9f0]" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/50 leading-none mb-1">Elvégzett oktatás</p>
                                    <p className="text-xl font-extrabold text-white leading-none"><CountUp target={12} /></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/[0.12] border border-[#c2652b]/40 backdrop-blur-sm rounded-2xl px-4 py-3">
                                <div className="w-8 h-8 rounded-lg bg-[#c2652b]/25 border border-[#c2652b]/40 flex items-center justify-center shrink-0">
                                    <Send className="w-4 h-4 text-[#f2a97c]" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/50 leading-none mb-1">Olvasatlan</p>
                                    <p className="text-xl font-extrabold text-[#f2a97c] leading-none"><CountUp target={3} /></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── Vészhelyzeti kapcsolatok sáv (mint a valós Portal.tsx-en) ── */}
                <motion.button
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="group w-full flex items-center gap-4 bg-white border border-[#e2e8f0] rounded-2xl shadow-sm px-5 py-4 mb-6 hover:border-[#a13f4c]/40 hover:shadow-md transition-all duration-200 text-left"
                >
                    <div className="w-10 h-10 rounded-xl bg-[#a13f4c]/10 flex items-center justify-center shrink-0 group-hover:bg-[#a13f4c]/15 transition-colors">
                        <Phone className="w-5 h-5 text-[#a13f4c]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#0f172a]">Értesítési lista</p>
                        <p className="text-xs text-[#94a3b8] mt-0.5">Kattintson a vészhelyzeti kapcsolatok megtekintéséhez</p>
                    </div>
                    <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-[#f8fafc] text-[#64748b] text-[10px] font-semibold">6 kapcsolat</span>
                    <div className="w-7 h-7 rounded-full border border-[#e2e8f0] flex items-center justify-center group-hover:bg-[#a13f4c] group-hover:border-[#a13f4c] transition-all">
                        <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-white transition-colors" />
                    </div>
                </motion.button>

                {/* ── Helyszínek a házban (mint a valós LocationGrid widget) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden mb-8"
                >
                    <div className="px-5 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#94a3b8]" />
                            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Helyszínek a házban</span>
                        </div>
                        <span className="text-xs text-[#94a3b8] tabular-nums">{LOCATIONS.length} helyszín</span>
                    </div>
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {LOCATIONS.map((loc, i) => (
                            <motion.div
                                key={loc.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.2 + i * 0.05 }}
                                className="group rounded-2xl border border-[#e2e8f0] bg-white p-4 flex flex-col gap-2.5 hover:shadow-md hover:-translate-y-0.5 hover:border-[#5c6e35]/40 transition-all duration-200 cursor-pointer"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="w-9 h-9 rounded-xl bg-[#f1f5f9] flex items-center justify-center shrink-0">
                                        <Building2 className="w-4 h-4 text-[#5c6e35]" />
                                    </div>
                                    <span className="text-[10px] font-semibold text-[#94a3b8] bg-[#f8fafc] px-2 py-0.5 rounded-full whitespace-nowrap">{loc.items} db</span>
                                </div>
                                <p className="text-sm font-bold text-[#0f172a] leading-snug">{loc.name}</p>
                                <div className="flex items-center justify-between mt-auto pt-0.5">
                                    <span className="text-[10px] font-semibold text-[#5c6e35] uppercase tracking-wide">Részletek</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#5c6e35] transition-colors" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Modulok (mind a 8, mint a valós Portal.tsx bento gridjén) ── */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-[#64748b] uppercase tracking-wider">Modulok</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
                    {MODULES.map((m, i) => (
                        <motion.div
                            key={m.title}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-60px' }}
                            variants={fadeUp}
                            transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
                            className="group bg-white border border-[#e2e8f0] rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col p-7"
                        >
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: `${m.color}15`, border: `1px solid ${m.color}30` }}>
                                <m.icon className="w-6 h-6" style={{ color: m.color }} strokeWidth={1.75} />
                            </div>
                            <h3 className="text-lg font-bold text-[#0f172a]">{m.title}</h3>
                            <p className="text-sm text-[#64748b] mt-2 flex-1 leading-relaxed">{m.desc}</p>
                            <ul className="mt-4 space-y-1.5">
                                {m.features.map(f => (
                                    <li key={f} className="flex items-center gap-2 text-xs text-[#94a3b8]">
                                        <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-5 pt-4 border-t border-[#f1f5f9] flex items-center justify-between">
                                <span className="text-sm font-semibold" style={{ color: m.color }}>{m.cta}</span>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all" style={{ backgroundColor: `${m.color}15`, border: `1px solid ${m.color}30` }}>
                                    <ChevronRight className="w-4 h-4" style={{ color: m.color }} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* ── Footer (mint a valós Portal.tsx-en) ── */}
            <footer className="bg-[#0f172a] px-4 sm:px-6 py-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#5c6e35]/25 border border-[#5c6e35]/35 flex items-center justify-center shrink-0">
                            <KeyRound className="w-4 h-4 text-[#c8d96f]" />
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-white block">H2O Offices</span>
                            <span className="text-xs text-white/40">&copy; 2026</span>
                        </div>
                    </div>
                    <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-white transition-colors">
                        <Send className="w-4 h-4 shrink-0" />
                        support@kulcsnyilvantarto.hu
                    </a>
                </div>
            </footer>
        </div>
    );
}
