import { motion } from 'motion/react';
import { KeyRound, ShieldCheck } from 'lucide-react';

/**
 * Bal alsó glassmorphic metrika-kártya.
 * A metrikák a platform valós működési területeit tükrözik:
 * kulcs/kártya-nyilvántartás, ellenőrzések, 24/7 biztonsági felügyelet.
 */
export default function BottomLeftCard() {
    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute bottom-28 right-4 left-auto md:left-6 md:right-auto md:bottom-6 lg:bottom-10 lg:left-10 p-3 md:p-4 lg:p-5 rounded-[1.2rem] md:rounded-[1.5rem] lg:rounded-[2.2rem] bg-white/55 backdrop-blur-xl border border-white/40 shadow-lg shadow-black/5 flex flex-col gap-2 lg:gap-3 min-w-[140px] md:min-w-[150px] lg:min-w-[180px] w-fit"
        >
            {/* Fő metrika */}
            <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white/50 shrink-0">
                    <KeyRound className="w-4 h-4 lg:w-[18px] lg:h-[18px] text-[rgba(30,50,90,0.9)]" />
                </span>
                <div className="flex flex-col leading-none">
                    <span className="text-xl md:text-2xl lg:text-3xl font-normal text-[rgb(30,40,60)] tracking-tight">
                        12.4K
                    </span>
                </div>
            </div>
            <p className="text-[11px] md:text-xs text-[rgba(30,40,60,0.75)] font-normal leading-snug">
                Kezelt vállalati eszköz
                <br />
                <span className="opacity-70">kulcsok · kártyák · ellenőrzések</span>
            </p>

            {/* Élő biztonsági státusz */}
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/30">
                <span className="relative flex w-2 h-2 shrink-0" aria-hidden="true">
                    <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                    <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[10px] md:text-[11px] text-[rgba(30,40,60,0.8)] font-normal flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Élő biztonsági státusz — 24/7
                </span>
            </div>
        </motion.div>
    );
}
