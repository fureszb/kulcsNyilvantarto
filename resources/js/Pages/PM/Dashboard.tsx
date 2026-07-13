import { useEffect, useState } from 'react';
import PmLayout from '../../Layouts/PmLayout';
import { WorkerCard, type WorkerStat } from '../../Components/WorkerStatCard';
import { DashboardHero } from '../../Components/ui/DashboardHero';
import { Card } from '../../Components/ui/Card';
import ModuleCardGrid, { type ModuleCardDef } from '../../Components/ModuleCardGrid';

declare function route(name: string, params?: unknown): string;

interface AssignedLocation {
    id: number;
    name: string;
    security_lead_name?: string | null;
}

interface Props {
    workerStats: WorkerStat[];
    welcomeName?: string | null;
    assignedLocation?: AssignedLocation | null;
}

function buildModules(): ModuleCardDef[] {
    return [
        {
            href: route('presence.index'),
            title: 'Ki van bent',
            description: 'Élő lista arról, hogy jelenleg kik tartózkodnak a kezelt irodaházban.',
            iconPath: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6-4a3 3 0 11-6 0 3 3 0 016 0z',
            accent: 'blue',
            features: ['Valós idejű frissítés', 'NFC-alapú azonosítás', 'Telephelyenkénti bontás'],
            actionLabel: 'Megtekintés',
        },
        {
            href: route('nfc-log.index'),
            title: 'NFC napló',
            description: 'Be-/kilépések és elutasított próbálkozások szűrhető naplója.',
            iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-4 8h4m-4 4h4m-6-4h.01M9 16h.01',
            accent: 'amber',
            features: ['Szűrés felhasználó szerint', 'Szűrés telephely szerint', 'Dátum-tartomány'],
            actionLabel: 'Napló megnyitása',
        },
    ];
}

export default function PmDashboard({ workerStats, welcomeName, assignedLocation }: Props) {
    const modules = buildModules();
    const [showWelcome, setShowWelcome] = useState(!!welcomeName);
    const [welcomeVisible, setWelcomeVisible] = useState(false);
    const [welcomeFading, setWelcomeFading] = useState(false);
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        if (!welcomeName) return;
        // PM loader fades at ~480ms — start welcome crossfade just before that
        const t0 = setTimeout(() => setWelcomeVisible(true), 400);
        const t1 = setTimeout(() => setEntered(true), 550);
        const t2 = setTimeout(() => setWelcomeFading(true), 2800);
        const t3 = setTimeout(() => setShowWelcome(false), 3500);
        return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [welcomeName]);

    return (
        <PmLayout title="Dolgozók áttekintése">
            {/* Welcome overlay */}
            {showWelcome && welcomeName && (
                <div
                    className={`fixed inset-0 z-[10000] flex items-center justify-center transition-opacity duration-500 ease-in-out pointer-events-none ${welcomeFading ? 'opacity-0' : welcomeVisible ? 'opacity-100' : 'opacity-0'}`}
                    style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1c1917 50%, #0f172a 100%)' }}
                >
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-600/[0.08] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>
                    <div
                        className={`relative text-center px-8 transition-all duration-700 ease-out ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                    >
                        <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.3em] mb-4">Property Manager Portál</p>
                        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-3">Üdvözöljük,</h1>
                        <h2
                            className="text-4xl sm:text-6xl font-extrabold tracking-tight"
                            style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                        >
                            {welcomeName}!
                        </h2>
                        <div className="mt-8 w-16 h-0.5 bg-amber-500/40 mx-auto rounded-full" />
                    </div>
                </div>
            )}

            <DashboardHero
                eyebrow={`Property Manager Portál${assignedLocation ? ` — ${assignedLocation.name}` : ''}`}
                eyebrowColor="text-amber-500"
                title="Dolgozók áttekintése"
                subtitle={`${workerStats.length} aktív dolgozó – oktatási és vizsgaeredmények${assignedLocation?.security_lead_name ? ` · Biztonsági vezető: ${assignedLocation.security_lead_name}` : ''}`}
                iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />

            {!assignedLocation && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
                    Jelenleg nincs irodaházhoz rendelve — kérje meg az adminisztrátort, hogy rendelje hozzá egy irodaházhoz, hogy lássa az ott dolgozókat.
                </div>
            )}

            {/* Worker grid */}
            {workerStats.length === 0 ? (
                <Card className="p-16 text-center">
                    <p className="text-slate-400">Még nincs aktív dolgozó a rendszerben.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {workerStats.map((stat, index) => (
                        <div key={stat.worker.id} className="pm-card-enter" style={{ animationDelay: `${100 + index * 130}ms` }}>
                            <WorkerCard stat={stat} workerRouteName="pm.worker" delayMs={100 + index * 130} accent="amber" />
                        </div>
                    ))}
                </div>
            )}

            {/* Modulok */}
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 mt-8">Modulok</h2>
            <ModuleCardGrid modules={modules} gridKey="pm-modules" />
        </PmLayout>
    );
}
