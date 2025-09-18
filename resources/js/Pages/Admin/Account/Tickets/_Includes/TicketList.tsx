import { Clock, Copy } from 'lucide-react';
import React from 'react';

interface Ticket {
    id: string;
    customerName: string;
    comment: string;
    updatedDate: string;
    status: 'Closed' | 'Open' | 'in Progress' | 'Pending';
    priority: 'Low' | 'Medium' | 'High' | 'Risky';
    subject: string;
    created_at: string;
    assigned_to?: string;
}

interface TicketListProps {
    tickets?: Ticket[];
}

interface TicketCardProps {
    ticket: Ticket;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Closed':
                return 'text-gray-600';
            case 'Open':
                return 'text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-medium';
            case 'in Progress':
                return 'text-white bg-gray-800 px-3 py-1 rounded-full text-sm font-medium';
            default:
                return 'text-gray-600';
        }
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'Low':
                return 'text-purple-600 bg-purple-100 px-3 py-1 rounded-full text-sm font-medium';
            case 'Medium':
                return 'text-white bg-blue-500 px-3 py-1 rounded-full text-sm font-medium';
            case 'High':
                return 'text-white bg-orange-500 px-3 py-1 rounded-full text-sm font-medium';
            case 'Risky':
                return 'text-white bg-red-500 px-3 py-1 rounded-full text-sm font-medium';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-gray-900">
                        {ticket.customerName}(customer)
                    </h3>
                    <span className="text-sm font-medium text-purple-600">
                        ID: {ticket.id}
                    </span>
                    <Copy className="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600" />
                </div>
                <div className="flex gap-3">
                    <button className="font-medium text-gray-600 hover:text-gray-800">
                        View Details
                    </button>
                    <button className="rounded-md bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-800">
                        Reply
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <h4 className="mb-2 font-medium text-gray-900">Comment:</h4>
                <p className="text-gray-600">{ticket.comment}</p>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Updated: {ticket.updatedDate}</span>
                </div>
                <div className="flex items-center gap-3">
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

const TicketList: React.FC<TicketListProps> = ({ tickets = [] }) => {
    // Default sample tickets for when no tickets are provided
    const sampleTickets: Ticket[] = [
        {
            id: 'TIC-001',
            customerName: 'Isreal Johnson',
            comment: 'Payment not processed',
            subject: 'Payment Issue',
            updatedDate: '2024-03-15',
            created_at: '2024-03-15',
            status: 'Closed',
            priority: 'Low',
        },
        {
            id: 'TIC-002',
            customerName: 'Jane Doe',
            comment: 'Unable to book appointment',
            subject: 'Booking Problem',
            updatedDate: '2024-03-16',
            created_at: '2024-03-16',
            status: 'Open',
            priority: 'Medium',
        },
        {
            id: 'TIC-003',
            customerName: 'John Smith',
            comment: 'Account verification issue',
            subject: 'Account Issue',
            updatedDate: '2024-03-17',
            created_at: '2024-03-17',
            status: 'Open',
            priority: 'High',
        },
        {
            id: 'TIC-004',
            customerName: 'Mary Wilson',
            comment: 'Urgent: Unable to access account',
            subject: 'Account Access',
            updatedDate: '2024-03-18',
            created_at: '2024-03-18',
            status: 'in Progress',
            priority: 'Risky',
        },
    ];

    const displayTickets = tickets.length > 0 ? tickets : sampleTickets;

    return (
        <div className="mx-auto min-h-screen max-w-4xl bg-gray-50 p-6">
            <h1 className="mb-6 text-2xl font-bold text-gray-900">
                Support Tickets
            </h1>
            <div className="space-y-4">
                {displayTickets.map((ticket, index) => (
                    <TicketCard key={ticket.id || index} ticket={ticket} />
                ))}
            </div>
        </div>
    );
};

export default TicketList;
