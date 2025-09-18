import CustomButton from '@/Components/common/CustomButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import ToggleSwitch from './ToggleSwithThree';

const AppointmentConfig = ({
    config,
}: {
    config: {
        appointment_reschedule_threshold: number;
        appointment_reschedule_percentage: number;
        appointment_canceling_threshold: number;
        appointment_canceling_percentage: number;
    };
}) => {
    const { data, setData, errors, processing, put, clearErrors } = useForm({
        appointment_reschedule_threshold:
            config.appointment_reschedule_threshold,
        appointment_reschedule_percentage:
            config.appointment_reschedule_percentage,
        appointment_canceling_threshold: config.appointment_canceling_threshold,
        appointment_canceling_percentage:
            config.appointment_canceling_percentage,
        reschedule_toggle: 'custom' as 'min' | 'custom' | 'max',
        cancel_toggle: 'custom' as 'min' | 'custom' | 'max',
    });

    useEffect(() => {
        // Set initial toggle states based on config values
        const rescheduleToggle =
            config.appointment_reschedule_threshold === 0
                ? 'min'
                : config.appointment_reschedule_threshold === 999
                  ? 'max'
                  : 'custom';
        const cancelToggle =
            config.appointment_canceling_threshold === 0
                ? 'min'
                : config.appointment_canceling_threshold === 999
                  ? 'max'
                  : 'custom';

        setData((prevData) => ({
            ...prevData,
            reschedule_toggle: rescheduleToggle,
            cancel_toggle: cancelToggle,
        }));
    }, [
        config.appointment_reschedule_threshold,
        config.appointment_canceling_threshold,
        setData,
    ]);

    const handleToggleChange = (
        type: 'reschedule' | 'cancel',
        value: 'min' | 'custom' | 'max',
    ) => {
        const key =
            type === 'reschedule'
                ? 'appointment_reschedule_threshold'
                : 'appointment_canceling_threshold';
        const toggleKey =
            type === 'reschedule' ? 'reschedule_toggle' : 'cancel_toggle';

        let thresholdValue: number;
        if (value === 'min') {
            thresholdValue = 0;
        } else if (value === 'max') {
            thresholdValue = 999;
        } else {
            // For custom, use the current value or a default
            thresholdValue =
                data[key] === 0 || data[key] === 999
                    ? type === 'reschedule'
                        ? 24
                        : 12 // Default values
                    : data[key];
        }

        setData((prevData) => ({
            ...prevData,
            [key]: thresholdValue,
            [toggleKey]: value,
        }));
    };

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
                Appointment Settings
            </h2>
            <div className="mb-6 grid gap-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Late Reschedule Threshold (hours)
                        </h3>
                        <p className="mb-4 text-sm text-gray-500">
                            Threshold to charge on late rescheduling
                        </p>
                        <AnimatePresence>
                            {data.reschedule_toggle === 'custom' && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <TextInput
                                        name="appointment_reschedule_threshold"
                                        type="number"
                                        value={
                                            data.appointment_reschedule_threshold
                                        }
                                        className="w-32"
                                        onChange={(e) =>
                                            setData(
                                                'appointment_reschedule_threshold',
                                                Number(e.target.value),
                                            )
                                        }
                                        onFocus={() =>
                                            clearErrors(
                                                'appointment_reschedule_threshold',
                                            )
                                        }
                                    />
                                    <InputError
                                        className="text-xs"
                                        message={
                                            errors.appointment_reschedule_threshold
                                        }
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <ToggleSwitch
                        enabled={data.reschedule_toggle}
                        onChange={(value) =>
                            handleToggleChange('reschedule', value)
                        }
                    />
                </div>
                <div>
                    <InputLabel
                        value="Late Reschedule Percentage (%)"
                        isRequired={true}
                    />
                    <TextInput
                        name="appointment_reschedule_percentage"
                        type="number"
                        value={data.appointment_reschedule_percentage}
                        className="my-2 w-full"
                        onChange={(e) =>
                            setData(
                                'appointment_reschedule_percentage',
                                Number(e.target.value),
                            )
                        }
                        onFocus={() =>
                            clearErrors('appointment_reschedule_percentage')
                        }
                    />
                    <InputError
                        className="text-xs"
                        message={errors.appointment_reschedule_percentage}
                    />
                </div>
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Late Canceling Threshold (hours)
                        </h3>
                        <p className="mb-4 text-sm text-gray-500">
                            Threshold to charge on late canceling
                        </p>
                        <AnimatePresence>
                            {data.cancel_toggle === 'custom' && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <TextInput
                                        name="appointment_canceling_threshold"
                                        type="number"
                                        value={
                                            data.appointment_canceling_threshold
                                        }
                                        className="w-32"
                                        onChange={(e) =>
                                            setData(
                                                'appointment_canceling_threshold',
                                                Number(e.target.value),
                                            )
                                        }
                                        onFocus={() =>
                                            clearErrors(
                                                'appointment_canceling_threshold',
                                            )
                                        }
                                    />
                                    <InputError
                                        className="text-xs"
                                        message={
                                            errors.appointment_canceling_threshold
                                        }
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <ToggleSwitch
                        enabled={data.cancel_toggle}
                        onChange={(value) =>
                            handleToggleChange('cancel', value)
                        }
                    />
                </div>
                <div>
                    <InputLabel
                        value="Late Canceling Penalty Percentage (%)"
                        isRequired={true}
                    />
                    <TextInput
                        name="appointment_canceling_percentage"
                        type="number"
                        value={data.appointment_canceling_percentage}
                        className="my-2 w-full"
                        onChange={(e) =>
                            setData(
                                'appointment_canceling_percentage',
                                Number(e.target.value),
                            )
                        }
                        onFocus={() =>
                            clearErrors('appointment_canceling_percentage')
                        }
                    />
                    <InputError
                        className="text-xs"
                        message={errors.appointment_canceling_percentage}
                    />
                </div>
            </div>
            <div className="flex items-end justify-end">
                <div>
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

export default AppointmentConfig;
