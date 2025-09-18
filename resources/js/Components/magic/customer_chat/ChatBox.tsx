import { Bell, ChevronLeft, Inbox, Mail, Send } from 'lucide-react';
import React, { useState } from 'react';

interface Message {
    text: string;
    is_read: boolean;
    sender_id: string;
    timestamp: string;
}

interface MessageGroup {
    date: string;
    messages: Message[];
}

interface Conversation {
    sender_id: string;
    sender_name: string;
    sender_image: string;
    message_groups: MessageGroup[];
}

interface ChatComponentProps {
    conversations: Conversation[];
}

const ChatBox: React.FC<ChatComponentProps> = ({ conversations }) => {
    const [selectedConversation, setSelectedConversation] =
        useState<Conversation | null>(null);
    const [filter, setFilter] = useState<'all' | 'new' | 'opened'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = conversations
        .filter((conv) => {
            if (filter === 'new')
                return conv.message_groups
                    .flatMap((g) => g.messages)
                    .some((m) => !m.is_read);
            if (filter === 'opened')
                return conv.message_groups
                    .flatMap((g) => g.messages)
                    .every((m) => m.is_read);
            return true;
        })
        .filter(
            (conv) =>
                conv.sender_name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                conv.message_groups
                    .flatMap((g) => g.messages)
                    .some((m) =>
                        m.text
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                    ),
        );

    const getLatestMessage = (conv: Conversation) => {
        const allMessages = conv.message_groups.flatMap((g) => g.messages);
        const latest = allMessages[allMessages.length - 1];
        const unreadCount = allMessages.filter((m) => !m.is_read).length;
        return { text: latest.text, unreadCount, timestamp: latest.timestamp };
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Left Pane - Conversations */}
            <div
                className={`w-full bg-white shadow-md md:w-1/3 ${selectedConversation ? 'hidden md:block' : 'block'}`}
            >
                <div className="border-b p-4">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded border p-2"
                    />
                </div>
                <div className="flex justify-around border-b p-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 p-2 ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        <Inbox size={16} /> All
                    </button>
                    <button
                        onClick={() => setFilter('new')}
                        className={`flex-1 p-2 ${filter === 'new' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        <Bell size={16} /> New
                    </button>
                    <button
                        onClick={() => setFilter('opened')}
                        className={`flex-1 p-2 ${filter === 'opened' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        <Mail size={16} /> Opened
                    </button>
                </div>
                <div className="h-[calc(100vh-150px)] overflow-y-auto">
                    {filteredConversations.map((conv) => {
                        const latest = getLatestMessage(conv);
                        const unreadCount =
                            latest.unreadCount > 0 ? latest.unreadCount : null;
                        return (
                            <div
                                key={conv.sender_id}
                                onClick={() => setSelectedConversation(conv)}
                                className="flex cursor-pointer items-center border-b p-2 hover:bg-gray-100"
                            >
                                <img
                                    src={conv.sender_image}
                                    alt={conv.sender_name}
                                    className="mr-2 h-10 w-10 rounded-full"
                                />
                                <div className="flex-1">
                                    <div className="truncate font-semibold">
                                        {conv.sender_name}
                                    </div>
                                    <div className="truncate text-sm text-gray-500">
                                        {latest.text}
                                    </div>
                                </div>
                                {unreadCount && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                        {unreadCount}
                                    </span>
                                )}
                                <div className="text-xs text-gray-400">
                                    {latest.timestamp}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Pane - Messages */}
            {selectedConversation && (
                <div className="flex w-full flex-col bg-white shadow-md md:w-2/3">
                    <div className="flex items-center border-b p-4">
                        <button
                            onClick={() => setSelectedConversation(null)}
                            className="mr-2 md:hidden"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <img
                            src={selectedConversation.sender_image}
                            alt={selectedConversation.sender_name}
                            className="mr-2 h-10 w-10 rounded-full"
                        />
                        <div>
                            <div className="font-semibold">
                                {selectedConversation.sender_name}
                            </div>
                            <div className="text-sm text-green-500">Online</div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {selectedConversation.message_groups.map((group) => (
                            <div key={group.date}>
                                <div className="my-2 text-center text-sm text-gray-400">
                                    {group.date}
                                </div>
                                {group.messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`mb-2 ${msg.sender_id === 'user' ? 'text-right' : 'text-left'}`}
                                    >
                                        <div
                                            className={`inline-block rounded-lg p-2 ${msg.sender_id === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                        >
                                            {msg.text}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {msg.timestamp} {msg.is_read && '✓'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="border-t p-4">
                        <div className="flex">
                            <input
                                type="text"
                                placeholder="Write message..."
                                className="flex-1 rounded-l border p-2"
                            />
                            <button className="rounded-r bg-purple-500 p-2 text-white">
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBox;
