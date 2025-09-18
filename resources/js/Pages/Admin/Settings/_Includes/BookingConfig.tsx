import CustomButton from '@/Components/common/CustomButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import ToggleSwitch from './ToggleSwitch';

const BookingConfig = ({
    config,
}: {
    config: {
        email_verification: boolean;
        two_factor_auth: boolean;
        min_booking_amount: number;
        max_booking_amount: number;
    };
}) => {
    const { data, setData, errors, processing, put, clearErrors } = useForm({
        email_verification: config.email_verification,
        two_factor_auth: config.two_factor_auth,
        min_booking_amount: config.min_booking_amount,
        max_booking_amount: config.max_booking_amount,
    });

    const submit = () => {
        put(route('admin.settings.updateAdminConfig'), {
            onSuccess: () => {
                clearErrors();
            },
        });
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Security Settings
            </h2>
            <div className="mb-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Email Verification
                        </h3>
                        <p className="text-sm text-gray-500">
                            Require email verification for new accounts
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.email_verification}
                        onChange={(value) =>
                            setData('email_verification', value)
                        }
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-gray-500">
                            Enable 2FA for admin accounts
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.two_factor_auth}
                        onChange={(value) => setData('two_factor_auth', value)}
                    />
                </div>
            </div>
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <InputLabel
                        value="Minimum Booking Amount (R)"
                        isRequired={true}
                    />
                    <TextInput
                        name="min_booking_amount"
                        type="number"
                        value={data.min_booking_amount}
                        className="my-2 w-full"
                        onChange={(e) =>
                            setData(
                                'min_booking_amount',
                                Number(e.target.value),
                            )
                        }
                        onFocus={() => clearErrors('min_booking_amount')}
                    />
                    <InputError
                        className="text-xs"
                        message={errors.min_booking_amount}
                    />
                </div>
                <div>
                    <InputLabel
                        value="Maximum Booking Amount (R)"
                        isRequired={true}
                    />
                    <TextInput
                        name="max_booking_amount"
                        type="number"
                        value={data.max_booking_amount}
                        className="my-2 w-full"
                        onChange={(e) =>
                            setData(
                                'max_booking_amount',
                                Number(e.target.value),
                            )
                        }
                        onFocus={() => clearErrors('max_booking_amount')}
                    />
                    <InputError
                        className="text-xs"
                        message={errors.max_booking_amount}
                    />
                </div>
            </div>
            <div className="flex items-end justify-end">
                <div className="div">
                    <CustomButton
                        variant="black"
                        onClick={submit}
                        disabled={processing}
                        className="w-full md:w-52"
                        type="submit"
                    >
                        {processing
                            ? 'Updating Settings...'
                            : 'Update Settings'}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default BookingConfig;
