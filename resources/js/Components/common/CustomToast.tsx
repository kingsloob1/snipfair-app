import { toast } from 'sonner';
import CustomButton from './CustomButton';

type ConfirmToastProps = {
    message: string;
    action?: string;
    onConfirm: () => void;
    duration?: number;
};

export function CustomToast({
    message,
    action = 'Confirm',
    onConfirm,
    duration = Infinity,
}: ConfirmToastProps) {
    const id = toast.custom(
        () => (
            <div className="flex min-w-[250px] flex-col gap-3 rounded-lg bg-white p-4 shadow-lg">
                <span className="text-sm font-medium text-gray-900">
                    {message}
                </span>
                <div className="flex gap-2">
                    <CustomButton
                        fullWidth={false}
                        onClick={() => {
                            onConfirm();
                            toast.dismiss(id);
                        }}
                        className="p-1.5"
                    >
                        {action}
                    </CustomButton>
                    <CustomButton
                        variant="secondary"
                        fullWidth={false}
                        onClick={() => toast.dismiss(id)}
                        className="p-1.5"
                    >
                        Cancel
                    </CustomButton>
                </div>
            </div>
        ),
        { duration, position: 'top-center' },
    );

    return null; // nothing is actually rendered directly
}
