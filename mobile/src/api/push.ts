import { apiClient } from './client';

export async function subscribeNativePush(deviceToken: string, platform: 'android' | 'ios'): Promise<void> {
    await apiClient.post('/push/subscribe-native', { device_token: deviceToken, platform });
}

export async function unsubscribeNativePush(): Promise<void> {
    await apiClient.post('/push/unsubscribe-native');
}
