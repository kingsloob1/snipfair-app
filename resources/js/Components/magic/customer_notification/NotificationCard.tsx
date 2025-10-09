import CustomButton from '@/Components/common/CustomButton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { cn } from '@/lib/utils';
import { NotificationCardProps, Priority } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Circle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const getPriorityClass = (priority: Priority) => {
    switch (priority) {
        case 'Low':
            return 'bg-purple-100 text-purple-700 border border-purple-700';
        case 'Medium':
            return 'bg-blue-100 text-blue-700 border border-blue-700';
        case 'High':
            return 'bg-orange-100 text-orange-700 border border-orange-700';
        case 'Risky':
            return 'bg-red-100 text-red-700 border border-red-700';
        case 'Opened':
            return 'bg-gray-100 text-gray-700 border border-gray-700';
        default:
            return 'bg-gray-100 text-gray-700 border border-gray-700';
    }
};
export const NotificationCard: React.FC<NotificationCardProps> = ({
    id,
    title,
    description,
    time_ago,
    time_string,
    priority,
    primaryAction,
    primaryActionLabel = 'Confirm',
    is_read,
    action_url,
}) => {
    const { url } = usePage();
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        if (url) {
            const params = new URLSearchParams(
                new URL(url, window.location.origin).search,
            );
            const tab = params.get('tab');
            if (Number(tab) == id) {
                setIsOpen(true);
            }
        }
    }, [url, id]);

    return (
        <>
            <div
                className="cursor-pointer rounded-xl border border-sf-stroke bg-sf-white p-4 transition-colors hover:bg-gray-50"
                onClick={() => setIsOpen(true)}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 gap-3">
                        <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-gray-900">
                                {title}
                            </h3>
                            <p className="truncate text-sm text-gray-500">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: description.replace(
                                            /\n/g,
                                            '<br />',
                                        ),
                                    }}
                                />
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                {time_ago}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-center">
                        <span
                            className={`rounded-full px-2 py-1 text-xs md:px-3.5 ${getPriorityClass(priority)}`}
                        >
                            {priority}
                        </span>
                        <Circle
                            className={cn(
                                'h-4 w-4',
                                is_read
                                    ? 'text-sf-gray'
                                    : 'fill-sf-orange-53 text-sf-orange-53',
                            )}
                        />
                    </div>
                </div>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="no-scrollbar max-h-[90vh] max-w-96 overflow-y-auto sm:rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex gap-4 pr-6">
                            <div className="flex flex-col gap-1.5">
                                <span>{title}</span>
                                <p className="mt-1 text-xs font-normal text-gray-400">
                                    {time_ago}
                                </p>
                                <div>
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-normal ${getPriorityClass(priority)}`}
                                    >
                                        {priority}
                                    </span>
                                </div>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-gray-700">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: description.replace(
                                        /\n/g,
                                        '<br />',
                                    ),
                                }}
                            />
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            {time_string}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {primaryAction && (
                            <CustomButton
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    primaryAction();
                                    setIsOpen(false);
                                }}
                            >
                                {primaryActionLabel}
                            </CustomButton>
                        )}
                        {action_url && (
                            <CustomButton
                                type="button"
                                onClick={() => {
                                    router.visit(route('admin.notifications.show', {id}));
                                    setIsOpen(false);
                                }}
                            >
                                View
                            </CustomButton>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
