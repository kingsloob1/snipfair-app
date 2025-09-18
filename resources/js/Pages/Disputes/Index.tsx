import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    ChevronRight,
    Clock,
    Search,
} from 'lucide-react';
import { useState } from 'react';

interface DisputeItem {
    id: number;
    ref_id: string;
    comment: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
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
        ref_id: string;
        service_name: string;
        scheduled_date: string;
        total_amount: number;
    };
    customer: {
        id: number;
        first_name: string;
        last_name: string;
        avatar?: string;
    };
    stylist: {
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

interface DisputesIndexProps extends PageProps {
    disputes: {
        data: DisputeItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const DisputesIndex = ({ auth, disputes }: DisputesIndexProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    const isCustomer = auth.user.role === 'customer';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-blue-100 text-blue-800';
            case 'in_progress':
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
            route('disputes.index'),
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
        router.get(route('disputes.index'));
    };

    const getOtherParty = (dispute: DisputeItem) => {
        const currentUserId = auth.user.id;
        if (dispute.customer.id === currentUserId) {
            return `${dispute.stylist.first_name} ${dispute.stylist.last_name}`;
        } else {
            return `${dispute.customer.first_name} ${dispute.customer.last_name}`;
        }
    };

    const getLastMessage = (dispute: DisputeItem) => {
        if (dispute.messages.length > 0) {
            const lastMessage = dispute.messages[0];
            return {
                text:
                    lastMessage.message.length > 100
                        ? `${lastMessage.message.substring(0, 100)}...`
                        : lastMessage.message,
                time: new Date(lastMessage.created_at).toLocaleString('en-US', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                }),
            };
        }
        return {
            text:
                dispute.comment.length > 100
                    ? `${dispute.comment.substring(0, 100)}...`
                    : dispute.comment,
            time: new Date(dispute.created_at).toLocaleString('en-US', {
                dateStyle: 'short',
                timeStyle: 'short',
            }),
        };
    };

    const routes = [
        {
            name: 'Dashboard',
            path: route('dashboard'),
            active: false,
        },
        {
            name: 'Disputes',
            path: route('disputes.index'),
            active: true,
        },
    ];

    const content = (
        <>
            <Head title="My Disputes" />
            <section className="mx-auto max-w-7xl px-5">
                {/* Header */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                My Disputes
                            </h1>
                            <p className="text-sm text-gray-600">
                                Manage and track your appointment disputes
                            </p>
                        </div>
                        <div className="text-sm text-gray-500">
                            {disputes.total} total disputes
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
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
                            <button
                                onClick={handleSearch}
                                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                            >
                                Search
                            </button>
                            <button
                                onClick={clearFilters}
                                className="rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Disputes List */}
                <div className="rounded-lg bg-white shadow-md">
                    {disputes.data.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {disputes.data.map((dispute) => {
                                const lastMessage = getLastMessage(dispute);
                                const otherParty = getOtherParty(dispute);

                                return (
                                    <div
                                        key={dispute.id}
                                        className="cursor-pointer p-6 transition-colors hover:bg-gray-50"
                                        onClick={() =>
                                            router.visit(
                                                route(
                                                    'disputes.show',
                                                    dispute.id,
                                                ),
                                            )
                                        }
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-1">
                                                        <div className="mb-2 flex items-center space-x-3">
                                                            <h3 className="text-lg font-medium text-gray-900">
                                                                Dispute{' '}
                                                                {dispute.ref_id}
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
                                                                        (l) =>
                                                                            l.toUpperCase(),
                                                                    )}
                                                            </span>
                                                            <span
                                                                className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(dispute.priority)}`}
                                                            >
                                                                {dispute.priority
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    dispute.priority.slice(
                                                                        1,
                                                                    )}
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

                                                        <p className="mb-2 text-sm text-gray-600">
                                                            Other party:{' '}
                                                            {otherParty}
                                                        </p>

                                                        <p className="text-sm text-gray-700">
                                                            {lastMessage.text}
                                                        </p>

                                                        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
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
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
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
                                    : "You don't have any disputes yet."}
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
                                                    route('disputes.index'),
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
                                                    route('disputes.index'),
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
        </>
    );

    if (isCustomer) {
        return (
            <AuthenticatedLayout
                showToExplore={false}
                exploreRoute={{
                    name: 'Back to Dashboard',
                    path: route('dashboard'),
                }}
                navigation={routes}
            >
                {content}
            </AuthenticatedLayout>
        );
    } else {
        return (
            <StylistAuthLayout header="My Disputes">
                {content}
            </StylistAuthLayout>
        );
    }
};

export default DisputesIndex;
