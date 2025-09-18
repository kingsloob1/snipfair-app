import CustomButton from '@/Components/common/CustomButton';
import CommonAvatar from '@/Components/common/forms/CommonAvatar';
import Modal from '@/Components/Modal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { router } from '@inertiajs/react';
import {
    Eye,
    Flag,
    MoreVertical,
    Search,
    Trash2,
    UserCheck,
    UserX,
} from 'lucide-react';
import { useState } from 'react';

interface Stylist {
    id: number;
    name: string;
    email: string;
    country?: string;
    created_at: string;
    status: 'active' | 'disabled' | 'flagged';
    avatar?: string;
    // Add computed fields that should come from backend
    total_earned?: number;
    stylist_profile?: {
        status: string;
    };
    total_appointments?: number;
    portfolios_count?: number;
    subscription?: string;
    stylistAppointments?: {
        id: number;
        customer: {
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
    }[];
    transactions?: {
        id: number;
        type: string;
        status: string;
        amount: number;
        created_at: string;
    }[];
}

interface StylistsTableProps {
    stylists: Stylist[];
}

const StylistsTable: React.FC<StylistsTableProps> = ({ stylists }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(
        null,
    );
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'disable' | 'enable' | 'delete' | 'flag' | 'reinstate';
        stylist: Stylist;
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

    const filteredStylists = stylists.filter(
        (stylist) =>
            stylist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stylist.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleViewDetails = (stylist: Stylist) => {
        setSelectedStylist(stylist);
        setShowDetailsModal(true);
    };

    const handleActionConfirm = (
        type: 'disable' | 'enable' | 'delete' | 'flag' | 'reinstate',
        stylist: Stylist,
    ) => {
        setConfirmAction({ type, stylist });
        setShowConfirmDialog(true);
    };

    const executeAction = () => {
        if (!confirmAction) return;

        const { type, stylist } = confirmAction;

        switch (type) {
            case 'disable':
                router.post(route('admin.stylists.disable'), {
                    user_id: stylist.id,
                });
                break;
            case 'enable':
                router.post(route('admin.stylists.enable'), {
                    user_id: stylist.id,
                });
                break;
            case 'flag':
                router.post(route('admin.stylists.flag'), {
                    user_id: stylist.id,
                });
                break;
            case 'reinstate':
                router.post(route('admin.stylists.unflag'), {
                    user_id: stylist.id,
                });
                break;
            case 'delete':
                router.delete(route('admin.stylists.destroy', stylist.id));
                break;
        }

        setShowConfirmDialog(false);
        setConfirmAction(null);
    };

    const getActionText = () => {
        if (!confirmAction) return '';
        const { type, stylist } = confirmAction;
        switch (type) {
            case 'disable':
                return `disable ${stylist.name}`;
            case 'enable':
                return `enable ${stylist.name}`;
            case 'flag':
                return `flag ${stylist.name}'s account`;
            case 'reinstate':
                return `reinstate ${stylist.name}'s account`;
            case 'delete':
                return `delete ${stylist.name}`;
            default:
                return '';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'disabled':
                return 'bg-red-100 text-red-800';
            case 'flagged':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    return (
        <div className="rounded-lg bg-white shadow">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Stylists
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search stylists..."
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
                                Stylist
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Total Earned
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Date Joined
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Appointments
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Portfolios
                            </th>
                            {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Subscription
                            </th> */}
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Profile
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
                        {filteredStylists.map((stylist) => (
                            <tr key={stylist.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <CommonAvatar
                                                name={stylist.name}
                                                image={stylist.avatar}
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {stylist.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {stylist.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {stylist.country || 'N/A'}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {formatCurrency(stylist.total_earned || 0)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {formatDate(stylist.created_at)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {stylist.total_appointments || 0}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {stylist.portfolios_count || 0}
                                </td>
                                {/* <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {stylist.subscription || 'Free'}
                                </td> */}
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                                            stylist.stylist_profile?.status ===
                                            'approved'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {stylist.stylist_profile?.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getStatusColor(stylist.status)}`}
                                    >
                                        {stylist.status}
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
                                                    handleViewDetails(stylist)
                                                }
                                                className="flex items-center"
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleActionConfirm(
                                                        stylist.stylist_profile
                                                            ?.status ===
                                                            'flagged'
                                                            ? 'reinstate'
                                                            : 'flag',
                                                        stylist,
                                                    )
                                                }
                                                className="flex items-center"
                                            >
                                                <Flag className="mr-2 h-4 w-4" />
                                                {stylist.stylist_profile
                                                    ?.status === 'flagged'
                                                    ? 'Reinstate'
                                                    : 'Flag'}{' '}
                                                Account
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleActionConfirm(
                                                        stylist.status ===
                                                            'active'
                                                            ? 'disable'
                                                            : 'enable',
                                                        stylist,
                                                    )
                                                }
                                                className="flex items-center"
                                            >
                                                {stylist.status === 'active' ? (
                                                    <>
                                                        <UserX className="mr-2 h-4 w-4" />
                                                        Disable
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                        Enable
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleActionConfirm(
                                                        'delete',
                                                        stylist,
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

                {filteredStylists.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="text-gray-500">No stylists found</div>
                    </div>
                )}
            </div>

            {/* Stylist Details Modal */}
            <Modal
                show={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                maxWidth="lg"
            >
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                        Stylist Details
                    </h3>
                    {selectedStylist && (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <CommonAvatar
                                    name={selectedStylist.name}
                                    image={selectedStylist.avatar}
                                    className="h-16 w-16"
                                />
                                <div>
                                    <h4 className="text-xl font-semibold">
                                        {selectedStylist.name}
                                    </h4>
                                    <p className="text-gray-600">
                                        {selectedStylist.email}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Location
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {selectedStylist.country || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <p className="text-sm capitalize text-gray-900">
                                        {selectedStylist.status}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Total Earned
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {formatCurrency(
                                            selectedStylist.total_earned || 0,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Total Appointments
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {selectedStylist.total_appointments ||
                                            0}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Portfolios
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {selectedStylist.portfolios_count || 0}
                                    </p>
                                </div>
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Subscription
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {selectedStylist.subscription || 'Free'}
                                    </p>
                                </div> */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date Joined
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {formatDate(selectedStylist.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="mt-6 flex justify-end gap-2">
                        <CustomButton
                            fullWidth={false}
                            onClick={() =>
                                router.visit(
                                    route(
                                        'admin.users.stylist',
                                        selectedStylist?.id,
                                    ),
                                )
                            }
                        >
                            View Full Profile
                        </CustomButton>
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
                        Are you sure you want to {getActionText()}?
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

export default StylistsTable;
