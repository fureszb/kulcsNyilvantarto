import { apiClient } from './client';
import type { LoginResponse, TenantUser } from '../types';

export async function login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    return data;
}

export async function logout(): Promise<void> {
    await apiClient.post('/auth/logout');
}

export async function me(): Promise<TenantUser> {
    const { data } = await apiClient.get<TenantUser>('/auth/me');
    return data;
}

export async function updateProfile(input: {
    name: string;
    email: string;
    current_password?: string | null;
    new_password?: string | null;
}): Promise<TenantUser> {
    const { data } = await apiClient.put<TenantUser>('/auth/profile', input);
    return data;
}
