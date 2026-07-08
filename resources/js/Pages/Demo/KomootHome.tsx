import { useState } from 'react';
import { motion } from 'motion/react';
import {
    KeyRound, LayoutGrid, Send, Sparkles, ChevronDown,
    GraduationCap, Trophy, ShieldCheck, CalendarClock,
    MessageSquare, Bot, Check, Menu, X,
} from 'lucide-react';

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")";

const NAV_LINKS = ['Kezdőlap', 'Ellenőrzés', 'Oktatás', 'Funkciók', 'Újdonságok'];

const WHY_ITEMS = [
    {
        icon: KeyRound,
        color: '#3b82f6',
        title: 'Útmutatás, ami tényleg elvezet',
        desc: 'Egy helyen minden kulcs, kártya és eszköz — a rendszer mindig tudja, hol tartasz.',
    },
    {
        icon: LayoutGrid,
        color: '#0d9488',
        title: 'Milliméterre pontos áttekintés',
        desc: 'Tervezd meg az ellenőrzést helyszínenként, tételre lebontva, részletes státusszal.',
    },
    {
        icon: Send,
        color: '#b45309',
        title: 'Egy kattintásos jelentés',
        desc: 'Nincs internet? Nem gond. A jelentés akkor is elkészül, és később szinkronizál.',
    },
    {
        icon: Sparkles,
        color: '#7c3aed',
        title: 'Fedezd fel a rendszer rejtett zugait',
        desc: 'AI asszisztens, oktatási anyagok és statisztikák — mind a felszín alatt várnak.',
    },
];

const MODULES = [
    { icon: KeyRound, label: 'Ellenőrzés', desc: 'Kulcsok és kártyák' },
    { icon: GraduationCap, label: 'Oktatás', desc: 'Interaktív tananyagok' },
    { icon: Trophy, label: 'Vizsga', desc: 'Tudáspróba' },
    { icon: ShieldCheck, label: 'Napi Jelentés', desc: 'Biztonsági szolgálat' },
    { icon: CalendarClock, label: 'Vezénylés', desc: 'Havi beosztás' },
    { icon: MessageSquare, label: 'Üzenetek', desc: 'Csapat-kommunikáció' },
    { icon: Bot, label: 'AI Asszisztens', desc: 'Dokumentum-alapú chat' },
];

const PRO_FEATURES = [
    'Korlátlan helyszín', 'Valós idejű riportok',
    'Több irodaházas nézet', 'Élő státusz-térkép',
    'Automatikus emlékeztetők', 'Egyedi jogosultság-szintek',
    'Havi teljesítmény-export', 'Prioritásos support',
];

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
};

