export interface Participant {
    id: string;
    event_id: string;
    user_id: string;
    joined_at: string;
    users: { name: string };
}
