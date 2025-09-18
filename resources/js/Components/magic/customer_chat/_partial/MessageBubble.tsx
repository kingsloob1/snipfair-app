import { ChatMessage as Message } from '@/types';
import { CheckCheckIcon, CheckIcon } from 'lucide-react';
import React from 'react';
interface MessageBubbleProps {
    message: Message;
    isCurrentUser: boolean;
}
export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isCurrentUser,
}) => {
    return (
        <div
            className={`mb-2 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
        >
            <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${isCurrentUser ? 'rounded-br-none bg-white text-gray-800' : 'rounded-bl-none bg-white text-gray-800'}`}
            >
                <div className="text-sm">{message.text}</div>
                <div className="mt-1 flex items-center justify-end space-x-1">
                    <span className="text-xs text-gray-500">
                        {message.timestamp}
                    </span>
                    {isCurrentUser &&
                        (message.is_read ? (
                            <CheckCheckIcon className="h-3 w-3 text-green-500" />
                        ) : (
                            <CheckIcon className="h-3 w-3 text-sf-gray" />
                        ))}
                </div>
            </div>
        </div>
    );
};

// {unreadCount === 0 &&
//                         latestMessage?.sender_id === currentUserId && (
//                             latestMessage?.is_read ? (
//                                 <CheckCheckIcon className="h-4 w-4 shrink-0 text-green-500" />
//                             ) : (
//                                 <CheckIcon className="h-4 w-4 shrink-0 text-sf-gray" />
//                             )
//                         )}
