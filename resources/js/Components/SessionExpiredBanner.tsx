import { Link } from '@inertiajs/react';

/** Csak akkor jelenik meg, ha az offline-queue szinkronizálása 401/419-et
 *  kapott (lásd native/offlineSync.ts) — enélkül a user offline szakasz
 *  után csendben soha nem szinkronizálna, észre sem véve, hogy újra be
 *  kellene jelentkeznie. */
export default function SessionExpiredBanner({ loginHref }: { loginHref: string }) {
    return (
        <div className="sticky top-16 z-[1040] bg-amber-500 text-white text-xs sm:text-sm px-4 py-2 flex items-center justify-center gap-3 text-center">
            <span>A munkameneted lejárt — a mentett (offline) beolvasások szinkronizálásához jelentkezz be újra.</span>
            <Link href={loginHref} className="underline font-semibold shrink-0">Bejelentkezés</Link>
        </div>
    );
}
