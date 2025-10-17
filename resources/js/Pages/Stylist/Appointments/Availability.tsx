import CustomButton from '@/Components/common/CustomButton';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { router } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import LocationSetting from '../Earnings/_Partials/LocationSetting';
import Schedule from './_partials/Schedule';

interface TimeSlot {
    id: string;
    from: string;
    to: string;
    [key: string]: string;
}

type DaySchedule = {
    day: string;
    available: boolean;
    timeSlots: TimeSlot[];
};

export default function Availability({
    stylist_schedules,
    settings,
}: {
    stylist_schedules: DaySchedule[];
    settings: {
        use_location: boolean;
        country: string;
    };
}) {
    const [canSave, setCanSave] = useState(false);
    const [loading, setLoading] = useState(false);
    const [schedules, setSchedules] =
        useState<DaySchedule[]>(stylist_schedules);

    useEffect(() => {
        const hasChanges =
            JSON.stringify(schedules) !== JSON.stringify(stylist_schedules);
        setCanSave(hasChanges);
    }, [schedules, stylist_schedules]);

    const allDaysUnavailable = schedules.every(
        (day) =>
            day.available === false &&
            (!day.timeSlots || day.timeSlots.length === 0),
    );

    const routes = [
        {
            name: 'Appointments',
            path: window.route('stylist.appointments'),
            active: true,
        },
        {
            name: 'Availability',
            path: '',
            active: false,
        },
    ];

    const saveChanges = () => {
        setLoading(true);
        router.post(
            window.route('stylist.appointments.availability.save'),
            {
                schedules: schedules,
            },
            {
                onSuccess: () => {
                    setLoading(false);
                    router.reload({ only: ['stylist_schedules'] });
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    toast.error(firstError || 'Something went wrong.');
                },
            },
        );
    };

    return (
        <StylistAuthLayout header="Stylist Schedules">
            <StylistNavigationSteps
                routes={routes}
                sub="Configure your working hours and available time slots"
                cta="View Schedules"
                ctaAction={() =>
                    router.visit(window.route('stylist.schedules'))
                }
            />
            <section className="mx-auto max-w-7xl px-5">
                <div
                    id="location"
                    className="rounded-lg border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6"
                >
                    <LocationSetting settings={settings} />
                </div>
                <div className="mt-3 rounded-lg border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
                    <div className="space-y-4">
                        <Schedule
                            schedules={schedules}
                            setSchedules={setSchedules}
                        />
                        <div className="flex justify-end">
                            <CustomButton
                                variant="primary"
                                fullWidth={false}
                                loading={loading}
                                disabled={loading || !canSave}
                                onClick={() => saveChanges()}
                                className="px-3.5 py-2"
                            >
                                <div className="flex items-center gap-2">
                                    <Save size={14} />
                                    <span className="font-medium">
                                        {allDaysUnavailable
                                            ? 'Set Changes'
                                            : canSave
                                              ? 'Save Changes'
                                              : 'Saved.'}
                                    </span>
                                </div>
                            </CustomButton>
                        </div>
                    </div>
                </div>
            </section>
        </StylistAuthLayout>
    );
}
