import { motion } from 'motion/react';
import { LockKeyhole, FileSearch } from 'lucide-react';

/**
 * Jobb alsó "kivágott" sarok-panel a faux-cutout SVG ívekkel.
 * Az akciócélok a munkaterület valós platform-interakciói:
 * Ügyfélkapu (a meglévő szervezetválasztó belépés) és Technikai audit.
 */
export default function BottomRightCorner() {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute bottom-0 right-0 p-3 pt-5 pl-8 sm:p-4 sm:pt-6 sm:pl-10 md:p-6 md:pt-8 md:pl-14 bg-[#f0f0f0] rounded-tl-[1.5rem] sm:rounded-tl-[2rem] md:rounded-tl-[3.5rem] flex items-center gap-3 sm:gap-4 md:gap-6"
        >
            {/* Faux-cutout ív — a panel FELETT, a jobb szélhez simulva */}
            <svg
                className="absolute -top-6 right-0 w-6 h-6 sm:-top-8 sm:w-8 sm:h-8 md:-top-10 md:w-10 md:h-10"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d="M24 0v24H0c13.255 0 24-10.745 24-24Z" fill="#f0f0f0" />
            </svg>
            {/* Faux-cutout ív — a paneltől BALRA, az alsó szélhez simulva */}
            <svg
                className="absolute bottom-0 -left-6 w-6 h-6 sm:-left-8 sm:w-8 sm:h-8 md:-left-10 md:w-10 md:h-10"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d="M24 0v24H0c13.255 0 24-10.745 24-24Z" fill="#f0f0f0" />
            </svg>

            {/* Ügyfélkapu — a meglévő szervezetválasztó belépésre visz */}
            <a href="/" className="flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer">
                <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-[rgba(30,50,90,0.9)] text-white group-hover:bg-[rgba(30,50,90,1)] transition-colors shadow-md"
                >
                    <LockKeyhole className="w-5 h-5 md:w-6 md:h-6" />
                </motion.span>
                <span className="text-[10px] sm:text-[11px] md:text-xs font-normal text-[rgb(45,45,45)]">
                    Ügyfélkapu
                </span>
            </a>

            {/* Technikai audit — kapcsolatfelvétel */}
            <a
                href="mailto:supportitsecurity@gmail.com?subject=Technikai%20audit%20igény"
                className="flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer"
            >
                <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white text-[rgba(30,50,90,0.9)] border border-[rgba(30,50,90,0.15)] group-hover:border-[rgba(30,50,90,0.4)] transition-colors shadow-md"
                >
                    <FileSearch className="w-5 h-5 md:w-6 md:h-6" />
                </motion.span>
                <span className="text-[10px] sm:text-[11px] md:text-xs font-normal text-[rgb(45,45,45)]">
                    Technikai audit
                </span>
            </a>
        </motion.div>
    );
}
