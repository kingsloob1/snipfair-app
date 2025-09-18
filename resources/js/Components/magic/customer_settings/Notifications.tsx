import CustomButton from '@/Components/common/CustomButton';
import { useForm } from '@inertiajs/react';

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (value: boolean) => void;
}

const ToggleSwitch = ({ enabled, onChange }: ToggleSwitchProps) => (
    <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            enabled ? 'bg-green-500' : 'bg-gray-300'
        }`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
    </button>
);

interface NotificationsData {
    booking_confirmation: boolean;
    appointment_reminders: boolean;
    favorite_stylist_update: boolean;
    promotions_offers: boolean;
    review_reminders: boolean;
    payment_confirmations: boolean;
    email_notifications: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
}

interface NotificationCardProps {
    data: NotificationsData;
    setData: (key: keyof NotificationsData, value: boolean) => void;
}

const AppointmentCard = ({ data, setData }: NotificationCardProps) => {
    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Appointment Notifications
            </h2>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Booking Confirmations
                        </h3>
                        <p className="text-sm text-gray-500">
                            Get notified when appointments are confirmed
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.booking_confirmation}
                        onChange={(value) =>
                            setData('booking_confirmation', value)
                        }
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Appointment Reminders
                        </h3>
                        <p className="text-sm text-gray-500">
                            Receive reminders before your appointments
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.appointment_reminders}
                        onChange={(value) =>
                            setData('appointment_reminders', value)
                        }
                    />
                </div>
            </div>
        </div>
    );
};

const UpdatesCard = ({ data, setData }: NotificationCardProps) => {
    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Stylist & Service Updates
            </h2>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Favorite Stylist Updates
                        </h3>
                        <p className="text-sm text-gray-500">
                            New availability from your favorite stylists
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.favorite_stylist_update}
                        onChange={(value) =>
                            setData('favorite_stylist_update', value)
                        }
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Promotions & Offers
                        </h3>
                        <p className="text-sm text-gray-500">
                            Special deals and discounts
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.promotions_offers}
                        onChange={(value) =>
                            setData('promotions_offers', value)
                        }
                    />
                </div>
            </div>
        </div>
    );
};

const ReviewsCard = ({ data, setData }: NotificationCardProps) => {
    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Reviews & Feedback
            </h2>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Review Reminders
                        </h3>
                        <p className="text-sm text-gray-500">
                            Reminders to review your completed appointments
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.review_reminders}
                        onChange={(value) => setData('review_reminders', value)}
                    />
                </div>
            </div>
        </div>
    );
};

const BillingCard = ({ data, setData }: NotificationCardProps) => {
    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Payment & Billing
            </h2>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Payment Confirmations
                        </h3>
                        <p className="text-sm text-gray-500">
                            Payment receipts and transaction updates
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.payment_confirmations}
                        onChange={(value) =>
                            setData('payment_confirmations', value)
                        }
                    />
                </div>
            </div>
        </div>
    );
};

interface SaveFormProps {
    data: NotificationsData;
    setData: (key: keyof NotificationsData, value: boolean) => void;
    onSubmit: () => void;
    processing: boolean;
}

const WorkConfirmationCard = ({
    data,
    setData,
    onSubmit,
    processing,
}: SaveFormProps) => {
    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Work Confirmation Methods
            </h2>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Email Notifications
                        </h3>
                        <p className="text-sm text-gray-500">
                            Receive notifications via email
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.email_notifications}
                        onChange={(value) =>
                            setData('email_notifications', value)
                        }
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Push Notifications
                        </h3>
                        <p className="text-sm text-gray-500">
                            Browser and app push notifications
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.push_notifications}
                        onChange={(value) =>
                            setData('push_notifications', value)
                        }
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            SMS Notifications
                        </h3>
                        <p className="text-sm text-gray-500">
                            Text message notifications
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.sms_notifications}
                        onChange={(value) =>
                            setData('sms_notifications', value)
                        }
                    />
                </div>
            </div>
            <div className="flex justify-end pb-3 pt-8">
                <CustomButton
                    type="submit"
                    className="w-full md:w-64"
                    onClick={onSubmit}
                    disabled={processing}
                >
                    {processing ? 'Saving...' : 'Save Changes'}
                </CustomButton>
            </div>
        </div>
    );
};

const Notifications = ({
    notifications,
}: {
    notifications: NotificationsData;
}) => {
    const { data, setData, patch, processing } = useForm({
        booking_confirmation: notifications.booking_confirmation,
        appointment_reminders: notifications.appointment_reminders,
        favorite_stylist_update: notifications.favorite_stylist_update,
        promotions_offers: notifications.promotions_offers,
        review_reminders: notifications.review_reminders,
        payment_confirmations: notifications.payment_confirmations,
        email_notifications: notifications.email_notifications,
        push_notifications: notifications.push_notifications,
        sms_notifications: notifications.sms_notifications,
    });

    const handleSubmit = () => {
        patch(route('customer.notifications.update'), {
            preserveScroll: true,
            onSuccess: () => {
                //
            },
        });
    };

    return [
        <AppointmentCard key="booking" data={data} setData={setData} />,
        <UpdatesCard key="updates" data={data} setData={setData} />,
        <ReviewsCard key="updates" data={data} setData={setData} />,
        <BillingCard key="updates" data={data} setData={setData} />,
        <WorkConfirmationCard
            key="work_confirmation"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            processing={processing}
        />,
    ];
};

export default Notifications;
