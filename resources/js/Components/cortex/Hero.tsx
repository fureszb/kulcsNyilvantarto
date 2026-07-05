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
                  Filmes vignette a videó fölött (z-[5]) — lágy szélű sötétítés
                  a szöveg-zóna mögé, doboz nélkül. A fehér szöveg így a világos
                  videón is éles, a videó a széleken tiszta marad.
                */}
                <div className="cortex-scrim absolute inset-0 z-[5] pointer-events-none" />

                {/* Tartalom réteg */}
                <div className="relative z-10 w-full h-full flex flex-col items-center">
                    <Navbar />

                    {/* Szöveges konténer — doboz nélkül, tiszta tipográfia */}
                    <div className="w-full flex flex-col items-center pt-10 md:pt-16 px-6 text-center max-w-5xl">
                        <HeroBadge />

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="mt-4 font-normal text-white tracking-[-0.02em] leading-[1.06] text-[clamp(2rem,5vw,3.75rem)] [text-shadow:0_2px_30px_rgba(9,16,33,0.55)]"
                        >
                            Intelligens automatizáció.
                            <br />
                            <span className="cortex-accent">Transzparens védelem.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="mt-5 text-base md:text-lg text-white/80 leading-relaxed max-w-2xl mx-auto font-normal [text-shadow:0_1px_16px_rgba(9,16,33,0.5)]"
                        >
                            Autonóm vállalati rendszerek és kiberbiztonsági védvonalak a
                            legmagasabb szintű rendelkezésre állásra tervezve. A Cortex
                            Opsystems stabil, skálázható és intelligens digitális
                            infrastruktúrát biztosít a kritikus üzleti folyamatok mögé.
                        </motion.p>
                    </div>

                    <BottomLeftCard />
                    <BottomRightCorner />
                </div>
            </section>
        </div>
    );
}
