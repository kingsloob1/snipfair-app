import AppointmentCard from '@/Components/magic/customer_appointment/AppointmentCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { AppointmentProps } from '@/types';
import { Head } from '@inertiajs/react';
import { motion } from 'motion/react';

interface AppointmentsProps {
    appointments: AppointmentProps[];
}

const Appointments = ({ appointments }: AppointmentsProps) => {
    return (
        <AuthenticatedLayout
            showToExplore={false}
            exploreRoute={{ name: 'Back to Explore', path: route('dashboard') }}
        >
            <Head title="Appointments" />
            <section className="mx-auto max-w-7xl overflow-hidden px-5 py-6 md:py-8">
                <h2 className="font-inter text-xl font-bold text-sf-gray-zinc sm:text-2xl md:text-3xl">
                    My Appointments
                </h2>
                <div className="relative grid grid-cols-1 gap-8 py-6 md:py-8 xl:gap-12">
                    {appointments && appointments.length === 0 && (
                        <p className="col-span-full text-center text-sm italic text-sf-primary-paragraph">
                            You have no appointments currently.
                        </p>
                    )}
                    {appointments &&
                        appointments.length > 0 &&
                        appointments.map((item, i) => (
                            <motion.div
                                key={i}
                                className="relative"
                                whileHover={{ scale: 1.01 }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <AppointmentCard {...item} />
                            </motion.div>
                        ))}
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Appointments;
