import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import { registerUnauthorizedHandler } from '../api/client';
import { getAppConfig, type AppConfig } from '../storage/appConfig';
import { clearToken, getToken, setToken } from '../storage/secureToken';
import type { TenantUser } from '../types';

interface AuthContextValue {
    /** null amíg a kezdeti session-visszaállítás fut. */
    isBootstrapping: boolean;
    appConfig: AppConfig | null;
    user: TenantUser | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    onServerConfigured: (config: AppConfig) => void;
    clearServerConfig: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
    const [user, setUser] = useState<TenantUser | null>(null);

    useEffect(() => {
        registerUnauthorizedHandler(() => setUser(null));
    }, []);

    useEffect(() => {
        (async () => {
            const config = await getAppConfig();
            setAppConfig(config);
            if (!config) {
                setIsBootstrapping(false);
                return;
            }

            const token = await getToken();
            if (!token) {
                setIsBootstrapping(false);
                return;
            }

            try {
                const freshUser = await authApi.me();
                setUser(freshUser);
            } catch {
                // A response interceptor 401-nél már törölte a tokent — itt nincs
                // más teendő, csak user=null marad (login képernyő jön).
            } finally {
                setIsBootstrapping(false);
            }
        })();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const { token, user: loggedInUser } = await authApi.login(email, password);
        await setToken(token);
        setUser(loggedInUser);
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch {
            // a logout hívás sikertelensége (pl. offline) nem akadályozhatja meg
            // a lokális kijelentkezést
        }
        await clearToken();
        setUser(null);
    }, []);

    const onServerConfigured = useCallback((config: AppConfig) => {
        setAppConfig(config);
    }, []);

    const clearServerConfig = useCallback(() => {
        setAppConfig(null);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({ isBootstrapping, appConfig, user, login, logout, onServerConfigured, clearServerConfig }),
        [isBootstrapping, appConfig, user, login, logout, onServerConfigured, clearServerConfig],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth() csak <AuthProvider> alatt hívható');
    return ctx;
}
