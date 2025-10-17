import CommonAvatar from '@/Components/common/forms/CommonAvatar';
import { Link } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, Copy, MapPin } from 'lucide-react';
import React, { useState } from 'react';

interface AppointmentDetailsProps {
    orderTime?: string;
    bookingId?: string;
    beautician?: {
        name: string;
        avatar?: string;
    };
    customer?: {
        id: number;
        name: string;
        avatar?: string;
    };
    date?: string;
    day?: string;
    time?: string;
    duration?: string;
    location?: string;
    phone?: string;
}

const AppointmentMatch: React.FC<AppointmentDetailsProps> = ({
    orderTime,
    bookingId,
    beautician,
    customer,
    date,
    day,
    time,
    duration,
    location,
    // phone,
}) => {
    const [hasCopied, setHasCopied] = useState<boolean>(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(bookingId || '');
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 800);
    };

    return (
        <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
            {/* Header */}
            <div className="mb-2 md:mb-8">
                <h1 className="mb-1 text-lg font-semibold text-sf-black md:text-xl xl:text-2xl">
                    Appointment Details
                </h1>
                <div className="flex items-center gap-3 text-xs text-sf-secondary-paragraph xl:text-sm">
                    <div className="flex items-center gap-1.5">
                        <span className="font-medium">
                            <span className="hidden md:inline">Order </span>
                            Date:
                        </span>
                        <span>{orderTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-medium">
                            <span className="hidden md:inline">Booking </span>
                            ID:
                        </span>
                        <span className="text-gray-800">{bookingId}</span>
                        <button
                            onClick={handleCopy}
                            className="rounded p-1 transition-colors hover:bg-gray-100"
                            title="Copy booking ID"
                        >
                            {hasCopied ? (
                                <CheckCircle className="h-4 w-4 text-success-normal" />
                            ) : (
                                <Copy className="h-4 w-4 text-gray-500" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* People Section */}
            <div className="mb-5 flex items-center justify-between">
                {/* Beautician */}
                <div className="hidden items-center gap-1 md:flex md:gap-2 xl:gap-4">
                    <CommonAvatar
                        className="h-16 w-16"
                        name={beautician?.name || ''}
                        image={`/storage/${beautician?.avatar}`}
                    />
                    <div>
                        <h3 className="text-lg font-semibold text-sf-black md:text-xl">
                            {beautician?.name}
                        </h3>
                        <p className="text-sm text-sf-secondary">Beautician</p>
                    </div>
                </div>

                {/* Customer */}
                <div>{JSON.stringify(customer)}</div>
                <Link
                    href={window.route('stylist.customer.show', {
                        id: customer?.id,
                    })}
                    className="flex flex-row-reverse items-center gap-1 md:flex-row md:gap-2 xl:gap-4"
                >
                    <div className="text-right">
                        <h3 className="text-lg font-semibold text-gray-900 md:text-xl">
                            {customer?.name}
                        </h3>
                        <p className="text-left text-sm text-gray-500 md:text-right">
                            Customer
                        </p>
                    </div>
                    <CommonAvatar
                        className="h-16 w-16"
                        name={customer?.name || ''}
                        image={`/storage/${customer?.avatar}`}
                    />
                </Link>
            </div>

            {/* Appointment Info */}
            <div className="grid grid-cols-2 gap-7">
                <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="h-4 w-4 shrink-0 text-sf-secondary" />
                    <span className="text-sm">
                        {day} ({date})
                    </span>
                </div>
                <div className="flex items-center justify-start gap-3 text-gray-700">
                    <Clock className="h-4 w-4 shrink-0 text-sf-secondary" />
                    <span className="text-sm">
                        {time} ({duration})
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-7">
                {/* Location */}
                <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="h-4 w-4 shrink-0 text-sf-secondary" />
                    <span className="text-sm">{location}</span>
                </div>

                {/* Phone */}
                {/* <div className="flex items-center justify-start gap-3 text-gray-700">
                    <Phone className="h-4 w-4 shrink-0 text-sf-secondary" />
                    <span className="text-sm">{phone}</span>
                </div> */}
            </div>
        </div>
    );
};

export default AppointmentMatch;