export default function KomootHome() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f5f3ee] text-[#22321a] antialiased" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
            <title>KulcsNyilvántartó — demo (Komoot stílus)</title>

            {/* ── Hero ─────────────────────────────────────────── */}
            <header className="relative overflow-hidden min-h-[92vh] flex flex-col" style={{ background: 'linear-gradient(180deg,#1b2a15 0%,#24361c 45%,#152112 100%)' }}>
                <div className="absolute -top-32 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl pointer-events-none aurora-blob-1" style={{ background: 'rgba(120,150,60,0.28)' }} />
                <div className="absolute -bottom-40 -right-24 w-[30rem] h-[30rem] rounded-full blur-3xl pointer-events-none aurora-blob-2" style={{ background: 'rgba(60,90,40,0.35)' }} />
                <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.05, backgroundImage: NOISE_BG, backgroundSize: '180px 180px', mixBlendMode: 'screen' }} />

                {/* Nav */}
                <nav className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-5">
                    <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-2 shrink-0">
                        <div className="w-7 h-7 rounded-full bg-[#c8d96f] flex items-center justify-center">
                            <KeyRound className="w-4 h-4 text-[#1b2a15]" strokeWidth={2.5} />
                        </div>
                        <span className="text-white font-extrabold text-lg tracking-tight">kulcsnyilvántartó</span>
                    </a>

                    <div className="hidden lg:flex items-center gap-8">
                        {NAV_LINKS.map(l => (
                            <a key={l} href="#" onClick={e => e.preventDefault()} className="text-sm text-white/80 hover:text-white transition-colors">{l}</a>
                        ))}
                    </div>

                    <div className="hidden sm:flex items-center gap-2.5">
                        <a href="#" onClick={e => e.preventDefault()} className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/15 transition-colors">App</a>
                        <a href="#" onClick={e => e.preventDefault()} className="px-4 py-2 rounded-full bg-[#5c6e35] text-white text-sm font-semibold hover:bg-[#4d5c2c] transition-colors">Bejelentkezés / Regisztráció</a>
                    </div>

                    <button onClick={() => setMobileOpen(o => !o)} className="sm:hidden text-white p-2">
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </nav>

                {mobileOpen && (
                    <div className="relative z-20 lg:hidden px-6 pb-4 flex flex-col gap-1">
                        {NAV_LINKS.map(l => (
                            <a key={l} href="#" onClick={e => e.preventDefault()} className="text-white/85 text-sm py-2 border-b border-white/10">{l}</a>
                        ))}
                        <a href="#" onClick={e => e.preventDefault()} className="mt-3 text-center px-4 py-2.5 rounded-full bg-[#5c6e35] text-white text-sm font-semibold">Bejelentkezés / Regisztráció</a>
                    </div>
                )}

                {/* Hero content */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-16">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-6">
                        <svg width="52" height="46" viewBox="0 0 52 46" fill="none">
                            <path d="M26 2 L48 42 H4 Z" fill="#c8d96f" />
                        </svg>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                        className="text-white font-extrabold tracking-tight leading-[1.05] text-[clamp(2.4rem,6vw,4.75rem)] max-w-4xl"
                    >
                        Tartsa kézben,<br />ami számít.
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.35 }}
                        className="mt-8 flex flex-wrap items-center justify-center gap-3"
                    >
                        <a href="#" onClick={e => e.preventDefault()} className="px-6 py-3 rounded-full bg-[#f5f3ee] text-[#1b2a15] font-bold text-sm hover:bg-white transition-colors">Regisztráció ingyen</a>
                        <a href="#" onClick={e => e.preventDefault()} className="px-6 py-3 rounded-full bg-[#5c6e35] text-white font-bold text-sm hover:bg-[#4d5c2c] transition-colors">Bejelentkezés</a>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.55 }}
                        className="mt-6 text-[11px] font-bold tracking-[0.25em] uppercase text-white/50"
                    >
                        Merre járna ma?
                    </motion.p>
                </div>

                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-10 flex justify-center pb-6"
                >
                    <ChevronDown className="w-6 h-6 text-white/40" />
                </motion.div>
            </header>

            {/* ── Miért szeretik ─────────────────────────────────── */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={fadeUp}
                transition={{ duration: 0.6 }}
                className="max-w-5xl mx-auto px-6 py-20 sm:py-28"
            >
                <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight mb-14">
                    Miért szeretik ezt <span className="whitespace-nowrap">12 000+ munkatársak</span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-x-10 gap-y-10">
                    {WHY_ITEMS.map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-60px' }}
                            variants={fadeUp}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className="flex gap-4"
                        >
                            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}1a` }}>
                                <item.icon className="w-5 h-5" style={{ color: item.color }} strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#22321a] leading-snug">{item.title}</h3>
                                <p className="text-sm text-[#5b6952] mt-1 leading-relaxed">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
                <div className="text-center mt-14">
                    <a href="#" onClick={e => e.preventDefault()} className="inline-flex px-7 py-3.5 rounded-full bg-[#5c6e35] text-white font-bold text-sm hover:bg-[#4d5c2c] transition-colors">Kezdje ingyen</a>
                </div>
            </motion.section>

            {/* ── Modulok sáv ──────────────────────────────────────── */}
            <section className="bg-white/60 border-y border-[#e4e0d3] py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.h2
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
                        className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight mb-12"
                    >
                        Válassza ki a folytatáshoz
                    </motion.h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {MODULES.map((m, i) => (
                            <motion.div
                                key={m.label}
                                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeUp}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                className="bg-white rounded-2xl border border-[#e4e0d3] p-5 flex flex-col items-center text-center gap-2.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                            >
                                <div className="w-11 h-11 rounded-xl bg-[#eef1e2] flex items-center justify-center">
                                    <m.icon className="w-5 h-5 text-[#5c6e35]" strokeWidth={1.75} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-[#22321a]">{m.label}</p>
                                    <p className="text-xs text-[#8a9478] mt-0.5">{m.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Premium-stílusú upsell ───────────────────────────── */}
            <motion.section
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
                className="max-w-5xl mx-auto px-6 py-20 sm:py-28"
            >
                <div className="text-center mb-3 flex items-center justify-center gap-2 text-sm font-bold text-[#7c6fd4]">
                    <Sparkles className="w-4 h-4" /> Prémium
                </div>
                <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight mb-10">Azoknak, akik tovább mennének</h2>

                <div className="rounded-3xl overflow-hidden grid sm:grid-cols-2 shadow-sm" style={{ background: '#e9e4fb' }}>
                    <div className="p-8 sm:p-10 flex flex-col justify-center">
                        <p className="text-sm text-[#4a4470] leading-relaxed mb-6">A legjobb ellenőrzések azok, amik sosem érnek véget. Mostantól nem is kell.</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-8">
                            {PRO_FEATURES.map(f => (
                                <div key={f} className="flex items-center gap-2 text-sm text-[#332f52]">
                                    <Check className="w-3.5 h-3.5 text-[#7c6fd4] shrink-0" />
                                    {f}
                                </div>
                            ))}
                        </div>
                        <a href="#" onClick={e => e.preventDefault()} className="w-fit px-6 py-3 rounded-full bg-[#7c6fd4] text-white font-bold text-sm hover:bg-[#6a5ec2] transition-colors">Indítsa el az ingyenes próbát</a>
                    </div>
                    <div className="relative min-h-[260px]" style={{ background: 'linear-gradient(160deg,#f2a75c 0%,#e88a4a 55%,#7c6fd4 100%)' }}>
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: NOISE_BG, backgroundSize: '160px 160px', mixBlendMode: 'overlay' }} />
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                    <div className="rounded-2xl border border-[#e4e0d3] bg-white p-5">
                        <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-sm">Alap csomag</p>
                            <span className="text-xs font-semibold text-[#8a9478]">Ingyenes</span>
                        </div>
                        <p className="text-xs text-[#8a9478] mb-4">Egy irodaházhoz</p>
                        <button className="w-full py-2.5 rounded-xl border border-[#e4e0d3] text-sm font-semibold text-[#22321a] hover:bg-[#f5f3ee] transition-colors">Kiválasztás</button>
                    </div>
                    <div className="rounded-2xl border-2 border-[#5c6e35] bg-white p-5 relative">
                        <span className="absolute -top-2.5 right-5 bg-[#f2a75c] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Legnépszerűbb</span>
                        <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-sm">Prémium csomag</p>
                            <span className="text-xs font-semibold text-[#5c6e35]">Egyedi árazás</span>
                        </div>
                        <p className="text-xs text-[#8a9478] mb-4">Korlátlan irodaház</p>
                        <button className="w-full py-2.5 rounded-xl bg-[#5c6e35] text-sm font-bold text-white hover:bg-[#4d5c2c] transition-colors">Kapcsolatfelvétel</button>
                    </div>
                </div>
            </motion.section>

            {/* ── Footer CTA ───────────────────────────────────────── */}
            <footer className="bg-[#1b2a15] text-center py-20 px-6">
                <motion.h2
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
                    className="text-white font-extrabold tracking-tight text-[clamp(2rem,5vw,3.5rem)] leading-tight"
                >
                    12 000 munkatárs,<br />plusz Ön.
                </motion.h2>
                <p className="text-white/50 text-sm mt-4">Néhány másodperc az egész, és kezdheti is.</p>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                    <a href="#" onClick={e => e.preventDefault()} className="px-6 py-3 rounded-full bg-[#f5f3ee] text-[#1b2a15] font-bold text-sm hover:bg-white transition-colors">Regisztráció ingyen</a>
                    <a href="#" onClick={e => e.preventDefault()} className="px-6 py-3 rounded-full border border-white/25 text-white font-bold text-sm hover:bg-white/10 transition-colors">Kapcsolatfelvétel</a>
                </div>
                <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/35 max-w-4xl mx-auto">
                    <span>KulcsNyilvántartó Kft. · Kulcs &amp; Kártya Nyilvántartó Rendszer</span>
                    <span>support@kulcsnyilvantarto.hu</span>
                </div>
            </footer>
        </div>
    );
}
