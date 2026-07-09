import { Link } from '@inertiajs/react';
import {
    FileText, Car, Package, AlertTriangle, DoorOpen, ClipboardList,
    KeyRound, Search, AlertOctagon, Flame, Download, ArrowLeft,
    MapPin, User, CheckCircle2, Clock, ExternalLink, type LucideIcon,
} from 'lucide-react';
import { useOwnLayout } from '../../hooks/useOwnLayout';
import type { DocumentSummary, DocumentType } from '../../types';

declare function route(name: string, params?: unknown): string;

interface Props {
    document: DocumentSummary;
}

const TYPE_LABELS: Record<DocumentType, string> = {
    feljegyzeses_jegyzokonyv: 'Feljegyzéses jegyzőkönyv',
    gepjarmu_beleptetes: 'Gépjármű beléptető nyilvántartás',
    eszkoz_atadas_atvetel: 'Eszközök átadás-átvétele',
    karfelveteli_jegyzokonyv: 'Kárfelvételi jegyzőkönyv',
    kiuritesi_jegyzokonyv: 'Kiürítési jegyzőkönyv',
    kiuritesi_nyilvantartas: 'Kiürítési nyilvántartás',
    kulcs_kartya_atadas_atvetel: 'Kulcs/Kártya átadás-átvétele',
    talalt_targy_jegyzokonyv: 'Talált tárgy jegyzőkönyv',
    robbantasi_fenyegetes: 'Robbantással fenyegetés',
    tuzkulcs_tuzkazetta_kiadas: 'Tűzkulcs és tűzkazetta kiadás',
};

const TYPE_ICONS: Record<DocumentType, LucideIcon> = {
    feljegyzeses_jegyzokonyv: FileText,
    gepjarmu_beleptetes: Car,
    eszkoz_atadas_atvetel: Package,
    karfelveteli_jegyzokonyv: AlertTriangle,
    kiuritesi_jegyzokonyv: DoorOpen,
    kiuritesi_nyilvantartas: ClipboardList,
    kulcs_kartya_atadas_atvetel: KeyRound,
    talalt_targy_jegyzokonyv: Search,
    robbantasi_fenyegetes: AlertOctagon,
    tuzkulcs_tuzkazetta_kiadas: Flame,
};

export default function DocumentsShow({ document }: Props) {
    const label = TYPE_LABELS[document.document_type] ?? document.document_type;
    const Icon = TYPE_ICONS[document.document_type] ?? FileText;
    const isFinal = document.status === 'finalized';
    const Layout = useOwnLayout();

    return (
        <Layout title={label}>
            <>

                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-orange-700/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
                    <div className="relative px-4 py-6 sm:px-8 sm:py-8 flex items-start justify-between gap-6 flex-wrap">
                        <div className="flex items-start gap-4">
                            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                                <Icon className="w-7 h-7 text-amber-300" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Dokumentum #{document.id}</p>
                                <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">{label}</h1>
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                                        {document.location?.name ?? 'Nincs helyszín megadva'}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <User className="w-4 h-4 text-slate-500 shrink-0" />
                                        {document.created_by?.name ?? '–'}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${isFinal ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                                        {isFinal ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        {isFinal ? 'Kész' : 'Vázlat'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                            <Link
                                href={route('documents.index')}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Vissza
                            </Link>
                            {document.pdf_path && (
                                <a
                                    href={route('documents.download', document.id)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold transition-colors shadow-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Letöltés
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* PDF előnézet */}
                {document.pdf_path ? (
                    <div className="bg-white border-2 border-amber-200 rounded-2xl shadow-lg shadow-amber-900/5 overflow-hidden">
                        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-amber-50/40">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                                <FileText className="w-3.5 h-3.5 text-amber-700" />
                            </div>
                            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">PDF előnézet</span>
                            <a
                                href={route('documents.preview', document.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-amber-200 shadow-sm text-xs font-semibold text-amber-700 hover:text-amber-900 hover:border-amber-300 hover:shadow transition-all"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Megnyitás új lapon
                            </a>
                        </div>
                        <div className="p-3 bg-amber-50/30">
                            <iframe
                                src={`${route('documents.preview', document.id)}#toolbar=0&navpanes=0&statusbar=0&view=FitH`}
                                className="w-full rounded-xl border border-amber-200/70 bg-slate-100 shadow-inner"
                                style={{ height: '75vh' }}
                                title={label}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-7 h-7 text-amber-400" strokeWidth={1.5} />
                        </div>
                        <p className="text-base font-semibold text-slate-600">A PDF még nincs elkészítve</p>
                        <p className="text-sm text-slate-400 mt-1">A dokumentum jelenleg vázlat állapotban van.</p>
                    </div>
                )}
            </>
        </Layout>
    );
}
