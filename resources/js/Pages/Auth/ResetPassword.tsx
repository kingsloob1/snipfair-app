import CustomButton from '@/Components/common/CustomButton';
import CustomInput from '@/Components/common/forms/CustomInput';
import LogoWrapper from '@/Components/common/LogoWrapper';
import { ArrowLeft } from '@/Components/icon/Icons';
import InputError from '@/Components/InputError';
import AuthLayout from '@/Layouts/AuthLayout';
import { resetSchema } from '@/schema/Forms';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { z } from 'zod';

type ResetFormProps = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const [showPassword, toggleEyeIcon] = useState(false);
    const [showPasswordConfirm, toggleEyeIconConfirm] = useState(false);
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        setError,
    } = useForm<ResetFormProps>({
        email: email,
        token: token,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        try {
            resetSchema.parse(data);
            post(route('password.store'), {
                onFinish: () => {
                    reset('password', 'password_confirmation');
                },
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                const initialErrors: Record<keyof ResetFormProps, string> = {
                    email: '',
                    password: '',
                    password_confirmation: '',
                    token: '',
                };

                const formErrors = error.errors.reduce((acc, curr) => {
                    const fieldName = curr.path[0] as keyof ResetFormProps;
                    if (
                        typeof fieldName === 'string' &&
                        Object.prototype.hasOwnProperty.call(acc, fieldName)
                    ) {
                        acc[fieldName] = curr.message;
                    }
                    return acc;
                }, initialErrors);

                setError(formErrors);
            }
        }
    };

    return (
        <AuthLayout className="w-full max-w-md p-5 md:p-8 lg:max-w-xl">
            <Head title="Reset Password" />
            <div className="mb-2.5">
                <LogoWrapper onlyLogo={true} />
            </div>
            <h2 className="mb-2.5 text-center font-inter text-xl font-bold text-sf-black-secondary">
                Reset Password
            </h2>
            <div className="mb-4 text-center text-sm text-sf-primary-paragraph">
                {email}
            </div>
            <form onSubmit={submit} className="space-y-5">
                <CustomInput
                    className="w-full px-2 py-2"
                    label="New Password"
                    inputType="password"
                    showEyeIcon={true}
                    showPassword={showPassword}
                    toggleEyeIcon={toggleEyeIcon}
                    extra="Make sure your password is a minimum of 8 characters and contains a mix of uppercase and lowercase letters, at least one number, and a special character. E.g. (Abc@%$#.!:_-+?/*#)"
                    name="password"
                    value={data.password}
                    placeholder="Create password"
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    handleFocus={() => clearErrors('password')}
                    isRequired={true}
                />
                <CustomInput
                    className="w-full px-2 py-2"
                    label="Confirm Password"
                    inputType="password"
                    showEyeIcon={true}
                    showPassword={showPasswordConfirm}
                    toggleEyeIcon={toggleEyeIconConfirm}
                    name="password_confirmation"
                    placeholder="Confirm your password"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                    }
                    error={errors.password_confirmation}
                    handleFocus={() => clearErrors('password_confirmation')}
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
                    <InputError
                        message={errors.email}
                        className="text-center"
                    />
                    <div className="flex items-center justify-center font-inter">
                        <Link
                            href={route('login')}
                            className="flex items-center gap-0 text-sm font-medium text-sf-primary no-underline transition-all duration-300 hover:gap-1 hover:text-sf-primary-hover hover:underline"
                        >
                            <ArrowLeft className="h-3.5" />
                            Back to login
                        </Link>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
