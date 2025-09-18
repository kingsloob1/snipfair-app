import { Profile } from '@/Components/magic/Profile';
import Authenticated from '@/Layouts/AuthenticatedLayout';
import { UserProfileProps } from '@/types/custom_types';
import { Head } from '@inertiajs/react';

export default function UserProfile({ statistics, user }: UserProfileProps) {
    const routes = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            active: true,
        },
        {
            name: 'Profile',
            path: '/profile',
            active: false,
        },
    ];

    return (
        <Authenticated navigation={routes}>
            <Head title="Profile" />
            <Profile statistics={statistics} user={user} />
        </Authenticated>
    );
}
