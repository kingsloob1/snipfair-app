import CommonAvatar from '@/Components/common/forms/CommonAvatar';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate } from '@/lib/helper';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { MapPinCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import BillingInfo from './_Partial/BillingInfo';
import BookedSummary from './_Partial/BookedSummary';
import DatePicker from './_Partial/DatePicker';
import TimeSelector from './_Partial/TimeSelector';

interface StylistSchedule {
    day: string;
    available: boolean;
    timeSlots: {
        id: string;
        from: string;
        to: string;
    }[];
}

interface ExistingAppointment {
    appointment_date: string;
    appointment_time: string;
    duration: string;
    status: string;
}

interface AppointmentData {
    id: number;
    status: string;
    appointment_code: string;
    completion_code?: string;
    amount: number;
    review?: boolean;
    canRescheduleFree?: boolean;
    reschedulePenaltyPercentage?: number;
    canCancelFree?: boolean;
    cancelPenaltyPercentage?: number;
    hoursUntilAppointment?: number;
    appointment_time: string;
    appointment_date: string;
    extra?: string;
}

export default function Appointment({
    portfolio,
    auth,
    customer_profile,
    stylist,
    stylist_schedules = [],
    existing_appointments = [],
    appointment,
}: PageProps<{
    portfolio: {
        id: number;
        title: string;
        category: { name: string };
        duration: string;
        price: number;
        distance: string | null;
    };
    customer_profile: { billing_name: string; billing_email: string };
    stylist: {
        id: number;
        name: string;
        avatar?: string;
        stylist_profile: { business_name: string; is_available?: boolean };
    };
    stylist_schedules?: StylistSchedule[];
    existing_appointments?: ExistingAppointment[];
    appointment: { id: number };
}>) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        undefined,
    );
    const [appointmentData, setAppointmentData] =
        useState<AppointmentData | null>(null);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [extra, setExtra] = useState<string>('');
    const [address, setAddress] = useState<string>(auth.user?.country || '');

    const enableCreate = false;

    useEffect(() => {
        setSelectedTime('');
    }, [selectedDate]);

    const validateDateAvailability = (date: Date): boolean => {
        const dayName = date
            .toLocaleDateString('en-US', { weekday: 'long' })
            .toLowerCase();

        const schedule = stylist_schedules.find(
            (s) => s.day.toLowerCase() === dayName,
        );

        return schedule?.available || false;
    };

    function getAvailableHalfHours(
        scheduleSlots: StylistSchedule['timeSlots'],
        existingAppointments: ExistingAppointment[],
        date: Date,
        durationHours: number = 1,
    ): string[] {
        const ranges: [number, number][] = scheduleSlots.map((slot) => {
            const [startHour] = slot.from.split(':').map(Number);
            const [endHour] = slot.to.split(':').map(Number);
            return [startHour * 60, endHour * 60];
        });
        // Step 1: Merge overlapping time ranges
        ranges.sort((a, b) => a[0] - b[0]);
        const merged: [number, number][] = [];

        for (const [start, end] of ranges) {
            if (!merged.length || start > merged[merged.length - 1][1]) {
                merged.push([start, end]);
            } else {
                merged[merged.length - 1][1] = Math.max(
                    merged[merged.length - 1][1],
                    end,
                );
            }
        }
        // Step 2: Generate 30-min slots, checking for conflicts
        const availableTimes: string[] = [];
        const dateStr = date.toISOString().split('T')[0];
        const slotLength = durationHours * 60;
        for (const [start, end] of merged) {
            for (let time = start; time + slotLength <= end; time += 30) {
                const hour = Math.floor(time / 60);
                const min = time % 60;
                const appointmentEnd = time + slotLength;

                // Conflict check
                const hasConflict = existingAppointments.some((apt) => {
                    if (apt.appointment_date !== dateStr) return false;
                    if (!['approved', 'confirmed'].includes(apt.status))
                        return false;

                    const [aptHour, aptMin] = apt.appointment_time
                        .split(':')
                        .map(Number);
                    const aptStart = aptHour * 60 + aptMin;
                    const aptDuration =
                        parseInt(apt.duration.split(' ')[0]) || 1;
                    const aptEnd = aptStart + aptDuration * 60;

                    return time < aptEnd && appointmentEnd > aptStart;
                });

                if (!hasConflict) {
                    const displayHour =
                        hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                    const displayMin =
                        min === 0 ? '00' : min.toString().padStart(2, '0');
                    const period = hour < 12 ? 'AM' : 'PM';
                    const timeString = `${displayHour}:${displayMin} ${period}`;
                    availableTimes.push(timeString);
                }
            }
        }

        return availableTimes;
    }

    const getAvailableTimesForDate = (date: Date): string[] => {
        if (!date) return [];

        const dayName = date
            .toLocaleDateString('en-US', { weekday: 'long' })
            .toLowerCase();
        const schedule = stylist_schedules.find(
            (s) => s.day.toLowerCase() === dayName,
        );

        if (!schedule?.available || !schedule.timeSlots.length) {
            return !enableCreate && selectedTime ? [selectedTime] : [];
        }

        const durationHours = parseInt(portfolio.duration.split(' ')[0]) || 1;

        const availableTimes = getAvailableHalfHours(
            schedule.timeSlots,
            existing_appointments,
            date,
            durationHours,
        );

        if (
            !enableCreate &&
            selectedTime &&
            !availableTimes.includes(selectedTime)
        ) {
            return [selectedTime, ...availableTimes];
        }

        return availableTimes;
    };
    return (
        <AuthenticatedLayout
            showToExplore={true}
            exploreRoute={{
                name: 'Back to Appointments',
                path: route('customer.appointments'),
            }}
        >
            <Head title="View Appointment" />
            <section className="mx-auto max-w-7xl px-5 py-2 md:py-4 xl:py-6">
                <h2 className="font-inter text-xl font-bold text-sf-gray-zinc sm:text-2xl md:text-3xl">
                    View Appointment
                </h2>
                <div
                    className={cn(
                        'relative grid grid-cols-1 gap-8 py-6 md:py-8 lg:grid-cols-3 xl:gap-12',
                        !appointmentData && 'hidden',
                    )}
                >
                    <div className="col-span-1 space-y-6 md:space-y-11 lg:col-span-2">
                        <div className="flex items-center justify-between gap-5 rounded-2xl border border-sf-stroke bg-sf-white-card p-4 md:p-6">
                            <Link
                                className="flex gap-2.5"
                                href={route(
                                    'customer.stylists.show',
                                    stylist.id,
                                )}
                            >
                                <CommonAvatar
                                    className="h-10 w-10"
                                    image={stylist.avatar || ''}
                                    name={stylist.name || 'Stylist'}
                                />
                                <div>
                                    <h3 className="font-semibold text-sf-black">
                                        {portfolio.title ||
                                            stylist.stylist_profile
                                                .business_name ||
                                            'Stylist'}
                                    </h3>
                                    <p className="text-xs text-sf-gradient-purple">
                                        {stylist.name || 'Stylist'}
                                    </p>
                                </div>
                            </Link>
                            <div>
                                <h6 className="flex gap-1.5 rounded-2xl border border-sf-gray bg-sf-primary-background px-2 py-1 text-xs font-bold text-sf-gray md:gap-2 xl:text-sm">
                                    <MapPinCheck size={14} />
                                    {portfolio.distance
                                        ? portfolio.distance
                                        : 'Distance not available'}
                                </h6>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-sf-stroke bg-sf-white-card p-4 md:p-6">
                            <DatePicker
                                selectedDate={selectedDate}
                                onDateSelect={setSelectedDate}
                                validateDate={validateDateAvailability}
                                enableCreate={enableCreate}
                            />
                        </div>
                        <div className="rounded-2xl border border-sf-stroke bg-sf-white-card p-4 md:p-6">
                            <TimeSelector
                                selectedTime={selectedTime}
                                onTimeSelect={setSelectedTime}
                                availableTimes={
                                    selectedDate
                                        ? getAvailableTimesForDate(selectedDate)
                                        : []
                                }
                                enableCreate={enableCreate}
                            />
                        </div>
                        <div className="rounded-2xl border border-sf-stroke bg-sf-white-card p-4 md:p-6">
                            <BillingInfo
                                customer_profile={customer_profile}
                                auth={auth}
                                extra={extra}
                                setExtra={setExtra}
                                setAddress={setAddress}
                                address={address}
                                enableCreate={enableCreate}
                            />
                        </div>
                    </div>
                    <div className="col-span-1">
                        <div className="sticky top-20 space-y-6 md:space-y-11">
                            <BookedSummary
                                portfolio={portfolio}
                                stylist={stylist}
                                selectedDate={selectedDate?.toLocaleDateString()}
                                selectedDateDb={
                                    selectedDate ? formatDate(selectedDate) : ''
                                }
                                selectedTime={selectedTime}
                                extra={extra}
                                setExtra={setExtra}
                                name={auth.user.name}
                                setSelectedTime={setSelectedTime}
                                setSelectedDate={setSelectedDate}
                                appointment_id={appointment.id}
                                appointmentData={appointmentData}
                                setAppointmentData={setAppointmentData}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
