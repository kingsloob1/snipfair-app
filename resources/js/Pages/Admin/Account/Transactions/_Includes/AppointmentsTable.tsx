import CommonAvatar from '@/Components/common/forms/CommonAvatar';
import Modal from '@/Components/Modal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { openFullscreenOverlay } from '@/lib/helper';
import { router } from '@inertiajs/react';
import { Eye, Flag, MoreVertical, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Appointment {
    id: number;
    customer: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
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
    proof?: {
        id: number;
        media_urls: string[];
    };
    appointment_date: string;
    amount: number;
    status: string;
    created_at: string;
}

interface AppointmentsTableProps {
    appointments: Appointment[];
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
    appointments,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAppointment, setSelectedAppointment] =
        useState<Appointment | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'flag' | 'delete';
        appointment: Appointment;
    } | null>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
        }).format(amount || 0);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            canceled: 'bg-red-100 text-red-800',
            flagged: 'bg-red-100 text-red-800',
        };
        return (
            statusColors[status as keyof typeof statusColors] ||
            'bg-gray-100 text-gray-800'
        );
    };

    const filteredAppointments = appointments.filter(
        (appointment) =>
            appointment.customer.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            appointment.stylist.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            appointment.portfolio.category.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
    );

    const handleViewDetails = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowDetailsModal(true);
    };

    const handleActionConfirm = (
        type: 'flag' | 'delete',
        appointment: Appointment,
    ) => {
        setConfirmAction({ type, appointment });
        setShowConfirmDialog(true);
    };

    const executeAction = () => {
        if (!confirmAction) return;

        const { type, appointment } = confirmAction;

        switch (type) {
            case 'flag':
                router.post(route('admin.transactions.flag-appointment'), {
                    appointment_id: appointment.id,
                });
                break;
            case 'delete':
                router.post(route('admin.transactions.delete-appointment'), {
                    appointment_id: appointment.id,
                });
                break;
        }

        setShowConfirmDialog(false);
        setConfirmAction(null);
    };

    const getActionText = () => {
        if (!confirmAction) return '';
        const { type, appointment } = confirmAction;
        switch (type) {
            case 'flag':
                return `flag appointment with ${appointment.customer.name}`;
            case 'delete':
                return `delete appointment with ${appointment.customer.name}`;
            default:
                return '';
        }
    };
    console.log(selectedAppointment);

    return (
        <div className="rounded-lg bg-white shadow">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Appointments
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search appointments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Stylist
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredAppointments.map((appointment) => (
                            <tr
                                key={appointment.id}
                                className="hover:bg-gray-50"
                            >
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <CommonAvatar
                                                name={appointment.customer.name}
                                                image={`/storage/${appointment.customer.avatar}`}
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {appointment.customer.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {appointment.customer.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <CommonAvatar
                                                name={appointment.stylist.name}
                                                image={`/storage/${appointment.stylist.avatar}`}
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {appointment.stylist.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {appointment.stylist.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {formatDate(appointment.appointment_date)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {appointment.portfolio.category.name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {formatCurrency(appointment.amount)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(appointment.status)}`}
                                    >
                                        {appointment.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="z-50 w-48"
                                        >
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleViewDetails(
                                                        appointment,
                                                    )
                                                }
                                                className="flex items-center"
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleActionConfirm(
                                                        'flag',
                                                        appointment,
                                                    )
                                                }
                                                className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <Flag className="mr-2 h-4 w-4" />
                                                Flag Appointment
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleActionConfirm(
                                                        'delete',
                                                        appointment,
                                                    )
                                                }
                                                className="flex items-center text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredAppointments.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="text-gray-500">
                            No appointments found
                        </div>
                    </div>
                )}
            </div>

            {/* Appointment Details Modal */}
            <Modal
                show={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                maxWidth="lg"
            >
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                        Appointment Details
                    </h3>
                    {selectedAppointment && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Customer
                                    </label>
                                    <div className="mt-1 flex items-center space-x-3">
                                        <CommonAvatar
                                            name={
                                                selectedAppointment.customer
                                                    .name
                                            }
                                            image={`/storage/${selectedAppointment.customer.avatar}`}
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {
                                                    selectedAppointment.customer
                                                        .name
                                                }
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {
                                                    selectedAppointment.customer
                                                        .email
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Stylist
                                    </label>
                                    <div className="mt-1 flex items-center space-x-3">
                                        <CommonAvatar
                                            name={
                                                selectedAppointment.stylist.name
                                            }
                                            image={`/storage/${selectedAppointment.stylist.avatar}`}
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {
                                                    selectedAppointment.stylist
                                                        .name
                                                }
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {
                                                    selectedAppointment.stylist
                                                        .email
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {formatDate(
                                            selectedAppointment.appointment_date,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Category
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {
                                            selectedAppointment.portfolio
                                                .category.name
                                        }
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Amount
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {formatCurrency(
                                            selectedAppointment.amount,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(selectedAppointment.status)}`}
                                    >
                                        {selectedAppointment.status}
                                    </span>
                                </div>
                            </div>
                            <hr />
                            {selectedAppointment.proof &&
                                selectedAppointment.proof.media_urls.length >
                                    0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Proof of Work
                                        </label>
                                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                            {selectedAppointment.proof.media_urls.map(
                                                (url, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={`/storage/${url}`}
                                                        onClick={() =>
                                                            openFullscreenOverlay(
                                                                `/storage/${url}`,
                                                            )
                                                        }
                                                        alt={`proof-${idx}`}
                                                        className="h-32 w-full rounded-lg object-cover"
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    )}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setShowDetailsModal(false)}
                            className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Confirmation Dialog */}
            <Modal
                show={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                maxWidth="md"
            >
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                        Confirm Action
                    </h3>
                    <p className="mb-6 text-gray-600">
                        Are you sure you want to {getActionText()}? This action
                        cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setShowConfirmDialog(false)}
                            className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={executeAction}
                            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AppointmentsTable;
