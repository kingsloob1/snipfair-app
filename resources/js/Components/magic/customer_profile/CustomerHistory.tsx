import { cn } from '@/lib/utils';

interface Appointment {
    id: number;
    stylist: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
    portfolio: {
        category: {
            id: number;
            name: string;
        };
    };
    amount: number;
    status: string;
    created_at: string;
}

interface CustomerHistoryProps {
    className?: string;
    appointments: Appointment[];
}

export default function CustomerHistory({
    className = '',
    appointments,
}: CustomerHistoryProps) {
    return (
        <div
            className={cn(
                'w-full space-y-6 overflow-hidden rounded-2xl border border-sf-stroke p-3.5 shadow-sm shadow-sf-gray/20 md:p-6',
                className,
            )}
        >
            <h2 className="mb-6 text-2xl font-bold text-sf-black">
                Appointment History
            </h2>
            <div className="no-scrollbar relative max-h-80 space-y-4 overflow-y-auto">
                {appointments.length === 0 ? (
                    <div className="text-center text-sf-gray">
                        No appointment history available.
                    </div>
                ) : (
                    appointments.map((appointment) => (
                        <div
                            key={appointment.id}
                            className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                        >
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {appointment.stylist.name}
                                        <span
                                            className={`ms-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                                appointment.status ===
                                                'completed'
                                                    ? 'border border-green-800 bg-green-100 text-green-800'
                                                    : appointment.status ===
                                                        'pending'
                                                      ? 'border border-yellow-800 bg-yellow-100 text-yellow-800'
                                                      : appointment.status ===
                                                          'cancelled'
                                                        ? 'border border-red-800 bg-red-100 text-red-800'
                                                        : 'border border-gray-800 bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {appointment.status}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(
                                            appointment.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900">
                                        <span className="font-medium">
                                            Category:
                                        </span>{' '}
                                        {appointment.portfolio.category.name}
                                    </p>
                                    <p className="text-sm text-gray-900">
                                        <span className="font-medium">
                                            Amount:
                                        </span>{' '}
                                        R{appointment.amount}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
