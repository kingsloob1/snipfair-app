import CustomButton from '@/Components/common/CustomButton';
import AddressInput from '@/Components/common/forms/AddressInput';
import InputError from '@/Components/InputError';
import SwitchWithIcon from '@/Components/stylist/SwitchWithIcon';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
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
    use_location: boolean;
    country: string;
};

interface SettingsProps {
    settings: {
        use_location: boolean;
        country: string;
    };
}

const LocationSetting = ({ settings }: SettingsProps) => {
    const { data, setData, post, processing, errors } =
        useForm<PaymentFormProps>({
            use_location: settings.use_location ?? true,
            country: settings.country ?? '',
        });

    const submit = () => {
        post(route('stylist.appointments.location.update'), {
            onSuccess: () => {
                console.log('saved');
            },
        });
    };

    return (
        <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-sf-black md:text-xl xl:text-2xl">
                    Location Settings
                </h3>
            </div>

            {/* Payout Settings */}
            <div className="space-y-0">
                <PayoutSetting
                    title="Enable Travel Mode"
                    description="Use your device location to provide availability in real-time."
                    enabled={data.use_location}
                    setData={(val) => setData('use_location', val)}
                />

                <div>
                    {!data.use_location ? (
                        <AddressInput
                            enableCreate={!data.use_location}
                            setAddress={(address) =>
                                setData('country', address)
                            }
                            address={data.country}
                        />
                    ) : (
                        <TextInput
                            id="country"
                            name="country"
                            value={data.country}
                            className="mt-1 block w-full opacity-50"
                            required
                            readOnly={true}
                            disabled={true}
                        />
                    )}
                    <InputError message={errors.country} className="mt-1" />
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end pt-8">
                <CustomButton
                    variant="primary"
                    fullWidth={false}
                    loading={processing}
                    disabled={processing}
                    onClick={submit}
                    className="px-3.5 py-2"
                >
                    <div className="flex items-center gap-2">
                        <Save size={14} />
                        <span className="font-medium">Save Changes</span>
                    </div>
                </CustomButton>
            </div>
        </div>
    );
};

export default LocationSetting;
