import { motion } from 'motion/react';
import Navbar from './Navbar';
import HeroBadge from './HeroBadge';
import BottomLeftCard from './BottomLeftCard';
import BottomRightCorner from './BottomRightCorner';

interface HeroProps {
    /** Helyi videófájl elérési útja a public/ alól. */
    videoSrc?: string;
}

export default function Hero({ videoSrc = '/videos/hero-bg.mp4' }: HeroProps) {
    return (
        <div className="w-full h-screen flex items-center justify-center p-3 md:p-5 bg-[#f0f0f0]">
            <section className="relative w-full max-w-[1536px] h-full rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-none flex flex-col items-center bg-white/10 group">
                {/*
                  Videós háttér — helyi fájl a public/videos/ könyvtárból.
                  Csere: tegyél egy .mp4-et a public/videos/ alá (pl. a letöltött
                  Pixabay videót), és add át a Hero-nak: <Hero videoSrc="/videos/sajat.mp4" />
                */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover object-[65%] lg:object-center z-0"
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>

                {/*
                  Finom sötét vignette a videó fölött (z-[5]) — a fehéres
                  videó tónusát tompítja, hogy a glass-panelek éle és a
                  fehér szövegek elváljanak; a videó-élmény megmarad.
                */}
                <div className="absolute inset-0 z-[5] pointer-events-none bg-gradient-to-b from-black/25 via-black/5 to-black/15" />

                {/* Tartalom réteg */}
                <div className="relative z-10 w-full h-full flex flex-col items-center">
                    <Navbar />

                    {/* Szöveges konténer */}
                    <div className="w-full flex flex-col items-center pt-8 px-6 text-center max-w-4xl">
                        <HeroBadge />

                        {/* Sötét brand glass-panel — a fehéres videón is éles kontraszt */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.15 }}
                            className="mt-2 rounded-[1.6rem] md:rounded-[2.2rem] bg-[rgba(24,38,62,0.55)] backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/25 px-6 py-6 md:px-12 md:py-9"
                        >
                            <motion.h1
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.25 }}
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-normal text-white mb-3 tracking-tight leading-[1.05]"
                            >
                                Intelligens automatizáció.
                                <br />
                                Transzparens védelem.
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.45 }}
                                className="text-sm sm:text-base md:text-lg text-white/85 leading-relaxed max-w-xl mx-auto font-normal"
                            >
                                Autonóm vállalati rendszerek és kiberbiztonsági védvonalak a
                                legmagasabb szintű rendelkezésre állásra tervezve. A Cortex
                                Opsystems stabil, skálázható és intelligens digitális
                                infrastruktúrát biztosít a kritikus üzleti folyamatok mögé.
                            </motion.p>
                        </motion.div>
                    </div>

                    <BottomLeftCard />
                    <BottomRightCorner />
                </div>
            </section>
        </div>
    );
}
