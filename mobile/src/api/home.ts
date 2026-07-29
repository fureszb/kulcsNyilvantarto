import { apiClient } from './client';
import type { HomeDashboard } from '../types';

export async function getHomeDashboard(): Promise<HomeDashboard> {
    const { data } = await apiClient.get<HomeDashboard>('/home');
    return data;
}
