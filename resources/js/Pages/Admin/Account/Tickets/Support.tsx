import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { Dialog, DialogContent } from '@/Components/ui/dialog';
import { apiCall } from '@/hooks/api';
import { AdminAccountLayout } from '@/Layouts/AdminAccountLayout';
import { useState } from 'react';
import TicketDetails from '../_Includes/TicketDetails';
import TicketList from '../_Includes/TicketList';
import StatCards from './_Includes/StatCards';

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

interface Metrics {
    metricOne: {
        value: string;
        subtitle: string;
    };
    metricTwo: {
        value: string;
        change: string;
        changeType: 'positive' | 'negative';
    };
    metricThree: {
        value: string;
        change: string;
        changeType: 'positive' | 'negative';
    };
    metricFour: {
        value: string;
        subtitle: string;
    };
}

export default function Support({
    tickets,
    metrics,
}: {
    tickets: Ticket[];
    metrics: Metrics;
}) {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    console.log(selectedTicket);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewTicketDetails = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTicket(null);
    };

    const handleSendReply = async (message: string) => {
        try {
            const response = await apiCall(
                `/admin/tickets/${selectedTicket?.id}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        message: message,
                        is_internal: false,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            console.log('Message sent successfully');
        } catch (error) {
            console.error('Failed to send message:', error);
            // You might want to show an error message to the user
        }
    };

    const handleUpdateTicket = async (
        ticketId: string,
        updates: { status?: string; priority?: string; assigned_to?: string },
    ) => {
        try {
            // TODO: Implement API call to update ticket
            const response = await apiCall(
                `/admin/tickets/${ticketId}/update`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify(updates),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to update ticket');
            }

            // Update the local ticket data
            if (selectedTicket) {
                setSelectedTicket({
                    ...selectedTicket,
                    status: updates.status
                        ? (updates.status
                              .replace('_', ' ')
                              .replace(/\b\w/g, (l) => l.toUpperCase()) as
                              | 'Open'
                              | 'Closed'
                              | 'Pending')
                        : selectedTicket.status,
                    priority: updates.priority
                        ? ((updates.priority.charAt(0).toUpperCase() +
                              updates.priority.slice(1)) as
                              | 'Low'
                              | 'Medium'
                              | 'High'
                              | 'Risky')
                        : selectedTicket.priority,
                });
            }

            console.log('Ticket updated successfully:', updates);
        } catch (error) {
            console.error('Failed to update ticket:', error);
            // You might want to show an error message to the user
        }
    };

    const routes = [
        {
            name: 'Support Tickets',
            path: route('admin.support'),
            active: true,
        },
    ];
    return (
        <AdminAccountLayout header="Admin Support">
            <StylistNavigationSteps
                routes={routes}
                sub="Managing support tickets and customer inquiries"
            />
            <section className="mx-auto max-w-7xl px-5">
                <StatCards metrics={metrics} />
            </section>
            <section className="mx-auto max-w-7xl px-5">
                <TicketList
                    tickets={tickets}
                    onViewDetails={handleViewTicketDetails}
                />
            </section>
            {/* Modal for Ticket Details */}
            {selectedTicket && (
                <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                    <DialogContent className="slim-scrollbar max-h-[90vh] max-w-md overflow-y-auto p-6">
                        <TicketDetails
                            ticketId={selectedTicket.id}
                            customer={{
                                name: selectedTicket.userName,
                                role: selectedTicket.type,
                                avatar: selectedTicket.userAvatar || '',
                            }}
                            status={
                                selectedTicket.status as
                                    | 'Open'
                                    | 'Closed'
                                    | 'Pending'
                            }
                            priority={
                                selectedTicket.priority as
                                    | 'Low'
                                    | 'Medium'
                                    | 'High'
                                    | 'Risky'
                            }
                            issue={
                                selectedTicket.subject || selectedTicket.comment
                            }
                            createdDate={selectedTicket.created_at}
                            updatedDate={selectedTicket.updatedDate}
                            onClose={handleCloseModal}
                            onSendReply={handleSendReply}
                            onUpdateTicket={handleUpdateTicket}
                        />
                    </DialogContent>
                </Dialog>
            )}
            {/* {isModalOpen && selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">

                    </div>
                </div>
            )} */}
        </AdminAccountLayout>
    );
}
