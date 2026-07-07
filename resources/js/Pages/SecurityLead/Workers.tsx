import SecurityLeadLayout from '../../Layouts/SecurityLeadLayout';
import { WorkerCard, type WorkerStat } from '../../Components/WorkerStatCard';

interface Props {
    workerStats: WorkerStat[];
}

export default function SecurityLeadWorkers({ workerStats }: Props) {
    return (
        <SecurityLeadLayout title="Emberek teljesítése">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-800">Emberek teljesítése</h1>
                <p className="text-sm text-slate-500 mt-1">{workerStats.length} aktív dolgozó a saját irodaházaidban — oktatási és vizsgaeredmények.</p>
            </div>

            {workerStats.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                    <p className="text-slate-400">Nincs hozzád rendelt dolgozó.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {workerStats.map((stat, index) => (
                        <WorkerCard key={stat.worker.id} stat={stat} workerRouteName="security-lead.worker" delayMs={80 + index * 90} accent="blue" />
                    ))}
                </div>
            )}
        </SecurityLeadLayout>
    );
}
