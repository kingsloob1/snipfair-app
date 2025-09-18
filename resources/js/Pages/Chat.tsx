import { ChatsComponent } from '@/Components/magic/customer_chat/ChatsComponent';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { ChatConversation, PageProps } from '@/types';
import { Head } from '@inertiajs/react';

type ChatPageProps = {
    conversations: ChatConversation[];
    selectedConversationId?: string;
};

const Chat = ({
    auth,
    conversations,
    selectedConversationId,
}: PageProps<ChatPageProps>) => {
    if (auth.user.role === 'customer') {
        return (
            <AuthenticatedLayout
                showToExplore={false}
                exploreRoute={{
                    name: 'Back to Explore',
                    path: route('dashboard'),
                }}
                fullScreen={true}
            >
                <Head title="Chat" />
                <section className="mx-auto max-w-7xl flex-1 px-1.5 py-2 sm:px-5 sm:py-6 md:py-8">
                    <ChatsComponent
                        conversations={conversations}
                        initialSelectedConversationId={selectedConversationId}
                    />
                </section>
            </AuthenticatedLayout>
        );
    } else if (auth.user.role === 'stylist') {
        return (
            <StylistAuthLayout fullScreen={true} header="Stylist Chat">
                <section className="mt-6 min-h-screen w-full max-w-7xl px-2 md:px-5">
                    <ChatsComponent
                        conversations={conversations}
                        initialSelectedConversationId={selectedConversationId}
                    />
                </section>
            </StylistAuthLayout>
        );
    } else return null;
};

export default Chat;
