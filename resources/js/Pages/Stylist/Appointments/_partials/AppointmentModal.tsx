import CustomButton from '@/Components/common/CustomButton';
import LogoWrapper from '@/Components/common/LogoWrapper';
import { VerifiedCheck } from '@/Components/icon/Icons';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { router, useForm } from '@inertiajs/react';
import { Dispatch, SetStateAction, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    setVariant: Dispatch<SetStateAction<string>>;
    variant: 'start' | 'finish' | 'success';
    customer: string;
    appointmentId: number;
}

type FormProps = {
    name: string;
    code: string;
    variant: 'confirmed' | 'completed';
};

export default function AppointmentModal({
    isOpen,
    setIsOpen,
    variant,
    setVariant,
    customer,
    appointmentId,
}: ModalProps) {
    const { data, setData, clearErrors, processing, errors, post } =
        useForm<FormProps>({
            name: customer,
            code: '',
            variant: 'confirmed',
        });

    useEffect(() => {
        setData({
            name: customer,
            code: variant === 'start' ? 'SF-' : 'CP-',
            variant: variant === 'start' ? 'confirmed' : 'completed',
        });
    }, [variant, customer, setData]);

    const submit = () => {
        if (variant === 'success') setIsOpen(false);
        else {
            if (variant === 'start')
                post(route('stylist.appointment.update', appointmentId), {
                    onSuccess: () => setIsOpen(false),
                });
            else
                post(route('stylist.appointment.update', appointmentId), {
                    onSuccess: () => setVariant('success'),
                });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="no-scrollbar max-h-[90vh] max-w-96 overflow-y-auto sm:rounded-2xl">
                {variant !== 'success' && (
                    <DialogHeader>
                        <DialogTitle>
                            <div className="mb-4">
                                <LogoWrapper
                                    title={
                                        variant === 'start'
                                            ? 'Verify Appointment'
                                            : 'Verify Job Completion'
                                    }
                                    subtitle={
                                        variant === 'start'
                                            ? 'Verify appointment with your customer code.'
                                            : 'Verify job done with your customer code'
                                    }
                                />
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                )}
                {variant === 'success' ? (
                    <div>
                        <div className="mb-8 flex justify-center">
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
                                <VerifiedCheck className="h-12 w-12 text-success-normal" />
                            </div>
                        </div>

                        <div className="mb-8 text-center">
                            <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                                Job Complete
                            </h2>
                            <p className="text-sm leading-relaxed text-sf-primary-paragraph">
                                You have successfully verified your job
                                completion. You can proceed to upload work done
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        <div>
                            <div>
                                <InputLabel value="Customer Name" />
                                <TextInput
                                    name="name"
                                    value={data.name}
                                    readOnly={true}
                                    className="my-2 w-full"
                                />
                            </div>
                            <div>
                                <InputLabel value="Verify Code" />
                                <TextInput
                                    name="code"
                                    value={data.code}
                                    className="my-2 w-full"
                                    placeholder={
                                        variant === 'start'
                                            ? 'Enter appointment code, e.g. SF-12345'
                                            : 'Enter job completion code, e.g. CP-12345'
                                    }
                                    onChange={(e) =>
                                        setData('code', e.target.value)
                                    }
                                    onFocus={() => clearErrors('code')}
                                />
                                <InputError
                                    className="text-xs"
                                    message={errors.code}
                                />
                            </div>
                        </div>
                        <div>
                            <h4 className="font-inter font-semibold text-sf-black">
                                Note:
                            </h4>
                            <ul className="flex flex-col gap-1 rounded-lg bg-sf-primary-hover/10 p-3 text-xs text-sf-primary-hover md:p-4">
                                <p>
                                    {variant === 'start'
                                        ? 'Ask your customer to generate verification code for you, input the code to verify appointment. Only confirm arrival at client\'s location'
                                        : 'Ask your customer to generate job completion code for you. input the code to verify Job.'}
                                </p>
                            </ul>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <div className="flex w-full flex-col justify-between gap-2">
                        <CustomButton
                            type="button"
                            className="px-3 py-2"
                            onClick={() => submit()}
                            disabled={processing}
                            loading={processing}
                        >
                            {variant === 'start'
                                ? 'Verify Appointment'
                                : variant === 'finish'
                                  ? 'Verify Job'
                                  : 'Upload Work'}
                        </CustomButton>
                        {variant === 'success' && (
                            <CustomButton
                                type="button"
                                variant="secondary"
                                className="px-3 py-2"
                                onClick={() =>
                                    router.visit(route('stylist.dashboard'))
                                }
                            >
                                Go to Dashboard
                            </CustomButton>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
