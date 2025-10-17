import { ChatConversation, PageProps } from '@/types';
import { router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { ConversationList } from './_partial/ConversationList';
import { MessageView } from './_partial/MessageView';

interface ChatComponentProps {
    conversations: ChatConversation[];
    initialSelectedConversationId?: string;
}

export const ChatsComponent: React.FC<ChatComponentProps> = ({
    conversations: initialConversations,
    initialSelectedConversationId,
}) => {
    const { auth } = usePage().props as unknown as PageProps;
    const currentUserId = auth.user.id.toString();
    const [conversations, setConversations] =
        useState<ChatConversation[]>(initialConversations);
    const [activeConversationId, setActiveConversationId] = useState<
        string | null
    >(initialSelectedConversationId || null);
    const [showMessageView, setShowMessageView] = useState<boolean>(
        !!initialSelectedConversationId,
    );

    // Update conversations when initialConversations change (after navigation)
    React.useEffect(() => {
        setConversations(initialConversations);
    }, [initialConversations]);

    // Set up real-time message listening
    useEffect(() => {
        if (!window.Echo || !currentUserId) return;
        const userChannel = window.Echo.private(`user.${currentUserId}`);
        userChannel.listen('.message.sent', (e: unknown) => {
            const eventData = e as {
                message: {
                    id: string;
                    text: string;
                    is_read: boolean;
                    sender_id: string;
                    receiver_id: string;
                    timestamp: string;
                };
                conversation_id: string;
            };

            const { message, conversation_id } = eventData;
            setConversations((prevConversations) => {
                return prevConversations.map((conv) => {
                    if (conv.id === conversation_id) {
                        const today = new Date();
                        const todayString =
                            today.toDateString() === new Date().toDateString()
                                ? 'Today'
                                : today.toLocaleDateString('en-US', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                  });

                        const newMessage = {
                            id: message.id,
                            text: message.text,
                            is_read: message.is_read,
                            sender_id: message.sender_id,
                            receiver_id: message.receiver_id,
                            timestamp: message.timestamp,
                        };
                        const updatedGroups = [...conv.message_groups];
                        const todayGroupIndex = updatedGroups.findIndex(
                            (group) => group.date === todayString,
                        );

                        if (todayGroupIndex >= 0) {
                            updatedGroups[todayGroupIndex] = {
                                ...updatedGroups[todayGroupIndex],
                                messages: [
                                    ...updatedGroups[todayGroupIndex].messages,
                                    newMessage,
                                ],
                            };
                        } else {
                            updatedGroups.push({
                                date: todayString,
                                messages: [newMessage],
                            });
                        }

                        return {
                            ...conv,
                            message_groups: updatedGroups,
                        };
                    }
                    return conv;
                });
            });
        });

        let conversationChannel: unknown = null;
        if (activeConversationId) {
            conversationChannel = window.Echo.private(
                `conversation.${activeConversationId}`,
            );

            (conversationChannel as any).listen(
                '.message.sent',
                (e: unknown) => {
                    console.log(
                        '📨 Received message on conversation channel:',
                        e,
                    );
                },
            );
        }

        // Listen for channel subscription success/errors
        userChannel
            .subscribed(() => {
                console.log('✅ Successfully subscribed to user channel');
            })
            .error((error: unknown) => {
                console.error('❌ Error subscribing to user channel:', error);
            });

        // Cleanup function
        return () => {
            console.log('🧹 Cleaning up Echo listeners');
            if (userChannel) {
                window.Echo.leave(`user.${currentUserId}`);
            }
            if (conversationChannel) {
                window.Echo.leave(`conversation.${activeConversationId}`);
            }
        };
    }, [currentUserId, activeConversationId]);

    // Handle initial conversation selection
    React.useEffect(() => {
        if (initialSelectedConversationId && conversations.length > 0) {
            const conversationExists = conversations.find(
                (conv) => conv.id === initialSelectedConversationId,
            );
            if (conversationExists) {
                setActiveConversationId(initialSelectedConversationId);
                setShowMessageView(true);

                // Mark messages as read
                router.patch(
                    '/chat/read',
                    {
                        conversation_id: initialSelectedConversationId,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                    },
                );

                // Clean up the URL by removing the conversation parameter
                const url = new URL(window.location.href);
                url.searchParams.delete('conversation');
                window.history.replaceState({}, '', url.toString());
            }
        }
    }, [initialSelectedConversationId, conversations]);

    const activeConversation = activeConversationId
        ? conversations.find((conv) => conv.id === activeConversationId) || null
        : null;

    const handleSelectConversation = (id: string) => {
        setActiveConversationId(id);
        setShowMessageView(true);

        // Mark messages as read
        router.patch(
            '/chat/read',
            {
                conversation_id: id,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleSendMessage = (text: string) => {
        if (!activeConversationId) return;

        // Optimistic update: Add message immediately to UI
        const tempId = `temp_${Date.now()}`;
        const now = new Date();
        const todayString =
            now.toDateString() === new Date().toDateString()
                ? 'Today'
                : now.toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                  });

        const optimisticMessage = {
            id: tempId,
            text: text,
            is_read: false,
            sender_id: currentUserId,
            receiver_id: '', // Will be filled by backend
            timestamp: now
                .toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                })
                .toLowerCase(),
        };

        // Update local state immediately
        setConversations((prevConversations) => {
            return prevConversations.map((conv) => {
                if (conv.id === activeConversationId) {
                    const updatedGroups = [...conv.message_groups];
                    const todayGroupIndex = updatedGroups.findIndex(
                        (group) => group.date === todayString,
                    );

                    if (todayGroupIndex >= 0) {
                        updatedGroups[todayGroupIndex] = {
                            ...updatedGroups[todayGroupIndex],
                            messages: [
                                ...updatedGroups[todayGroupIndex].messages,
                                optimisticMessage,
                            ],
                        };
                    } else {
                        updatedGroups.push({
                            date: todayString,
                            messages: [optimisticMessage],
                        });
                    }

                    return {
                        ...conv,
                        message_groups: updatedGroups,
                    };
                }
                return conv;
            });
        });

        // Send message via API
        router.post(
            '/chat/send',
            {
                conversation_id: activeConversationId,
                text: text,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Remove optimistic message and let real-time listener handle the real message
                    setConversations((prevConversations) => {
                        return prevConversations.map((conv) => {
                            if (conv.id === activeConversationId) {
                                const updatedGroups = conv.message_groups.map(
                                    (group) => ({
                                        ...group,
                                        messages: group.messages.filter(
                                            (msg) => msg.id != tempId,
                                        ),
                                    }),
                                );
                                return {
                                    ...conv,
                                    message_groups: updatedGroups,
                                };
                            }
                            return conv;
                        });
                    });
                },
                onError: (errors) => {
                    console.error('Failed to send message:', errors);
                    // Remove optimistic message on error
                    setConversations((prevConversations) => {
                        return prevConversations.map((conv) => {
                            if (conv.id === activeConversationId) {
                                const updatedGroups = conv.message_groups.map(
                                    (group) => ({
                                        ...group,
                                        messages: group.messages.filter(
                                            (msg) => msg.id != tempId,
                                        ),
                                    }),
                                );
                                return {
                                    ...conv,
                                    message_groups: updatedGroups,
                                };
                            }
                            return conv;
                        });
                    });
                },
            },
        );
    };

    const handleBack = () => {
        setShowMessageView(false);
    };

    return (
        <div className="flex h-full w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            {/* Conversation List - hide on mobile when a conversation is selected */}
            <div
                className={`w-full md:block md:w-1/3 ${showMessageView ? 'hidden' : 'block'}`}
            >
                <ConversationList
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    onSelectConversation={handleSelectConversation}
                />
            </div>
            {/* Message View - show on mobile only when a conversation is selected */}
            <div
                className={`w-full md:block md:w-2/3 ${showMessageView ? 'block' : 'hidden'}`}
            >
                <MessageView
                    conversation={activeConversation}
                    conversations={conversations}
                    onSendMessage={handleSendMessage}
                    onBack={handleBack}
                />
            </div>
        </div>
    );
};
