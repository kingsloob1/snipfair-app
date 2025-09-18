import CustomButton from '@/Components/common/CustomButton';
import { AppointmentStatusProps } from '@/types/custom_types';
import { Download } from 'lucide-react';
import Receipt from './_partial/Receipt';

interface PaymentMethod {
    id: number;
    name: string;
    service: string;
    paymentMethod: string;
    amount: number;
    status: AppointmentStatusProps;
    date: string;
    imageUrl?: string;
}

interface PaymentHistoryProps {
    payment_history: PaymentMethod[];
}

const PaymentHistory = ({ payment_history }: PaymentHistoryProps) => {
    const handleSubmit = () => {
        console.log('Submitting changes:');
    };

    return (
        <div className="">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                    Your Payment Methods
                </h2>
                <CustomButton onClick={handleSubmit} fullWidth={false}>
                    <div className="flex gap-2">
                        <Download className="h-4 w-4" />
                        Export All
                    </div>
                </CustomButton>
            </div>
            <div className="space-y-5 md:space-y-6">
                {payment_history && payment_history.length > 0 ? (
                    payment_history.map((method, index) => (
                        <Receipt {...method} key={index} />
                    ))
                ) : (
                    <p className="h-full py-8 text-center text-sm italic text-sf-primary-paragraph">
                        You have no payments yet.
                    </p>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;
