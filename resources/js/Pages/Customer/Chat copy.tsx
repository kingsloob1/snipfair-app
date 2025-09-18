import ChatBox from '@/Components/magic/customer_chat/ChatBox';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

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

const Chat = () => {
    // const sectionProducts = products.filter(
    //     (product) => product.favorite === true,
    // );
    // const conversations = [
    //     {
    //         id: 1,
    //         name: 'Jane Doe',
    //         messages: [
    //             {
    //                 text: 'Hi, I want to make inquiry about...',
    //                 is_read: false,
    //                 timestamp: '12:55 am',
    //             },
    //             {
    //                 text: 'Hello Janet, thank you for reaching out',
    //                 is_read: true,
    //                 timestamp: '12:57 am',
    //             },
    //             {
    //                 text: 'What do you need to know?',
    //                 is_read: true,
    //                 timestamp: '12:57 am',
    //             },
    //         ],
    //     },
    //     {
    //         id: 2,
    //         name: 'John Smith',
    //         messages: [
    //             {
    //                 text: 'Hello, can we discuss the project?',
    //                 is_read: false,
    //                 timestamp: '10:30 am',
    //             },
    //             {
    //                 text: 'Sure, let’s schedule a meeting',
    //                 is_read: false,
    //                 timestamp: '10:32 am',
    //             },
    //         ],
    //     },
    // ];

    const conversations: Conversation[] = [
        {
            sender_id: 'user1',
            sender_name: 'Jane Doe',
            sender_image: 'https://via.placeholder.com/40',
            message_groups: [
                {
                    date: '12 August 2022',
                    messages: [
                        {
                            text: 'Hello, I want to make enquiries about your services.',
                            is_read: true,
                            sender_id: 'user1',
                            timestamp: '12:55 am',
                        },
                        {
                            text: 'Hi, I want make inquiry about...',
                            is_read: true,
                            sender_id: 'user1',
                            timestamp: '12:55 am',
                        },
                        {
                            text: 'Hello Janet, thank you for reaching out',
                            is_read: true,
                            sender_id: 'user',
                            timestamp: '12:57 am',
                        },
                        {
                            text: 'What do you need to know?',
                            is_read: true,
                            sender_id: 'user',
                            timestamp: '12:57 am',
                        },
                    ],
                },
                {
                    date: 'Today',
                    messages: [
                        {
                            text: 'Hi, I want make inquiry about...',
                            is_read: false,
                            sender_id: 'user1',
                            timestamp: '02:50 pm',
                        },
                        {
                            text: 'Hi, I want make inquiry about...',
                            is_read: false,
                            sender_id: 'user1',
                            timestamp: '02:51 pm',
                        },
                    ],
                },
            ],
        },
        {
            sender_id: 'user2',
            sender_name: 'John Smith',
            sender_image: 'https://via.placeholder.com/40',
            message_groups: [
                {
                    date: '10 July 2025',
                    messages: [
                        {
                            text: 'Can we schedule a meeting?',
                            is_read: true,
                            sender_id: 'user2',
                            timestamp: '09:15 am',
                        },
                        {
                            text: 'Sure, how about tomorrow?',
                            is_read: true,
                            sender_id: 'user',
                            timestamp: '09:17 am',
                        },
                    ],
                },
            ],
        },
        {
            sender_id: 'user3',
            sender_name: 'Alice Johnson',
            sender_image: 'https://via.placeholder.com/40',
            message_groups: [
                {
                    date: '15 July 2025',
                    messages: [
                        {
                            text: 'I need help with my order.',
                            is_read: false,
                            sender_id: 'user3',
                            timestamp: '11:30 am',
                        },
                    ],
                },
            ],
        },
        {
            sender_id: 'user4',
            sender_name: 'Bob Wilson',
            sender_image: 'https://via.placeholder.com/40',
            message_groups: [
                {
                    date: '20 July 2025',
                    messages: [
                        {
                            text: 'Thanks for the update!',
                            is_read: true,
                            sender_id: 'user4',
                            timestamp: '03:20 pm',
                        },
                        {
                            text: "You're welcome!",
                            is_read: true,
                            sender_id: 'user',
                            timestamp: '03:22 pm',
                        },
                    ],
                },
            ],
        },
        {
            sender_id: 'user5',
            sender_name: 'Emma Davis',
            sender_image: 'https://via.placeholder.com/40',
            message_groups: [
                {
                    date: '22 July 2025',
                    messages: [
                        {
                            text: 'Can you send the details?',
                            is_read: false,
                            sender_id: 'user5',
                            timestamp: '01:10 pm',
                        },
                    ],
                },
            ],
        },
        {
            sender_id: 'user6',
            sender_name: 'Michael Brown',
            sender_image: 'https://via.placeholder.com/40',
            message_groups: [
                {
                    date: '23 July 2025',
                    messages: [
                        {
                            text: "Let's discuss the project.",
                            is_read: true,
                            sender_id: 'user6',
                            timestamp: '02:00 pm',
                        },
                    ],
                },
            ],
        },
        {
            sender_id: 'user7',
            sender_name: 'Sarah Lee',
            sender_image: 'https://via.placeholder.com/40',
            message_groups: [
                {
                    date: '23 July 2025',
                    messages: [
                        {
                            text: 'I have a question.',
                            is_read: false,
                            sender_id: 'user7',
                            timestamp: '02:30 pm',
                        },
                    ],
                },
            ],
        },
        {
            sender_id: 'user8',
            sender_name: 'David Kim',
            sender_image: 'https://via.placeholder.com/40',
            message_groups: [
                {
                    date: '23 July 2025',
                    messages: [
                        {
                            text: 'Great work today!',
                            is_read: true,
                            sender_id: 'user8',
                            timestamp: '02:40 pm',
                        },
                    ],
                },
            ],
        },
        {
            sender_id: 'user9',
            sender_name: 'Lisa Chen',
            sender_image: 'https://via.placeholder.com/40',
            message_groups: [
                {
                    date: '23 July 2025',
                    messages: [
                        {
                            text: 'Call me back please.',
                            is_read: false,
                            sender_id: 'user9',
                            timestamp: '02:45 pm',
                        },
                    ],
                },
            ],
        },
        {
            sender_id: 'user10',
            sender_name: 'Tom Harris',
            sender_image: 'https://via.placeholder.com/40',
            message_groups: [
                {
                    date: '23 July 2025',
                    messages: [
                        {
                            text: 'See you tomorrow.',
                            is_read: true,
                            sender_id: 'user10',
                            timestamp: '02:50 pm',
                        },
                    ],
                },
            ],
        },
    ];

    return (
        <AuthenticatedLayout
            showToExplore={false}
            exploreRoute={{ name: 'Back to Explore', path: route('dashboard') }}
        >
            <Head title="Chat" />
            <section className="mx-auto max-w-7xl px-5 py-2 md:py-4 xl:py-6">
                <ChatBox conversations={conversations} />
            </section>
        </AuthenticatedLayout>
    );
};

export default Chat;
