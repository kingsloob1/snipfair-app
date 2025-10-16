/* eslint-disable jsx-a11y/aria-role */
import CustomButton from '@/Components/common/CustomButton';
import Success from '@/Components/common/dialogs/Success';
import CustomInput from '@/Components/common/forms/CustomInput';
import LogoWrapper from '@/Components/common/LogoWrapper';
import Separator from '@/Components/common/Separator';
import RegisterSteps from '@/Components/stylist/RegisterSteps';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import AuthLayout from '@/Layouts/AuthLayout';
import { cn } from '@/lib/utils';
import { registerStylistSchema } from '@/schema/Forms';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FocusEvent, FormEventHandler, useState } from 'react';
import { z } from 'zod';
import Socials from '../_Partials/Socials';

type RegisterFormProps = {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
    accept_terms: boolean;
};

export default function Register() {
    const [showPassword, toggleEyeIcon] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showPasswordConfirm, toggleEyeIconConfirm] = useState(false);
    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
        setError,
        reset,
    } = useForm<RegisterFormProps>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        accept_terms: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        try {
            registerStylistSchema.parse(data);
            post(window.route('stylist.store'), {
                onFinish: () => {
                    reset('password', 'password_confirmation');
                },
                onSuccess: (pageEvt) => {
                    const newPageProps = pageEvt.props as {
                        flash?: {
                            success?: string;
                            error?: string;
                            info?: string;
                            warning?: string;
                            message?: string;
                        };
                    };

                    if (newPageProps.flash?.error) {
                        router.visit(window.route('home'));
                    } else {
                        setIsOpen(true);
                    }
                },
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                const initialErrors: Record<keyof RegisterFormProps, string> = {
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    password: '',
                    password_confirmation: '',
                    accept_terms: '',
                };

                const formErrors = error.errors.reduce((acc, curr) => {
                    const fieldName = curr.path[0] as keyof RegisterFormProps;
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

    const handleFocus = (
        event:
            | FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
            | 'accept_terms',
    ) => {
        let el:
            | 'first_name'
            | 'last_name'
            | 'email'
            | 'phone'
            | 'password'
            | 'password_confirmation'
            | 'accept_terms';

        if (typeof event === 'string') {
            el = event;
        } else {
            el = event.target.name as typeof el;
        }

        clearErrors(el);
    };

    return (
        <AuthLayout
            type="stylist"
            className="w-full max-w-md p-5 md:p-8 lg:max-w-xl"
        >
            <Head title="Register" />
            <main className="space-y-5">
                <div className="mb-8">
                    <LogoWrapper subtitle="Create your professional stylist account to get started" />
                </div>
                <RegisterSteps
                    steps={[
                        'Personal Info',
                        'Verification',
                        'Skill Details',
                        'Identification',
                        'Complete',
                    ]}
                    currentStep={1}
                />
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2 md:gap-2">
                        <CustomInput
                            className="w-full px-2 py-2"
                            label="First Name"
                            name="first_name"
                            value={data.first_name}
                            placeholder="First name"
                            onChange={(e) =>
                                setData('first_name', e.target.value)
                            }
                            error={errors.first_name}
                            handleFocus={handleFocus}
                            isRequired={true}
                        />
                        <CustomInput
                            className="w-full px-2 py-2"
                            label="Last Name"
                            name="last_name"
                            value={data.last_name}
                            placeholder="Last name"
                            onChange={(e) =>
                                setData('last_name', e.target.value)
                            }
                            error={errors.last_name}
                            handleFocus={handleFocus}
                            isRequired={true}
                        />
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 md:gap-2">
                        <CustomInput
                            className="w-full px-2 py-2"
                            label="Email"
                            name="email"
                            value={data.email}
                            placeholder="example@mail.com"
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            handleFocus={handleFocus}
                            isRequired={true}
                        />
                        <div className="flex flex-col gap-1">
                            <CustomInput
                                inputType="custom-country"
                                label="Phone"
                                name="phone"
                                placeholder="Enter phone"
                                value={data.phone}
                                onPhoneChange={(value) =>
                                    setData('phone', value)
                                }
                                className="rounded-md border border-sf-stroke bg-transparent p-2 shadow-sm focus-within:border-2 focus-within:border-sf-primary focus-within:ring-sf-primary"
                                isRequired={true}
                                error={errors.phone}
                            />
                        </div>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 md:gap-2">
                        <CustomInput
                            className="w-full px-2 py-2"
                            label="Password"
                            inputType="password"
                            showEyeIcon={true}
                            showPassword={showPassword}
                            toggleEyeIcon={toggleEyeIcon}
                            extra="Make sure your password is a minimum of 8 characters and contains a mix of uppercase and lowercase letters, at least one number, and a special character. E.g. (Abc@%$#.!:_-+?/*#)"
                            name="password"
                            value={data.password}
                            placeholder="Create password"
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            error={errors.password}
                            handleFocus={handleFocus}
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
                            placeholder="Confirm password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            error={errors.password_confirmation}
                            handleFocus={handleFocus}
                            isRequired={true}
                        />
                    </div>

                    <div className="flex items-center gap-2 p-2 pl-0">
                        <Checkbox
                            id="checkbox"
                            className="h-5 w-5 border-2 border-sf-stroke bg-sf-white text-sf-white data-[state=checked]:bg-sf-primary"
                            checked={data.accept_terms}
                            onCheckedChange={(checked) => {
                                handleFocus('accept_terms');
                                setData('accept_terms', checked === true);
                            }}
                        ></Checkbox>
                        <Label
                            htmlFor="checkbox"
                            className={cn(
                                'cursor-pointer font-inter text-sm font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                                errors.accept_terms
                                    ? 'text-danger-normal'
                                    : 'text-sf-black-secondary',
                            )}
                        >
                            I agree to the{' '}
                            <Link
                                href="/terms"
                                className={cn(
                                    'no-underline transition-all duration-200 hover:underline',
                                    errors.accept_terms
                                        ? 'text-el-error hover:opacity-70'
                                        : 'text-sf-primary hover:text-sf-primary-hover',
                                )}
                            >
                                Terms
                            </Link>
                            {' and '}
                            <Link
                                href="/privacy-policy"
                                className={cn(
                                    'no-underline transition-all duration-200 hover:underline',
                                    errors.accept_terms
                                        ? 'text-el-error hover:opacity-70'
                                        : 'text-sf-primary hover:text-sf-primary-hover',
                                )}
                            >
                                Privacy Policy
                            </Link>
                        </Label>
                    </div>
                    <div className="flex flex-col gap-3">
                        <CustomButton
                            type="submit"
                            loading={processing}
                            disabled={processing}
                        >
                            Sign Up
                        </CustomButton>
                        <div className="flex items-center justify-center space-x-1 font-inter">
                            <span className="text-sm text-sf-black-secondary">
                                Already have a stylist account?
                            </span>
                            <Link
                                href={window.route('login')}
                                className="text-sm font-medium text-sf-primary no-underline transition-colors duration-200 hover:text-sf-primary-hover hover:underline"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>
                </form>
                <Separator />
                <Socials role="stylist" />
            </main>
            <Success
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                primaryButtonText="Get Started"
                handlePrimaryClick={() =>
                    router.visit(window.route('stylist.dashboard'))
                }
                title="Registration Successful"
                description="Your Snipfair account have been successfully set up. Kindly proceed to verify your account"
                canClose={false}
            />
        </AuthLayout>
    );
}
