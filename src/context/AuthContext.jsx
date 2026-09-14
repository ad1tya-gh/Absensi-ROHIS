import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getProfile } from '../lib/supabaseQueries';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [profile, setProfile] = useState(null); // { role: 'admin'|'user' }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ambil session yang sudah ada
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen perubahan auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    await loadProfile(session.user.id);
                } else {
                    setProfile(null);
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    async function loadProfile(userId) {
        try {
            const prof = await getProfile(userId);
            setProfile(prof);
        } catch {
            setProfile({ role: 'user' }); // fallback default
        } finally {
            setLoading(false);
        }
    }

    const value = {
        user,
        profile,
        loading,
        isAdmin: profile?.role === 'admin',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider');
    return ctx;
}
