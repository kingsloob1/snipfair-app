import CustomButton from '@/Components/common/CustomButton';
import Success from '@/Components/common/dialogs/Success';
import AddressInput from '@/Components/common/forms/AddressInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextareaInput from '@/Components/TextareaInput';
import TextInput from '@/Components/TextInput';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

type ProfileFormProps = {
    name: string;
    email: string;
    phone?: string;
    country?: string;
    bio?: string;
};

type ProfileForm = {
    name: string;
    email: string;
    phone?: string;
    country: string;
    bio?: string;
};

export default function ProfileForm({ user }: { user: ProfileFormProps }) {
    const [isOpen, setIsOpen] = useState(false);
    const { data, setData, put, processing, errors } = useForm<ProfileForm>({
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country || '',
        bio: user.bio || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('customer.profile.update'), {
            onSuccess: () => setIsOpen(true),
        });
    };

    return (
        <form
            onSubmit={submit}
            className="no-scrollbar flex max-h-[80dvh] flex-col overflow-auto p-1"
        >
            <DialogHeader>
                <DialogTitle>Personal Details</DialogTitle>
                <DialogDescription>
                    Update your personal details
                </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
                <InputLabel
                    htmlFor="name"
                    value="Full Name"
                    isRequired={true}
                />
                <TextInput
                    id="name"
                    name="name"
                    value={data.name}
                    className="mt-1 block w-full"
                    autoComplete="name"
                    isFocused={true}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    readOnly={true}
                />
                <InputError message={errors.name} className="mt-2" />
            </div>
            <div className="mt-4">
                <InputLabel htmlFor="email" value="Email" isRequired={true} />
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    autoComplete="username"
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    readOnly={true}
                />
                <InputError message={errors.email} className="mt-2" />
            </div>
            <div className="mt-4">
                <InputLabel htmlFor="phone" value="Phone" isRequired={true} />
                <PhoneInput
                    placeholder="Enter phone number"
                    // international
                    value={data.phone}
                    defaultCountry="ZA"
                    onChange={(value) => setData('phone', value)}
                    className="rounded-md border border-sf-stroke bg-sf-primary-background p-2 shadow-sm focus-within:border-2 focus-within:border-sf-primary focus-within:ring-sf-primary"
                />
                <InputError message={errors.phone} className="mt-2" />
            </div>
            <div className="mt-4">
                <InputLabel htmlFor="location" value="Location" />
                <AddressInput
                    enableCreate={true}
                    setAddress={(address) => setData('country', address)}
                    address={data.country}
                />
                <InputError message={errors.country} />
            </div>
            <div className="mt-4">
                <InputLabel htmlFor="about" value="About (optional)" />
                <TextareaInput
                    id="bio"
                    name="bio"
                    value={data.bio}
                    className="mt-1 block w-full"
                    placeholder="Type here..."
                    isFocused={true}
                    onChange={(e) => setData('bio', e.target.value)}
                    required
                />
                <InputError message={errors.bio} className="mt-2" />
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
                handlePrimaryClick={() => router.visit(route('dashboard'))}
                title="Profile Updated"
                description="You have successfully updated your account"
                canClose={false}
            />
        </form>
    );
}
