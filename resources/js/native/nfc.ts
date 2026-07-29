import axios from 'axios';
import { CapacitorNfc, type NfcEvent, type NfcSessionEndEvent } from '@capgo/capacitor-nfc';

export interface NfcScanResult {
    status: 'checked' | 'denied' | 'error';
    message?: string;
    locationName?: string;
    tagLabel?: string;
}

/** Bájt-tömb UID → kettősponttal tagolt nagybetűs hex string — pontosan az
 *  a formátum, amit az admin NfcTags/Form.tsx placeholdere is mutat
 *  ("04:3E:8A:AA:77:72:81") és amit a NfcTag::uid oszlop tárol. */
function formatTagUid(bytes: number[]): string {
    return bytes.map((byte) => byte.toString(16).padStart(2, '0').toUpperCase()).join(':');
}

/** Egyetlen NFC-matrica beolvasása és beküldése a `native.nfc.scan`
 *  végpontnak (session-guarddal, ugyanaz a controller-logika, mint a
 *  Kotlin mobil kliens bearer-tokenes API-jánál). `iosSessionType: 'tag'`
 *  kell a nyers (nem-NDEF) matrica-UID olvasásához — ehhez iOS-en az Xcode
 *  Signing & Capabilities alatt engedélyezni kell a "Near Field
 *  Communication Tag Reading" képességet, enélkül a scan hibával elszáll.
 *  A pluginnek nincs külön requestPermissions()-e: NFC-hez Androidon nincs
 *  futásidejű engedély (csak a manifest-permission, ami már bele van
 *  fordítva), iOS-en pedig az Info.plist NFCReaderUsageDescription elég. */
export async function scanNfcTag(): Promise<NfcScanResult> {
    return new Promise((resolve) => {
        let settled = false;

        const finish = (result: NfcScanResult) => {
            if (settled) return;
            settled = true;
            tagHandle.then((h) => h.remove());
            endHandle.then((h) => h.remove());
            resolve(result);
        };

        const tagHandle = CapacitorNfc.addListener('nfcEvent', async (event: NfcEvent) => {
            const idBytes = event.tag?.id;
            if (!idBytes || idBytes.length === 0) {
                finish({ status: 'error', message: 'Nem sikerült beolvasni a matrica azonosítóját.' });
                return;
            }

            try {
                const { data } = await axios.post(route('native.nfc.scan'), {
                    tag_uid: formatTagUid(idBytes),
                    scanned_at: new Date().toISOString(),
                });
                finish({ status: 'checked', locationName: data.location?.name, tagLabel: data.tag?.label });
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 403) {
                    finish({ status: 'denied', message: error.response.data?.message ?? 'Nincs jogosultsága ehhez a telephelyhez.' });
                } else if (axios.isAxiosError(error) && error.response?.status === 404) {
                    finish({ status: 'denied', message: 'Ismeretlen NFC matrica.' });
                } else {
                    finish({ status: 'error', message: 'Hálózati hiba történt a beolvasás közben.' });
                }
            }
        });

        const endHandle = CapacitorNfc.addListener('nfcSessionEnd', (event: NfcSessionEndEvent) => {
            if (event.reason === 'userCancelled') {
                finish({ status: 'error', message: 'Megszakítva.' });
            } else {
                finish({ status: 'error', message: 'Az NFC-olvasás megszakadt.' });
            }
        });

        CapacitorNfc.startScanning({ iosSessionType: 'tag', invalidateAfterFirstRead: true }).catch(() => {
            finish({ status: 'error', message: 'Nem sikerült elindítani az NFC-olvasást.' });
        });
    });
}

export async function cancelNfcScan(): Promise<void> {
    await CapacitorNfc.stopScanning().catch(() => {});
}
