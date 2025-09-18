import { getPagination } from '@/lib/helper';
import { AppointmentStatusProps } from '@/types/custom_types';
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    Download,
    Info,
    MoreVertical,
    Search,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

// TypeScript interfaces
interface RequestData {
    id: string;
    name: string;
    email: string;
    requestId: string;
    purpose: string;
    requestTime: string;
    amount: number;
    status: AppointmentStatusProps;
    avatar: string;
}

type TabType =
    | 'All'
    | 'Completed'
    | 'Pending'
    | 'Failed'
    | 'Reversed'
    | 'Approved'
    | 'Declined'
    | 'Processing';

const TableSample = ({ requestData }: { requestData: RequestData[] }) => {
    const [activeTab, setActiveTab] = useState<TabType>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Filter data based on search and active tab
    const filteredData = useMemo(() => {
        let filtered = requestData;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (item) =>
                    item.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    item.email
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    item.purpose
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
            );
        }

        // Filter by tab
        if (activeTab !== 'All') {
            const statusMap = {
                Approved: 'Approved',
                Completed: 'Completed',
                Pending: 'Pending',
                Processing: 'Processing',
                Failed: 'Failed',
                Reversed: 'Reversed',
                Declined: 'Declined',
            };
            filtered = filtered.filter(
                (item) =>
                    item.status ===
                    statusMap[activeTab as keyof typeof statusMap],
            );
        }

        return filtered;
    }, [searchTerm, activeTab, requestData]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = filteredData.slice(
        startIndex,
        startIndex + rowsPerPage,
    );
    const pages = getPagination(currentPage, totalPages);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'Completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'Pending':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'Processing':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'Failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'Declined':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'Reversed':
                return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            default:
                return <Info className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'text-green-600 bg-green-50';
            case 'Approved':
                return 'text-green-600 bg-green-50';
            case 'Pending':
                return 'text-yellow-600 bg-yellow-50';
            case 'Processing':
                return 'text-yellow-600 bg-yellow-50';
            case 'Failed':
                return 'text-red-600 bg-red-50';
            case 'Declined':
                return 'text-red-600 bg-red-50';
            case 'Reversed':
                return 'text-orange-600 bg-orange-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
            {/* Header Tabs */}
            <div className="no-scrollbar mb-6 overflow-x-auto border-b border-gray-200">
                <nav className="flex space-x-8">
                    {(
                        [
                            'All',
                            'Approved',
                            'Completed',
                            'Pending',
                            'Processing',
                            'Declined',
                            'Reversed',
                            'Failed',
                        ] as TabType[]
                    ).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`border-b-2 px-1 py-2 text-sm font-medium ${
                                activeTab === tab
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-purple-500 md:w-64"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative hidden md:block">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                        >
                            <option>All Status</option>
                            <option>Approved</option>
                            <option>Completed</option>
                            <option>Pending</option>
                            <option>Processing</option>
                            <option>Declined</option>
                            <option>Reversed</option>
                            <option>Failed</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <button className="hidden items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 md:flex">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Date Range</span>
                    </button>
                </div>

                {/* Export Button */}
                <button className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50">
                    <span className="text-gray-600">Export</span>
                    <Download className="h-4 w-4 text-gray-400" />
                </button>
            </div>

            {/* Table */}
            <div className="no-scrollbar overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Name and Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Request ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Purpose
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Request Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {paginatedData.map((request) => (
                            <tr key={request.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                                <span className="text-sm font-medium text-purple-600">
                                                    {request.avatar}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {request.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {request.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {request.requestId}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {request.purpose}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {request.requestTime}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                    {formatAmount(request.amount)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                        className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(request.status)}`}
                                    >
                                        {getStatusIcon(request.status)}
                                        <span>{request.status}</span>
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Per Page</span>
                    <select
                        value={rowsPerPage}
                        onChange={(e) => setRowsPerPage(Number(e.target.value))}
                        className="rounded border border-gray-300 py-1 pl-1 pr-5 text-sm"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Page Navigation */}
                    <div className="flex space-x-1">
                        <button
                            onClick={() =>
                                setCurrentPage(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                            Prev
                        </button>

                        {pages.map((page, i) =>
                            typeof page === 'string' ? (
                                <span
                                    key={`ellipsis-${i}`}
                                    className="hidden px-3 py-2 text-sm text-gray-500 md:inline"
                                >
                                    {page}
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`hidden rounded px-3 py-2 text-sm md:inline ${
                                        currentPage === page
                                            ? 'bg-purple-100 text-purple-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {page}
                                </button>
                            ),
                        )}

                        <button
                            onClick={() =>
                                setCurrentPage(
                                    Math.min(totalPages, currentPage + 1),
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <span className="text-sm text-gray-500">
                        Showing {startIndex + 1} -{' '}
                        {Math.min(
                            startIndex + rowsPerPage,
                            filteredData.length,
                        )}{' '}
                        of {filteredData.length}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TableSample;
