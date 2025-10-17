import CustomButton from '@/Components/common/CustomButton';
import LogoWrapper from '@/Components/common/LogoWrapper';
import { VerifiedCheck } from '@/Components/icon/Icons';
import RegisterSteps from '@/Components/stylist/RegisterSteps';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle,
    Info,
    LucideClockFading,
    TriangleAlert,
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';

export default function Complete({
    stylist_status,
}: {
    stylist_status?: string;
}) {
    const { post, processing } = useForm({});
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        setTimeout(() => {
            setIsOpen(stylist_status === 'completed');
        }, 1200);
    }, [stylist_status]);

    const submit = () => {
        post(window.route('stylist.complete.success'), {
            onFinish: () => {
                window.route('stylist.dashboard');
            },
        });
    };

    const logoutUser = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();

        router.visit(window.route('logout'), {
            method: 'post',
            onBefore: () =>
                confirm(
                    'Are you sure you want to restart stylist registration process?',
                ),
            onSuccess() {
                window.location.href = window.route('stylist.register');
            },
            onError() {
                window.location.href = window.route('logout');
            },
        });
    };

    return (
        <AuthLayout
            type="stylist"
            className="w-full max-w-md p-5 md:p-8 lg:max-w-xl"
        >
            <Head title="Setup Profile" />
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="no-scrollbar max-h-[90vh] max-w-96 overflow-y-auto sm:rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex gap-4 pr-6">
                            <div className="mb-4">
                                <LogoWrapper
                                    title="Account Under Review"
                                    subtitle="Thank you for registering! Your account is currently being reviewed by our team. Do well to complete your stylist profile"
                                />
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2.5">
                        <div>
                            <h4 className="font-inter font-semibold text-sf-black">
                                Note:
                            </h4>
                            <ul className="flex flex-col gap-1 rounded-lg bg-sf-primary-hover/10 p-3 text-xs text-sf-primary-hover md:p-4">
                                <li>
                                    • Our team will review your documents within
                                    1-2 business days
                                </li>
                                <li>
                                    • You'll receive an email notification once
                                    approved
                                </li>
                                <li>
                                    • Full platform access will be granted upon
                                    approval
                                </li>
                            </ul>
                        </div>
                        {/* <TriangleAlert size={18} /> */}
                        <div>
                            <h4 className="my-2 font-inter font-semibold text-sf-black">
                                Verification Status
                            </h4>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 rounded-lg border border-success-normal bg-success-normal/10 px-3.5 py-2 md:py-3">
                                    <div className="flex flex-1 items-center gap-4">
                                        <CheckCircle
                                            size={18}
                                            className="text-success-normal"
                                        />
                                        <h5 className="text-xs font-semibold">
                                            Email Verification
                                        </h5>
                                    </div>
                                    <div className="rounded-full bg-sf-white/25 px-1.5 py-0.5 font-inter text-[11px] font-medium text-success-normal shadow-sm">
                                        Verified
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg border border-warning-normal bg-warning-normal/10 px-3.5 py-2 md:py-3">
                                    <div className="flex flex-1 items-center gap-4">
                                        <LucideClockFading
                                            size={18}
                                            className="text-warning-normal"
                                        />
                                        <h5 className="text-xs font-semibold">
                                            Skill Setup
                                        </h5>
                                    </div>
                                    <div className="rounded-full bg-sf-white/25 px-1.5 py-0.5 font-inter text-[11px] font-medium text-warning-normal shadow-sm">
                                        Processing
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg border border-warning-normal bg-warning-normal/10 px-3.5 py-2 md:py-3">
                                    <div className="flex flex-1 items-center gap-4">
                                        <TriangleAlert
                                            size={18}
                                            className="text-warning-normal"
                                        />
                                        <h5 className="text-xs font-semibold">
                                            Identity Verification
                                        </h5>
                                    </div>
                                    <div className="rounded-full bg-sf-white/25 px-1.5 py-0.5 font-inter text-[11px] font-medium text-warning-normal shadow-sm">
                                        Not verified
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg border border-sf-primary bg-sf-primary/10 px-3.5 py-2 md:py-3">
                                    <div className="flex flex-1 items-center gap-4">
                                        <Info
                                            size={18}
                                            className="text-sf-primary"
                                        />
                                        <h5 className="text-xs font-semibold">
                                            Services
                                        </h5>
                                    </div>
                                    <div className="rounded-full bg-sf-white/25 px-1.5 py-0.5 font-inter text-[11px] font-medium text-sf-primary shadow-sm">
                                        Not listed
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-sf-gray">
                        Need to update your information or have questions?
                    </p>
                    <DialogFooter>
                        <div className="flex w-full justify-between">
                            <CustomButton
                                type="button"
                                variant="secondary"
                                fullWidth={false}
                                className="mr-3 px-3 py-2"
                                onClick={() => {
                                    window.location.href =
                                        window.route('contact');
                                }}
                            >
                                Contact Support
                            </CustomButton>
                            <CustomButton
                                type="button"
                                className="px-3 py-2"
                                fullWidth={false}
                                onClick={() => {
                                    window.location.href =
                                        window.route('stylist.profile');
                                }}
                            >
                                Complete Profile
                            </CustomButton>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <main className="space-y-5">
                <div className="mb-8">
                    <LogoWrapper subtitle="Complete your professional stylist account setup" />
                </div>
                <RegisterSteps
                    steps={[
                        'Personal Info',
                        'Verification',
                        'Skill Details',
                        'Identification',
                        'Complete',
                    ]}
                    currentStep={stylist_status === 'completed' ? 6 : 5}
                />
                <div className="mb-8 flex justify-center">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
                        <VerifiedCheck className="h-12 w-12 text-success-normal" />
                    </div>
                </div>

                <div className="mb-8 text-center">
                    <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                        Registration Complete
                    </h2>
                    <p className="text-sm leading-relaxed text-sf-primary-paragraph">
                        You have successfully completed your account setup.
                    </p>
                </div>
                <div>
                    <CustomButton
                        type="button"
                        disabled={processing}
                        loading={processing}
                        onClick={() => submit()}
                    >
                        Next
                    </CustomButton>
                </div>
                <div className="flex items-center justify-center gap-2">
                    <motion.button
                        whileHover={{
                            scale: 1.05,
                            color: 'rgba(10, 34, 255, 1)',
                        }}
                        whileTap={{ scale: 0.95 }}
                        animate={{ scale: 1, color: 'rgb(10, 177, 255)' }}
                        initial={{
                            scale: 1.1,
                            color: 'rgba(10, 34, 255, 1)',
                        }}
                        onClick={logoutUser}
                        className="mt-3 text-sm text-sf-primary"
                    >
                        Made a mistake? Click to restart registration process
                    </motion.button>
                </div>
            </main>
        </AuthLayout>
    );
}
