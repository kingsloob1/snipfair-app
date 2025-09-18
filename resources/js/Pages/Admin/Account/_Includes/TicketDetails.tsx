import { apiCall } from '@/hooks/api';
import { Calendar, Check, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Message {
    id: string;
    text: string;
    timestamp: string;
    isFromCustomer: boolean;
    isDelivered?: boolean;
}

interface Customer {
    name: string;
    role: string;
    avatar: string;
}

interface TicketDetailsProps {
    ticketId?: string;
    customer?: Customer;
    status?: 'Open' | 'Closed' | 'Pending';
    priority?: 'Low' | 'Medium' | 'High' | 'Risky';
    issue?: string;
    createdDate?: string;
    updatedDate?: string;
    messages?: Message[];
    onClose?: () => void;
    onSendReply?: (message: string) => void;
    onUpdateTicket?: (
        ticketId: string,
        updates: { status?: string; priority?: string; assigned_to?: string },
    ) => void;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({
    ticketId = 'TIC-001',
    customer = {
        name: 'Rejoice James',
        role: 'Customer',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
    status = 'Open',
    priority = 'Risky',
    issue = 'Payment not processed',
    createdDate = '2024-03-15',
    updatedDate = '2024-03-15',
    messages = [],
    onClose,
    onSendReply,
    onUpdateTicket,
}) => {
    const [replyMessage, setReplyMessage] = useState('');
    const [currentStatus, setCurrentStatus] = useState(status);
    const [currentPriority, setCurrentPriority] = useState(priority);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [conversationMessages, setConversationMessages] = useState(messages);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // Load conversation messages when component mounts
    useEffect(() => {
        const loadConversation = async () => {
            setIsLoadingMessages(true);
            try {
                const response = await apiCall(
                    `/admin/tickets/${ticketId}/messages`,
                );
                if (response.ok) {
                    const data = await response.json();
                    setConversationMessages(data.messages || messages);
                }
            } catch (error) {
                console.error('Failed to load conversation:', error);
                // Fallback to provided messages
                setConversationMessages(messages);
            } finally {
                setIsLoadingMessages(false);
            }
        };

        if (ticketId && ticketId !== 'TIC-001') {
            loadConversation();
        } else {
            setConversationMessages(messages);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketId]); // Intentionally excluding 'messages' to prevent infinite loop

    const handleSendReply = () => {
        if (replyMessage.trim()) {
            // Add the new message to the conversation immediately for better UX
            const newMessage = {
                id: Date.now().toString(),
                text: replyMessage,
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                isFromCustomer: false,
                isDelivered: false,
            };

            setConversationMessages((prev) => [...prev, newMessage]);

            // Call the parent's onSendReply
            onSendReply?.(replyMessage);
            setReplyMessage('');
        }
    };

    const handleUpdateTicket = async () => {
        if (!onUpdateTicket) return;

        setIsSaving(true);
        try {
            await onUpdateTicket(ticketId, {
                status: currentStatus.toLowerCase().replace(' ', '_'),
                priority: currentPriority.toLowerCase(),
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update ticket:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setCurrentStatus(status);
        setCurrentPriority(priority);
        setIsEditing(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open':
                return 'bg-green-100 text-green-800';
            case 'Closed':
                return 'bg-gray-100 text-gray-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-green-100 text-green-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Low':
                return 'bg-blue-500 text-white';
            case 'Medium':
                return 'bg-yellow-500 text-white';
            case 'High':
                return 'bg-orange-500 text-white';
            case 'Risky':
                return 'bg-red-500 text-white';
            default:
                return 'bg-red-500 text-white';
        }
    };

    return (
        <div className="mx-auto max-w-lg rounded-lg bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <h1 className="text-xl font-semibold text-sf-black">
                    Ticket Details - {ticketId}
                </h1>
            </div>

            {/* Customer Info Card */}
            <div className="border-b border-gray-200 p-4">
                <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <img
                                src={customer.avatar}
                                alt={customer.name}
                                className="h-16 w-16 rounded-full object-cover"
                            />
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {customer.name}
                                </h2>
                                <p className="text-sm capitalize text-gray-600">
                                    {customer.role}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-3 rounded-2xl bg-sf-primary-hover/20 p-4 text-xs">
                            {/* Status and Priority Controls */}
                            <div className="flex items-center space-x-3">
                                {isEditing ? (
                                    <>
                                        {/* Status Dropdown */}
                                        <select
                                            value={currentStatus}
                                            onChange={(e) =>
                                                setCurrentStatus(
                                                    e.target.value as
                                                        | 'Open'
                                                        | 'Closed'
                                                        | 'Pending',
                                                )
                                            }
                                            className="rounded border border-gray-300 px-3 py-1 text-xs"
                                        >
                                            <option value="Open">Open</option>
                                            <option value="Pending">
                                                Pending
                                            </option>
                                            <option value="Closed">
                                                Closed
                                            </option>
                                        </select>

                                        {/* Priority Dropdown */}
                                        <select
                                            value={currentPriority}
                                            onChange={(e) =>
                                                setCurrentPriority(
                                                    e.target.value as
                                                        | 'Low'
                                                        | 'Medium'
                                                        | 'High'
                                                        | 'Risky',
                                                )
                                            }
                                            className="rounded border border-gray-300 px-3 py-1 text-xs"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">
                                                Medium
                                            </option>
                                            <option value="High">High</option>
                                            <option value="Risky">Risky</option>
                                        </select>
                                    </>
                                ) : (
                                    <>
                                        <span
                                            className={`rounded-full px-3 py-1 font-medium ${getStatusColor(currentStatus)}`}
                                        >
                                            {currentStatus}
                                        </span>
                                        <span
                                            className={`rounded-full px-3 py-1 font-medium ${getPriorityColor(currentPriority)}`}
                                        >
                                            {currentPriority}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleUpdateTicket}
                                            disabled={isSaving}
                                            className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                                    >
                                        Edit Status
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-900">
                            {issue}
                        </p>
                    </div>

                    <div className="mt-4 flex items-center space-x-6 text-xs text-gray-600">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Created: {createdDate}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Updated: {updatedDate}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conversation History */}
            <div className="p-6">
                <div className="mb-2 flex items-center space-x-1">
                    <MessageSquare className="h-5 w-5 text-gray-600" />
                    <h3 className="font-medium text-sf-primary-paragraph">
                        Conversation History
                    </h3>
                </div>

                <div className="mb-3 space-y-3">
                    {isLoadingMessages ? (
                        <div className="flex justify-center py-4">
                            <div className="text-xs text-gray-500">
                                Loading conversation...
                            </div>
                        </div>
                    ) : conversationMessages.length > 0 ? (
                        conversationMessages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.isFromCustomer ? 'justify-start' : 'justify-end'}`}
                            >
                                <div
                                    className={`max-w-xs rounded-lg px-4 py-3 lg:max-w-md ${
                                        message.isFromCustomer
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'bg-gray-900 text-white'
                                    }`}
                                >
                                    <p className="text-sm">{message.text}</p>
                                    <div
                                        className={`mt-2 flex items-center justify-between text-xs ${
                                            message.isFromCustomer
                                                ? 'text-gray-500'
                                                : 'text-gray-300'
                                        }`}
                                    >
                                        <span>{message.timestamp}</span>
                                        {!message.isFromCustomer &&
                                            message.isDelivered && (
                                                <Check className="h-3 w-3 text-green-400" />
                                            )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-4 text-center text-sm text-gray-500">
                            No messages yet. Start a conversation by sending a
                            reply.
                        </div>
                    )}
                </div>

                {/* Reply Section */}
                <div className="border-t border-gray-200 pt-4">
                    <h4 className="mb-3 text-xs font-medium text-gray-900">
                        Send Reply
                    </h4>
                    <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="message here"
                        className="w-full resize-none rounded-lg border border-gray-300 p-1.5 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        rows={3}
                    />
                    <div className="mt-4 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleSendReply}
                            className="rounded-lg bg-sf-primary-paragraph px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800"
                        >
                            Send Reply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
