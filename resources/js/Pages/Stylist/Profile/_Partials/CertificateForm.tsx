import CustomButton from '@/Components/common/CustomButton';
import Success from '@/Components/common/dialogs/Success';
import CustomInput from '@/Components/common/forms/CustomInput';
import SingleFileInput from '@/Components/common/forms/SingleFileInput';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import 'react-phone-number-input/style.css';

type CertificateFormProps = {
    title: string;
    skill: string;
    issuer: string;
    certification?: File | null;
    description: string;
};

export default function CertificateForm() {
    const [isOpen, setIsOpen] = useState(false);
    const { data, setData, post, processing, clearErrors, errors } =
        useForm<CertificateFormProps>({
            title: '',
            skill: '',
            issuer: '',
            certification: null,
            description: '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('stylist.profile.certificate.create'), {
            onFinish: () => setIsOpen(true),
        });
    };

    return (
        <form
            onSubmit={submit}
            className="no-scrollbar flex max-h-[80dvh] flex-col overflow-auto p-1"
        >
            <DialogHeader className="mb-6">
                <DialogTitle>Add Certificate & Award</DialogTitle>
                <DialogDescription>
                    Update your personal details
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <CustomInput
                    className="w-full px-1 py-1 text-sm"
                    label="Certificate Title"
                    name="title"
                    value={data.title}
                    placeholder="Title"
                    onChange={(e) => setData('title', e.target.value)}
                    error={errors.title}
                    handleFocus={() => clearErrors('title')}
                    isRequired={true}
                />
                <CustomInput
                    className="w-full px-1 py-1 text-sm"
                    label="Skill Obtained"
                    name="skill"
                    value={data.skill}
                    placeholder="Name of skill obtained"
                    onChange={(e) => setData('skill', e.target.value)}
                    error={errors.skill}
                    handleFocus={() => clearErrors('skill')}
                    isRequired={true}
                />
                <CustomInput
                    className="w-full px-1 py-1 text-sm"
                    label="Issuer Institution"
                    name="issuer"
                    value={data.issuer}
                    onChange={(e) => setData('issuer', e.target.value)}
                    error={errors.issuer}
                    handleFocus={() => clearErrors('issuer')}
                    isRequired={true}
                />
                <SingleFileInput
                    value={data.certification}
                    onChange={(file) => setData('certification', file)}
                    type="image"
                    disabled={processing}
                    error={errors.certification}
                    isRequired={true}
                    label="Certificate/Award"
                    extra="(Image File)"
                />
                <CustomInput
                    inputType="textarea"
                    className="w-full resize-none px-1 py-1 text-sm"
                    label="About Certification (optional)"
                    name="description"
                    value={data.description}
                    placeholder="Type here..."
                    onChange={(e) => setData('description', e.target.value)}
                    error={errors.description}
                    handleFocus={() => clearErrors('description')}
                    isRequired={false}
                    totalWords={50}
                />
            </div>
            <DialogFooter>
                <CustomButton
                    type="submit"
                    className="mt-4"
                    loading={processing}
                    disabled={processing}
                >
                    Update Profile
                </CustomButton>
            </DialogFooter>
            <Success
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                primaryButtonText="Back to Home"
                handlePrimaryClick={() =>
                    router.visit(route('stylist.profile'))
                }
                title="Profile Updated"
                description="You have successfully updated your account"
                canClose={false}
            />
        </form>
    );
}
