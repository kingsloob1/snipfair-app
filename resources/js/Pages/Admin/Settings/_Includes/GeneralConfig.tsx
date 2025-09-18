import CustomButton from '@/Components/common/CustomButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import ToggleSwitch from './ToggleSwitch';

const GeneralConfig = ({
    config,
}: {
    config: {
        allow_registration_stylists: boolean;
        allow_registration_customers: boolean;
        maintenance_mode: boolean;
        maintenance_message?: string;
    };
}) => {
    const { data, setData, errors, processing, put, clearErrors } = useForm({
        allow_registration_stylists: config.allow_registration_stylists,
        allow_registration_customers: config.allow_registration_customers,
        maintenance_mode: config.maintenance_mode,
        maintenance_message: config.maintenance_message,
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
                General Settings
            </h2>
            <div className="mb-5 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Maintenance Mode
                        </h3>
                        <p className="text-sm text-gray-500">
                            Enable to put the site in maintenance mode
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.maintenance_mode}
                        onChange={(value) => setData('maintenance_mode', value)}
                    />
                </div>
                <AnimatePresence>
                    {data.maintenance_mode ? (
                        <motion.div
                            key="maintenance-message-section"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-0.5"
                            style={{ overflow: 'hidden' }}
                        >
                            <div>
                                <InputLabel
                                    value="Maintenance Message"
                                    isRequired={false}
                                />
                                <TextInput
                                    name="maintenance_message"
                                    value={data.maintenance_message}
                                    className="my-2 w-full"
                                    onChange={(e) =>
                                        setData(
                                            'maintenance_message',
                                            e.target.value,
                                        )
                                    }
                                    onFocus={() =>
                                        clearErrors('maintenance_message')
                                    }
                                />
                                <InputError
                                    className="text-xs"
                                    message={errors.maintenance_message}
                                />
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            User Registration
                        </h3>
                        <p className="text-sm text-gray-500">
                            Allow new users to register
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.allow_registration_customers}
                        onChange={(value) =>
                            setData('allow_registration_customers', value)
                        }
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Stylist Registration
                        </h3>
                        <p className="text-sm text-gray-500">
                            Allow new stylists to register
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.allow_registration_stylists}
                        onChange={(value) =>
                            setData('allow_registration_stylists', value)
                        }
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

export default GeneralConfig;
