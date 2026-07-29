import { Navigate, Route, HashRouter, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { BottomTabBar } from './components/BottomTabBar';
import { ServerSetupScreen } from './screens/ServerSetupScreen';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { NfcScanScreen } from './screens/NfcScanScreen';
import { NfcHistoryScreen } from './screens/NfcHistoryScreen';
import { ProfileScreen } from './screens/ProfileScreen';

function AppShell() {
    const { isBootstrapping, appConfig, user } = useAuth();

    if (isBootstrapping) {
        return (
            <div className="min-h-full flex items-center justify-center bg-brand-chrome">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (!appConfig) {
        return <ServerSetupScreen />;
    }

    if (!user) {
        return <LoginScreen />;
    }

    return (
        <div className="min-h-full flex flex-col bg-slate-50">
            <div className="flex-1 overflow-y-auto safe-top">
                <Routes>
                    <Route path="/home" element={<HomeScreen />} />
                    <Route path="/nfc" element={<NfcScanScreen />} />
                    <Route path="/nfc/history" element={<NfcHistoryScreen />} />
                    <Route path="/profile" element={<ProfileScreen />} />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
            </div>
            <BottomTabBar />
        </div>
    );
}

export function App() {
    return (
        <AuthProvider>
            {/* HashRouter: statikus file:// eredetről betöltött Capacitor WebView-ban
                a history API-alapú útvonalak szerver-side resolve nélkül 404-eznének
                újratöltésnél — a hash-alapú routing ezt elkerüli. */}
            <HashRouter>
                <AppShell />
            </HashRouter>
        </AuthProvider>
    );
}
