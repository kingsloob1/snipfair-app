import Modal from '@/Components/Modal';
import { router } from '@inertiajs/react';
import { Calendar, Check, Eye, X } from 'lucide-react';
import React, { useState } from 'react';

interface StylistApplication {
    id: string;
    name: string;
    email: string;
    created_at: string;
    avatar?: string;
    country?: string;
    bio?: string;
    phone?: string;
    // Add additional fields that might come from the backend
    experience?: string;
    specialties?: string[];
    portfolio_count?: number;
}

interface PendingStylistApprovalsProps {
    applications?: StylistApplication[];
}

const PendingStylistApprovals: React.FC<PendingStylistApprovalsProps> = ({
    applications = [],
}) => {
    const [selectedApplication, setSelectedApplication] =
        useState<StylistApplication | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'approve' | 'reject';
        application: StylistApplication;
    } | null>(null);

    // Default data if none provided
    const defaultApplications: StylistApplication[] = [
        {
            id: '1',
            name: 'David Wilson',
            email: 'david@email.com',
            created_at: '2024-03-10',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            country: 'United States',
            bio: 'Professional stylist with 5 years experience',
            phone: '+1234567890',
            experience: '5 years',
            specialties: ['Hair Styling', 'Color Treatment'],
            portfolio_count: 12,
        },
        {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah@email.com',
            created_at: '2024-03-09',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            country: 'Canada',
            bio: 'Certified hair stylist specializing in modern cuts',
            phone: '+1987654321',
            experience: '3 years',
            specialties: ['Modern Cuts', 'Bridal Styling'],
            portfolio_count: 8,
        },
    ];

    const stylistData =
        applications.length > 0 ? applications : defaultApplications;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleViewDetails = (application: StylistApplication) => {
        setSelectedApplication(application);
        setShowDetailsModal(true);
    };

    const handleActionConfirm = (
        type: 'approve' | 'reject',
        application: StylistApplication,
    ) => {
        setConfirmAction({ type, application });
        setShowConfirmDialog(true);
    };

    const executeAction = () => {
        if (!confirmAction) return;

        const { type, application } = confirmAction;

        switch (type) {
            case 'approve':
                router.post(route('admin.stylists.approve'), {
                    application_id: application.id,
                });
                break;
            case 'reject':
                router.post(route('admin.stylists.reject'), {
                    application_id: application.id,
                });
                break;
        }

        setShowConfirmDialog(false);
        setConfirmAction(null);
    };

    const getActionText = () => {
        if (!confirmAction) return '';
        const { type, application } = confirmAction;
        return type === 'approve'
            ? `approve ${application.name}'s application`
            : `reject ${application.name}'s application`;
    };

    return (
        <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    Pending Stylist Approvals
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Review and approve new stylist applications
                </p>
            </div>

            <div className="p-6">
                <div className="space-y-4">
                    {stylistData.map((stylist) => (
                        <div
                            key={stylist.id}
                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                        >
                            <div className="flex items-center space-x-4">
                                <img
                                    src={
                                        stylist.avatar ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(stylist.name)}&background=6366f1&color=ffffff`
                                    }
                                    alt={`${stylist.name} profile`}
                                    className="h-16 w-16 rounded-full border-2 border-gray-100 object-cover"
                                />

                                <div className="flex flex-col">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {stylist.name}
                                    </h3>
                                    <p className="mb-2 text-sm text-gray-600">
                                        {stylist.email}
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="mr-1 h-4 w-4" />
                                        <span>
                                            Applied on{' '}
                                            {formatDate(stylist.created_at)}
                                        </span>
                                    </div>
                                    {stylist.country && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            📍 {stylist.country}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleViewDetails(stylist)}
                                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <Eye className="mr-1 h-4 w-4" />
                                    View Details
                                </button>
                                <button
                                    onClick={() =>
                                        handleActionConfirm('reject', stylist)
                                    }
                                    className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Reject
                                </button>
                                <button
                                    onClick={() =>
                                        handleActionConfirm('approve', stylist)
                                    }
                                    className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    <Check className="mr-1 h-4 w-4" />
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))}

                    {stylistData.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="text-gray-500">
                                No pending applications
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Application Details Modal */}
            <Modal
                show={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                maxWidth="lg"
            >
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                        Stylist Application Details
                    </h3>
                    {selectedApplication && (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <img
                                    className="h-20 w-20 rounded-full border-2 border-gray-200 object-cover"
                                    src={
                                        selectedApplication.avatar ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedApplication.name)}&background=6366f1&color=ffffff`
                                    }
                                    alt={selectedApplication.name}
                                />
                                <div>
                                    <h4 className="text-xl font-semibold">
                                        {selectedApplication.name}
                                    </h4>
                                    <p className="text-gray-600">
                                        {selectedApplication.email}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Applied on{' '}
                                        {formatDate(
                                            selectedApplication.created_at,
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Phone
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {selectedApplication.phone || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Location
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {selectedApplication.country || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Experience
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {selectedApplication.experience ||
                                            'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Portfolio Items
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {selectedApplication.portfolio_count ||
                                            0}
                                    </p>
                                </div>
                            </div>

                            {selectedApplication.bio && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Bio
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedApplication.bio}
                                    </p>
                                </div>
                            )}

                            {selectedApplication.specialties &&
                                selectedApplication.specialties.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Specialties
                                        </label>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {selectedApplication.specialties.map(
                                                (specialty, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                                                    >
                                                        {specialty}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    )}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={() => setShowDetailsModal(false)}
                            className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                        >
                            Close
                        </button>
                        {selectedApplication && (
                            <>
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        handleActionConfirm(
                                            'reject',
                                            selectedApplication,
                                        );
                                    }}
                                    className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        handleActionConfirm(
                                            'approve',
                                            selectedApplication,
                                        );
                                    }}
                                    className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                >
                                    Approve
                                </button>
                            </>
                        )}
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
                            className={`rounded-md px-4 py-2 text-white ${
                                confirmAction?.type === 'approve'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PendingStylistApprovals;
