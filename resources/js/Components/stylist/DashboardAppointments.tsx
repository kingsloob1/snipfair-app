import CustomButton from '@/Components/common/CustomButton';
import { AppointmentCardProps } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import AppointmentCard from './AppointmentCard';

const DashboardAppointments = ({
    appointments,
}: {
    appointments?: AppointmentCardProps[];
}) => {
    return (
        <div className="space-y-4">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-sf-black">
                        Upcoming Appointments
                    </h2>
                    <p className="text-sm text-sf-primary-paragraph">
                        Stay updated with your appointments and activities
                    </p>
                </div>
                <Link href={route('stylist.schedules')}>
                    <CustomButton
                        variant="secondary"
                        className="bg-transparent"
                        fullWidth={false}
                    >
                        <div className="flex items-center gap-2">
                            View All
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    </CustomButton>
                </Link>
            </div>
            {appointments && appointments.length > 0 ? (
                appointments
                    .slice(0, 5)
                    .map((item, index) => (
                        <AppointmentCard {...item} key={index} />
                    ))
            ) : (
                <p className="h-full py-8 text-center text-sm italic text-sf-primary-paragraph">
                    You have no upcoming appointments
                </p>
            )}
        </div>
    );
};

export default DashboardAppointments;
