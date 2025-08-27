import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
});

export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    name: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    name?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string | null;
                    created_at?: string;
                };
            };
            events: {
                Row: {
                    id: string;
                    title: string;
                    description: string | null;
                    location: string | null;
                    event_date: string;
                    image_url: string[];
                    creator_id: string;
                    status: "upcoming" | "started" | "finished";
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description?: string | null;
                    location?: string | null;
                    event_date: string;
                    image_url?: string[];
                    creator_id: string;
                    status?: "upcoming" | "started" | "finished";
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string | null;
                    location?: string | null;
                    event_date?: string;
                    image_url?: string[];
                    creator_id?: string;
                    status?: "upcoming" | "started" | "finished";
                    created_at?: string;
                };
            };
            participants: {
                Row: {
                    id: string;
                    event_id: string;
                    user_id: string;
                    joined_at: string;
                };
                Insert: {
                    id?: string;
                    event_id: string;
                    user_id: string;
                    joined_at?: string;
                };
                Update: {
                    id?: string;
                    event_id?: string;
                    user_id?: string;
                    joined_at?: string;
                };
            };
            reviews: {
                Row: {
                    id: string;
                    event_id: string;
                    user_id: string;
                    content: string;
                    photo_url: string[];
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    event_id: string;
                    user_id: string;
                    content: string;
                    photo_url?: string[];
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    event_id?: string;
                    user_id?: string;
                    content?: string;
                    photo_url?: string[];
                    created_at?: string;
                };
            };
        };
    };
};
