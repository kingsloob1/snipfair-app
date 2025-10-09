import { NotificationCard } from '@/Components/magic/customer_notification/NotificationCard';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { AdminAccountLayout } from '@/Layouts/AdminAccountLayout';
import { NotificationCardProps, PageProps } from '@/types';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import isUrl from 'is-url-superb';

interface NotificationPageProps extends PageProps {
    notifications: (NotificationCardProps & { id: number })[];
}

export default function Notifications({
    notifications: notificationData,
}: PageProps<NotificationPageProps>) {
    const routes = [
        {
            name: 'Dashboard',
            path: route('admin.dashboard'),
            active: false,
        },
    ];

    const markAsRead = async (notificationId: number) => {
        try {
            router.patch(route('admin.notifications.read', notificationId));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            router.patch(route('admin.notifications.read-all'));
        } catch (error) {
            toast.error('Failed to mark all notifications as read');
            console.error(error);
        }
    };

    const enhancedNotifications = notificationData.map((notification) =>  {
        let action_url = '';
        if(notification.type){
            if(isUrl(notification.type, {lenient: true})){
                action_url = notification.type;
            } else if(action_url === 'stylist_dispute'){
                action_url = route('admin.disputes.index');
            }
        }

        return {
            ...notification,
            primaryAction: () => {
                markAsRead(notification.id);
            },
            action_url,
            primaryActionLabel: 'Close',
        }
    });

    return (
        <AdminAccountLayout header="Admin Dashboard">
            <StylistNavigationSteps
                routes={routes}
                sub="Here's what's happening with your platform today"
            />
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
                                <NotificationCard key={i} {...notification} />
                            ))
                        ) : (
                            <p className="py-10 text-center text-base italic text-sf-primary-paragraph">
                                No new notifications currently
                            </p>
                        )}
                    </div>
                </div>
            </section>
        </AdminAccountLayout>
    );
}
