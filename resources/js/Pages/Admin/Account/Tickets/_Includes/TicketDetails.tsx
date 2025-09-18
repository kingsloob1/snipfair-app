import { Calendar, Check, MessageSquare, X } from 'lucide-react';
import { useState } from 'react';

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
    messages = [
        {
            id: '1',
            text: 'Hello, I want to make enquiries about your services.',
            timestamp: '12:55 am',
            isFromCustomer: true,
        },
        {
            id: '2',
            text: 'Hello Janet, thank you for reaching out',
            timestamp: '12:57 am',
            isFromCustomer: false,
            isDelivered: true,
        },
    ],
    onClose,
    onSendReply,
}) => {
    const [replyMessage, setReplyMessage] = useState('');

    const handleSendReply = () => {
        if (replyMessage.trim()) {
            onSendReply?.(replyMessage);
            setReplyMessage('');
        }
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
        <div className="mx-auto max-w-4xl rounded-lg bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Ticket Details - {ticketId}
                </h1>
                <button
                    onClick={onClose}
                    className="rounded-full p-2 transition-colors hover:bg-gray-100"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>
            </div>

            {/* Customer Info Card */}
            <div className="border-b border-gray-200 p-6">
                <div className="rounded-lg bg-gray-50 p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <img
                                src={customer.avatar}
                                alt={customer.name}
                                className="h-16 w-16 rounded-full object-cover"
                            />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {customer.name}
                                </h2>
                                <p className="text-gray-600">{customer.role}</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <span
                                className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(status)}`}
                            >
                                {status}
                            </span>
                            <span
                                className={`rounded-full px-3 py-1 text-sm font-medium ${getPriorityColor(priority)}`}
                            >
                                {priority}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="font-medium text-gray-900">{issue}</p>
                    </div>

                    <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
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
                <div className="mb-4 flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900">
                        Conversation History
                    </h3>
                </div>

                <div className="mb-6 space-y-4">
                    {messages.map((message) => (
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
                    ))}
                </div>

                {/* Reply Section */}
                <div className="border-t border-gray-200 pt-4">
                    <h4 className="mb-3 text-sm font-medium text-gray-900">
                        Send Reply
                    </h4>
                    <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="message here"
                        className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        rows={4}
                    />
                    <div className="mt-4 flex justify-end space-x-3">
                        <button
                            onClick={() => setReplyMessage('')}
                            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleSendReply}
                            className="rounded-lg bg-gray-900 px-6 py-2 text-white transition-colors hover:bg-gray-800"
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
