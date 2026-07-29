import { apiClient } from './client';
import type { NfcHistoryEntry, NfcScanResponse, NfcTodayChecklist } from '../types';

/**
 * A backend `nfc_tags.uid` oszlopa egy sima, nem normalizált string —
 * nincs formátum-validáció, case-sensitive exact match (lásd
 * NfcTag::where('uid', ...)). A testvér Kotlin app Android NFC-olvasója
 * (`NfcReader.android.kt`) kettősponttal tagolt, nagybetűs hex UID-t küld
 * (`tag.id.joinToString(":") { "%02X".format(it) }`) — ez az admin felület
 * (`Admin/NfcTags/Form.tsx`) placeholder-formátuma is. Ha ez a formátum eltér
 * attól, ahogy az admin a matricát rögzítette, a scan sosem talál egyezést —
 * ezért itt SZÁNDÉKOSAN ugyanazt a formázást kell követni, nem egy tetszőleges
 * más hex-reprezentációt.
 */
export function formatTagUid(bytes: number[]): string {
    return bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(':');
}

export async function scanTag(tagUid: string): Promise<NfcScanResponse> {
    try {
        const { data } = await apiClient.post<NfcScanResponse>('/nfc/scan', { tag_uid: tagUid });
        return data;
    } catch (error: unknown) {
        // 403/404 itt ÉRVÉNYES domain-válaszok ("denied"/"ismeretlen matrica"), nem
        // kivételek — a NfcAccessController ezekhez is JSON body-t ad vissza, csak
        // nem 2xx státusszal. Csak 401/422/5xx számít valódi hibának.
        if (isAxiosErrorWithNfcBody(error)) {
            return error.response!.data as NfcScanResponse;
        }
        throw error;
    }
}

function isAxiosErrorWithNfcBody(error: unknown): error is { response: { status: number; data: unknown } } {
    const err = error as { response?: { status?: number; data?: unknown } };
    return !!err.response && (err.response.status === 403 || err.response.status === 404) && !!err.response.data;
}

export async function getNfcHistory(): Promise<NfcHistoryEntry[]> {
    const { data } = await apiClient.get<{ entries: NfcHistoryEntry[] }>('/nfc/history');
    return data.entries;
}

export async function getTodayChecklist(): Promise<NfcTodayChecklist> {
    const { data } = await apiClient.get<NfcTodayChecklist>('/nfc/today-checklist');
    return data;
}
