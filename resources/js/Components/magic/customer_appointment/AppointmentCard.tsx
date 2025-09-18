import CustomButton from '@/Components/common/CustomButton';
import { AppointmentProps } from '@/types';
import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    Clock,
    Info,
    MapPin,
    User,
    XCircle,
} from 'lucide-react';

const AppointmentCard = ({
    id,
    stylistName,
    stylistTitle,
    appointmentType,
    location,
    date,
    time,
    price,
    status,
    avatarUrl,
}: AppointmentProps) => {
    const getStatusIcon = (status: AppointmentProps['status']) => {
        switch (status) {
            case 'Approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'Completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'Pending':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'Processing':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'Failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'Declined':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'Reversed':
                return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            default:
                return <Info className="h-4 w-4 text-gray-500" />;
        }
    };
    const getStatusColor = (status: AppointmentProps['status']) => {
        switch (status) {
            case 'Completed':
                return 'text-green-600 bg-green-50';
            case 'Approved':
                return 'text-green-600 bg-green-50';
            case 'Pending':
                return 'text-yellow-600 bg-yellow-50';
            case 'Processing':
                return 'text-yellow-600 bg-yellow-50';
            case 'Failed':
                return 'text-red-600 bg-red-50';
            case 'Declined':
                return 'text-red-600 bg-red-50';
            case 'Reversed':
                return 'text-orange-600 bg-orange-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };
    return (
        <div className="w-full overflow-hidden rounded-2xl bg-sf-white p-4 shadow-md shadow-sf-gray/20 md:p-6 lg:py-8">
            <div className="relative flex flex-col justify-between gap-6 md:flex-row">
                <div className="flex min-w-[35%] items-start gap-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 md:h-20 md:w-20">
                        <img
                            src={avatarUrl}
                            alt={stylistName}
                            className="h-full w-full rounded-full object-cover"
                        />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="font-inter text-lg font-semibold text-sf-black md:text-xl">
                            {stylistTitle}
                        </h3>

                        <div className="flex items-center gap-2 text-sf-gradient-purple md:mb-5">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{stylistName}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-sf-primary-paragraph md:mb-5">
                            <Calendar className="h-4 w-4" />
                            <span>{date}</span>
                        </div>

                        <div className="text-2xl font-bold text-sf-gradient-purple">
                            <span className="rounded-full bg-sf-white-card p-1.5">
                                {price}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:min-w-[200px]">
                    <h3 className="font-inter text-lg font-semibold text-sf-black md:text-xl">
                        {appointmentType}
                    </h3>

                    <div className="flex items-center gap-2 truncate text-sm text-sf-primary-paragraph md:mb-6">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>{location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-sf-primary-paragraph md:mb-5">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span>{time}</span>
                    </div>
                </div>

                <div className="flex flex-col justify-between gap-4 md:items-end">
                    <div className="absolute right-0 top-0 flex items-center gap-2 md:static">
                        <span
                            className={`flex items-center gap-1 rounded-xl px-2 py-1 text-sm font-medium ${getStatusColor(status)}`}
                        >
                            {status}
                            {getStatusIcon(status)}
                        </span>
                    </div>

                    <div className="flex gap-3">
                        <CustomButton
                            variant="black"
                            className="px-2.5 py-1.5"
                            onClick={() =>
                                router.visit(
                                    route('customer.appointment.show', id),
                                )
                            }
                        >
                            <div className="flex items-center gap-1">
                                <Calendar className="h-5 w-5" />
                                <span className="text-xs">View Details</span>
                            </div>
                        </CustomButton>
                        {/* <button className="rounded-xl border border-red-200 px-6 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50">
                            Cancel
                        </button> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentCard;
