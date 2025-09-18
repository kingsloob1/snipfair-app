import CommonAvatar from '@/Components/common/forms/CommonAvatar';
import {
    ChatMessage,
    ChatConversation as Conversation,
    PageProps,
} from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import EmptyMessage from './EmptyMessage';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

interface MessageViewProps {
    conversation: Conversation | null;
    conversations: Conversation[];
    onSendMessage: (text: string) => void;
    onBack: () => void;
}
export const MessageView: React.FC<MessageViewProps> = ({
    conversation,
    conversations,
    onSendMessage,
    onBack,
}) => {
    const { auth } = usePage().props as unknown as PageProps;
    const currentUserId = auth.user.id.toString();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop =
                messagesEndRef.current.scrollHeight;
        }
    }, [conversation]);
    if (!conversation) {
        return (
            <>
                {conversations.length > 0 ? (
                    <div className="flex h-full flex-col items-center justify-center bg-gray-50 text-gray-500">
                        <p>Select a conversation to start chatting</p>
                    </div>
                ) : (
                    <EmptyMessage messages={conversations} />
                )}
            </>
        );
    }
    console.log(conversation);
    return (
        <div className="flex h-full flex-col bg-gray-50">
            {/* Header */}
            <div className="flex items-center border-b border-gray-200 bg-white p-1 md:p-4">
                <button
                    className="mr-3 rounded-full p-1 hover:bg-gray-100 md:hidden"
                    onClick={onBack}
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <Link
                    className="flex gap-3"
                    href={
                        conversation.other_user_role === 'customer'
                            ? `/stylist/customer/${conversation.other_user_id}`
                            : `/customer/stylist/${conversation.other_user_id}`
                    }
                >
                    <div className="relative">
                        <CommonAvatar
                            image={conversation.other_user_image || ''}
                            name={conversation.other_user_name || 'User'}
                            className="h-10 w-10"
                        />
                        {conversation.is_online && (
                            <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-green-500"></div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium">
                            {conversation.other_user_name}
                        </h3>
                        <p className="text-xs text-green-500">
                            {conversation.is_online
                                ? 'Online'
                                : conversation.last_seen}
                        </p>
                    </div>
                </Link>
            </div>
            {/* Message List */}
            <div
                ref={messagesEndRef}
                className="slim-scrollbar flex-1 overflow-y-auto bg-sf-white-neutral bg-[url('/images/chat-bg.png')] bg-cover bg-center bg-blend-overlay"
            >
                {conversation.message_groups.map((group, groupIndex) => (
                    <div
                        key={groupIndex}
                        className="relative mb-6 px-2 sm:px-4"
                    >
                        <div className="mb-4 text-center">
                            <span className="rounded-full bg-white px-2 py-1 text-xs text-sf-gradient-purple">
                                {group.date}
                            </span>
                        </div>
                        {group.messages.map(
                            (message: ChatMessage, messageIndex: number) => (
                                <MessageBubble
                                    key={messageIndex}
                                    message={message}
                                    isCurrentUser={
                                        message.sender_id === currentUserId
                                    }
                                />
                            ),
                        )}
                    </div>
                ))}
            </div>
            {/* Input Area */}
            <MessageInput onSendMessage={onSendMessage} />
        </div>
    );
};
