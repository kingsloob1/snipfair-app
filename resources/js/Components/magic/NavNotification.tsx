import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { BadgeInfo, Info, Triangle, TriangleAlert } from 'lucide-react';
import { ReactNode } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface NotificationItemProps {
    id: number;
    type: 'chat' | 'notification' | 'admin-notification';
    other_id?: number;
    icon: React.ReactNode;
    title: string;
    description: string;
    timestamp: string;
    isUnread?: boolean;
}
const NotificationItem = ({
    id,
    type,
    other_id,
    icon,
    title,
    description,
    timestamp,
    isUnread = false,
}: NotificationItemProps) => (
    <button
        className="flex w-full cursor-pointer gap-4 p-4 hover:bg-slate-50"
        onClick={() => {
            type === 'chat'
                ? router.post('/chat/start', {
                      recipient_id: other_id,
                  })
                : type === 'notification'
                  ? router.visit(route('user.notifications.show', id))
                  : router.visit(route('admin.notifications.show', id));
        }}
    >
        <div className="mt-1 flex-shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
                <p className="text-left text-sm font-medium text-gray-900">
                    {title}
                </p>
                <span className="text-xs text-gray-500">{timestamp}</span>
            </div>
            <div className={cn('items-center', isUnread && 'flex gap-2')}>
                <p className="truncate text-left text-sm text-gray-500">
                    {description}
                </p>
                {isUnread && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-danger-normal"></span>
                )}
            </div>
        </div>
    </button>
);

type NavNotificationProps = {
    onClick?: () => void;
    type: 'notification' | 'chat' | 'admin-notification';
    items?: {
        type: 'reminder' | 'setting' | 'info' | 'chat';
        title: string;
        description: string;
        timestamp: string;
        isUnread?: boolean;
        image?: string;
        other_id?: number;
        id?: number;
    }[];
    trigger: ReactNode;
};

export default function NavNotification({
    onClick,
    type,
    items,
    trigger,
}: NavNotificationProps) {
    const Icons = {
        normal: <Info className="h-5 w-5 text-sf-primary" />,
        low: <Triangle className="h-5 w-5 text-warning-normal" />,
        moderate: <TriangleAlert className="h-5 w-5 text-sf-orange-53" />,
        critical: <BadgeInfo className="h-5 w-5 text-danger-normal" />,
    };
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="border-none focus:outline-none focus:ring-0 focus:ring-ring focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0">
                {trigger}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
                <div className="border-b border-gray-200 p-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {type === 'notification' ? 'Notifications' : 'Messages'}
                    </h2>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {items && items.length > 0 ? (
                        items
                            .slice(0, 3)
                            .map((item, i) => (
                                <NotificationItem
                                    key={i}
                                    icon={
                                        item.type === 'chat' ? (
                                            <img
                                                className="h-8 w-8 rounded-full bg-sf-white-card"
                                                src={item.image ?? ''}
                                            />
                                        ) : (
                                            Icons[
                                                item.type as
                                                    | 'normal'
                                                    | 'low'
                                                    | 'moderate'
                                                    | 'critical'
                                            ]
                                        )
                                    }
                                    title={item.title}
                                    other_id={item.other_id}
                                    description={item.description}
                                    timestamp={item.timestamp}
                                    isUnread={item.isUnread}
                                    id={item.id ?? 0}
                                    type={type}
                                />
                            ))
                    ) : (
                        <p className="h-full py-8 text-center text-sm italic text-sf-primary-paragraph">
                            No {type === 'chat' ? 'messages' : 'notifications'}{' '}
                            currently
                        </p>
                    )}
                </div>
                <div className="border-t border-gray-200 p-4">
                    <button
                        className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-white transition-colors hover:bg-purple-700"
                        onClick={onClick}
                    >
                        Show All{' '}
                        {type === 'notification' ? 'Notifications' : 'Messages'}
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
