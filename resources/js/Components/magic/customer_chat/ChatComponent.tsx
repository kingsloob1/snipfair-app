import { MessageCircle, Send } from 'lucide-react';
import React, { useState } from 'react';

interface Message {
    text: string;
    is_read: boolean;
    timestamp: string;
}

interface Conversation {
    id: number;
    name: string;
    messages: Message[];
}

interface ChatComponentProps {
    conversations: Conversation[];
}

const ChatComponent: React.FC<ChatComponentProps> = ({ conversations }) => {
    const [selectedConversation, setSelectedConversation] = useState<
        number | null
    >(null);
    const [messageInput, setMessageInput] = useState('');

    const handleConversationClick = (id: number) => {
        setSelectedConversation(id);
    };

    const handleSendMessage = () => {
        if (messageInput.trim()) {
            setMessageInput('');
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Left Sidebar (Conversations) - Visible on Mobile Initially */}
            <div
                className={`w-1/4 bg-white shadow-md ${selectedConversation !== null ? 'hidden md:block' : 'block'}`}
            >
                <div className="border-b p-4">
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full rounded border p-2"
                    />
                </div>
                <div className="h-[calc(100%-60px)] overflow-y-auto">
                    {conversations.map((conv) => {
                        const latestMessage =
                            conv.messages[conv.messages.length - 1];
                        const unreadCount = conv.messages.filter(
                            (msg) => !msg.is_read,
                        ).length;
                        return (
                            <div
                                key={conv.id}
                                onClick={() => handleConversationClick(conv.id)}
                                className="flex cursor-pointer items-center border-b p-4 hover:bg-gray-50"
                            >
                                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                                    <MessageCircle size={20} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="truncate font-semibold">
                                        {conv.name}
                                    </div>
                                    <div className="truncate text-sm text-gray-500">
                                        {latestMessage.text}
                                    </div>
                                </div>
                                {unreadCount > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Chat Area - Visible on Conversation Select */}
            <div
                className={`flex flex-1 flex-col ${selectedConversation === null ? 'hidden md:flex' : 'flex'}`}
            >
                <div className="flex items-center justify-between border-b p-4">
                    {selectedConversation !== null && (
                        <>
                            <div className="flex items-center">
                                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                                    <MessageCircle size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold">
                                        {
                                            conversations.find(
                                                (conv) =>
                                                    conv.id ===
                                                    selectedConversation,
                                            )?.name
                                        }
                                    </div>
                                    <div className="text-sm text-green-500">
                                        Online 12:55 am
                                    </div>
                                </div>
                            </div>
                            <div>12 August 2022</div>
                        </>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {selectedConversation !== null &&
                        conversations
                            .find((conv) => conv.id === selectedConversation)
                            ?.messages.map((msg, index) => (
                                <div key={index} className="mb-4">
                                    <div
                                        className={`rounded-lg p-2 ${msg.is_read ? 'bg-gray-200' : 'bg-purple-100'}`}
                                    >
                                        {msg.text}
                                    </div>
                                    <div className="ml-2 text-xs text-gray-500">
                                        {msg.timestamp}
                                    </div>
                                </div>
                            ))}
                </div>
                <div className="flex border-t p-4">
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Write message"
                        className="mr-2 flex-1 rounded border p-2"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="rounded bg-purple-500 p-2 text-white"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;

// Design this chat component using tailwind and typescript. Do it exactly as it is in the screenshot.
// 1. For responsiveness, the mobile will be broken into two sides, a mobile screen will automatically show only the left side initially (list of conversations), and when a conversation is clicked on, it will show the right side (conversation of messages), with a button to go back to conversations.
// 2. The main prop will receive a list of conversations, where each conversation is will have a sender_id, sender_name, sender_image, then a grouped list of messages. Each group of messages will have a date and messages prop, and each message will have its text, is_read, sender_id and timestamp.
// 3. The conversations list will display, with truncation, the most recent message of that conversation, indicating how many messages are unread as shown in the screenshot.
// 4. In the conversations pane, there's are 3 buttons to filter conversations, based on is_read status of the conversation's messages, and a search string to search conversation.name/message.text.
// Use lucide-react icons.
