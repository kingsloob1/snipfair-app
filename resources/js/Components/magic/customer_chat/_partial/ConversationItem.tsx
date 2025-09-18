import CommonAvatar from '@/Components/common/forms/CommonAvatar';
import {
    ChatMessage,
    ChatConversation as Conversation,
    PageProps,
} from '@/types';
import { usePage } from '@inertiajs/react';
import { CheckCheckIcon, CheckIcon } from 'lucide-react';
import React from 'react';

interface ConversationItemProps {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
}
export const ConversationItem: React.FC<ConversationItemProps> = ({
    conversation,
    isActive,
    onClick,
}) => {
    const { auth } = usePage().props as unknown as PageProps;
    const currentUserId = auth.user.id.toString();

    // Get the latest message from all message groups
    const latestMessageGroup =
        conversation.message_groups[conversation.message_groups.length - 1];
    const latestMessage =
        latestMessageGroup?.messages[latestMessageGroup.messages.length - 1];
    // Count unread messages
    const unreadCount = conversation.message_groups.reduce(
        (count, group) =>
            count +
            group.messages.filter(
                (msg: ChatMessage) =>
                    !msg.is_read && msg.sender_id != currentUserId,
            ).length,
        0,
    );
    // Format timestamp (e.g., "12:55 am")
    const formattedTime = latestMessage?.timestamp || '';
    return (
        <div
            className={`flex cursor-pointer items-center border-b border-gray-100 p-2 hover:bg-gray-50 sm:p-4 ${isActive ? 'bg-sf-gradient-purple/5' : ''}`}
            onClick={onClick}
        >
            <div className="relative mr-3">
                <CommonAvatar
                    image={conversation.other_user_image || ''}
                    name={conversation.other_user_name || 'User'}
                    className="h-10 w-10"
                />
                {conversation.is_online && (
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500"></div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                    <h3 className="truncate text-sm font-medium text-gray-900">
                        {conversation.other_user_name}
                    </h3>
                    <span className="text-xs text-gray-500">
                        {formattedTime}
                    </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                    <p className="truncate text-sm text-gray-500">
                        {latestMessage?.text || 'No messages yet'}
                    </p>
                    {unreadCount > 0 && (
                        <div className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                            {unreadCount}
                        </div>
                    )}
                    {unreadCount === 0 &&
                        latestMessage?.sender_id === currentUserId &&
                        (latestMessage?.is_read ? (
                            <CheckCheckIcon className="h-4 w-4 shrink-0 text-green-500" />
                        ) : (
                            <CheckIcon className="h-4 w-4 shrink-0 text-sf-gray" />
                        ))}
                </div>
            </div>
        </div>
    );
};
