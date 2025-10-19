type SubscriptionStatus = 'inactive' | 'active' | 'expired' | 'pending';
export interface User {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    email_verified_at?: string;
    phone_verified_at?: string;
    avatar?: string;
    country?: string;
    bio?: string;
    role: 'customer' | 'stylist' | 'admin';
    phone?: string;
    subscription_status?: SubscriptionStatus;
    availability?: boolean;
    plan?: string;
    stylist_profile?: {
        is_available: boolean;
        business_name: string;
        years_of_experience: string;
        status: 'approved' | 'pending' | 'flagged' | 'rejected';
    };
}

type Item = {
    type: 'reminder' | 'setting' | 'info' | 'chat';
    title: string;
    description: string;
    timestamp: string;
    isUnread?: boolean;
    image?: string;
    id: number;
    other_id?: number;
};

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

export type PagePropsWithNotifiers<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    'auth:from:app'?: boolean;
    recentChats: Item[];
    recentNotifications: Item[];
};

export type NavRoute = {
    name: string;
    path: string;
    active?: boolean;
};

export interface Product {
    id: number;
    name: string;
    title: string;
    profession: string;
    category: string;
    description: string;
    location: string;
    image: string;
    rating: number;
    reviewCount: number;
    award: string;
    specialties: { name: string; price: string }[];
    price: number;
    priceRange: string;
    experience: string;
    nextAvailable: string;
    favorite: boolean;
    badge: string;
    bookings: number;
    isAvailable: boolean;
    availability?: 'Today' | 'Tomorrow' | 'A week' | 'Strictly Booking';
    distance: string;
    isCertified: boolean;
    certificationText: string;
    responseTime: string;
    workSamples: string[];
    section: 'top_rated' | 'featured' | 'online';
    likes: number;
    time: string;
    duration: string;
}

export interface WorkingHour {
    day: string;
    openTime?: string;
    closeTime?: string;
    isClosed?: boolean;
}

export interface AppointmentProps {
    id: number;
    stylistName?: string;
    appointmentType?: string;
    stylistTitle?: string;
    location?: string;
    date?: string;
    time?: string;
    price?: string;
    status:
        | 'Completed'
        | 'Pending'
        | 'Failed'
        | 'Reversed'
        | 'Approved'
        | 'Declined'
        | 'Processing';
    avatarUrl?: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    is_read: boolean;
    sender_id: string;
    receiver_id: string;
    timestamp: string;
}
export interface ChatMessageGroup {
    date: string;
    messages: ChatMessage[];
}
export interface ChatConversation {
    id: string;
    other_user_id: string;
    other_user_name: string;
    other_user_image: string;
    other_user_role: 'customer' | 'stylist';
    message_groups: ChatMessageGroup[];
    is_online?: boolean;
    last_seen?: string;
}
export type ChatFilterType = 'all' | 'new' | 'opened';

type Priority = 'Low' | 'Medium' | 'High' | 'Risky' | 'Opened';
interface NotificationCardProps {
    id?: number;
    title: string;
    description: string;
    time_ago: string;
    time_string: string;
    priority: Priority;
    primaryAction?: () => void;
    secondaryAction?: () => void;
    primaryActionLabel?: string;
    secondaryActionLabel?: string;
    is_read: boolean;
    type?: string;
    action_url?: string;
}

interface AppointmentCardProps {
    appointment: number;
    name: string;
    stylist_id: number;
    customer_id: number;
    service: string;
    amount: number;
    status: 'confirmed' | 'pending' | 'canceled' | 'rescheduled';
    date: string;
    time: string;
    imageUrl?: string;
}
