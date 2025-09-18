import CustomButton from './common/CustomButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

export default function ConfirmationModal({
    showConfirmation,
    setShowConfirmation,
    isProcessing,
    handleConfirmationGoBack,
    handleConfirmationCorrect,
}: {
    showConfirmation: boolean;
    setShowConfirmation: (value: boolean) => void;
    isProcessing: boolean;
    handleConfirmationGoBack: () => void;
    handleConfirmationCorrect: () => void;
}) {
    return (
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        Payment Confirmation
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="text-center">
                        <p className="text-sf-black">
                            You have made the payment and kept a receipt for
                            reference. Proceed?
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <CustomButton
                            variant="secondary"
                            onClick={handleConfirmationGoBack}
                            disabled={isProcessing}
                            className="flex-1"
                        >
                            Go back
                        </CustomButton>

                        <CustomButton
                            onClick={handleConfirmationCorrect}
                            disabled={isProcessing}
                            className="flex-1"
                        >
                            {isProcessing ? 'Processing...' : 'Correct'}
                        </CustomButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
