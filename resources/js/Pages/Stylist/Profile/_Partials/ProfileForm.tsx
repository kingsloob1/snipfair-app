import CustomButton from '@/Components/common/CustomButton';
import Success from '@/Components/common/dialogs/Success';
import AddressInput from '@/Components/common/forms/AddressInput';
import CustomInput from '@/Components/common/forms/CustomInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import 'react-phone-number-input/style.css';

type ProfileFormProps = {
    first_name: string;
    last_name: string;
    email: string;
    years_of_experience: string;
    business_name: string;
    phone?: string;
    location: string;
    bio: string;
};

interface ProfileDetailProps {
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    title?: string;
    avatar: string;
    rating: number;
    reviews_count: number;
    years_of_experience: string;
    experience: string;
    schedule: string;
    location: string;
    phone: string;
    visits_count: number;
    bio?: string;
}

export default function ProfileForm({
    profile_details,
}: {
    profile_details: ProfileDetailProps;
}) {
    console.log('ProfileForm', profile_details);
    const [isOpen, setIsOpen] = useState(false);
    const { data, setData, put, processing, clearErrors, errors } =
        useForm<ProfileFormProps>({
            first_name: profile_details.first_name,
            last_name: profile_details.last_name,
            email: profile_details.email,
            years_of_experience: profile_details.years_of_experience,
            business_name: profile_details.title ?? '',
            phone: profile_details.phone,
            location: profile_details.location,
            bio: profile_details.bio ?? '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(window.route('stylist.profile.update'), {
            onFinish: () => setIsOpen(true),
        });
    };

    const min = 0;
    const max = 20;
    const options = Array.from({ length: max - min + 1 }, (_, i) => {
        const num = min + i;
        return {
            label: String(num),
            value: String(num),
        };
    });

    return (
        <form
            onSubmit={submit}
            className="no-scrollbar flex max-h-[80dvh] flex-col overflow-auto p-1"
        >
            <DialogHeader className="mb-6">
                <DialogTitle>Personal Details</DialogTitle>
                <DialogDescription>
                    Update your personal details
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <CustomInput
                        className="w-full px-1 py-1 text-sm"
                        label="First Name"
                        name="first_name"
                        value={data.first_name}
                        placeholder="First name"
                        onChange={(e) => setData('first_name', e.target.value)}
                        error={errors.first_name}
                        handleFocus={() => clearErrors('first_name')}
                        isRequired={true}
                        isReadOnly={true}
                    />
                    <CustomInput
                        className="w-full px-1 py-1 text-sm"
                        label="Last Name"
                        name="last_name"
                        value={data.last_name}
                        placeholder="Last name"
                        onChange={(e) => setData('last_name', e.target.value)}
                        error={errors.last_name}
                        handleFocus={() => clearErrors('last_name')}
                        isRequired={true}
                    />
                </div>
                <CustomInput
                    className="w-full px-1 py-1 text-sm"
                    inputType="email"
                    label="Email"
                    name="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    handleFocus={() => clearErrors('email')}
                    isRequired={true}
                />
                <CustomInput
                    inputType="custom-select"
                    label="Years of Experience"
                    name="years_of_experience"
                    placeholder="Your Experience"
                    value={data.years_of_experience}
                    onPhoneChange={(value) =>
                        setData('years_of_experience', value)
                    }
                    className="rounded-md border border-sf-stroke bg-transparent p-1 text-sm shadow-sm focus-within:border-2 focus-within:border-sf-primary focus-within:ring-sf-primary"
                    isRequired={true}
                    error={errors.years_of_experience}
                    selectOptions={options}
                />
                <CustomInput
                    className="w-full px-1 py-1 text-sm"
                    label="Professional Title (Optional)"
                    name="business_name"
                    value={data.business_name}
                    placeholder=""
                    onChange={(e) => setData('business_name', e.target.value)}
                    error={errors.business_name}
                    handleFocus={() => clearErrors('business_name')}
                    isRequired={false}
                />
                <CustomInput
                    inputType="custom-country"
                    label="Phone"
                    name="phone"
                    placeholder="Phone"
                    value={data.phone}
                    onPhoneChange={(value) => setData('phone', value)}
                    className="rounded-md border border-sf-stroke bg-transparent p-1 text-sm shadow-sm focus-within:border-2 focus-within:border-sf-primary focus-within:ring-sf-primary"
                    isRequired={true}
                    error={errors.phone}
                />
                <div>
                    <InputLabel htmlFor="location" value="Location" />
                    <AddressInput
                        enableCreate={true}
                        setAddress={(address) => setData('location', address)}
                        address={data.location}
                    />
                    <InputError message={errors.location} />
                </div>
                <CustomInput
                    inputType="textarea"
                    className="w-full resize-none px-1 py-1 text-sm"
                    label="Professional Bio"
                    name="bio"
                    value={data.bio}
                    placeholder="Tell potential clients about your expertise and what makes you unique"
                    onChange={(e) => setData('bio', e.target.value)}
                    error={errors.bio}
                    handleFocus={() => clearErrors('bio')}
                    isRequired={true}
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
                    router.visit(window.route('stylist.dashboard'))
                }
                title="Profile Updated"
                description="You have successfully updated your account"
                canClose={false}
            />
        </form>
    );
}
