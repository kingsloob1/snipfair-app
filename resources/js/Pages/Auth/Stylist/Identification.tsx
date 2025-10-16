import CustomButton from '@/Components/common/CustomButton';
import CustomInput from '@/Components/common/forms/CustomInput';
import FileInput from '@/Components/common/forms/FileInput';
import LogoWrapper from '@/Components/common/LogoWrapper';
import RegisterSteps from '@/Components/stylist/RegisterSteps';
import AuthLayout from '@/Layouts/AuthLayout';
import { mergeInertiaFieldErrors } from '@/lib/helper';
import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { FocusEvent, FormEventHandler } from 'react';

type SkillFormProps = {
    identification_id?: string;
    identification_file: File[];
    identification_proof?: File;
};

export default function Identification() {
    const { data, setData, post, processing, errors, clearErrors } =
        useForm<SkillFormProps>({
            identification_id: '',
            identification_file: [],
            identification_proof: undefined,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(window.route('stylist.complete.identity'), {
            onFinish: () => {
                window.route('stylist.dashboard');
            },
        });
    };

    const handleFocus = (
        event: FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
    ) => {
        let el:
            | 'identification_id'
            | 'identification_file'
            | 'identification_proof';

        if (typeof event === 'string') {
            el = event;
        } else {
            el = event.target.name as typeof el;
        }

        clearErrors(el);
    };

    const mergedErrors = mergeInertiaFieldErrors(errors, 'identification_file');

    const logoutUser = () => {
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
                window.location.href = window.route('stylist.register');
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
                    currentStep={4}
                />
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <FileInput
                            value={data.identification_file}
                            onChange={(files) =>
                                setData('identification_file', files)
                            }
                            type="document_or_image"
                            maxFiles={1}
                            disabled={processing}
                            error={mergedErrors[0] ?? ''}
                            isRequired={true}
                            label="Government ID"
                            extra="(Driver's license, passport, or state ID)"
                        />
                    </div>
                    <div>
                        <FileInput
                            value={data.identification_file}
                            onChange={(files) =>
                                setData('identification_proof', files[0])
                            }
                            type="image"
                            maxFiles={1}
                            disabled={processing}
                            error={errors.identification_proof}
                            isRequired={true}
                            label="Identification Proof"
                            extra="(Image of you holding your Government identification"
                        />
                    </div>
                    <CustomInput
                        className="w-full px-2 py-2 text-sm"
                        label="Document Number"
                        name="identification_id"
                        value={data.identification_id}
                        placeholder="Identification Number"
                        onChange={(e) =>
                            setData('identification_id', e.target.value)
                        }
                        error={errors.identification_id}
                        handleFocus={handleFocus}
                        isRequired={true}
                    />
                    <div className="flex flex-row-reverse justify-between gap-5">
                        <CustomButton
                            type="submit"
                            fullWidth={false}
                            className="px-3 py-2"
                            loading={processing}
                            disabled={processing}
                        >
                            <div className="flex items-center gap-1.5">
                                <span>Next</span>
                                <ChevronRight size={14} />
                            </div>
                        </CustomButton>
                        <CustomButton
                            type="button"
                            fullWidth={false}
                            variant="secondary"
                            onClick={() =>
                                router.visit(
                                    window.route('stylist.complete', {
                                        previous: 'yes',
                                    }),
                                )
                            }
                            className="px-3 py-2"
                        >
                            <div className="flex items-center gap-1.5">
                                <ChevronLeft size={14} />
                                Previous
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
