import CustomInput from '@/Components/common/forms/CustomInput';
import GradientButton from '@/Components/common/GradientButton';
import SwitchWithIcon from '@/Components/stylist/SwitchWithIcon';
import { useForm } from '@inertiajs/react';
import React from 'react';

interface PayoutSettingProps {
    title: string;
    description: string;
    enabled: boolean;
    setData: (enabled: boolean) => void;
}

const PayoutSetting: React.FC<PayoutSettingProps> = ({
    title,
    description,
    enabled,
    setData,
}) => {
    return (
        <div className="flex items-start justify-between py-6">
            <div className="flex-1">
                <h3 className="text-sm font-medium text-sf-primary-paragraph md:text-base">
                    {title}
                </h3>
                <p className="text-xs text-sf-secondary-paragraph md:text-sm">
                    {description}
                </p>
            </div>
            <div className="ml-6">
                <SwitchWithIcon enabled={enabled} onChange={setData} />
            </div>
        </div>
    );
};

type PaymentFormProps = {
    payout_day: string;
    payout_frequency: string;
    automatic_payout: boolean;
    instant_payout: boolean;
};

interface SettingsProps {
    settings: {
        payout_day: string;
        payout_frequency: string;
        automatic_payout: boolean;
        instant_payout: boolean;
    };
}

const PaymentSetting = ({ settings }: SettingsProps) => {
    const { data, setData, put, errors } = useForm<PaymentFormProps>({
        payout_day: settings.payout_day ?? '',
        payout_frequency: settings.payout_frequency ?? '',
        automatic_payout: settings.automatic_payout ?? false,
        instant_payout: settings.instant_payout ?? false,
    });

    const submit = () => {
        put(route('stylist.earnings.settings.update'), {
            onSuccess: () => {
                console.log('saved');
            },
        });
    };

    const frequencyOptions = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'];
    const dayOptions = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
    ];

    return (
        <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-sf-black md:text-xl xl:text-2xl">
                    Payout Settings
                </h3>
            </div>

            {/* Payout Settings */}
            <div className="space-y-0">
                <PayoutSetting
                    title="Enable Automatic Payouts"
                    description="Automatically transfer earnings to your bank account"
                    enabled={data.automatic_payout}
                    setData={() => setData('automatic_payout', true)}
                />

                <div className="border-t border-sf-stroke"></div>

                <PayoutSetting
                    title="use Manual Requests"
                    description="Choose to submit your payment request at your convenience"
                    enabled={!data.automatic_payout}
                    setData={() => setData('automatic_payout', false)}
                />
            </div>

            {/* Payout Frequency Section */}
            <div className="mt-8 border-t border-sf-stroke pt-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <CustomInput
                            inputType="custom-select"
                            label="Payout Frequency"
                            name="payout_frequency"
                            placeholder="Payout Frequency"
                            value={data.payout_frequency}
                            onPhoneChange={(value) =>
                                setData('payout_frequency', value.toLowerCase())
                            }
                            className="rounded-md border border-sf-stroke bg-transparent p-2 text-sm shadow-sm focus-within:border-2 focus-within:border-sf-primary focus-within:ring-sf-primary"
                            isRequired={true}
                            error={errors.payout_frequency}
                            selectOptions={frequencyOptions.map((option) => ({
                                label: String(option),
                                value: String(option.toLowerCase()),
                            }))}
                        />
                    </div>

                    <div>
                        <CustomInput
                            inputType="custom-select"
                            label="Day of Week"
                            name="payout_day"
                            placeholder="Day of Week"
                            value={data.payout_day}
                            onPhoneChange={(value) =>
                                setData('payout_day', value)
                            }
                            className="rounded-md border border-sf-stroke bg-transparent p-2 text-sm shadow-sm focus-within:border-2 focus-within:border-sf-primary focus-within:ring-sf-primary"
                            isRequired={true}
                            error={errors.payout_day}
                            selectOptions={dayOptions.map((option) => ({
                                label: String(option),
                                value: String(option.toLowerCase()),
                            }))}
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end pt-8">
                <GradientButton
                    text="Save Changes"
                    onClick={submit}
                    className="px-2.5 py-2 text-sm font-normal"
                />
            </div>
        </div>
    );
};

export default PaymentSetting;
