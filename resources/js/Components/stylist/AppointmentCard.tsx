import { AppointmentCardProps } from '@/types';
import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    Check,
    CheckCheckIcon,
    CheckCircle,
    Clock,
    Info,
    X,
} from 'lucide-react';
import { motion } from 'motion/react';
import CustomButton from '../common/CustomButton';
import GradientText from '../common/GradientText';
import CommonAvatar from '../common/forms/CommonAvatar';

export default function AppointmentCard({
    appointment,
    customer_id,
    service,
    name,
    date,
    time,
    amount,
    status,
    imageUrl,
}: AppointmentCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'text-success-normal bg-success-light/40';
            case 'completed':
                return 'text-success-normal bg-success-light/40';
            case 'pending':
                return 'text-warning-normal bg-warning-normal/5';
            case 'rescheduled':
                return 'text-sf-primary bg-sf-primary/5';
            case 'canceled':
                return 'text-danger-normal bg-danger-normal/15';
            default:
                return 'text-sf-gray-zinc bg-sf-gray-zinc/10';
        }
    };
    const statusIcon = {
        approved: <Check className="ml-1 h-4 w-4" />,
        confirmed: <CheckCircle className="ml-1 h-4 w-4" />,
        completed: <CheckCheckIcon className="ml-1 h-4 w-4" />,
        pending: <AlertTriangle className="ml-1 h-4 w-4" />,
        rescheduled: <Info className="ml-1 h-4 w-4" />,
        canceled: <X className="ml-1 h-4 w-4" />,
        escalated: <AlertTriangle className="ml-1 h-4 w-4" />,
    };

    return (
        <motion.div
            className="flex flex-col justify-between gap-6 rounded-xl border border-sf-stroke bg-sf-white p-4 sm:flex-row"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex gap-4 sm:hidden">
                <p className="font-bold text-sf-black">R{amount}</p>
                <span
                    className={`flex rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(status)}`}
                >
                    {status}
                    {statusIcon[status]}
                </span>
            </div>
            <div className="flex items-start gap-1.5">
                <CommonAvatar
                    className="h-12 w-12 shrink-0"
                    image={`/storage/${imageUrl}`}
                    name={name}
                />
                <div>
                    <h3 className="font-semibold text-sf-primary-paragraph">
                        {service}
                    </h3>
                    <p className="text-sm font-medium text-sf-black-secondary">
                        {name}
                    </p>
                    <div className="flex items-center gap-2 text-sf-secondary-paragraph">
                        <Calendar size={12} />
                        <span className="text-xs">{date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sf-secondary-paragraph">
                        <Clock size={12} />
                        <span className="text-xs">{time}</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end gap-5">
                <div className="hidden gap-4 sm:flex">
                    <p className="font-bold text-sf-black">R{amount}</p>
                    <span
                        className={`flex rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(status)}`}
                    >
                        {status}
                        {statusIcon[status]}
                    </span>
                </div>
                <div className="flex gap-3">
                    <CustomButton
                        className="bg-transparent px-3 py-1.5"
                        variant="secondary"
                        onClick={() =>
                            router.post(
                                route('chat.start', {
                                    recipient_id: customer_id,
                                }),
                            )
                        }
                    >
                        Message
                    </CustomButton>
                    <button
                        onClick={() =>
                            router.visit(
                                route('stylist.appointment', appointment),
                            )
                        }
                        className="whitespace-nowrap rounded-xl border border-sf-gradient-pink/50 px-3 py-1.5 text-sm font-medium text-sf-gradient-pink transition-colors hover:bg-red-50"
                    >
                        <GradientText>View Details</GradientText>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
