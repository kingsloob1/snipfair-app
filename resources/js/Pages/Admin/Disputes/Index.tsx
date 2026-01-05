import CustomButton from '@/Components/common/CustomButton';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { AdminAccountLayout } from '@/Layouts/AdminAccountLayout';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    Calendar,
    CheckCircle,
    ChevronRight,
    Clock,
    MessageSquare,
    Search,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface DisputeItem {
    id: number;
    ref_id: string;
    comment: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'risky';
    from: 'customer' | 'stylist';
    created_at: string;
    updated_at: string;
    appointment: {
        id: number;
        booking_id: string;
        portfolio: {
            title: string;
        };
        appointment_date: string;
        amount: number;
    };
    customer?: {
        id: number;
        first_name: string;
        last_name: string;
        avatar?: string;
    };
    stylist?: {
        id: number;
        first_name: string;
        last_name: string;
        avatar?: string;
    };
    messages: Array<{
        id: number;
        message: string;
        created_at: string;
    }>;
}

interface DisputesIndexProps {
    disputes: {
        data: DisputeItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    metrics: {
        total: number;
        open: number;
        in_progress: number;
        resolved: number;
        closed: number;
    };
    filters: {
        search?: string;
        status?: string;
        priority?: string;
    };
}

const AdminDisputesIndex = ({
    disputes,
    metrics,
    filters,
}: DisputesIndexProps) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [priorityFilter, setPriorityFilter] = useState(
        filters.priority || '',
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-blue-100 text-blue-800';
            case 'in-progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'closed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low':
                return 'bg-blue-500 text-white';
            case 'medium':
                return 'bg-yellow-500 text-white';
            case 'high':
                return 'bg-orange-500 text-white';
            case 'risky':
                return 'bg-red-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const handleSearch = () => {
        router.get(
            window.route('admin.disputes.index'),
            {
                search: searchTerm,
                status: statusFilter,
                priority: priorityFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setPriorityFilter('');
        router.get(window.route('admin.disputes.index'));
    };

    const getLastMessage = (dispute: DisputeItem) => {
        if (dispute.messages.length > 0) {
            const lastMessage = dispute.messages[0];
            return {
                text:
                    lastMessage.message.length > 100
                        ? `${lastMessage.message.substring(0, 100)}...`
                        : lastMessage.message,
                time: new Date(lastMessage.created_at).toLocaleDateString(),
            };
        }
        return {
            text:
                dispute.comment.length > 100
                    ? `${dispute.comment.substring(0, 100)}...`
                    : dispute.comment,
            time: new Date(dispute.created_at).toLocaleDateString(),
        };
    };

    const routes = [
        {
            name: 'Admin Dashboard',
            path: window.route('admin.dashboard'),
            active: false,
        },
        {
            name: 'Disputes Management',
            path: window.route('admin.disputes.index'),
            active: true,
        },
    ];

    return (
        <AdminAccountLayout header="Disputes Management">
            <Head title="Disputes Management" />

            <StylistNavigationSteps
                routes={routes}
                sub="Manage and resolve appointment disputes"
            />

            {/* Metrics Cards */}
            <section className="mx-auto mb-6 max-w-7xl px-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-600">
                                Total
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                                <Users className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mb-3">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {metrics.total}
                            </h3>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-600">
                                Open
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mb-3">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {metrics.open}
                            </h3>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-yellow-600">
                                In Progress
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mb-3">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {metrics.in_progress}
                            </h3>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-green-600">
                                Resolved
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                                <CheckCircle className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mb-3">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {metrics.resolved}
                            </h3>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">
                                Closed
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                                <AlertCircle className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mb-3">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {metrics.closed}
                            </h3>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5">
                {/* Search and Filters */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search disputes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-blue-500"
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleSearch()
                                }
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="risky">Risky</option>
                        </select>

                        <div className="flex space-x-2">
                            <CustomButton
                                fullWidth={false}
                                onClick={handleSearch}
                            >
                                Search
                            </CustomButton>
                            <CustomButton
                                variant="secondary"
                                fullWidth={false}
                                onClick={clearFilters}
                            >
                                Clear
                            </CustomButton>
                        </div>
                    </div>
                </div>

                {/* Disputes List */}
                <div className="rounded-lg bg-white shadow-md">
                    {disputes.data.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {disputes.data.map((dispute) => {
                                const lastMessage = getLastMessage(dispute);

                                return (
                                    <button
                                        key={dispute.id}
                                        className="w-full cursor-pointer p-6 transition-colors hover:bg-gray-50"
                                        onClick={() =>
                                            router.visit(
                                                window.route(
                                                    'admin.disputes.show',
                                                    dispute.id,
                                                ),
                                            )
                                        }
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-1 text-left">
                                                        <div className="mb-2 flex flex-col items-start justify-between md:flex-row md:items-center">
                                                            <div className="flex space-x-3">
                                                                <h3 className="text-lg font-medium text-gray-900">
                                                                    Dispute{' '}
                                                                    {
                                                                        dispute.ref_id
                                                                    }
                                                                </h3>
                                                                <span
                                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(dispute.status)}`}
                                                                >
                                                                    {dispute.status
                                                                        .replace(
                                                                            '_',
                                                                            ' ',
                                                                        )
                                                                        .replace(
                                                                            /\b\w/g,
                                                                            (
                                                                                l,
                                                                            ) =>
                                                                                l.toUpperCase(),
                                                                        )}
                                                                </span>
                                                                <span
                                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(dispute.priority)}`}
                                                                >
                                                                    {dispute.priority
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase() +
                                                                        dispute.priority.slice(
                                                                            1,
                                                                        )}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-gray-500">
                                                                Created by{' '}
                                                                {dispute.from}
                                                            </span>
                                                        </div>

                                                        <p className="mb-2 text-sm text-gray-600">
                                                            Appointment:{' '}
                                                            {
                                                                dispute
                                                                    .appointment
                                                                    .booking_id
                                                            }{' '}
                                                            -{' '}
                                                            {
                                                                dispute
                                                                    .appointment
                                                                    .portfolio
                                                                    .title
                                                            }
                                                        </p>

                                                        <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                            <p className="text-sm text-gray-600">
                                                                Customer:{' '}
                                                                {dispute.customer
                                                                    ? `${
                                                                          dispute
                                                                              .customer
                                                                              ?.first_name
                                                                      } ${dispute.customer?.last_name}`
                                                                    : `Deleted Customer`}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                Stylist:{' '}
                                                                {dispute.stylist
                                                                    ? `${
                                                                          dispute
                                                                              .stylist
                                                                              ?.first_name
                                                                      } ${dispute.stylist?.last_name}`
                                                                    : `Deleted Stylist`}
                                                            </p>
                                                        </div>

                                                        <p className="mb-3 text-sm text-gray-700">
                                                            {lastMessage.text}
                                                        </p>

                                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                            <div className="flex items-center space-x-1">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>
                                                                    Created:{' '}
                                                                    {new Date(
                                                                        dispute.created_at,
                                                                    ).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Clock className="h-3 w-3" />
                                                                <span>
                                                                    Last
                                                                    activity:{' '}
                                                                    {
                                                                        lastMessage.time
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <MessageSquare className="h-3 w-3" />
                                                                <span>
                                                                    {
                                                                        dispute
                                                                            .messages
                                                                            .length
                                                                    }{' '}
                                                                    messages
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900">
                                No disputes found
                            </h3>
                            <p className="text-gray-600">
                                {searchTerm || statusFilter || priorityFilter
                                    ? 'Try adjusting your search filters.'
                                    : 'No disputes have been reported yet.'}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {disputes.last_page > 1 && (
                        <div className="border-t border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing page {disputes.current_page} of{' '}
                                    {disputes.last_page}
                                </div>
                                <div className="flex space-x-2">
                                    {disputes.current_page > 1 && (
                                        <button
                                            onClick={() =>
                                                router.get(
                                                    window.route(
                                                        'admin.disputes.index',
                                                    ),
                                                    {
                                                        page:
                                                            disputes.current_page -
                                                            1,
                                                    },
                                                )
                                            }
                                            className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    {disputes.current_page <
                                        disputes.last_page && (
                                        <button
                                            onClick={() =>
                                                router.get(
                                                    window.route(
                                                        'admin.disputes.index',
                                                    ),
                                                    {
                                                        page:
                                                            disputes.current_page +
                                                            1,
                                                    },
                                                )
                                            }
                                            className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </AdminAccountLayout>
    );
};

export default AdminDisputesIndex;
