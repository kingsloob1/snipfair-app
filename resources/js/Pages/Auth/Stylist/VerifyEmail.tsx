import Success from '@/Components/common/dialogs/Success';
import LogoWrapper from '@/Components/common/LogoWrapper';
import { SuccessCheck } from '@/Components/icon/Icons';
import InputError from '@/Components/InputError';
import OtpInput from '@/Components/OtpInput';
import RegisterSteps from '@/Components/stylist/RegisterSteps';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface PageProps {
    auth: {
        user: Record<string | symbol, unknown> | null;
    };
}

export default function VerifyEmail({ status }: { status?: string }) {
    const user = (usePage().props as unknown as PageProps).auth.user;
    const [showStatus, setStatus] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [secondsLeft, setSecondsLeft] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        otp: '',
    });

    console.log(user);

    useEffect(() => {
        if (data.otp.length > 5) {
            post(route('verification.otp.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    setData('otp', '');
                    setIsOpen(true);
                },
            });
        }
    }, [data.otp, post, setData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.otp.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setData('otp', '');
                setIsOpen(true);
            },
        });
    };

    const startCountdown = () => {
        setSecondsLeft(60);
        setCanResend(false);
        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const resendOtp = () => {
        post(route('verification.otp.resend'), {
            preserveScroll: true,
            onSuccess: () => {
                setData('otp', '');
                startCountdown();
                setStatus(true);
            },
        });
    };

    return (
        <AuthLayout
            type="stylist"
            className="w-full max-w-md p-5 md:p-8 lg:max-w-xl"
        >
            <Head title="Email Verification" />
            <main className="space-y-5">
                <div className="mb-8">
                    <LogoWrapper subtitle="Verify your professional stylist account" />
                </div>
                <RegisterSteps
                    steps={[
                        'Personal Info',
                        'Verification',
                        'Skill Details',
                        'Identification',
                        'Complete',
                    ]}
                    currentStep={2}
                />
                {status === 'verification-code-sent' && showStatus && (
                    <div className="relative mb-6 flex gap-3.5 rounded-2xl bg-success-50 p-3 pr-5 shadow-lg">
                        <SuccessCheck className="h-6 w-6 shrink-0 text-success-normal" />
                        <div className="flex flex-col gap-2">
                            <h2 className="text-base font-bold text-success-normal">
                                Email Sent!
                            </h2>
                            <p className="font-inter text-sm text-success-normal">
                                We've sent a 6-digit code to{' '}
                                <b>
                                    {user
                                        ? (user.email as string)
                                        : 'your email'}
                                </b>
                                . Please enter the code below to continue.
                            </p>
                        </div>
                        <div className="absolute right-4 top-4">
                            <button
                                className="hover:bg-success-light"
                                onClick={() => setStatus(false)}
                            >
                                <X
                                    size={16}
                                    className="font-bold text-success-normal"
                                    fontWeight={700}
                                    strokeWidth={2}
                                />
                            </button>
                        </div>
                    </div>
                )}
                <h2 className="text-center font-inter text-2xl font-bold text-sf-black-secondary">
                    One-Time Password Verification
                </h2>
                <div className="mb-4 text-center text-sm text-sf-primary-paragraph">
                    Please input the code that was sent to your{' '}
                    {user && user.email_verified_at
                        ? 'phone number'
                        : 'email address'}
                    .
                </div>

                <form onSubmit={submit}>
                    <div className="mb-4">
                        <div className="flex justify-center space-x-2">
                            <OtpInput
                                length={6}
                                value={data.otp}
                                onChange={(value) => setData('otp', value)}
                                disabled={processing}
                                className="justify-center"
                            />
                        </div>
                        <InputError
                            message={errors.otp}
                            className="mt-2 text-center"
                        />
                    </div>
                    <p className="mt-4 text-center text-sm text-sf-gray-zinc">
                        {"Haven't received your verification code?"}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                        <button
                            className="text-sm text-sf-primary disabled:text-sf-stroke"
                            onClick={resendOtp}
                            disabled={processing || !canResend}
                        >
                            Resend Code
                        </button>
                        {!canResend && (
                            <span className="w-7 text-sm text-sf-gray">
                                {secondsLeft}s
                            </span>
                        )}
                    </div>
                </form>
            </main>
            <Success
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                primaryButtonText="Complete Registration"
                // secondaryButtonText="Go to Dashboard"
                handlePrimaryClick={() =>
                    router.visit(route('stylist.dashboard'))
                }
                // handleSecondaryClick={() => router.visit(route('dashboard'))}
                title="Email Verified!"
                description="You have successfully verified your email address. Proceed to complete your application."
                canClose={false}
            />
        </AuthLayout>
    );
}
