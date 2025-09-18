import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { cn } from '@/lib/utils';
import websiteConfig from '@/lib/website-config';
import { LoaderCircle } from 'lucide-react';
import Checkout from '../magic/customer_wallet/_partial/Checkout';

interface PaymentModalProps {
    isOpen: boolean;
    duckModal: boolean;
    onClose: () => void;
    amount: number;
    userBalance: number;
    portfolioId: number;
    onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    amount,
    userBalance,
    portfolioId,
    onPaymentSuccess,
    duckModal,
}) => {
    const requiredAmount = amount - userBalance;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={cn(duckModal ? 'max-w-xs' : 'max-w-md')}>
                <DialogHeader>
                    <DialogTitle className="mt-4 flex items-center justify-between">
                        <span>
                            {duckModal ? 'Redirecting...' : 'Payment Summary'}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div
                        className={cn(
                            'my-14 h-10 text-center',
                            duckModal ? 'block' : 'hidden',
                        )}
                    >
                        <span>
                            <LoaderCircle className="mx-auto h-10 w-10 animate-spin" />
                        </span>
                    </div>
                    <div className={cn('space-y-6', duckModal && 'hidden')}>
                        {/* Payment Summary */}
                        <div className="rounded-lg border border-sf-stroke bg-sf-white-card p-4">
                            <h3 className="mb-3 font-semibold text-sf-black">
                                Payment Summary
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-sf-secondary-paragraph">
                                        Service Amount:
                                    </span>
                                    <span className="font-medium">
                                        {websiteConfig.currency_symbol}
                                        {amount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sf-secondary-paragraph">
                                        Your Balance:
                                    </span>
                                    <span className="font-medium">
                                        -{websiteConfig.currency_symbol}
                                        {userBalance.toFixed(2)}
                                    </span>
                                </div>
                                <div className="border-t border-sf-stroke pt-2">
                                    <div className="flex justify-between font-semibold">
                                        <span>Amount to Pay:</span>
                                        <span className="text-sf-primary">
                                            {websiteConfig.currency_symbol}
                                            {requiredAmount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Checkout
                            amount={requiredAmount}
                            onClose={onClose}
                            onTopupSuccess={onPaymentSuccess}
                            portfolioId={portfolioId}
                            type="deposit"
                        />

                        {/* Terms */}
                        <p className="text-center text-xs text-sf-secondary-paragraph">
                            By proceeding, you agree to our payment terms and
                            booking policy.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;
