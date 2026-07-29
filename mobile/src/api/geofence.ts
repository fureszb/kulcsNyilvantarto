import { apiClient } from './client';
import type { GeofencePingResponse } from '../types';

export interface GeofencePingInput {
    lat: number;
    lng: number;
    accuracy?: number;
    recorded_at: string;
}

export async function pingGeofence(input: GeofencePingInput): Promise<GeofencePingResponse> {
    const { data } = await apiClient.post<GeofencePingResponse>('/geofence/ping', input);
    return data;
}
