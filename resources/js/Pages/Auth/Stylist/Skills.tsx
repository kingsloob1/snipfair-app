import CustomButton from '@/Components/common/CustomButton';
import AddressInput from '@/Components/common/forms/AddressInput';
import CustomInput from '@/Components/common/forms/CustomInput';
import LogoWrapper from '@/Components/common/LogoWrapper';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import RegisterSteps from '@/Components/stylist/RegisterSteps';
import AuthLayout from '@/Layouts/AuthLayout';
import { PageProps } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import React, { FocusEvent, FormEventHandler, useEffect } from 'react';

type SkillFormProps = {
    business_name?: string;
    country: string;
    years_of_experience: string;
    bio?: string;
};

export default function Skills({ auth }: PageProps) {
    const { data, setData, post, processing, errors, clearErrors } =
        useForm<SkillFormProps>({
            business_name: '',
            country: '',
            years_of_experience: '',
            bio: '',
        });

    useEffect(() => {
        if (auth.user) {
            if (auth.user.stylist_profile) {
                setData((prev) => ({
                    ...prev,
                    business_name:
                        auth.user.stylist_profile?.business_name ?? '',
                    country: auth.user.country ?? '',
                    years_of_experience:
                        auth.user.stylist_profile?.years_of_experience ?? '',
                    bio: auth.user.bio ?? '',
                }));
            }
        }
    }, [auth.user, setData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(window.route('stylist.complete.skill'), {
            onFinish: () => {
                window.route('stylist.dashboard');
            },
        });
    };

    const handleFocus = (
        event: FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
    ) => {
        let el: 'business_name' | 'country' | 'years_of_experience' | 'bio';

        if (typeof event === 'string') {
            el = event;
        } else {
            el = event.target.name as typeof el;
        }

        clearErrors(el);
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
                    currentStep={3}
                />
                <form onSubmit={submit} className="space-y-5">
                    <CustomInput
                        className="w-full px-2 py-2 text-sm"
                        label="Business/Salon Name (Optional)"
                        name="business_name"
                        value={data.business_name}
                        placeholder=""
                        onChange={(e) =>
                            setData('business_name', e.target.value)
                        }
                        error={errors.business_name}
                        handleFocus={handleFocus}
                        isRequired={false}
                    />
                    <div>
                        <InputLabel
                            htmlFor="country"
                            value="Location"
                            isRequired={true}
                        />
                        <AddressInput
                            enableCreate={!data.country}
                            setAddress={(country) =>
                                setData('country', country)
                            }
                            address={data.country}
                        />
                        <InputError message={errors.country} className="mt-1" />
                    </div>
                    <CustomInput
                        inputType="custom-select"
                        label="Years of Experience"
                        name="years_of_experience"
                        placeholder="Your Experience"
                        value={data.years_of_experience}
                        onPhoneChange={(value) =>
                            setData('years_of_experience', value)
                        }
                        className="rounded-md border border-sf-stroke bg-transparent p-2 text-sm shadow-sm focus-within:border-2 focus-within:border-sf-primary focus-within:ring-sf-primary"
                        isRequired={true}
                        error={errors.years_of_experience}
                        selectOptions={options}
                    />
                    <CustomInput
                        inputType="textarea"
                        className="w-full resize-none px-2 py-2 text-sm"
                        label="Professional Bio"
                        name="bio"
                        value={data.bio}
                        placeholder="Tell potential clients about your expertise and what makes you unique"
                        onChange={(e) => setData('bio', e.target.value)}
                        error={errors.bio}
                        handleFocus={handleFocus}
                        isRequired={true}
                        totalWords={50}
                    />
                    <div className="flex flex-row-reverse justify-between gap-5">
                        {/* <CustomButton
                            type="submit"
                            variant="secondary"
                            loading={processing}
                            disabled={processing}
                        >
                            Sign Up
                        </CustomButton> */}
                        <CustomButton
                            type="submit"
                            fullWidth={false}
                            loading={processing}
                            disabled={processing}
                        >
                            <div className="flex gap-1.5">
                                <span>Next</span>
                                <ChevronRight />
                            </div>
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
                            Made a mistake? Click to restart registration
                            process
                        </motion.button>
                    </div>
                </form>
            </main>
        </AuthLayout>
    );
}
