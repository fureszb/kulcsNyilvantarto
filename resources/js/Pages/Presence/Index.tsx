import { useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useOwnLayout } from '../../hooks/useOwnLayout';
import { getEcho } from '../../echo';
import type { PageProps } from '../../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PresentUser {
    id: number;
    name: string;
    role: string;
    last_entry_at: string;
    last_entry_location_id: number;
    last_entry_location?: { id: number; name: string };
}

interface LocationInfo {
    id: number;
    name: string;
    polygon: [number, number][] | null;
    workers_count: number;
}

interface GuardPosition {
    user_id: number;
    user_name: string;
    location_id: number;
    lat: number;
    lng: number;
    zone_status: 'inside' | 'outside' | 'unknown';
    recorded_at: string;
}

interface Props {
    presentUsers: PresentUser[];
    locations: LocationInfo[];
    guardPositions: GuardPosition[];
}

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    user: 'Dolgozó',
    property_manager: 'Property Manager',
    security_lead: 'Biztonsági vezető',
    area_director: 'Területi igazgató',
};

const ZONE_STATUS_COLORS: Record<string, string> = {
    inside: '#16a34a',
    outside: '#dc2626',
    unknown: '#94a3b8',
};

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}

export default function PresenceIndex({ presentUsers, locations, guardPositions }: Props) {
    const Layout = useOwnLayout();
    const { tenant } = usePage<PageProps>().props;

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const layerGroupRef = useRef<L.LayerGroup | null>(null);
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

    useEffect(() => {
        if (!tenant?.slug) return;
        try {
            const channel = getEcho(tenant.slug).private(`tenant.${tenant.slug}.presence`);
            channel.listen('.nfc-access', () => {
                router.reload({ only: ['presentUsers', 'locations', 'guardPositions'] });
            });
            channel.listen('.geofence', () => {
                router.reload({ only: ['presentUsers', 'locations', 'guardPositions'] });
            });
            return () => {
                channel.stopListening('.nfc-access');
                channel.stopListening('.geofence');
            };
        } catch { /* no-op, oldal frissítéssel is aktuális marad */ }
    }, [tenant?.slug]);

    // Térkép inicializálása egyszer.
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current).setView([47.4979, 19.0402], 12);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap közreműködők',
            maxZoom: 19,
        }).addTo(map);

        layerGroupRef.current = L.layerGroup().addTo(map);

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Zónák + őr-markerek újrarajzolása, ha a props frissül (élő Reverb esemény vagy első betöltés).
    useEffect(() => {
        const map = mapRef.current;
        const layerGroup = layerGroupRef.current;
        if (!map || !layerGroup) return;

        layerGroup.clearLayers();

        const bounds: L.LatLngExpression[] = [];

        locations.forEach((location) => {
            if (!location.polygon || location.polygon.length < 3) return;
            L.polygon(location.polygon, { color: '#2563eb', weight: 2, fillOpacity: 0.08 })
                .bindTooltip(location.name)
                .addTo(layerGroup);
            location.polygon.forEach((p) => bounds.push(p));
        });

        guardPositions.forEach((pos) => {
            L.circleMarker([pos.lat, pos.lng], {
                radius: 8,
                color: ZONE_STATUS_COLORS[pos.zone_status] ?? ZONE_STATUS_COLORS.unknown,
                fillColor: ZONE_STATUS_COLORS[pos.zone_status] ?? ZONE_STATUS_COLORS.unknown,
                fillOpacity: 0.8,
                weight: 2,
            })
                .bindTooltip(`${pos.user_name} (${formatTime(pos.recorded_at)})`)
                .addTo(layerGroup);
            bounds.push([pos.lat, pos.lng]);
        });

        if (bounds.length > 0) {
            map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 16 });
        }
    }, [locations, guardPositions]);

    function selectLocation(location: LocationInfo) {
        setSelectedLocationId(location.id);
        const map = mapRef.current;
        if (!map || !location.polygon || location.polygon.length < 3) return;
        map.fitBounds(L.latLngBounds(location.polygon), { padding: [40, 40], maxZoom: 17 });
    }

    function presentCountFor(locationId: number): number {
        return presentUsers.filter((u) => u.last_entry_location_id === locationId).length;
    }

    return (
        <Layout title="Ki van bent">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-full md:w-64 shrink-0">
                    <div className="card overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-200">
                            <h2 className="text-sm font-semibold text-slate-700">Telephelyek</h2>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                            {locations.length === 0 ? (
                                <div className="px-4 py-6 text-center text-sm text-slate-400">Nincs elérhető telephely.</div>
                            ) : (
                                locations.map((location) => (
                                    <button
                                        key={location.id}
                                        type="button"
                                        onClick={() => selectLocation(location)}
                                        className={`w-full text-left px-4 py-3 transition-colors ${
                                            selectedLocationId === location.id ? 'bg-emerald-50' : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-medium text-slate-800 text-sm truncate">{location.name}</span>
                                            {!location.polygon && (
                                                <span className="shrink-0 text-[10px] text-slate-400 whitespace-nowrap">nincs zóna</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            {presentCountFor(location.id)} bent / {location.workers_count} dolgozó
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 card overflow-hidden">
                    <div ref={mapContainerRef} style={{ height: '420px' }} />
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[480px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Név</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Szerepkör</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Telephely</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Belépés</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {presentUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-12 text-center text-slate-400">
                                        Jelenleg senki nincs bent.
                                    </td>
                                </tr>
                            ) : (
                                presentUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3.5 font-semibold text-slate-800">{u.name}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{ROLE_LABELS[u.role] ?? u.role}</td>
                                        <td className="px-5 py-3.5 text-slate-600">{u.last_entry_location?.name ?? '–'}</td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                                                {formatTime(u.last_entry_at)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}
