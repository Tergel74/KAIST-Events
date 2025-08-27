export interface Review {
    id: string;
    event_id: string;
    user_id: string;
    content: string;
    photo_url?: string[];
    created_at: string;
    users: { name: string };
}
