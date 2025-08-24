export interface Event {
    id: string;
    title: string;
    description: string;
    location: string;
    event_date: string;
    image_url?: string | string[];
    creator_id: string;
    status: "upcoming" | "completed";
    created_at: string;
    users?: { name: string };
    participant_count?: number;
}
