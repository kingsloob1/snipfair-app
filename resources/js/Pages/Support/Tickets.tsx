import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    MessageCircle,
    Plus,
    Search,
} from 'lucide-react';
import { useState } from 'react';

interface Ticket {
    id: number;
    ticket_id: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'closed' | 'pending';
    priority: 'low' | 'medium' | 'high' | 'risky';
    created_at: string;
    updated_at: string;
    latest_message?: {
        message: string;
        created_at: string;
        sender_type: string;
    };
}

type TicketsProps = {
    tickets: {
        data: Ticket[];
        links: Record<string, unknown>;
        meta: Record<string, unknown>;
    };
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'open':
            return <AlertCircle className="h-4 w-4" />;
        case 'in_progress':
            return <Clock className="h-4 w-4" />;
        case 'closed':
            return <CheckCircle2 className="h-4 w-4" />;
        case 'pending':
            return <Clock className="h-4 w-4" />;
        default:
            return <MessageCircle className="h-4 w-4" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'open':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'in_progress':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'closed':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'pending':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'low':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'high':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'risky':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const TicketCard = ({ ticket }: { ticket: Ticket }) => {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {ticket.subject}
                        </h3>
                        <span className="font-mono text-sm text-gray-500">
                            #{ticket.ticket_id}
                        </span>
                    </div>
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                        {ticket.description}
                    </p>
                </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(ticket.status)}`}
                    >
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace('_', ' ').toUpperCase()}
                    </div>
                    <div
                        className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getPriorityColor(ticket.priority)}`}
                    >
                        {ticket.priority.toUpperCase()}
                    </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {formatDate(ticket.created_at)}
                </div>
            </div>

            {ticket.latest_message && (
                <div className="mb-3 border-t pt-3">
                    <p className="line-clamp-2 text-sm text-gray-600">
                        <span className="font-medium">
                            {ticket.latest_message.sender_type.includes('User')
                                ? 'You'
                                : 'Support'}
                            :
                        </span>{' '}
                        {ticket.latest_message.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        {formatDate(ticket.latest_message.created_at)}
                    </p>
                </div>
            )}

            <div className="flex justify-end">
                <Link
                    href={window.route('tickets.show', ticket.ticket_id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                    <MessageCircle className="h-4 w-4" />
                    View Details
                </Link>
            </div>
        </div>
    );
};

const TicketContainer = ({ tickets }: TicketsProps) => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const filteredTickets = tickets.data.filter((ticket) => {
        const matchesStatus =
            statusFilter === 'all' || ticket.status === statusFilter;
        const matchesPriority =
            priorityFilter === 'all' || ticket.priority === priorityFilter;
        const matchesSearch =
            searchQuery === '' ||
            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.ticket_id.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesPriority && matchesSearch;
    });
    return (
        <section className="mx-auto max-w-7xl px-5 py-6 md:py-8">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
                        Support Tickets
                    </h1>
                    <p className="text-gray-600">
                        Track and manage your support requests
                    </p>
                </div>
                <Link
                    href={window.route('tickets.create')}
                    className="inline-flex items-center gap-2 rounded-lg bg-sf-gradient-primary px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    New Ticket
                </Link>
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex flex-col gap-4 lg:flex-row">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tickets by subject or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 px-8 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="pending">Pending</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    {/* Priority Filter */}
                    <div>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="px-8s rounded-lg border border-gray-300 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Priority</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="risky">Critical</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tickets Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {filteredTickets.length === 0 ? (
                    <div className="col-span-full py-12 text-center">
                        <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900">
                            No tickets found
                        </h3>
                        <p className="mb-6 text-gray-600">
                            {tickets.data.length === 0
                                ? "You haven't created any support tickets yet."
                                : 'No tickets match your current filters.'}
                        </p>
                        <Link
                            href={window.route('tickets.create')}
                            className="inline-flex items-center gap-2 rounded-lg bg-sf-gradient-primary px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Create Your First Ticket
                        </Link>
                    </div>
                ) : (
                    filteredTickets.map((ticket) => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                    ))
                )}
            </div>

            {/* Pagination would go here if needed */}
            {tickets.links && (
                <div className="mt-8 flex justify-center">
                    {/* Add pagination component here */}
                </div>
            )}
        </section>
    );
};

export default function Tickets({ auth, tickets }: PageProps<TicketsProps>) {
    const routes = [
        {
            name: 'Dashboard',
            path: window.route('dashboard'),
            active: false,
        },
        {
            name: 'Support',
            path: window.route('tickets.index'),
            active: true,
        },
    ];

    if (auth.user.role === 'customer') {
        return (
            <AuthenticatedLayout navigation={routes}>
                <Head title="Support Tickets" />
                <TicketContainer tickets={tickets} />
            </AuthenticatedLayout>
        );
    } else if (auth.user.role === 'stylist') {
        return (
            <StylistAuthLayout header="Stylist Support">
                <TicketContainer tickets={tickets} />
            </StylistAuthLayout>
        );
    }
}
