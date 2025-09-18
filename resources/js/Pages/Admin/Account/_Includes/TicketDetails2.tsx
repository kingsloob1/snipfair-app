import { Calendar, Check, MessageCircle, X } from 'lucide-react';
import React from 'react';

interface Message {
    id: string;
    content: string;
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
    riskLevel?: 'Low' | 'Medium' | 'Risky';
    paymentStatus?: string;
    createdDate?: string;
    updatedDate?: string;
    messages?: Message[];
    onClose?: () => void;
    onReply?: () => void;
}

const TicketDetails2: React.FC<TicketDetailsProps> = ({
    ticketId = 'TIC-001',
    customer = {
        name: 'Rejoice James',
        role: 'Customer',
        avatar: '/api/placeholder/64/64',
    },
    status = 'Open',
    riskLevel = 'Risky',
    paymentStatus = 'Payment not processed',
    createdDate = '2024-03-15',
    updatedDate = '2024-03-15',
    messages = [
        {
            id: '1',
            content: 'Hello, I want to make enquiries about your services.',
            timestamp: '12:55 am',
            isFromCustomer: true,
        },
        {
            id: '2',
            content: 'Hello Janet, thank you for reaching out',
            timestamp: '12:57 am',
            isFromCustomer: false,
            isDelivered: true,
        },
    ],
    onClose = () => console.log('Close clicked'),
    onReply = () => console.log('Reply clicked'),
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open':
                return 'bg-green-100 text-green-800';
            case 'Closed':
                return 'bg-gray-100 text-gray-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'Low':
                return 'bg-green-500 text-white';
            case 'Medium':
                return 'bg-yellow-500 text-white';
            case 'Risky':
                return 'bg-red-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="mx-auto w-full max-w-4xl rounded-lg bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Ticket Details - {ticketId}
                </h1>
                <button
                    onClick={onClose}
                    className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>
            </div>

            {/* Customer Info Section */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200">
                            <img
                                src={customer.avatar}
                                alt={customer.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src =
                                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIyMCIgeT0iMjAiPgo8cGF0aCBkPSJNMjAgMjFWMTlBNCA0IDAgMCAwIDE2IDE1SDhBNCA0IDAgMCAwIDQgMTlWMjEiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K';
                                }}
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {customer.name}
                            </h2>
                            <p className="text-gray-600">{customer.role}</p>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(status)}`}
                        >
                            {status}
                        </span>
                        <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${getRiskColor(riskLevel)}`}
                        >
                            {riskLevel}
                        </span>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="font-medium text-gray-700">{paymentStatus}</p>
                </div>

                <div className="mt-4 flex items-center space-x-8 text-sm text-gray-600">
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

            {/* Conversation History */}
            <div className="p-6">
                <div className="mb-6 flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        Conversation History
                    </h3>
                </div>

                <div className="space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className="space-y-2">
                            <div
                                className={`flex ${message.isFromCustomer ? 'justify-start' : 'justify-end'}`}
                            >
                                <div
                                    className={`max-w-xs rounded-lg px-4 py-3 lg:max-w-md ${
                                        message.isFromCustomer
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'bg-blue-500 text-white'
                                    }`}
                                >
                                    <p className="text-sm">{message.content}</p>
                                </div>
                            </div>

                            <div
                                className={`flex items-center space-x-1 ${
                                    message.isFromCustomer
                                        ? 'justify-start'
                                        : 'justify-end'
                                }`}
                            >
                                <span className="text-xs text-gray-500">
                                    {message.timestamp}
                                </span>
                                {!message.isFromCustomer &&
                                    message.isDelivered && (
                                        <Check className="h-3 w-3 text-green-500" />
                                    )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 border-t border-gray-200 bg-gray-50 p-6">
                <button
                    onClick={onClose}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                >
                    Close
                </button>
                <button
                    onClick={onReply}
                    className="rounded-lg bg-gray-900 px-6 py-2 text-white transition-colors hover:bg-gray-800"
                >
                    Reply to Ticket
                </button>
            </div>
        </div>
    );
};
export default TicketDetails2;
