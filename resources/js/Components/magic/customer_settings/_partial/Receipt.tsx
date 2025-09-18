import { AppointmentStatusProps } from '@/types/custom_types';
import { AlertTriangle, Check, CheckCheck, Download, Info } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

interface HairCutReceiptProps {
    id: number;
    name: string;
    service: string;
    paymentMethod: string;
    amount: number;
    status: AppointmentStatusProps;
    date: string;
    imageUrl?: string;
}

const Receipt: React.FC<HairCutReceiptProps> = ({
    service,
    name,
    date,
    paymentMethod,
    amount,
    status,
    imageUrl,
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Confirmed':
                return 'text-success-normal bg-success-light/40';
            case 'Pending':
                return 'text-warning-normal bg-warning-normal/5';
            case 'Declined':
                return 'text-danger-normal bg-danger-normal/15';
            default:
                return 'text-sf-gray-zinc';
        }
    };
    const statusIcon = {
        Approved: <CheckCheck className="ml-1 h-4 w-4" />,
        Processing: <Info className="ml-1 h-4 w-4" />,
        Confirmed: <Check className="ml-1 h-4 w-4" />,
        Completed: <Check className="ml-1 h-4 w-4" />,
        Pending: <AlertTriangle className="ml-1 h-4 w-4" />,
        Declined: <Info className="ml-1 h-4 w-4" />,
        Reversed: <Info className="ml-1 h-4 w-4" />,
        Failed: <AlertTriangle className="ml-1 h-4 w-4" />,
    };
    return (
        <motion.div
            className="flex items-center justify-between rounded-lg bg-white px-6 py-4 shadow md:px-8"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center">
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt="Profile"
                        className="mr-4 h-12 w-12 rounded-full"
                    />
                )}
                <div>
                    <h3 className="font-bold text-sf-gradient-purple">
                        {service}
                    </h3>
                    <p className="font-medium text-sf-black-secondary">
                        {name}
                    </p>
                    <p className="text-sm text-sf-secondary-paragraph">
                        {date} | {paymentMethod}
                    </p>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <p className="text-lg font-bold text-sf-black">R{amount}</p>
                <div className="flex gap-1.5">
                    <span
                        className={`flex rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(status)}`}
                    >
                        {status}
                        {statusIcon[status]}
                    </span>
                    <motion.button
                        className="ml-4 rounded-full text-sf-gray"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Download className="h-4 w-4" />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default Receipt;
