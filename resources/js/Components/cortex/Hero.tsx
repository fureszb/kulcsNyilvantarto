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
                  Olvashatósági scrim — a videó fölött, a tartalom alatt (z-[5]).
                  A sötét/szürke szövegek (navbar, hero) mögött világosít, hogy
                  bármilyen videón olvashatók legyenek; a középső sáv tisztább
                  marad, hogy a videó-élmény megmaradjon.
                */}
                <div className="absolute inset-0 z-[5] pointer-events-none bg-gradient-to-b from-[#f0f0f0]/85 via-[#f0f0f0]/25 via-45% to-[#f0f0f0]/45" />

                {/* Tartalom réteg */}
                <div className="relative z-10 w-full h-full flex flex-col items-center">
                    <Navbar />

                    {/* Szöveges konténer */}
                    <div className="w-full flex flex-col items-center pt-8 px-6 text-center max-w-4xl">
                        <HeroBadge />

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="cortex-legible text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-normal text-[#5E6470] mb-2 tracking-tight leading-[1.05]"
                        >
                            A jövő itt van.
                            <br />
                            Te élsz vele?
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="cortex-legible text-sm sm:text-base md:text-lg text-[#5E6470] opacity-90 leading-relaxed max-w-xl font-normal"
                        >
                            Automatizált vállalati rendszerek, golyóálló szoftverek és 24/7
                            biztonsági felügyelet — a Cortex Opsystems azt a hátteret adja,
                            amivel a vállalata nyugodtan nőhet.
                        </motion.p>
                    </div>

                    <BottomLeftCard />
                    <BottomRightCorner />
                </div>
            </section>
        </div>
    );
}
