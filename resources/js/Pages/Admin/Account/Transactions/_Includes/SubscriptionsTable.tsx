import CommonAvatar from '@/Components/common/forms/CommonAvatar';
import Modal from '@/Components/Modal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import {
    Check,
    Eye,
    Flag,
    MoreVertical,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Subscription {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
    plan: {
        id: number;
        name: string;
        amount: number;
    };
    payment: {
        id: number;
        status: string;
    };
    expiry: string;
    created_at: string;
}

interface SubscriptionsTableProps {
    subscriptions: Subscription[];
}

const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({
    subscriptions,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubscription, setSelectedSubscription] =
        useState<Subscription | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'flag' | 'delete' | 'approve' | 'decline' | 'reverse';
        subscription: Subscription;
    } | null>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
        }).format(amount || 0);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            declined: 'bg-red-100 text-red-800',
            reversed: 'bg-purple-100 text-purple-800',
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            flagged: 'bg-red-100 text-red-800',
        };
        return (
            statusColors[status as keyof typeof statusColors] ||
            'bg-gray-100 text-gray-800'
        );
    };

    const filteredSubscriptions = subscriptions.filter(
        (subscription) =>
            subscription.user.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            subscription.user.email
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            subscription.plan.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
    );

    const handleViewDetails = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setShowDetailsModal(true);
    };

    const handleActionConfirm = (
        type: 'flag' | 'delete' | 'approve' | 'decline' | 'reverse',
        subscription: Subscription,
    ) => {
        setConfirmAction({ type, subscription });
        setShowConfirmDialog(true);
    };

    const executeAction = () => {
        if (!confirmAction) return;

        const { type, subscription } = confirmAction;

        switch (type) {
            case 'flag':
                router.post(route('admin.transactions.flag-subscription'), {
                    subscription_id: subscription.id,
                });
                break;
            case 'delete':
                router.post(route('admin.transactions.delete-subscription'), {
                    subscription_id: subscription.id,
                });
                break;
            case 'approve':
            case 'decline':
            case 'reverse':
                router.post(
                    route('admin.transactions.update-subscription-status'),
                    {
                        subscription_id: subscription.id,
                        status: type + 'd',
                    },
                );
                break;
        }

        setShowConfirmDialog(false);
        setConfirmAction(null);
    };

    const getActionText = () => {
        if (!confirmAction) return '';
        const { type, subscription } = confirmAction;
        switch (type) {
            case 'flag':
                return `flag ${subscription.user.name}'s subscription`;
            case 'delete':
                return `delete ${subscription.user.name}'s subscription`;
            case 'approve':
                return `approve ${subscription.user.name}'s subscription`;
            case 'decline':
                return `decline ${subscription.user.name}'s subscription`;
            case 'reverse':
                return `reverse ${subscription.user.name}'s subscription`;
            default:
                return '';
        }
    };

    return (
        <div className="rounded-lg bg-white shadow">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Subscriptions
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search subscriptions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Plan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Plan Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Payment Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Expiry
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredSubscriptions.map((subscription) => (
                            <tr
                                key={subscription.id}
                                className="hover:bg-gray-50"
                            >
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <CommonAvatar
                                                name={subscription.user.name}
                                                image={subscription.user.avatar}
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {subscription.user.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {subscription.user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {subscription.plan.name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {formatCurrency(subscription.plan.amount)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(subscription.payment.status)}`}
                                    >
                                        {subscription.payment.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {formatDate(subscription.created_at)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {formatDate(subscription.expiry)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="z-50 w-48"
                                        >
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleViewDetails(
                                                        subscription,
                                                    )
                                                }
                                                className="flex items-center"
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            {subscription.payment.status ===
                                                'pending' && (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleActionConfirm(
                                                                'approve',
                                                                subscription,
                                                            )
                                                        }
                                                        className="flex w-full items-center px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50"
                                                    >
                                                        <Check className="mr-2 h-4 w-4" />
                                                        Approve
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleActionConfirm(
                                                                'decline',
                                                                subscription,
                                                            )
                                                        }
                                                        className="flex w-full items-center px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50"
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        Decline
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleActionConfirm(
                                                                'reverse',
                                                                subscription,
                                                            )
                                                        }
                                                        className="flex w-full items-center px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50"
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        Reverse
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleActionConfirm(
                                                        'flag',
                                                        subscription,
                                                    )
                                                }
                                                className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <Flag className="mr-2 h-4 w-4" />
                                                Flag Subscription
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleActionConfirm(
                                                        'delete',
                                                        subscription,
                                                    )
                                                }
                                                className="flex items-center text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Subscription
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredSubscriptions.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="text-gray-500">
                            No subscriptions found
                        </div>
                    </div>
                )}
            </div>

            {/* Subscription Details Modal */}
            <Modal
                show={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                maxWidth="lg"
            >
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                        Subscription Details
                    </h3>
                    {selectedSubscription && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        User
                                    </label>
                                    <div className="mt-1 flex items-center space-x-3">
                                        <CommonAvatar
                                            name={
                                                selectedSubscription.user.name
                                            }
                                            image={
                                                selectedSubscription.user.avatar
                                            }
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedSubscription.user.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {
                                                    selectedSubscription.user
                                                        .email
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Plan
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {selectedSubscription.plan.name}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Plan Amount
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {formatCurrency(
                                            selectedSubscription.plan.amount,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Payment Status
                                    </label>
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(selectedSubscription.payment.status)}`}
                                    >
                                        {selectedSubscription.payment.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date Subscribed
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {formatDate(
                                            selectedSubscription.created_at,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Expiry Date
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {formatDate(
                                            selectedSubscription.expiry,
                                        )}
                                    </p>
                                </div>
                            </div>
                            {selectedSubscription.payment.status ===
                                'pending' && (
                                <div className="mt-6 flex space-x-3">
                                    <button
                                        onClick={() =>
                                            handleActionConfirm(
                                                'approve',
                                                selectedSubscription,
                                            )
                                        }
                                        className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleActionConfirm(
                                                'decline',
                                                selectedSubscription,
                                            )
                                        }
                                        className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                    >
                                        Decline
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleActionConfirm(
                                                'reverse',
                                                selectedSubscription,
                                            )
                                        }
                                        className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                                    >
                                        Reverse
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setShowDetailsModal(false)}
                            className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Confirmation Dialog */}
            <Modal
                show={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                maxWidth="md"
            >
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                        Confirm Action
                    </h3>
                    <p className="mb-6 text-gray-600">
                        Are you sure you want to {getActionText()}? This action
                        cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setShowConfirmDialog(false)}
                            className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={executeAction}
                            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SubscriptionsTable;
