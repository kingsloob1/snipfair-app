import { apiCall } from '@/hooks/api';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    Clock,
    Download,
    MessageSquare,
    Paperclip,
    Send,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface DisputeMessage {
    id: number;
    message: string;
    attachments?: Array<{
        name: string;
        url: string;
        size: number;
        type: string;
    }>;
    sender: {
        id: number;
        first_name?: string;
        last_name?: string;
        name?: string;
        type?: string;
    };
    sender_type: string;
    // sender_role: string;
    // sender_name: string;
    created_at: string;
    read_at?: string;
}

interface Dispute {
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
        ref_id: string;
        service_name: string;
        scheduled_date: string;
        total_amount: number;
        booking_id: string;
        portfolio: {
            title: string;
        };
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
    messages: DisputeMessage[];
}

interface DisputeShowProps extends PageProps {
    dispute: Dispute;
}

const DisputeShow = ({ auth, dispute }: DisputeShowProps) => {
    const [newMessage, setNewMessage] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messages, setMessages] = useState<DisputeMessage[]>(
        dispute.messages,
    );

    const isCustomer = auth.user.role === 'customer';
    const currentUserId = auth.user.id;

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setAttachments((prev) => [...prev, ...files].slice(0, 5)); // Max 5 files
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmitMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() && attachments.length === 0) return;

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('message', newMessage);

            attachments.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });

            const response = await apiCall(
                route('disputes.messages.store', dispute.id),
                {
                    method: 'POST',
                    body: formData,
                },
            );

            if (response.ok) {
                const data = await response.json();
                setMessages((prev) => [...prev, data.message]);
                setNewMessage('');
                setAttachments([]);
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // You might want to show an error toast here
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isMessageFromCurrentUser = (message: DisputeMessage) => {
        return (
            message.sender_type !== 'App\\Models\\Admin' &&
            message.sender.id === currentUserId
        );
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
            active: false,
        },
        {
            name: `Dispute #${dispute.ref_id}`,
            path: route('disputes.show', dispute.id),
            active: true,
        },
    ];

    const content = (
        <>
            <Head title={`Dispute #${dispute.ref_id}`} />
            <section className="mx-auto max-w-4xl px-5">
                {/* Dispute Header */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Dispute created by{' '}
                                {isCustomer
                                    ? dispute.from === 'customer'
                                        ? 'You'
                                        : 'Stylist'
                                    : dispute.from === 'customer'
                                      ? 'Customer'
                                      : 'You'}
                            </h1>
                            <p className="text-sm text-gray-600">
                                Appointment: {dispute.appointment.booking_id} -{' '}
                                {dispute.appointment.portfolio.title}
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <span
                                className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(dispute.status)}`}
                            >
                                {dispute.status
                                    .replace('_', ' ')
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                            <span
                                className={`rounded-full px-3 py-1 text-sm font-medium ${getPriorityColor(dispute.priority)}`}
                            >
                                {dispute.priority.charAt(0).toUpperCase() +
                                    dispute.priority.slice(1)}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                                Created:{' '}
                                {new Date(
                                    dispute.created_at,
                                ).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                                Updated:{' '}
                                {new Date(
                                    dispute.updated_at,
                                ).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-gray-50 p-4">
                        <h3 className="mb-2 font-medium text-gray-900">
                            Original Issue:
                        </h3>
                        <p className="text-gray-700">{dispute.comment}</p>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="rounded-lg bg-white shadow-md">
                    <div className="border-b border-gray-200 p-4">
                        <div className="flex items-center space-x-2">
                            <MessageSquare className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-medium text-gray-900">
                                Conversation
                            </h2>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="max-h-96 space-y-4 overflow-y-auto p-4">
                        {messages.length > 0 ? (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${isMessageFromCurrentUser(message) ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md ${isMessageFromCurrentUser(message) ? 'order-2' : 'order-1'}`}
                                    >
                                        <div
                                            className={`rounded-lg px-4 py-3 ${
                                                isMessageFromCurrentUser(
                                                    message,
                                                )
                                                    ? 'bg-sf-primary text-white'
                                                    : message.sender_type ===
                                                        'App\\Models\\Admin'
                                                      ? 'border border-orange-200 bg-orange-100 text-orange-900'
                                                      : 'bg-gray-100 text-gray-900'
                                            }`}
                                        >
                                            <div className="mb-1">
                                                <span
                                                    className={`text-xs font-medium ${
                                                        isMessageFromCurrentUser(
                                                            message,
                                                        )
                                                            ? 'text-blue-100'
                                                            : 'text-gray-600'
                                                    }`}
                                                >
                                                    {isMessageFromCurrentUser(
                                                        message,
                                                    )
                                                        ? 'You'
                                                        : message.sender.name}
                                                    {message.sender_type ===
                                                        'App\\Models\\Admin' &&
                                                        ' (Admin)'}
                                                </span>
                                            </div>
                                            <p className="text-sm">
                                                {message.message}
                                            </p>

                                            {/* Attachments */}
                                            {message.attachments &&
                                                message.attachments.length >
                                                    0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {message.attachments.map(
                                                            (
                                                                attachment,
                                                                index,
                                                            ) => (
                                                                <div
                                                                    key={index}
                                                                    className={`flex items-center space-x-2 rounded p-2 ${
                                                                        isMessageFromCurrentUser(
                                                                            message,
                                                                        )
                                                                            ? 'bg-sf-gray'
                                                                            : 'border bg-white'
                                                                    }`}
                                                                >
                                                                    <Paperclip className="h-4 w-4" />
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-xs">
                                                                            {
                                                                                attachment.name
                                                                            }
                                                                        </p>
                                                                        <p className="text-xs opacity-75">
                                                                            {formatFileSize(
                                                                                attachment.size,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <a
                                                                        href={route(
                                                                            'disputes.messages.download',
                                                                            [
                                                                                message.id,
                                                                                index,
                                                                            ],
                                                                        )}
                                                                        className="flex items-center space-x-1 text-xs hover:underline"
                                                                    >
                                                                        <Download className="h-3 w-3" />
                                                                        <span>
                                                                            Download
                                                                        </span>
                                                                    </a>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                )}

                                            <div
                                                className={`mt-2 text-xs ${
                                                    isMessageFromCurrentUser(
                                                        message,
                                                    )
                                                        ? 'text-blue-100'
                                                        : 'text-gray-500'
                                                }`}
                                            >
                                                {new Date(
                                                    message.created_at,
                                                ).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-gray-500">
                                <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    {dispute.status !== 'closed' &&
                    dispute.status !== 'resolved' ? (
                        <div className="border-t border-gray-200 p-4">
                            <form onSubmit={handleSubmitMessage}>
                                {/* Attachments Preview */}
                                {attachments.length > 0 && (
                                    <div className="mb-3 space-y-2">
                                        {attachments.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-2 rounded bg-gray-50 p-2"
                                            >
                                                <Paperclip className="h-4 w-4 text-gray-500" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatFileSize(
                                                            file.size,
                                                        )}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeAttachment(index)
                                                    }
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex space-x-3">
                                    <div className="flex-1">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) =>
                                                setNewMessage(e.target.value)
                                            }
                                            placeholder="Type your message..."
                                            className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-blue-500"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <label className="cursor-pointer rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50">
                                            <Paperclip className="h-5 w-5" />
                                            <input
                                                type="file"
                                                multiple
                                                className="hidden"
                                                accept=".jpg,.jpeg,.png,.pdf,.gif"
                                                onChange={handleFileChange}
                                                disabled={
                                                    attachments.length >= 5
                                                }
                                            />
                                        </label>
                                        <button
                                            type="submit"
                                            disabled={
                                                isSubmitting ||
                                                (!newMessage.trim() &&
                                                    attachments.length === 0)
                                            }
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            ) : (
                                                <Send className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    You can attach up to 5 files (max 5MB each).
                                    Supported formats: JPG, PNG, PDF
                                </p>
                            </form>
                        </div>
                    ) : (
                        <div className="border-t border-gray-200 p-4 text-center">
                            <div className="flex items-center justify-center space-x-2 text-gray-500">
                                <AlertCircle className="h-5 w-5" />
                                <span>
                                    This dispute has been {dispute.status} and
                                    is no longer accepting messages.
                                </span>
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
            <StylistAuthLayout header="Dispute Details">
                {content}
            </StylistAuthLayout>
        );
    }
};

export default DisputeShow;
