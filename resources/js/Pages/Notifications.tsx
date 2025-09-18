import { NotificationCard } from '@/Components/magic/customer_notification/NotificationCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { NotificationCardProps, PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';

interface NotificationPageProps extends PageProps {
    notifications: (NotificationCardProps & { id: number })[];
}

const CustomerNotifications = ({
    auth,
    notifications: notificationData,
}: PageProps<NotificationPageProps>) => {
    const routes = [
        {
            name: 'Dashboard',
            path: route('dashboard'),
            active: true,
        },
        {
            name: 'Notifications',
            path: route('customer.notifications'),
            active: false,
        },
    ];

    const markAsRead = async (notificationId: number) => {
        try {
            router.patch(route('notifications.read', notificationId));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            router.patch(route('notifications.read-all'));
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const enhancedNotifications = notificationData.map((notification) => ({
        ...notification,
        primaryAction: () => {
            markAsRead(notification.id);
            console.log('Primary action for notification:', notification.id);
        },
        action_url: notification.type,
        primaryActionLabel: 'Close',
    }));

    if (auth.user.role === 'customer') {
        return (
            <AuthenticatedLayout
                showToExplore={false}
                exploreRoute={{
                    name: 'Back to Explore',
                    path: route('dashboard'),
                }}
                navigation={routes}
            >
                <Head title="Notifications" />
                <section className="mx-auto max-w-7xl px-5">
                    <div className="w-full rounded-2xl bg-sf-white shadow-md">
                        <div className="px-4 py-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        Notifications
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        Stay updated with your appointments and
                                        activities
                                    </p>
                                </div>
                                {notificationData.length > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="rounded-md bg-sf-primary px-3 py-1 text-sm text-white transition-colors hover:bg-sf-primary/90"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4 border-t p-5 md:px-8">
                            {enhancedNotifications &&
                            enhancedNotifications.length > 0 ? (
                                enhancedNotifications.map((notification, i) => (
                                    <NotificationCard
                                        key={i}
                                        {...notification}
                                    />
                                ))
                            ) : (
                                <p className="py-10 text-center text-base italic text-sf-primary-paragraph">
                                    No new notifications currently
                                </p>
                            )}
                        </div>
                    </div>
                </section>
            </AuthenticatedLayout>
        );
    } else if (auth.user.role === 'stylist') {
        return (
            <StylistAuthLayout header="Stylist Notifications">
                <section className="mt-6 w-full max-w-7xl px-5">
                    <div className="w-full rounded-2xl bg-sf-white shadow-md">
                        <div className="px-4 py-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        Notifications
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        Stay updated with your appointments and
                                        activities
                                    </p>
                                </div>
                                {notificationData.length > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="rounded-md bg-sf-primary px-3 py-1 text-sm text-white transition-colors hover:bg-sf-primary/90"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4 border-t p-5 md:px-8">
                            {enhancedNotifications &&
                            enhancedNotifications.length > 0 ? (
                                enhancedNotifications.map((notification, i) => (
                                    <NotificationCard
                                        key={i}
                                        {...notification}
                                    />
                                ))
                            ) : (
                                <p className="py-10 text-center text-base italic text-sf-primary-paragraph">
                                    No new notifications currently
                                </p>
                            )}
                        </div>
                    </div>
                </section>
            </StylistAuthLayout>
        );
    } else return null;
};

export default CustomerNotifications;
