import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

type SubscriptionStatus =
    | 'unverified'
    | 'approved'
    | 'pending'
    | 'flagged'
    | 'rejected';

interface SubscriptionProps {
    status?: SubscriptionStatus;
}

// Subscription Component
const SubscriptionPill = ({ status }: SubscriptionProps) => {
    const getStatusColor = (
        status: 'unverified' | 'approved' | 'pending' | 'flagged' | 'rejected',
    ) => {
        switch (status) {
            case 'approved':
                return 'bg-green-600';
            case 'pending':
                return 'bg-yellow-600';
            case 'flagged':
                return 'bg-yellow-600';
            case 'rejected':
                return 'bg-red-600';
            default:
                return 'bg-gray-600';
        }
    };

    const getStatusText = (
        status: 'unverified' | 'approved' | 'pending' | 'flagged' | 'rejected',
    ) => {
        if (status) return status.charAt(0).toUpperCase() + status.slice(1);
        else return 'Pending';
    };

    return (
        <Link
            href={route('stylist.verification')}
            className={cn(
                'inline-flex items-center rounded-full border border-orange-400 px-2 py-1',
                status === 'unverified' ? 'bg-danger-normal' : 'bg-white',
            )}
        >
            <span
                className={cn(
                    'mr-3 text-sm font-medium',
                    status === 'unverified'
                        ? 'text-sf-white'
                        : 'text-orange-500',
                )}
            >
                {status === 'unverified' ? 'Verify Profile' : 'Verification'}
            </span>
            <span
                className={`rounded-full px-2 py-1 text-xs font-medium text-white ${getStatusColor(status || 'unverified')}`}
            >
                {getStatusText(status || 'unverified')}
            </span>
        </Link>
    );
};

export default SubscriptionPill;
