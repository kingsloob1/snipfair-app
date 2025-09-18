import CustomButton from '@/Components/common/CustomButton';
import FileInput from '@/Components/common/forms/FileInput';
import LogoWrapper from '@/Components/common/LogoWrapper';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextareaInput from '@/Components/TextareaInput';
import TextInput from '@/Components/TextInput';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { mergeInertiaFieldErrors } from '@/lib/helper';
import { useForm } from '@inertiajs/react';
import { Dispatch, SetStateAction, useEffect } from 'react';

interface ModalProps {
    uploadOpen: boolean;
    setUploadOpen: Dispatch<SetStateAction<boolean>>;
    variant: 'dispute' | 'proof';
    customer: string;
    appointmentId: number;
}

type FormData = {
    customer: string;
    variant: 'dispute' | 'proof';
    comment: string;
    images: File[];
};

export default function UploadModal({
    uploadOpen,
    setUploadOpen,
    variant,
    customer,
    appointmentId,
}: ModalProps) {
    const { data, setData, clearErrors, processing, errors, post } =
        useForm<FormData>({
            customer: customer,
            variant: variant,
            comment: '',
            images: [],
        });
    useEffect(() => {
        setData((prev) => ({
            ...prev,
            customer,
            variant,
        }));
    }, [variant, customer, setData]);
    const mergedErrors = mergeInertiaFieldErrors(errors, 'media');
    const submit = () => {
        if (variant === 'dispute')
            post(route('stylist.appointment.forms', appointmentId), {
                onSuccess: () => setUploadOpen(false),
            });
        else
            post(route('stylist.appointment.forms', appointmentId), {
                onSuccess: () => setUploadOpen(false),
            });
    };

    return (
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogContent className="no-scrollbar max-h-[90vh] max-w-96 overflow-y-auto sm:rounded-2xl">
                <DialogHeader>
                    <DialogTitle>
                        <div className="mb-4">
                            <LogoWrapper
                                title={
                                    variant === 'dispute'
                                        ? 'Escalate a Dispute'
                                        : 'Upload Job Completion'
                                }
                                subtitle={
                                    variant === 'dispute'
                                        ? 'Create a dispute on this appointment'
                                        : 'Upload job done, for verification and to upload your profile'
                                }
                            />
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2.5">
                    <div>
                        <div>
                            <InputLabel
                                value="Customer Name"
                                isRequired={true}
                            />
                            <TextInput
                                name="customer"
                                value={data.customer}
                                readOnly={true}
                                isFocused={false}
                                className="my-2 w-full"
                            />
                        </div>
                        <div>
                            <InputLabel value="Comment" isRequired={true} />
                            <TextareaInput
                                name="comment"
                                value={data.comment}
                                className="my-2 w-full resize-none"
                                onChange={(e) =>
                                    setData('comment', e.target.value)
                                }
                                onFocus={() => clearErrors('comment')}
                            />
                            <InputError
                                className="text-xs"
                                message={errors.comment}
                            />
                        </div>
                    </div>
                    <div>
                        <FileInput
                            value={data.images}
                            onChange={(files) => setData('images', files)}
                            type="image"
                            maxFiles={3}
                            disabled={processing}
                            error={mergedErrors[0] ?? ''}
                            label="Attachments"
                            extra="(Up to 3 files)"
                            fullWidth={false}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <div className="flex w-full flex-col justify-between gap-2">
                        <CustomButton
                            type="button"
                            className="px-3 py-2"
                            disabled={processing}
                            loading={processing}
                            onClick={() => submit()}
                        >
                            {variant === 'dispute'
                                ? 'Send Dispute'
                                : 'Upload Work'}
                        </CustomButton>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
