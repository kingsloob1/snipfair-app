import CustomButton from '@/Components/common/CustomButton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { apiCall } from '@/hooks/api';
import { router } from '@inertiajs/react';
import { Clock, CreditCard, EyeIcon, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Plan {
    id: number;
    name: string;
    description: string;
    amount: string;
    duration: number;
    status: number;
}

interface SubscriptionPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan?: Plan | null;
}

interface PaymentMethod {
    id: number;
    account_name: string;
    bank_name: string;
    account_number: string;
    routing_number?: string;
}

const SubscriptionPaymentModal: React.FC<SubscriptionPaymentModalProps> = ({
    isOpen,
    onClose,
    plan,
}) => {
    const [timeLeft, setTimeLeft] = useState(300);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
        null,
    );
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [error, setError] = useState<string>('');

    const subscriptionAmount = plan ? parseFloat(plan.amount) : 0;

    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            fetch('/api/admin-payment-methods/default')
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        setPaymentMethod(data.payment_method);
                    } else {
                        setError('No default payment method available');
                    }
                })
                .catch(() => {
                    setError('Failed to load payment method');
                });
        }
    }, [isOpen]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        setError('');

        try {
            const response = await apiCall(
                '/api/stylist/process-subscription-payment',
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        plan_id: plan?.id,
                        amount: subscriptionAmount,
                        payment_method_id: paymentMethod?.id,
                    }),
                },
            );

            const data = await response.json();

            if (data.success) {
                toast.success('Payment successful!');
                onClose();
                router.visit(route('stylist.dashboard'));
            } else {
                setError(data.message || 'Payment failed');
            }
        } catch (error) {
            setError('Payment processing failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const maskAccountNumber = (accountNumber: string) => {
        if (!accountNumber) return '';
        const visible = accountNumber.slice(-4);
        return '•'.repeat(accountNumber.length - 4) + visible;
    };

    if (!plan) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="slim-scrollbar max-h-[90vh] max-w-md overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Complete Subscription</span>
                        <div className="flex items-center gap-2 text-sm text-warning-normal">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="rounded-lg border border-sf-stroke bg-sf-white-card p-4">
                        <h3 className="mb-3 font-semibold text-sf-black">
                            Subscription Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-sf-secondary-paragraph">
                                    Plan:
                                </span>
                                <span className="font-medium">{plan.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sf-secondary-paragraph">
                                    Duration:
                                </span>
                                <span className="font-medium">
                                    {plan.name === 'Free Plan'
                                        ? 'Free forever'
                                        : `${plan.duration} days`}
                                </span>
                            </div>
                            <div className="border-t border-sf-stroke pt-2">
                                <div className="flex justify-between font-semibold">
                                    <span>Total Amount:</span>
                                    <span className="text-sf-primary">
                                        R{subscriptionAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-sf-stroke bg-sf-white-card p-4">
                        <h3 className="mb-3 font-semibold text-sf-black">
                            Plan Details
                        </h3>
                        <p className="text-sm text-sf-secondary-paragraph">
                            {plan.description}
                        </p>
                    </div>
                    {plan.name !== 'Free Plan' && (
                        <>
                            {paymentMethod ? (
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="relative w-full rounded-lg border border-sf-stroke bg-sf-white-card p-4"
                                >
                                    <div className="absolute right-1 top-1">
                                        {showDetails ? (
                                            <EyeOff className="h-4 w-4 text-sf-primary" />
                                        ) : (
                                            <EyeIcon className="h-4 w-4 text-sf-primary" />
                                        )}
                                    </div>
                                    <h3 className="mb-3 font-semibold text-sf-black">
                                        Payment Method
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sf-primary/10">
                                            <CreditCard className="h-5 w-5 text-sf-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sf-black">
                                                <span className="text-xs text-sf-secondary-paragraph">
                                                    Bank Name:
                                                </span>{' '}
                                                {paymentMethod.bank_name}
                                            </p>
                                            <p className="text-sm text-sf-secondary-paragraph">
                                                <span className="text-xs text-sf-secondary-paragraph">
                                                    Account Name:
                                                </span>{' '}
                                                {paymentMethod.account_name}
                                            </p>
                                            <p className="text-base text-sf-secondary-paragraph">
                                                {showDetails
                                                    ? paymentMethod.account_number
                                                    : maskAccountNumber(
                                                          paymentMethod.account_number,
                                                      )}
                                            </p>
                                            <p className="text-sm text-sf-secondary-paragraph">
                                                <span className="text-xs text-sf-secondary-paragraph">
                                                    Routing Number:
                                                </span>{' '}
                                                {paymentMethod.routing_number ||
                                                    ''}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ) : (
                                <div className="bg-danger-light/10 rounded-lg border border-danger-normal/20 p-4">
                                    <p className="text-danger-normal">
                                        {error || 'Loading payment method...'}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                    {error && (
                        <div className="bg-danger-light/10 mx-auto max-w-80 overflow-hidden rounded-lg border border-danger-normal/20 p-3">
                            <p className="text-sm text-danger-normal">
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <CustomButton
                            onClick={handlePayment}
                            disabled={!paymentMethod || isProcessing}
                            className="w-full"
                        >
                            {isProcessing
                                ? 'Processing Payment...'
                                : `Pay R${subscriptionAmount.toFixed(2)}`}
                        </CustomButton>

                        <CustomButton
                            variant="secondary"
                            onClick={onClose}
                            disabled={isProcessing}
                            className="w-full"
                        >
                            Cancel
                        </CustomButton>
                    </div>

                    <p className="text-center text-xs text-sf-secondary-paragraph">
                        By proceeding, you agree to our payment terms and
                        subscription policy.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SubscriptionPaymentModal;
