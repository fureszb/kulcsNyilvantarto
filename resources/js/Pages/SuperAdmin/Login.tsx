import { useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '../../types';

declare function route(name: string, params?: unknown): string;

interface FormData {
    email: string;
    password: string;
    [key: string]: unknown;
}

export default function SuperAdminLogin() {
    const { flash } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm<FormData>({
        email: '',
        password: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('super-admin.authenticate'));
    }

    const errorMsg = errors.email ?? errors.password ?? flash.error;

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#0f172a'}}>
            <div style={{width: '100%', maxWidth: '24rem'}}>

                <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                    <div style={{width: '3.5rem', height: '3.5rem', background: '#4f46e5', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'}}>
                        <svg style={{width: '1.75rem', height: '1.75rem'}} fill="none" stroke="white" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                    </div>
                    <h1 style={{fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: 0}}>Super Admin</h1>
                    <p style={{color: '#94a3b8', fontSize: '0.875rem', margin: '0.25rem 0 0'}}>KK Nyilvántartó – Rendszeradmin</p>
                </div>

                <div style={{background: 'white', borderRadius: '1.25rem', boxShadow: '0 25px 50px rgba(0,0,0,.4)', padding: '1.75rem'}}>
                    {errorMsg && (
                        <div style={{marginBottom: '1rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '0.5rem', fontSize: '0.875rem'}}>
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div style={{marginBottom: '1.25rem'}}>
                            <label style={{display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem'}}>
                                Email cím
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                autoFocus
                                style={{width: '100%', boxSizing: 'border-box', borderRadius: '0.5rem', border: `2px solid ${errors.email ? '#f87171' : '#e2e8f0'}`, padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#0f172a', outline: 'none', transition: 'border-color .15s'}}
                                placeholder="admin@example.com"
                                autoComplete="email"
                                onFocus={(e) => { e.target.style.borderColor = '#6366f1'; }}
                                onBlur={(e) => { e.target.style.borderColor = errors.email ? '#f87171' : '#e2e8f0'; }}
                            />
                        </div>
                        <div style={{marginBottom: '1.25rem'}}>
                            <label style={{display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem'}}>
                                Jelszó
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                style={{width: '100%', boxSizing: 'border-box', borderRadius: '0.5rem', border: `2px solid ${errors.password ? '#f87171' : '#e2e8f0'}`, padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#0f172a', outline: 'none', transition: 'border-color .15s'}}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                onFocus={(e) => { e.target.style.borderColor = '#6366f1'; }}
                                onBlur={(e) => { e.target.style.borderColor = errors.password ? '#f87171' : '#e2e8f0'; }}
                            />
                            {errors.password && (
                                <p style={{color: '#ef4444', fontSize: '0.75rem', margin: '.375rem 0 0'}}>{errors.password}</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            style={{width: '100%', padding: '0.75rem', background: '#4f46e5', color: 'white', fontWeight: 700, fontSize: '0.875rem', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', transition: 'background .15s', opacity: processing ? 0.7 : 1}}
                            onMouseOver={(e) => { (e.target as HTMLButtonElement).style.background = '#4338ca'; }}
                            onMouseOut={(e) => { (e.target as HTMLButtonElement).style.background = '#4f46e5'; }}
                        >
                            {processing ? 'Bejelentkezés...' : 'Bejelentkezés'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
