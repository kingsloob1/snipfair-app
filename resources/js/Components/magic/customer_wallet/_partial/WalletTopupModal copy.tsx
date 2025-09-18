import CustomButton from '@/Components/common/CustomButton';
import ConfirmationModal from '@/Components/ConfirmationModal';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import websiteConfig from '@/lib/website-config';
import { router } from '@inertiajs/react';
import { Clock, CreditCard, EyeIcon, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PaymentMethod {
    id: number;
    account_name: string;
    bank_name: string;
    account_number: string;
    routing_number?: string;
}

interface WalletTopupModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    // paymentMethods: PaymentMethod[];
    onTopupSuccess: () => void;
}

const WalletTopupModal: React.FC<WalletTopupModalProps> = ({
    isOpen,
    onClose,
    amount,
    // paymentMethods,
    onTopupSuccess,
}) => {
    const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
        null,
    );
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [error, setError] = useState<string>('');

    // Timer countdown
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

    // Fetch default payment method
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

    const handleTopup = async () => {
        setIsProcessing(true);
        setError('');

        try {
            router.post(
                route('customer.wallet.topup'),
                {
                    amount: amount,
                    payment_method_id: paymentMethod?.id,
                },
                {
                    onSuccess: () => {
                        onTopupSuccess();
                        onClose();
                        router.reload({ only: ['wallet', 'walletStats'] });
                    },
                    onError: (errors) => {
                        setError(errors.message || 'Top-up failed');
                    },
                },
            );
        } catch (error) {
            setError('Top-up processing failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTopupClick = () => {
        setShowConfirmation(true);
    };

    const handleConfirmationGoBack = () => {
        setShowConfirmation(false);
    };

    const handleConfirmationCorrect = () => {
        handleTopup();
    };

    const maskAccountNumber = (accountNumber: string) => {
        if (!accountNumber) return '';
        const visible = accountNumber.slice(-4);
        return '•'.repeat(accountNumber.length - 4) + visible;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="mt-4 flex items-center justify-between">
                        <span>Complete Top-up</span>
                        <div className="flex items-center gap-2 text-sm text-warning-normal">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Top-up Summary */}
                    <div className="rounded-lg border border-sf-stroke bg-sf-white-card p-4">
                        <h3 className="mb-3 font-semibold text-sf-black">
                            Top-up Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-sf-secondary-paragraph">
                                    Top-up Amount:
                                </span>
                                <span className="font-medium">
                                    {websiteConfig.currency_symbol}
                                    {amount.toFixed(2)}
                                </span>
                            </div>
                            <div className="border-t border-sf-stroke pt-2">
                                <div className="flex justify-between font-semibold">
                                    <span>Total Amount:</span>
                                    <span className="text-sf-primary">
                                        {websiteConfig.currency_symbol}
                                        {amount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    {paymentMethod ? (
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="relative w-full rounded-lg border border-sf-stroke bg-sf-white-card p-4"
                        >
                            <div className="absolute right-2 top-2">
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
                                <div className="hidden h-10 w-10 items-center justify-center rounded-lg bg-sf-primary/10 md:flex">
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
                                        {paymentMethod.routing_number || ''}
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

                    {/* Error Message */}
                    {error && (
                        <div className="bg-danger-light/10 rounded-lg border border-danger-normal/20 p-3">
                            <p className="text-sm text-danger-normal">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <CustomButton
                            onClick={handleTopupClick}
                            disabled={!paymentMethod || isProcessing}
                            className="w-full"
                        >
                            {isProcessing
                                ? 'Processing Top-up...'
                                : `Top-up ${websiteConfig.currency_symbol}${amount.toFixed(2)}`}
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

                    {/* Terms */}
                    <p className="text-center text-xs text-sf-secondary-paragraph">
                        By proceeding, you agree to our payment terms and wallet
                        policy.
                    </p>
                </div>
                <ConfirmationModal
                    showConfirmation={showConfirmation}
                    setShowConfirmation={setShowConfirmation}
                    isProcessing={isProcessing}
                    handleConfirmationGoBack={handleConfirmationGoBack}
                    handleConfirmationCorrect={handleConfirmationCorrect}
                />
            </DialogContent>
        </Dialog>
    );
};

export default WalletTopupModal;
