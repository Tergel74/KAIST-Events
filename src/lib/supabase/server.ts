import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "./client";

export const createServerSupabaseClient = () => {
    return createServerComponentClient<Database>({ cookies });
};

export const getUser = async () => {
    const supabase = createServerSupabaseClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user;
};

export const requireAuth = async () => {
    const user = await getUser();
    if (!user) {
        throw new Error("Authentication required");
    }
    return user;
};

export const isKaistEmail = (email: string): boolean => {
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || "@kaist.ac.kr";
    return email.endsWith(allowedDomain);
};
