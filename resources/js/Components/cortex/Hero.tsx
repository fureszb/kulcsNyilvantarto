import { motion } from 'motion/react';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';
import Navbar from './Navbar';

interface HeroProps {
    /** Helyi videófájl elérési útja a public/ alól. */
    videoSrc?: string;
}

const METRICS = [
    { value: '12.4K', label: 'Kezelt eszköz' },
    { value: '99.99%', label: 'Rendszer-uptime' },
    { value: '24/7', label: 'Aktív védelem' },
];

export default function Hero({ videoSrc = '/videos/hero-bg.mp4' }: HeroProps) {
    return (
        <div className="w-full h-screen flex items-center justify-center p-3 md:p-5 bg-[#f0f0f0]">
            <section className="relative w-full max-w-[1536px] h-full rounded-[1.5rem] md:rounded-[3rem] overflow-hidden flex flex-col bg-[#060b19] group">
                {/* Videós háttér — helyi fájl a public/videos/ könyvtárból. */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>

                {/*
                  Cinematic overlay: erős alulról-sötét gradiens (a szöveg mögött),
                  finom felső sötétítés a navbarhoz — a videó közepe tiszta marad.
                */}
                <div
                    className="absolute inset-0 z-[5] pointer-events-none"
                    style={{
                        background:
                            'linear-gradient(to top, #060b19 8%, rgba(6,11,25,0.94) 30%, rgba(6,11,25,0.6) 50%, rgba(6,11,25,0.12) 68%, rgba(6,11,25,0.5) 100%)',
                    }}
                />

                {/* Tartalom réteg */}
                <div className="relative z-10 w-full h-full flex flex-col">
                    <Navbar />

                    {/* Alulra igazított hero-szöveg */}
                    <div className="mt-auto w-full px-6 sm:px-10 lg:px-16 pb-8 sm:pb-10 lg:pb-14">
                        <div className="max-w-3xl">
                            {/* Eyebrow */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className="flex items-center gap-2.5 mb-5"
                            >
                                <span className="relative flex w-2 h-2" aria-hidden="true">
                                    <span className="absolute inline-flex w-full h-full rounded-full bg-cyan-400 opacity-60 animate-ping" />
                                    <span className="relative inline-flex w-2 h-2 rounded-full bg-cyan-400" />
                                </span>
                                <span className="text-[11px] sm:text-xs font-normal tracking-[0.22em] uppercase text-white/70">
                                    Cortex Opsystems
                                </span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="font-normal text-white tracking-[-0.02em] leading-[1.04] text-[clamp(2.2rem,5.5vw,4.5rem)]"
                            >
                                Intelligens automatizáció.
                                <br />
                                <span className="cortex-accent">Transzparens védelem.</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="mt-5 text-sm sm:text-base md:text-lg text-white/70 leading-relaxed max-w-xl font-normal"
                            >
                                Autonóm vállalati rendszerek és kiberbiztonsági védvonalak a
                                legmagasabb szintű rendelkezésre állásra tervezve — stabil,
                                skálázható infrastruktúra a kritikus üzleti folyamatok mögé.
                            </motion.p>

                            {/* CTA-k */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.45 }}
                                className="mt-7 flex flex-wrap items-center gap-3"
                            >
                                <a
                                    href="mailto:supportitsecurity@gmail.com?subject=Kapcsolatfelvétel%20—%20Cortex%20Opsystems"
                                    className="group/btn inline-flex items-center gap-2.5 bg-white text-[#060b19] rounded-full pl-5 pr-2 py-2 text-sm font-medium hover:bg-white/90 transition-colors"
                                >
                                    Kapcsolatfelvétel
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#060b19] text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </span>
                                </a>
                                <a
                                    href="/"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/25 text-white/90 pl-4 pr-5 py-2.5 text-sm font-medium hover:bg-white/10 hover:border-white/40 transition-colors backdrop-blur-sm"
                                >
                                    <LockKeyhole className="w-4 h-4" />
                                    Ügyfélkapu
                                </a>
                            </motion.div>

                            {/* Metrika-sor — inline, elegáns elválasztókkal */}
                            <motion.dl
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                className="mt-9 pt-6 border-t border-white/10 flex items-center gap-6 sm:gap-10"
                            >
                                {METRICS.map(m => (
                                    <div key={m.label} className="flex flex-col">
                                        <dt className="order-2 text-[10px] sm:text-xs text-white/50 tracking-wide mt-0.5">
                                            {m.label}
                                        </dt>
                                        <dd className="order-1 text-xl sm:text-2xl md:text-3xl font-normal text-white tracking-tight tabular-nums">
                                            {m.value}
                                        </dd>
                                    </div>
                                ))}
                            </motion.dl>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
