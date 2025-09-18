export interface Service {
    id: number;
    name: string;
    banner?: string;
    description?: string;
    image_url?: string;
    tags?: string[];
}

export type AppointmentStatusProps =
    | 'Completed'
    | 'Pending'
    | 'Failed'
    | 'Reversed'
    | 'Approved'
    | 'Declined'
    | 'Processing';

export interface Transaction {
    id: string;
    name: string;
    email: string;
    requestId: string;
    purpose: string;
    requestTime: string;
    amount: number;
    status: AppointmentStatusProps;
    avatar: string;
}

export interface PaymentMethod {
    id: number;
    bank: string;
    account: string;
    routing: string;
    is_active: boolean;
    is_default: boolean;
}

export interface EarningProps {
    statistics: {
        total_earnings: {
            value: number;
            current_period: number;
            change_percentage: number;
            change_text: string;
            is_positive: boolean;
        };
        total_balance: {
            value: number;
            change_percentage: number;
            change_text: string;
            is_positive: boolean;
        };
        total_withdrawn: {
            value: number;
            current_period: number;
            change_percentage: number;
            change_text: string;
            is_positive: boolean;
        };
        total_requests: {
            value: number;
            change_text: string;
            is_positive: boolean;
        };
    };
    payment_method: {
        bank: string;
        account: string;
        routing: string;
    };
    payment_method_full: PaymentMethod;
    payment_methods: PaymentMethod[];
    settings: {
        automatic_payout: boolean;
        payout_frequency: string;
    };
    transactions: Transaction[];
}

export interface UserProfileProps {
    statistics: {
        total_spendings: number;
        total_appointments: number;
        completed_appointments: number;
        failed_appointments: number;
        active_appointments: number;
    };
    user: {
        name: string;
        email: string;
        phone?: string;
        country?: string;
        bio?: string;
        avatar?: string;
    };
}

export type MergedStylistPortfolioItem = {
    id: number;
    profile_id: number | null;
    availability_status: boolean | null;
    availability:
        | 'Online Now'
        | 'Today'
        | 'Tomorrow'
        | 'This Week'
        | 'Available Later';
    distance: string | null;
    response_time: string | null;
    next_available: string | null;
    average_rating: number | null;
    total_reviews: number | null;
    is_liked: boolean | null;
    name: string | null;
    title: string | null;
    certificates: string[] | null;
    profile_image: string | null;
    banner_image: string | null;
    sample_images: string[] | null;
    price_range: string | null;
    location: string | null;
    categories: { category: string; price: number }[] | null;
    years_of_experience: number | null;
    likes_count: number | null;
    section: 'top_rated' | 'online' | 'featured' | null;
    category: string | null;
    description: string | null;
    appointment_counts: number | null;
    price: number | null;
    stylist_name: string | null;
};
