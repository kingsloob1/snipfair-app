import CustomButton from '@/Components/common/CustomButton';
import CustomInput from '@/Components/common/forms/CustomInput';
import LogoWrapper from '@/Components/common/LogoWrapper';
import InputError from '@/Components/InputError';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function ConfirmPassword() {
    const [showPassword, toggleEyeIcon] = useState(false);
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            password: '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout className="w-full max-w-96 p-5 md:p-8">
            <Head title="Confirm Password" />
            <div className="mb-2.5">
                <LogoWrapper onlyLogo={true} />
            </div>
            <h2 className="mb-2.5 text-center font-inter text-xl font-bold text-sf-black-secondary">
                Confirm Password
            </h2>

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                This is a secure area of the application. Please confirm your
                password before continuing.
            </div>

            <form onSubmit={submit}>
                <div className="mt-4">
                    <CustomInput
                        className="w-full px-2 py-2"
                        label="Password"
                        inputType="password"
                        showEyeIcon={true}
                        showPassword={showPassword}
                        toggleEyeIcon={toggleEyeIcon}
                        name="password"
                        value={data.password}
                        placeholder="Enter password"
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        handleFocus={() => clearErrors('password')}
                        isRequired={true}
                    />
                </div>

                <div className="mt-4 flex flex-col items-center justify-center">
                    <CustomButton
                        type="submit"
                        loading={processing}
                        disabled={processing}
                    >
                        Continue
                    </CustomButton>
                    <InputError message={errors.password} className="mt-2" />
                </div>
            </form>
        </AuthLayout>
    );
}
