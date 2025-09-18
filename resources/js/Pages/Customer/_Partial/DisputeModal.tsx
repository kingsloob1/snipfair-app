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
import { Dispatch, SetStateAction } from 'react';

interface ModalProps {
    disputeOpen: boolean;
    setDisputeOpen: Dispatch<SetStateAction<boolean>>;
    stylist: string;
    appointmentId: number;
}

type FormData = {
    stylist: string;
    comment: string;
    images: File[];
};

export default function DisputeModal({
    disputeOpen,
    setDisputeOpen,
    stylist,
    appointmentId,
}: ModalProps) {
    const { data, setData, clearErrors, processing, errors, post } =
        useForm<FormData>({
            stylist: stylist,
            comment: '',
            images: [],
        });
    const mergedErrors = mergeInertiaFieldErrors(errors, 'media');
    const submit = () => {
        post(route('customer.appointment.dispute', appointmentId), {
            onSuccess: () => setDisputeOpen(false),
        });
    };

    return (
        <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
            <DialogContent className="no-scrollbar max-h-[90vh] max-w-96 overflow-y-auto sm:rounded-2xl">
                <DialogHeader>
                    <DialogTitle>
                        <div className="mb-4">
                            <LogoWrapper
                                title="Escalate a Dispute"
                                subtitle="Create a dispute on this appointment"
                            />
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2.5">
                    <div>
                        <div>
                            <InputLabel
                                value="Stylist Name"
                                isRequired={true}
                            />
                            <TextInput
                                name="stylist"
                                value={data.stylist}
                                readOnly={true}
                                className="my-2 w-full"
                            />
                        </div>
                        <div>
                            <InputLabel value="Description" isRequired={true} />
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
                            label="Attachments (optional)"
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
                            Send Dispute
                        </CustomButton>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
