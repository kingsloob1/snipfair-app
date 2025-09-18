import CustomButton from '@/Components/common/CustomButton';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import AppointmentCard from '@/Components/stylist/AppointmentCard';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { AppointmentCardProps } from '@/types';
import { Filter } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

export default function FullSchedules({
    appointments,
}: {
    appointments?: AppointmentCardProps[];
}) {
    const [priceFilter, setPriceFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [openFilter, setOpenFilter] = useState(false);
    const routes = [
        {
            name: 'Dashboard',
            path: route('stylist.dashboard'),
            active: true,
        },
        {
            name: 'Full Schedule',
            path: '',
            active: false,
        },
    ];

    const priceOptions = [
        'All',
        'Below R50',
        'R51-100',
        'R101-150',
        'R151-200',
        'Above R200',
    ];

    const statusOptions = [
        'All Status',
        'Pending',
        'Approved',
        'Confirmed',
        'Completed',
        'Canceled',
        'Rescheduled',
        'Escalated',
    ];

    const filterByPrice = (item: AppointmentCardProps) => {
        if (priceFilter === 'All') return true;
        if (priceFilter === 'Below R50') return item.amount < 50;
        if (priceFilter === 'R51-100')
            return item.amount >= 51 && item.amount <= 100;
        if (priceFilter === 'R101-150')
            return item.amount >= 101 && item.amount <= 150;
        if (priceFilter === 'R151-200')
            return item.amount >= 151 && item.amount <= 200;
        if (priceFilter === 'Above R200') return item.amount > 200;
        return true;
    };

    const filterByStatus = (item: AppointmentCardProps) => {
        if (statusFilter === 'All Status') return true;
        return item.status.toLowerCase() === statusFilter.toLowerCase();
    };

    const filteredItems = appointments
        ? appointments.filter(
              (item) => filterByPrice(item) && filterByStatus(item),
          )
        : [];

    return (
        <StylistAuthLayout header="Stylist Schedules">
            <StylistNavigationSteps
                routes={routes}
                sub="Manage all your appointments"
            />
            <section className="mx-auto max-w-7xl px-5">
                <div className="rounded-lg border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
                    <div className="space-y-4">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex flex-col gap-4">
                                <h2 className="font-semibold text-sf-black">
                                    Search for Schedules
                                </h2>
                                <div className="flex items-center gap-4">
                                    <CustomButton
                                        variant={
                                            openFilter ? 'secondary' : 'primary'
                                        }
                                        fullWidth={false}
                                        onClick={() =>
                                            setOpenFilter(!openFilter)
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            <Filter size={14} />
                                            <span className="font-medium">
                                                Filter
                                            </span>
                                        </div>
                                    </CustomButton>
                                    <AnimatePresence>
                                        {openFilter && (
                                            <motion.div
                                                key="fade-box"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.4 }}
                                                className="flex items-center gap-2.5"
                                            >
                                                <div className="relative">
                                                    <select
                                                        value={priceFilter}
                                                        onChange={(e) =>
                                                            setPriceFilter(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        {priceOptions.map(
                                                            (option) => (
                                                                <option
                                                                    key={option}
                                                                    value={
                                                                        option
                                                                    }
                                                                >
                                                                    {option}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>
                                                <div className="relative">
                                                    <select
                                                        value={statusFilter}
                                                        onChange={(e) =>
                                                            setStatusFilter(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        {statusOptions.map(
                                                            (option) => (
                                                                <option
                                                                    key={option}
                                                                    value={
                                                                        option
                                                                    }
                                                                >
                                                                    {option}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>
                                                <div className="ml-auto text-sm text-gray-500">
                                                    {filteredItems.length}{' '}
                                                    {filteredItems.length === 1
                                                        ? 'result'
                                                        : 'results'}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                        {filteredItems.length === 0 ? (
                            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                                <div className="mb-2 text-gray-400">
                                    <Filter
                                        size={48}
                                        className="mx-auto opacity-50"
                                    />
                                </div>
                                <h3 className="mb-2 text-lg font-medium text-gray-900">
                                    No items found
                                </h3>
                                <p className="text-gray-500">
                                    Try adjusting your filters to see more
                                    results.
                                </p>
                            </div>
                        ) : (
                            filteredItems.map((item, i) => (
                                <AppointmentCard {...item} key={i} />
                            ))
                        )}
                    </div>
                    {/* <DashboardAppointments /> */}
                    {(priceFilter !== 'All' ||
                        statusFilter !== 'All Status') && (
                        <div className="mt-6 rounded-lg border border-sf-primary/50 bg-sf-primary/5 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-sf-primary">
                                        Active Filters:
                                    </span>
                                    <div className="flex gap-2">
                                        {priceFilter !== 'All' && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                                Price: {priceFilter}
                                                <button
                                                    onClick={() =>
                                                        setPriceFilter('All')
                                                    }
                                                    className="rounded-full p-0.5 hover:bg-blue-200"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}
                                        {statusFilter !== 'All Status' && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                                Status: {statusFilter}
                                                <button
                                                    onClick={() =>
                                                        setStatusFilter(
                                                            'All Status',
                                                        )
                                                    }
                                                    className="rounded-full p-0.5 hover:bg-blue-200"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setPriceFilter('All');
                                        setStatusFilter('All Status');
                                    }}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {/* rounded-lg border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6 */}
            </section>
        </StylistAuthLayout>
    );
}
