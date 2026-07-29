// Mezőnevek 1:1 a Laravel Api\TenantUserResource / Api\AuthController válaszával
// (KulcsNyilvantarto/app/Http/Resources/Api/TenantUserResource.php).
export type TenantUserRole = 'admin' | 'user' | 'property_manager' | 'security_lead' | 'area_director';

export interface TenantUser {
    id: number;
    name: string;
    email: string;
    role: TenantUserRole;
    is_active: boolean;
    employed_since: string | null;
    left_at: string | null;
    location_id: number | null;
    director_id: number | null;
    notes_read_at: string | null;
    messages_read_at: string | null;
}

export interface LoginResponse {
    token: string;
    user: TenantUser;
}

export interface HomeVenue {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    logo_path: string | null;
    responsible_person: string | null;
    email: string | null;
    items_count: number;
}

export interface HomePresence {
    on_duty: boolean;
    schedule_label: string | null;
    has_location: boolean;
    venue_name: string | null;
    checked_count: number;
    total_count: number;
}

export interface HomeRecentActivity {
    description: string;
    time_label: string;
    kind: 'success' | 'info' | 'neutral';
}

export interface HomeMessagePreview {
    initials: string;
    sender_label: string;
    time_label: string;
    snippet: string;
}

export interface HomeTodaySchedule {
    value_label: string;
    area_name: string | null;
}

export interface HomeDashboard {
    checks_today: number;
    trainings_completed: number;
    venue_mode: 'buildings' | 'tenants';
    venues: HomeVenue[];
    security_module_visible: boolean;
    presence: HomePresence;
    recent_activity: HomeRecentActivity[];
    unread_messages_count: number;
    message_previews: HomeMessagePreview[];
    today_schedule: HomeTodaySchedule | null;
    hours_worked_today: number;
}

export type NfcScanStatus = 'checked' | 'denied';

export interface NfcScanResponse {
    status: NfcScanStatus;
    message?: string;
    location?: { id: number; name: string };
    tag?: { id: number; label: string | null };
}

export interface NfcHistoryEntry {
    id: number;
    event_type: 'nfc.checkpoint' | 'nfc.entry' | 'nfc.exit' | 'nfc.denied';
    location_name: string | null;
    tag_label: string | null;
    occurred_at: string;
}

export interface NfcChecklistPoint {
    id: number;
    label: string | null;
    scanned: boolean;
    scanned_at: string | null;
}

export interface NfcTodayChecklist {
    location_names: string[];
    points: NfcChecklistPoint[];
}

export type GeofenceZoneStatus = 'inside' | 'outside' | 'unknown';

export interface GeofencePingResponse {
    status: 'ok';
    zone_status: GeofenceZoneStatus;
}

export interface ApiValidationError {
    message: string;
    errors?: Record<string, string[]>;
}
