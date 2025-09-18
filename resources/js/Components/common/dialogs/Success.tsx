import { VerifiedCheck } from '@/Components/icon/Icons';
import CustomButton from '../CustomButton';
import OverlayComponent from '../Overlay';

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

export default function Success({
    isOpen,
    onClose,
    handlePrimaryClick,
    handleSecondaryClick,
    primaryButtonText = '',
    secondaryButtonText = '',
    title = 'Success',
    description = '.',
    canClose = false,
}: OverlayProps) {
    return (
        <OverlayComponent onClose={onClose} isOpen={isOpen} canClose={canClose}>
            <div className="mb-8 flex justify-center">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
                    <VerifiedCheck className="h-12 w-12 text-success-normal" />
                </div>
            </div>

            <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                    {title}
                </h2>
                <p className="text-sm leading-relaxed text-sf-primary-paragraph">
                    {description}
                </p>
            </div>

            <div className="space-y-3">
                {primaryButtonText && (
                    <CustomButton type="button" onClick={handlePrimaryClick}>
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
        </OverlayComponent>
    );
}
