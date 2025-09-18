import CustomButton from '@/Components/common/CustomButton';
import CustomInput from '@/Components/common/forms/CustomInput';
import FileInput from '@/Components/common/forms/FileInput';
import LogoWrapper from '@/Components/common/LogoWrapper';
import RegisterSteps from '@/Components/stylist/RegisterSteps';
import AuthLayout from '@/Layouts/AuthLayout';
import { mergeInertiaFieldErrors } from '@/lib/helper';
import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FocusEvent, FormEventHandler } from 'react';

type SkillFormProps = {
    identification_id?: string;
    identification_file: File[];
};

export default function Identification() {
    const { data, setData, post, processing, errors, clearErrors } =
        useForm<SkillFormProps>({
            identification_id: '',
            identification_file: [],
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('stylist.complete.identity'), {
            onFinish: () => {
                route('stylist.dashboard');
            },
        });
    };

    const handleFocus = (
        event: FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
    ) => {
        let el: 'identification_id' | 'identification_file';

        if (typeof event === 'string') {
            el = event;
        } else {
            el = event.target.name as typeof el;
        }

        clearErrors(el);
    };

    const mergedErrors = mergeInertiaFieldErrors(errors, 'identification_file');

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
                            type="file"
                            maxFiles={1}
                            disabled={processing}
                            error={mergedErrors[0] ?? ''}
                            isRequired={true}
                            label="Government ID"
                            extra="(Driver's license, passport, or state ID)"
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
                                    route('stylist.complete', {
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
                </form>
            </main>
        </AuthLayout>
    );
}
