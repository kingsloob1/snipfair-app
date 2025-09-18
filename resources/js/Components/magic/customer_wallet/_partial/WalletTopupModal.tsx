import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { cn } from '@/lib/utils';
import websiteConfig from '@/lib/website-config';
import { LoaderCircle } from 'lucide-react';
import Checkout from './Checkout';

interface WalletTopupModalProps {
    isOpen: boolean;
    duckModal: boolean;
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
    duckModal,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={cn(duckModal ? 'max-w-xs' : 'max-w-md')}>
                <DialogHeader>
                    <DialogTitle className="mt-4 flex items-center justify-between">
                        <span>
                            {duckModal ? 'Redirecting...' : 'Top-up Summary'}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Top-up Summary */}
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
                        <Checkout
                            amount={amount}
                            onClose={onClose}
                            onTopupSuccess={onTopupSuccess}
                        />
                        {/* Terms */}
                        <p className="text-center text-xs text-sf-secondary-paragraph">
                            By proceeding, you agree to our payment terms and
                            wallet policy.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default WalletTopupModal;
