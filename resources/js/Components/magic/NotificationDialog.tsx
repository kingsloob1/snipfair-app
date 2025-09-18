import { Bell, MessageSquare, Settings } from 'lucide-react';
import React from 'react';
interface NotificationItemProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    timestamp: string;
}
const NotificationItem = ({
    icon,
    title,
    description,
    timestamp,
}: NotificationItemProps) => (
    <div className="flex cursor-pointer gap-4 p-4 hover:bg-slate-50">
        <div className="mt-1 flex-shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <span className="text-xs text-gray-500">{timestamp}</span>
            </div>
            <p className="truncate text-sm text-gray-500">{description}</p>
        </div>
    </div>
);
interface NotificationDialogProps {
    isOpen?: boolean;
    onClose?: () => void;
    'data-id'?: string;
}
export const NotificationDialog = ({
    isOpen = true,
    onClose,
    'data-id': dataId,
}: NotificationDialogProps) => {
    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 flex items-start justify-end p-4 sm:p-6"
            onClick={onClose}
            data-id={dataId}
        >
            <div className="w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg">
                <div className="border-b border-gray-200 p-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Notification
                    </h2>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    <NotificationItem
                        icon={<Bell className="h-5 w-5 text-red-500" />}
                        title="Training session reminder"
                        description="Don't forget to join our upcoming training session..."
                        timestamp="Now"
                    />
                    <NotificationItem
                        icon={<Settings className="h-5 w-5 text-blue-500" />}
                        title="New integration announcement"
                        description="Our HR Management Dashboard now integrates..."
                        timestamp="9:00 AM"
                    />
                    <NotificationItem
                        icon={
                            <MessageSquare className="h-5 w-5 text-green-500" />
                        }
                        title="User feedback survey"
                        description="We want to hear from you! Take our quick user f..."
                        timestamp="1 Oct 2022"
                    />
                </div>
                <div className="border-t border-gray-200 p-4">
                    <button
                        className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-white transition-colors hover:bg-purple-700"
                        onClick={() => console.log('Show all notifications')}
                    >
                        Show All Notification
                    </button>
                </div>
            </div>
        </div>
    );
};
