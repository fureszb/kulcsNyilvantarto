import Hero from '../../Components/cortex/Hero';

/**
 * Cortex Opsystems — vállalati nyitóoldal (Hero szekció).
 * A spec "src/App.tsx" megfelelője Inertia-oldalként; a .cortex-landing
 * osztály hordozza a Helvetica fontot és a #f0f0f0 hátteret oldal-szkópoltan
 * (globális stílus-regresszió nélkül).
 */
export default function CortexLanding() {
    return (
        <main className="cortex-landing min-h-screen bg-[#f0f0f0]">
            <title>Cortex Opsystems — Vállalati biztonsági megoldások</title>
            <Hero />
        </main>
    );
}
