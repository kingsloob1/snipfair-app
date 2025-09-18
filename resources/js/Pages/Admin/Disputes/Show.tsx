import CommonAvatar from '@/Components/common/forms/CommonAvatar';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { apiCall } from '@/hooks/api';
import { AdminAccountLayout } from '@/Layouts/AdminAccountLayout';
import { openFullscreenOverlay } from '@/lib/helper';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    DollarSign,
    Download,
    MessageSquare,
    Paperclip,
    Send,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
    sender_role: string;
    sender_name: string;
    created_at: string;
    read_at?: string;
}

interface Dispute {
    id: number;
    ref_id: string;
    comment: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'risky';
    from: 'customer' | 'stylist';
    resolution_comment: string;
    image_urls: string[];
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
    admin_customer_messages: DisputeMessage[];
    admin_stylist_messages: DisputeMessage[];
}

type ResolutionType =
    | 'refund_customer'
    | 'complete_for_stylist'
    | 'no_action'
    | 'split_refund';

interface DisputeShowProps {
    dispute: Dispute;
}

const AdminDisputeShow = ({ dispute }: DisputeShowProps) => {
    const [activeTab, setActiveTab] = useState<'customer' | 'stylist'>(
        'customer',
    );
    const [newMessage, setNewMessage] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customerMessages, setCustomerMessages] = useState<DisputeMessage[]>(
        dispute.admin_customer_messages,
    );
    const [stylistMessages, setStylistMessages] = useState<DisputeMessage[]>(
        dispute.admin_stylist_messages,
    );
    const [currentPriority, setCurrentPriority] = useState<Dispute['priority']>(
        dispute.priority,
    );
    const [showResolutionModal, setShowResolutionModal] = useState(false);
    const { data, setData, processing, patch, reset } = useForm({
        status: 'resolved',
        resolutionComment: '',
        resolutionType: 'no_action',
        refundAmount: dispute.appointment.amount,
        refundPercentage: 100,
        customerAmount: dispute.appointment.amount,
        stylistAmount: 0,
    });

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

    const getPriorityColor = (priority: Dispute['priority']) => {
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
            const totalFiles = attachments.length + files.length;

            if (totalFiles > 5) {
                toast.error('You can only attach a maximum of 5 files');
                return;
            }

            setAttachments((prev) => [...prev, ...files].slice(0, 5));
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
        toast.success('Attachment removed');
    };

    const handleSubmitMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if ((!newMessage.trim() && attachments.length === 0) || !activeTab) {
            toast.warning('Please enter a message or attach a file');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('message', newMessage);
            formData.append(
                'conversation_type',
                activeTab === 'stylist' ? 'admin_stylist' : 'admin_customer',
            );

            attachments.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });

            const response = await apiCall(
                route('admin.disputes.messages.store', dispute.id),
                {
                    method: 'POST',
                    body: formData,
                },
            );

            if (response.ok) {
                const data = await response.json();
                if (activeTab === 'stylist') {
                    setStylistMessages((prev) => [...prev, data.message]);
                } else {
                    setCustomerMessages((prev) => [...prev, data.message]);
                }
                setNewMessage('');
                setAttachments([]);
                toast.success('Message sent successfully');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to send message',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (currentStatus: string) => {
        try {
            const response = await apiCall(
                route('admin.disputes.status.update', dispute.id),
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        status: currentStatus,
                    }),
                },
            );

            if (response.ok) {
                toast.success('Dispute status updated successfully');
                router.reload({ only: ['dispute'] });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to update status',
            );
        }
    };

    const handleUpdatePriority = async (newPriority: Dispute['priority']) => {
        try {
            const response = await apiCall(
                route('admin.disputes.priority.update', dispute.id),
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        priority: newPriority,
                    }),
                },
            );

            if (response.ok) {
                setCurrentPriority(newPriority);
                toast.success('Priority updated successfully');
            } else {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || 'Failed to update priority',
                );
            }
        } catch (error) {
            console.error('Error updating priority:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to update priority',
            );
        }
    };

    const openResolveDispute = () => {
        if (dispute.status !== 'resolved') {
            reset();
            setShowResolutionModal(true);
        }
    };

    const handleResolveDispute = async () => {
        // Validate required fields
        if (!data.resolutionComment.trim()) {
            toast.info('Please provide a resolution comment');
            return;
        }

        if (data.refundPercentage < 0 || data.refundPercentage > 100) {
            toast.error(
                'Please provide a valid refund amount, should not be lesser than 0 or more than appointment amount',
            );
            return;
        }

        if (
            (data.resolutionType === 'refund_customer' ||
                data.resolutionType === 'split_refund') &&
            !data.refundAmount
        ) {
            toast.error('Please specify the refund amount');
            return;
        }

        try {
            patch(route('admin.disputes.status.update', dispute.id), {
                onSuccess: () => {
                    toast.success('Dispute resolved successfully');
                    reset();
                    router.reload({ only: ['dispute'] });
                },
                onError: (errors) => {
                    //get first error
                    const firstError = Object.values(errors)[0];
                    toast.error(firstError ?? 'Failed to resolve dispute');
                },
            });
        } catch (error) {
            console.error('Error resolving dispute:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to resolve dispute',
            );
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleAmountChange = (amount: number) => {
        const totalAmount = dispute.appointment.amount;
        // setRefundAmount(amount);
        setData((prev) => ({
            ...prev,
            refundAmount: amount,
            refundPercentage: Math.round((amount / totalAmount) * 100),
        }));

        if (data.resolutionType === 'split_refund') {
            setData((prev) => ({
                ...prev,
                customerAmount: amount,
                stylistAmount: totalAmount - amount,
            }));
        }
    };

    const handlePercentageChange = (percentage: number) => {
        const totalAmount = dispute.appointment.amount;
        const amount = (totalAmount * percentage) / 100;
        setData((prev) => ({
            ...prev,
            refundAmount: Math.round(amount * 100) / 100,
            refundPercentage: percentage,
        }));

        if (data.resolutionType === 'split_refund') {
            setData((prev) => ({
                ...prev,
                customerAmount: Math.round(amount * 100) / 100,
                stylistAmount: Math.round((totalAmount - amount) * 100) / 100,
            }));
        }
    };

    const handleCustomerAmountChange = (amount: number) => {
        const totalAmount = dispute.appointment.amount;
        setData((prev) => ({
            ...prev,
            customerAmount: Math.round(amount * 100) / 100,
            stylistAmount: Math.round((totalAmount - amount) * 100) / 100,
            refundAmount: amount,
            refundPercentage: Math.round((amount / totalAmount) * 100),
        }));
    };

    const routes = [
        {
            name: 'Admin Dashboard',
            path: route('admin.dashboard'),
            active: true,
        },
        {
            name: 'Disputes',
            path: route('admin.disputes.index'),
            active: true,
        },
        {
            name: `Dispute #${dispute.ref_id}`,
            path: route('admin.disputes.show', dispute.id),
            active: false,
        },
    ];

    const renderMessages = (renderMessages: DisputeMessage[]) => {
        return (
            <div className="tiny-scrollbar max-h-96 space-y-4 overflow-y-auto p-4">
                {renderMessages.length > 0 ? (
                    renderMessages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender_type === 'App\\Models\\Admin' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-xs lg:max-w-md`}>
                                <div
                                    className={`rounded-lg px-4 py-3 ${
                                        message.sender_type ===
                                        'App\\Models\\Admin'
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                    }`}
                                >
                                    <div className="mb-1">
                                        <span
                                            className={`text-xs font-medium ${
                                                message.sender_type ===
                                                'App\\Models\\Admin'
                                                    ? 'text-orange-100'
                                                    : 'text-gray-600'
                                            }`}
                                        >
                                            {message.sender_type ===
                                            'App\\Models\\Admin'
                                                ? '(Admin)'
                                                : message.sender.name}
                                        </span>
                                    </div>
                                    <p className="text-sm">{message.message}</p>

                                    {/* Attachments */}
                                    {message.attachments &&
                                        message.attachments.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {message.attachments.map(
                                                    (attachment, index) => (
                                                        <div
                                                            key={index}
                                                            className={`flex items-center space-x-2 rounded p-2 ${
                                                                message.sender_type ===
                                                                'App\\Models\\Admin'
                                                                    ? 'bg-orange-500'
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
                                            message.sender_type ===
                                            'App\\Models\\Admin'
                                                ? 'text-orange-100'
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
        );
    };

    return (
        <AdminAccountLayout header="Dispute Management">
            <Head title={`Dispute #${dispute.ref_id}`} />

            <StylistNavigationSteps
                routes={routes}
                sub="Manage and resolve appointment disputes"
            />

            <section className="mx-auto max-w-6xl px-5">
                {/* Dispute Header */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-4 flex flex-col items-start justify-between md:flex-row md:items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Dispute from{' '}
                                <span className="capitalize">
                                    {dispute.from}
                                </span>
                            </h1>
                            <p className="text-sm text-gray-600">
                                Appointment: {dispute.appointment.booking_id} -{' '}
                                {dispute.appointment.portfolio.title}
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <div className="flex items-center space-x-2">
                                <span
                                    className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(dispute.status)}`}
                                >
                                    {dispute.status
                                        .replace('_', ' ')
                                        .replace(/\b\w/g, (l) =>
                                            l.toUpperCase(),
                                        )}
                                </span>
                            </div>
                            <div className="relative">
                                <select
                                    value={currentPriority}
                                    onChange={(e) =>
                                        handleUpdatePriority(
                                            e.target
                                                .value as Dispute['priority'],
                                        )
                                    }
                                    className={`rounded-full border-none px-3 py-1 text-sm font-medium ${getPriorityColor(currentPriority)}`}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="risky">Risky</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mb-4 flex space-x-3">
                        {dispute.status === 'open' && (
                            <button
                                onClick={() => {
                                    handleUpdateStatus('in_progress');
                                }}
                                className="rounded-lg bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700"
                            >
                                Move to In Progress
                            </button>
                        )}

                        {(dispute.status === 'open' ||
                            dispute.status === 'in_progress') && (
                            <button
                                onClick={openResolveDispute}
                                className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                            >
                                Resolve Dispute
                            </button>
                        )}

                        {dispute.status !== 'closed' &&
                            dispute.status !== 'resolved' && (
                                <button
                                    onClick={() => {
                                        handleUpdateStatus('closed');
                                    }}
                                    className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                                >
                                    Close Dispute
                                </button>
                            )}
                    </div>

                    {/* Participants and Details */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <h3 className="mb-3 font-medium text-gray-900">
                                Participants
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    className="flex items-center space-x-3"
                                    href={route(
                                        'admin.users.customer',
                                        dispute.customer.id,
                                    )}
                                >
                                    <CommonAvatar
                                        image={
                                            `/storage/${dispute.customer.avatar}` ||
                                            ''
                                        }
                                        name={`${dispute.customer.first_name} ${dispute.customer.last_name}`}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {dispute.customer.first_name}{' '}
                                            {dispute.customer.last_name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Customer
                                        </p>
                                    </div>
                                    {dispute.from === 'customer' && (
                                        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                            Dispute Creator
                                        </span>
                                    )}
                                </Link>

                                <Link
                                    className="flex items-center space-x-3"
                                    href={route(
                                        'admin.users.stylist',
                                        dispute.stylist.id,
                                    )}
                                >
                                    <CommonAvatar
                                        image={
                                            `/storage/${dispute.stylist.avatar}` ||
                                            ''
                                        }
                                        name={`${dispute.stylist.first_name} ${dispute.stylist.last_name}`}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {dispute.stylist.first_name}{' '}
                                            {dispute.stylist.last_name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Stylist
                                        </p>
                                    </div>
                                    {dispute.from === 'stylist' && (
                                        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                            Dispute Creator
                                        </span>
                                    )}
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-3 font-medium text-gray-900">
                                Details
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        Created:{' '}
                                        {new Date(
                                            dispute.created_at,
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        Updated:{' '}
                                        {new Date(
                                            dispute.updated_at,
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <DollarSign className="h-4 w-4" />
                                    <span>
                                        Appointment Value: R
                                        {dispute.appointment.amount}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 rounded-lg bg-gray-50 p-4">
                        <h3 className="mb-2 font-medium text-gray-900">
                            Original Issue:
                        </h3>
                        <p className="text-gray-700">{dispute.comment}</p>
                        <hr className="my-4" />
                        <div>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                {dispute.image_urls &&
                                    dispute.image_urls.length > 0 &&
                                    dispute.image_urls.map((file, index) => (
                                        <div
                                            key={index}
                                            className="group relative"
                                        >
                                            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                                <img
                                                    src={`/storage/${file}`}
                                                    onClick={() =>
                                                        openFullscreenOverlay(
                                                            `/storage/${file}`,
                                                        )
                                                    }
                                                    alt={'Upload work ' + index}
                                                    className="h-full w-full cursor-pointer object-cover"
                                                />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
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

                    {/* Tab Headers */}
                    <div className="mb-4 flex border-b border-gray-200">
                        <button
                            className={`w-1/2 px-4 py-2 ${activeTab === 'customer' ? 'border-b-2 border-orange-500' : ''}`}
                            onClick={() => setActiveTab('customer')}
                        >
                            Customer{' '}
                            <span className="hidden md:inline">
                                Conversation
                            </span>{' '}
                            ({customerMessages.length})
                        </button>
                        <button
                            className={`w-1/2 px-4 py-2 ${activeTab === 'stylist' ? 'border-b-2 border-orange-500' : ''}`}
                            onClick={() => setActiveTab('stylist')}
                        >
                            Stylist{' '}
                            <span className="hidden md:inline">
                                Conversation
                            </span>{' '}
                            ({stylistMessages.length})
                        </button>
                    </div>
                    {/* Messages List */}
                    <div className="messages-container">
                        {activeTab === 'customer'
                            ? renderMessages(customerMessages)
                            : renderMessages(stylistMessages)}
                    </div>

                    {/* Admin Message Input */}
                    {!(
                        dispute.status === 'closed' ||
                        dispute.status === 'resolved'
                    ) && (
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
                                            placeholder="Type your admin response..."
                                            className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-orange-500 focus:ring-orange-500"
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
                                            className="rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                                    Responding to {activeTab}. You can attach up
                                    to 5 files (max 5MB each).
                                </p>
                            </form>
                        </div>
                    )}
                </div>
            </section>

            {/* Resolution Modal */}
            {showResolutionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="mx-4 w-full max-w-lg rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">
                            Resolve Dispute
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Resolution Type
                                </label>
                                <select
                                    value={data.resolutionType}
                                    onChange={(e) =>
                                        setData(
                                            'resolutionType',
                                            e.target.value as ResolutionType,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="no_action">
                                        No Financial Action
                                    </option>
                                    <option value="refund_customer">
                                        Refund Customer
                                    </option>
                                    <option value="complete_for_stylist">
                                        Complete for Stylist
                                    </option>
                                    <option value="split_refund">
                                        Split Refund
                                    </option>
                                </select>
                            </div>

                            {(data.resolutionType === 'refund_customer' ||
                                data.resolutionType === 'split_refund') && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Refund Amount (R)
                                            </label>
                                            <input
                                                type="number"
                                                value={data.refundAmount}
                                                onChange={(e) =>
                                                    handleAmountChange(
                                                        parseFloat(
                                                            e.target.value,
                                                        ) || 0,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                                min="0"
                                                max={dispute.appointment.amount}
                                                step="0.01"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Percentage (%)
                                            </label>
                                            <input
                                                type="number"
                                                value={data.refundPercentage}
                                                onChange={(e) =>
                                                    handlePercentageChange(
                                                        parseFloat(
                                                            e.target.value,
                                                        ) || 0,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                                min="0"
                                                max="100"
                                                step="1"
                                            />
                                        </div>
                                    </div>

                                    {data.resolutionType === 'split_refund' && (
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <h4 className="mb-3 text-sm font-medium text-gray-700">
                                                Amount Distribution
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-600">
                                                        Customer Amount (R)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={
                                                            data.customerAmount
                                                        }
                                                        onChange={(e) =>
                                                            handleCustomerAmountChange(
                                                                parseFloat(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                            )
                                                        }
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                                        min="0"
                                                        max={
                                                            dispute.appointment
                                                                .amount
                                                        }
                                                        step="0.01"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-600">
                                                        Stylist Amount (R)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={
                                                            data.stylistAmount
                                                        }
                                                        readOnly
                                                        className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500">
                                                Total: R
                                                {dispute.appointment.amount} |
                                                Customer gets: R
                                                {data.customerAmount} | Stylist
                                                gets: R{data.stylistAmount}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Resolution Comment
                                </label>
                                <textarea
                                    value={data.resolutionComment}
                                    onChange={(e) =>
                                        setData(
                                            'resolutionComment',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Explain the resolution decision..."
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowResolutionModal(false);
                                }}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResolveDispute}
                                disabled={processing}
                                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60 disabled:hover:bg-green-700"
                            >
                                Resolve Dispute
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminAccountLayout>
    );
};

export default AdminDisputeShow;
