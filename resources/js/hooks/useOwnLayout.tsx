import { usePage } from '@inertiajs/react';
import type { ComponentType, ReactNode } from 'react';
import AppLayout from '../Layouts/AppLayout';
import AdminLayout from '../Layouts/AdminLayout';
import DirectorLayout from '../Layouts/DirectorLayout';
import SecurityLeadLayout from '../Layouts/SecurityLeadLayout';
import PmLayout from '../Layouts/PmLayout';
import type { PageProps } from '../types';

/** Megosztott (több szerepkör által elért) oldalakhoz: a bejelentkezett
 *  felhasználó SAJÁT portáljának layoutjában nyílik meg az oldal (fejléc,
 *  menü), ne szakadjon ki egy másik szerepkör navigációjába. */
export function useOwnLayout(): ComponentType<{ children: ReactNode; title?: string }> {
    const { auth } = usePage<PageProps>().props;
    switch (auth.user?.role) {
        case 'admin': return AdminLayout;
        case 'area_director': return DirectorLayout;
        case 'security_lead': return SecurityLeadLayout;
        case 'property_manager': return PmLayout;
        default: return AppLayout;
    }
}
