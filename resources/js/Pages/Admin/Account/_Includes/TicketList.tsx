import { Clock, Copy } from 'lucide-react';
import React from 'react';

interface Ticket {
    id: string;
    userName: string;
    userAvatar?: string;
    type: 'customer' | 'stylist';
    comment: string;
    updatedDate: string;
    status: 'Closed' | 'Open' | 'in Progress' | 'Pending';
    priority: 'Low' | 'Medium' | 'High' | 'Risky';
    subject: string;
    created_at: string;
    assigned_to?: string;
}

interface TicketCardProps {
    ticket: Ticket;
    onViewDetails: (ticket: Ticket) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onViewDetails }) => {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Closed':
                return 'text-gray-600';
            case 'Open':
                return 'text-green-600 bg-green-100 px-3 py-1 rounded-full font-medium';
            case 'in Progress':
                return 'text-white bg-gray-800 px-3 py-1 rounded-full font-medium';
            default:
                return 'text-gray-600';
        }
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'Low':
                return 'text-purple-600 bg-purple-100 px-3 py-1 rounded-full font-medium';
            case 'Medium':
                return 'text-white bg-blue-500 px-3 py-1 rounded-full font-medium';
            case 'High':
                return 'text-white bg-orange-500 px-3 py-1 rounded-full font-medium';
            case 'Risky':
                return 'text-white bg-red-500 px-3 py-1 rounded-full font-medium';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">
                        {ticket.userName}({ticket.type})
                    </h3>
                    <span className="text-sm font-medium text-purple-600">
                        ID: {ticket.id}
                    </span>
                    <Copy className="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600" />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => onViewDetails(ticket)}
                        className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800"
                    >
                        View Details
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium text-gray-900">
                    Comment:
                </h4>
                <p className="text-sm text-gray-600">{ticket.comment}</p>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Updated: {ticket.updatedDate}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <span className={getStatusStyles(ticket.status)}>
                        {ticket.status}
                    </span>
                    <span className={getPriorityStyles(ticket.priority)}>
                        {ticket.priority}
                    </span>
                </div>
            </div>
        </div>
    );
};

const TicketList: React.FC<{
    tickets: Ticket[];
    onViewDetails: (ticket: Ticket) => void;
}> = ({ tickets, onViewDetails }) => {
    if (!tickets || tickets.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <div className="mb-4 text-gray-400">
                    <Clock size={48} className="mx-auto opacity-50" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                    No support tickets found
                </h3>
                <p className="text-gray-500">
                    There are currently no support tickets to display.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tickets.map((ticket, index) => (
                <TicketCard
                    key={ticket.id || index}
                    ticket={ticket}
                    onViewDetails={onViewDetails}
                />
            ))}
        </div>
    );
};

export default TicketList;
