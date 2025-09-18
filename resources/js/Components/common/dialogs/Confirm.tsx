import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import CustomButton from '../CustomButton';

interface OverlayProps {
    isOpen: boolean;
    onClose: () => void;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    handlePrimaryClick?: () => void;
    handleSecondaryClick?: () => void;
    title?: string;
    description?: string;
    canClose?: boolean;
}

export default function Confirm({
    isOpen,
    onClose,
    handlePrimaryClick,
    handleSecondaryClick,
    primaryButtonText = '',
    secondaryButtonText = '',
    title = 'Success',
    description = '.',
    canClose = true,
}: OverlayProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose || !canClose}>
            <DialogContent
                className={canClose ? '' : '[&>button:last-child]:hidden'}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="text-center">
                    <p className="text-sm leading-relaxed text-sf-primary-paragraph">
                        {description}
                    </p>
                </div>
                <DialogFooter>
                    <div className="mx-auto flex w-full max-w-[70%] justify-between gap-8">
                        {primaryButtonText && (
                            <CustomButton
                                type="button"
                                onClick={handlePrimaryClick}
                            >
                                {primaryButtonText}
                            </CustomButton>
                        )}
                        {secondaryButtonText && (
                            <CustomButton
                                variant="secondary"
                                onClick={handleSecondaryClick}
                            >
                                {secondaryButtonText}
                            </CustomButton>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
