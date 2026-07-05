import { motion } from 'motion/react';
import { ArrowUpRight, ChevronRight } from 'lucide-react';

const MENU_ITEMS = ['Services', 'Solutions', 'Company', 'Operations'];

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between py-6 px-6 md:px-10 w-full relative z-10">
            {/* Bal oldal: távolságtartó helykitöltő a középre igazított menühöz */}
            <div className="hidden md:block w-[140px]" aria-hidden="true" />

            {/* Középső menü */}
            <ul className="hidden md:flex items-center gap-8 text-[rgb(45,45,45)] font-normal text-sm">
                {MENU_ITEMS.map(item => (
                    <li key={item}>
                        <a
                            href="#"
                            className="group flex items-center gap-0.5 hover:text-[rgba(30,50,90,1)] transition-colors cursor-pointer"
                        >
                            {item}
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </a>
                    </li>
                ))}
            </ul>

            {/* Mobil logó */}
            <div className="md:hidden">
                <span className="font-normal tracking-tighter text-xl text-[rgba(30,50,90,0.9)]">CORTEX</span>
            </div>

            {/* Jobb oldali CTA gomb */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center bg-[rgba(30,50,90,0.8)] text-white rounded-full pl-2 pr-4 md:pr-6 py-1.5 md:py-2 gap-2 md:gap-3 hover:bg-[rgba(30,50,90,1)] transition-colors group cursor-pointer"
            >
                <span className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/15 group-hover:bg-white/25 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                </span>
                <span className="text-sm font-normal">Kapcsolat</span>
            </motion.button>
        </nav>
    );
}
