import CustomButton from '@/Components/common/CustomButton';
import { router } from '@inertiajs/react';
import { Calendar, Clock, DollarSign } from 'lucide-react';

export default function QuickActions() {
    return (
        <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
            <h2 className="mb-4 text-xl font-semibold text-sf-black md:text-2xl">
                Quick Actions
            </h2>

            <div className="space-y-3">
                {/* <CustomButton
                    variant="secondary"
                    onClick={() => router.visit(route('stylist.dashboard'))}
                >
                    <div className="flex items-center gap-2">
                        <WandSparkles className="h-5 w-5" />
                        Customize Page
                    </div>
                </CustomButton> */}
                <CustomButton
                    variant="secondary"
                    onClick={() =>
                        router.visit(route('stylist.appointments.calendar'))
                    }
                >
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        See Calendar
                    </div>
                </CustomButton>
                <CustomButton
                    variant="secondary"
                    onClick={() =>
                        router.visit(route('stylist.appointments.availability'))
                    }
                >
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Set Availability
                    </div>
                </CustomButton>
                <CustomButton
                    variant="secondary"
                    onClick={() =>
                        router.visit(route('stylist.profile.services'))
                    }
                >
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Set Ratings
                    </div>
                </CustomButton>
            </div>
        </div>
    );
}
