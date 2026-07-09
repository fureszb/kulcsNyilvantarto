export interface Tenant {
    name: string;
    slug: string;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
    is_admin: boolean;
    is_property_manager: boolean;
}

export interface Auth {
    user: AuthUser | null;
    superAdmin: { loggedIn: boolean } | null;
}

export interface Flash {
    success?: string | null;
    error?: string | null;
}

export interface Nav {
    newNotes: number;
    newMessages: number;
}

export interface PageProps {
    auth: Auth;
    tenant: Tenant | null;
    flash: Flash;
    nav: Nav;
    errors: Record<string, string>;
    [key: string]: unknown;
}

export interface Location {
    id: number;
    name: string;
    slug?: string;
    description?: string | null;
    responsible_person?: string | null;
    email?: string | null;
    icon?: string | null;
    logo_path?: string | null;
    is_active: boolean;
    items_count?: number;
    items?: Item[];
    groups?: ItemGroup[];
}

export interface ItemGroup {
    id: number;
    name: string;
    location_id: number;
    items?: Item[];
}

export interface Item {
    id: number;
    name: string;
    description?: string | null;
    type?: string | null;
    group_id?: number | null;
    location_id: number;
    group?: ItemGroup | null;
}

export interface Check {
    id: number;
    location_id: number;
    user_id: number;
    checked_by: string;
    extra_email?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    location?: Location;
    check_items?: CheckItem[];
    check_items_count?: number;
    checked_count?: number;
}

export interface CheckItem {
    id: number;
    check_id: number;
    item_id: number;
    is_checked: boolean;
    item: Item;
}

export interface Training {
    id: number;
    title: string;
    description?: string | null;
    is_active: boolean;
    steps?: TrainingStep[];
    steps_count?: number;
    user_result?: TrainingResult | null;
}

export interface TrainingStep {
    id: number;
    training_id: number;
    order: number;
    title?: string | null;
    content?: string | null;
    media_type?: string | null;
    media_path?: string | null;
    question?: string | null;
    answers?: TrainingAnswer[];
    is_correct?: boolean | null;
}

export interface TrainingAnswer {
    id: number;
    step_id: number;
    text: string;
    is_correct: boolean;
}

export interface TrainingResult {
    id: number;
    training_id: number;
    user_id: number;
    score: number;
    total: number;
    passed: boolean;
    created_at: string;
}

export interface Exam {
    id: number;
    title: string;
    description?: string | null;
    is_active: boolean;
    pass_score: number;
    steps?: ExamStep[];
    steps_count?: number;
    user_result?: ExamResult | null;
    max_attempts?: number | null;
    cooldown_minutes?: number;
    shuffle_questions?: boolean;
    shuffle_answers?: boolean;
    time_limit_minutes?: number | null;
}

export interface ExamStep {
    id: number;
    exam_id: number;
    order: number;
    question: string;
    answers?: ExamAnswer[];
}

export interface ExamAnswer {
    id: number;
    step_id: number;
    text: string;
    is_correct?: boolean;
}

export interface ExamResult {
    id: number;
    exam_id: number;
    user_id: number;
    score: number;
    total: number;
    passed: boolean;
    created_at: string;
    answers?: ExamAnswer[];
    started_at?: string | null;
    tab_violations?: number;
    ip_address?: string | null;
    time_taken_seconds?: number | null;
}

export interface SecurityDailyReport {
    id: number;
    report_date: string;
    prepared_by: string;
    taken_over_from?: string | null;
    handover_time?: string | null;
    created_by_user_id?: number | null;
    service_members?: unknown[] | null;
    previous_shift_members?: unknown[] | null;
    cc_recipients?: unknown[] | null;
    equipment?: unknown[] | null;
    inspectors?: unknown[] | null;
    patrols?: unknown[] | null;
    incidents?: unknown[] | null;
    events?: unknown[] | null;
    fire_alarms?: unknown[] | null;
    elevators?: unknown[] | null;
    maintenance?: unknown[] | null;
    created_at: string;
    updated_at: string;
    shares?: SecurityReportShare[];
    locations?: { id: number; name: string }[];
}

export interface SecurityReportShare {
    id: number;
    report_id: number;
    shared_with_user_id: number;
    user?: AuthUser;
}

export interface ShiftNote {
    id: number;
    user_id: number;
    content: string;
    note_date: string;
    created_at: string;
    updated_at: string;
    user?: { id: number; name: string; is_admin?: boolean; role?: string };
    author?: { id: number; name: string };
}

export interface PmMessageReply {
    id: number;
    pm_message_id: number;
    sender_id: number;
    sender_name: string;
    content: string;
    created_at: string;
}

export interface PmMessage {
    id: number;
    content: string;
    send_to_all: boolean;
    sent_by_user_id: number;
    sent_by_name: string;
    created_at: string;
    updated_at: string;
    recipients?: PmMessageRecipient[];
    replies?: PmMessageReply[];
}

export interface PmMessageRecipient {
    id: number;
    pm_message_id: number;
    user_id: number;
    user?: TenantUser;
}

export interface TenantUser {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    employed_since?: string | null;
    created_at: string;
}

export interface TenantRecord {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    created_at: string;
    url?: string;
    users_count?: number;
}

export interface ActivityLog {
    id: number;
    event_type: string;
    user_id?: number | null;
    user_name?: string | null;
    description?: string | null;
    metadata?: Record<string, unknown> | null;
    occurred_at: string;
    created_at: string;
}

export interface TenantUserBasic {
    id: number;
    name: string;
}

export interface Setting {
    key: string;
    value: string | null;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export type DocumentType =
    | 'feljegyzeses_jegyzokonyv'
    | 'gepjarmu_beleptetes'
    | 'eszkoz_atadas_atvetel'
    | 'karfelveteli_jegyzokonyv'
    | 'kiuritesi_jegyzokonyv'
    | 'kiuritesi_nyilvantartas'
    | 'kulcs_kartya_atadas_atvetel'
    | 'talalt_targy_jegyzokonyv'
    | 'robbantasi_fenyegetes'
    | 'tuzkulcs_tuzkazetta_kiadas';

export interface DocumentSummary {
    id: number;
    document_type: DocumentType;
    status: string;
    pdf_path: string | null;
    finalized_at: string | null;
    created_at: string;
    location?: { id: number; name: string } | null;
    created_by?: TenantUserBasic | null;
}
