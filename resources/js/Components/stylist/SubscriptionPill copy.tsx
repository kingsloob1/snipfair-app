import { Link } from '@inertiajs/react';

type SubscriptionStatus = 'inactive' | 'active' | 'expired' | 'pending';

interface SubscriptionProps {
    status?: SubscriptionStatus;
}

// Subscription Component
const SubscriptionPill = ({ status }: SubscriptionProps) => {
    const getStatusStyles = () => {
        switch (status) {
            case 'active':
                return 'bg-green-500 text-white';
            case 'expired':
                return 'bg-red-500 text-white';
            case 'inactive':
            default:
                return 'bg-gray-400 text-white';
        }
    };

    const getStatusText = () => {
        if (status) return status.charAt(0).toUpperCase() + status.slice(1);
        else return 'Inactive';
    };

    return (
        <Link
            href={route('stylist.subscriptions')}
            className="inline-flex items-center rounded-full border border-orange-400 bg-white px-2 py-1"
        >
            <span className="mr-3 text-sm font-medium text-orange-500">
                Subscription
            </span>
            <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusStyles()}`}
            >
                {getStatusText()}
            </span>
        </Link>
    );
};

export default SubscriptionPill;
