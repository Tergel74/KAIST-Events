export interface Event {
    id: string;
    title: string;
    description: string;
    location: string;
    location_coordinates?: {
        lat: number;
        lng: number;
    };
    event_date: string;
    started_date?: string;
    image_url?: string[];
    creator_id: string;
    status: "upcoming" | "started" | "finished";
    created_at: string;
    users?: { name: string };
    participants: any[];
    participant_count?: number;
}
