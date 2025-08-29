"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                const {
                    data: { session: initialSession },
                    error,
                } = await supabase.auth.getSession();
                if (error) {
                    console.error("Error getting initial session:", error);
                }
                setSession(initialSession);
                setUser(initialSession?.user ?? null);
            } catch (error) {
                console.error("Error in getInitialSession:", error);
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Handle different auth events
            switch (event) {
                case "SIGNED_IN":
                    // Let individual pages handle their own redirects after login
                    // Only redirect if we're on the home page
                    const currentPath = window.location.pathname;
                    if (currentPath === "/") {
                        setTimeout(() => {
                            router.push("/dashboard");
                        }, 100);
                    }
                    break;
                case "SIGNED_OUT":
                    // Redirect to home page after sign out
                    router.push("/");
                    break;
                case "TOKEN_REFRESHED":
                    // Session was refreshed
                    console.log("Token refreshed");
                    break;
                case "USER_UPDATED":
                    // User metadata was updated
                    console.log("User updated");
                    break;
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    const signOut = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Error signing out:", error);
            }
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshSession = async () => {
        try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) {
                console.error("Error refreshing session:", error);
            } else {
                setSession(data.session);
                setUser(data.session?.user ?? null);
            }
        } catch (error) {
            console.error("Error refreshing session:", error);
        }
    };

    const value = {
        user,
        session,
        loading,
        signOut,
        refreshSession,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export function useRequireAuth() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/login");
        }
    }, [user, loading, router]);

    return { user, loading };
}
