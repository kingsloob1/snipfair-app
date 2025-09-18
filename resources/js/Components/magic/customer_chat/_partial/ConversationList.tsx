import {
    ChatMessage,
    ChatConversation as Conversation,
    ChatFilterType as FilterType,
    PageProps,
} from '@/types';
import { usePage } from '@inertiajs/react';
import { SearchIcon } from 'lucide-react';
import React, { useState } from 'react';
import { ConversationItem } from './ConversationItem';
import EmptyMessage from './EmptyMessage';
interface ConversationListProps {
    conversations: Conversation[];
    activeConversationId: string | null;
    onSelectConversation: (conversationId: string) => void;
}
export const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    activeConversationId,
    onSelectConversation,
}) => {
    const { auth } = usePage().props as unknown as PageProps;
    const currentUserId = auth.user.id.toString();
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const filteredConversations = conversations.filter((conversation) => {
        // Apply text search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const nameMatch = conversation.other_user_name
                .toLowerCase()
                .includes(query);
            const messageMatch = conversation.message_groups.some((group) =>
                group.messages.some((msg: ChatMessage) =>
                    msg.text.toLowerCase().includes(query),
                ),
            );
            if (!nameMatch && !messageMatch) return false;
        }
        // Apply filter
        if (filter === 'new') {
            // Has unread messages
            return conversation.message_groups.some((group) =>
                group.messages.some(
                    (msg: ChatMessage) =>
                        !msg.is_read && msg.sender_id != currentUserId,
                ),
            );
        } else if (filter === 'opened') {
            // All messages are read
            return conversation.message_groups.every((group) =>
                group.messages.every(
                    (msg: ChatMessage) =>
                        msg.is_read || msg.sender_id === currentUserId,
                ),
            );
        }
        return true;
    });
    return (
        <div className="flex h-full flex-col border-r border-sf-stroke bg-sf-white">
            <div className="border-b border-sf-stroke p-1 md:p-4">
                <h1 className="hidden items-center justify-between text-xl font-semibold sm:flex">
                    All Chats
                </h1>
                <div className="mt-1.5 flex rounded-md bg-gray-100 sm:mt-4">
                    <button
                        className={`flex-1 rounded-md py-1 text-sm font-medium sm:py-2 ${filter === 'all' ? 'bg-white text-sf-gradient-purple shadow' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`flex-1 rounded-md py-1 text-sm font-medium sm:py-2 ${filter === 'new' ? 'bg-white text-sf-gradient-purple shadow' : ''}`}
                        onClick={() => setFilter('new')}
                    >
                        New
                    </button>
                    <button
                        className={`flex-1 rounded-md py-1 text-sm font-medium sm:py-2 ${filter === 'opened' ? 'bg-white text-sf-gradient-purple shadow' : ''}`}
                        onClick={() => setFilter('opened')}
                    >
                        Opened
                    </button>
                </div>
                <div className="relative mt-1 sm:mt-4">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-4 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredConversations && filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                        <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            isActive={activeConversationId === conversation.id}
                            onClick={() =>
                                onSelectConversation(conversation.id)
                            }
                        />
                    ))
                ) : (
                    <EmptyMessage messages={conversations} />
                )}
            </div>
        </div>
    );
};
