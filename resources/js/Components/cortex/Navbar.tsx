import { motion } from 'motion/react';
import { ArrowUpRight, ChevronRight } from 'lucide-react';

const MENU_ITEMS = ['Services', 'Solutions', 'Company', 'Operations'];

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between py-6 px-6 sm:px-10 lg:px-16 w-full relative z-10">
            {/* Logó */}
            <span className="font-normal tracking-tight text-lg text-white">
                CORTEX
            </span>

            {/* Középső menü — világos, áttetsző (a sötét cinematic overlay-en) */}
            <ul className="hidden md:flex items-center gap-8 text-white/75 font-normal text-sm">
                {MENU_ITEMS.map(item => (
                    <li key={item}>
                        <a
                            href="#"
                            className="group flex items-center gap-0.5 hover:text-white transition-colors cursor-pointer"
                        >
                            {item}
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </a>
                    </li>
                ))}
            </ul>

            {/* Jobb oldali CTA */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center bg-white/10 text-white rounded-full pl-2 pr-4 md:pr-5 py-1.5 gap-2 md:gap-3 border border-white/20 hover:bg-white/20 transition-colors group cursor-pointer backdrop-blur-sm"
            >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/15 group-hover:bg-white/25 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                </span>
                <span className="text-sm font-normal">Kapcsolat</span>
            </motion.button>
        </nav>
    );
}
