import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    MessageCircle,
    Paperclip,
    Send,
    Shield,
    User,
} from 'lucide-react';
import { motion } from 'motion/react';
import { FormEventHandler, useRef } from 'react';

interface TicketMessage {
    id: number;
    message: string;
    created_at: string;
    sender_type: string;
    sender: {
        id: number;
        first_name?: string;
        last_name?: string;
        email?: string;
        name?: string;
    };
    attachments?: string[];
    is_internal: boolean;
}

interface Ticket {
    id: number;
    ticket_id: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'closed' | 'pending';
    priority: 'low' | 'medium' | 'high' | 'risky';
    created_at: string;
    updated_at: string;
    resolved_at?: string;
    messages: TicketMessage[];
}

type TicketDetailProps = {
    ticket: Ticket;
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'open':
            return <AlertCircle className="h-5 w-5" />;
        case 'in_progress':
            return <Clock className="h-5 w-5" />;
        case 'closed':
            return <CheckCircle2 className="h-5 w-5" />;
        case 'pending':
            return <Clock className="h-5 w-5" />;
        default:
            return <MessageCircle className="h-5 w-5" />;
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

const MessageBubble = ({
    message,
    isFromCustomer,
}: {
    message: TicketMessage;
    isFromCustomer: boolean;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 flex gap-3 ${isFromCustomer ? 'justify-end' : 'justify-start'}`}
        >
            {!isFromCustomer && (
                <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                        <Shield className="h-4 w-4 text-white" />
                    </div>
                </div>
            )}

            <div
                className={`flex max-w-xs flex-col sm:max-w-md lg:max-w-lg ${isFromCustomer ? 'items-end' : 'items-start'}`}
            >
                <div
                    className={`rounded-lg px-4 py-3 ${
                        isFromCustomer
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-200 bg-gray-100 text-gray-900'
                    }`}
                >
                    <p className="text-sm">{message.message}</p>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>
                        {isFromCustomer
                            ? 'You'
                            : message.sender.name || 'Support Agent'}
                    </span>
                    <span>•</span>
                    <span>{formatDate(message.created_at)}</span>
                </div>
            </div>

            {isFromCustomer && (
                <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                        <User className="h-4 w-4 text-gray-600" />
                    </div>
                </div>
            )}
        </motion.div>
    );
};

const TicketContainer = ({ ticket }: TicketDetailProps) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!data.message.trim()) return;

        post(route('tickets.send-message', ticket.ticket_id), {
            onSuccess: () => {
                reset('message');
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({
                        behavior: 'smooth',
                    });
                }, 100);
            },
        });
    };
    return (
        <section className="mx-auto max-w-4xl px-5 py-6 md:py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href={route('tickets.index')}
                    className="mb-4 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Tickets
                </Link>

                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="mb-2 text-2xl font-bold text-gray-900">
                                {ticket.subject}
                            </h1>
                            <p className="mb-4 text-gray-600">
                                {ticket.description}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="mb-2 font-mono text-sm text-gray-500">
                                #{ticket.ticket_id}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(ticket.status)}`}
                        >
                            {getStatusIcon(ticket.status)}
                            {ticket.status.replace('_', ' ').toUpperCase()}
                        </div>

                        <div
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${getPriorityColor(ticket.priority)}`}
                        >
                            {ticket.priority.toUpperCase()} PRIORITY
                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            Created {formatDate(ticket.created_at)}
                        </div>

                        {ticket.resolved_at && (
                            <div className="flex items-center gap-1 text-sm text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                Resolved {formatDate(ticket.resolved_at)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Conversation
                    </h2>
                </div>

                <div className="max-h-96 min-h-96 overflow-y-auto p-6">
                    {ticket.messages.length === 0 ? (
                        <div className="py-8 text-center">
                            <MessageCircle className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                            <p className="text-gray-600">
                                No messages yet. Start the conversation!
                            </p>
                        </div>
                    ) : (
                        <>
                            {ticket.messages.map((message) => (
                                <MessageBubble
                                    key={message.id}
                                    message={message}
                                    isFromCustomer={message.sender_type.includes(
                                        'User',
                                    )}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>
            </div>

            {/* Reply Form */}
            {ticket.status !== 'closed' && (
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                        Send a Message
                    </h3>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <textarea
                                value={data.message}
                                onChange={(e) =>
                                    setData('message', e.target.value)
                                }
                                placeholder="Type your message here..."
                                rows={4}
                                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.message && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.message}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 transition-colors hover:text-gray-900"
                            >
                                <Paperclip className="h-4 w-4" />
                                Attach File
                            </button>

                            <button
                                type="submit"
                                disabled={processing || !data.message.trim()}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                                {processing ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {ticket.status === 'closed' && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                    <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-600" />
                    <p className="font-medium text-green-800">
                        This ticket has been resolved
                    </p>
                    <p className="text-sm text-green-700">
                        Thank you for contacting support. If you need further
                        assistance, please create a new ticket.
                    </p>
                </div>
            )}
        </section>
    );
};

export default function TicketDetail({
    auth,
    ticket,
}: PageProps<TicketDetailProps>) {
    const routes = [
        {
            name: 'Dashboard',
            path: route('dashboard'),
            active: false,
        },
        {
            name: 'Support',
            path: route('tickets.index'),
            active: false,
        },
        {
            name: `Ticket #${ticket.ticket_id}`,
            path: route('tickets.show', ticket.ticket_id),
            active: true,
        },
    ];

    if (auth.user.role === 'customer') {
        return (
            <AuthenticatedLayout navigation={routes}>
                <Head title={`Ticket #${ticket.ticket_id}`} />
                <TicketContainer ticket={ticket} />
            </AuthenticatedLayout>
        );
    } else if (auth.user.role === 'stylist') {
        return (
            <StylistAuthLayout header="Stylist Support">
                <TicketContainer ticket={ticket} />
            </StylistAuthLayout>
        );
    } else null;
}
