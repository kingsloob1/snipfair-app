import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';
import { UserProfileProps } from '@/types/custom_types';
import { Mail, MapPin, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { ProfileHeader } from './_partial/ProfileHeader';
import { StatCard } from './_partial/StatCard';

export const Profile = ({ statistics, user }: UserProfileProps) => {
    return (
        <div className="mx-auto max-w-7xl px-5">
            <ProfileHeader
                name={user.name}
                type="Customer"
                appointmentsCount={statistics.active_appointments}
                imageUrl={user.avatar || ''}
                user={user}
            />
            {statistics.total_spendings > 10 && (
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <StatCard
                        title="Total Spent"
                        value={`R${statistics.total_spendings}`}
                        period="This month"
                        change={{
                            value: 8.5,
                            text: 'Up from last month',
                            isPositive: true,
                        }}
                    />
                    <StatCard
                        title="All Appointments"
                        value={`${statistics.total_appointments}`}
                        period="Today"
                        change={{
                            value: 100,
                            text: 'low from yesterday',
                            isPositive: false,
                        }}
                    />
                    <StatCard
                        title="Completed"
                        value={`${statistics.completed_appointments}`}
                        period="This Week"
                        change={{
                            value: 8.5,
                            text: 'Up from this week',
                            isPositive: true,
                        }}
                    />
                    <StatCard
                        title="Failed"
                        value={`${statistics.failed_appointments}`}
                        period="This Week"
                        change={{
                            value: 8.5,
                            text: 'Up from this week',
                            isPositive: false,
                        }}
                    />
                </div>
            )}
            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="mb-6 rounded-lg bg-white p-4 shadow-sm md:p-6"
            >
                <h3 className="mb-4 text-lg font-semibold">
                    Contact Information
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">
                            {user.phone || 'N/A'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">
                            {user.country || 'N/A'}
                        </span>
                    </div>
                </div>
                <h3 className="mb-4 mt-8 text-lg font-semibold">About</h3>
                <p className="text-gray-600">{user.bio || 'N/A'}</p>
            </motion.div>
            <div className="mb-6 bg-white p-4 shadow dark:bg-gray-800 sm:rounded-lg sm:p-8">
                <DeleteUserForm className="max-w-xl" />
            </div>
        </div>
    );
};
