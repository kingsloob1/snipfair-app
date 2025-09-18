import CustomButton from '@/Components/common/CustomButton';
import Success from '@/Components/common/dialogs/Success';
import CustomInput from '@/Components/common/forms/CustomInput';
import LogoWrapper from '@/Components/common/LogoWrapper';
import { ArrowLeft } from '@/Components/icon/Icons';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'), {
            preserveScroll: true,
            onSuccess: () => {
                setData('email', '');
                setIsOpen(true);
            },
        });
    };

    return (
        <AuthLayout className="w-full max-w-96 p-5 md:p-8">
            <Head title="Forgot Password" />
            <div className="mb-2.5">
                <LogoWrapper onlyLogo={true} />
            </div>
            <h2 className="mb-2.5 text-center font-inter text-xl font-bold text-sf-black-secondary">
                Forgot Password?
            </h2>
            <div className="mb-4 text-center text-sm text-sf-primary-paragraph">
                Enter your email address and we will send you instructions to
                reset your password.
            </div>
            {status && (
                <div className="mb-4 text-sm font-medium text-green-600 dark:text-green-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <CustomInput
                    className="w-full px-2 py-2"
                    label="Email"
                    name="email"
                    value={data.email}
                    placeholder="Enter your email"
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    handleFocus={() => clearErrors('email')}
                    isRequired={true}
                />

                <div className="flex flex-col gap-3">
                    <CustomButton
                        type="submit"
                        loading={processing}
                        disabled={processing}
                    >
                        Continue
                    </CustomButton>
                    <div className="flex items-center justify-center font-inter">
                        <Link
                            href={route('login')}
                            className="flex items-center gap-0 text-sm font-medium text-sf-primary no-underline transition-all duration-300 hover:gap-1 hover:text-sf-primary-hover hover:underline"
                        >
                            <ArrowLeft className="h-3.5" />
                            Back
                        </Link>
                    </div>
                </div>
            </form>
            <Success
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                primaryButtonText="Close"
                handlePrimaryClick={() => setIsOpen(false)}
                secondaryButtonText="Resend mail"
                handleSecondaryClick={() => {
                    post(route('password.email'));
                    setIsOpen(false);
                }}
                title="Check Your Email"
                description="Please check your email for instructions to reset your password."
                canClose={true}
            />
        </AuthLayout>
    );
}
