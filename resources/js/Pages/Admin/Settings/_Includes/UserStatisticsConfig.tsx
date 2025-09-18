import CustomButton from '@/Components/common/CustomButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const UserStatisticsConfig = ({
    config,
}: {
    config: {
        professional_stylists: number;
        happy_customers: number;
        services_completed: number;
        customer_satisfaction: number;
    };
}) => {
    const [isCalculating, setIsCalculating] = useState(false);

    const { data, setData, errors, processing, put, clearErrors } = useForm({
        professional_stylists: config.professional_stylists,
        happy_customers: config.happy_customers,
        services_completed: config.services_completed,
        customer_satisfaction: config.customer_satisfaction,
    });

    const submit = () => {
        put(route('admin.settings.updateAdminConfig'), {
            onSuccess: () => {
                clearErrors();
            },
        });
    };

    const calculateStatistics = () => {
        setIsCalculating(true);
        router.post(
            route('admin.settings.calculate-statistics'),
            {},
            {
                onSuccess: () => {
                    setIsCalculating(false);
                    router.reload({ only: ['config'] });
                },
                onError: () => {
                    setIsCalculating(false);
                },
            },
        );
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    User Statistics
                </h2>
                <CustomButton
                    variant="black"
                    fullWidth={false}
                    onClick={calculateStatistics}
                    disabled={isCalculating}
                    className="text-xs"
                >
                    {isCalculating
                        ? 'Calculating...'
                        : 'Calculate Automatically'}
                </CustomButton>
            </div>
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <InputLabel
                        value="Professional Stylists"
                        isRequired={true}
                    />
                    <TextInput
                        name="professional_stylists"
                        type="number"
                        value={data.professional_stylists}
                        className="my-2 w-full"
                        onChange={(e) =>
                            setData(
                                'professional_stylists',
                                Number(e.target.value),
                            )
                        }
                        onFocus={() => clearErrors('professional_stylists')}
                    />
                    <InputError
                        className="text-xs"
                        message={errors.professional_stylists}
                    />
                </div>
                <div>
                    <InputLabel value="Happy Customers" isRequired={true} />
                    <TextInput
                        name="happy_customers"
                        type="number"
                        value={data.happy_customers}
                        className="my-2 w-full"
                        onChange={(e) =>
                            setData('happy_customers', Number(e.target.value))
                        }
                        onFocus={() => clearErrors('happy_customers')}
                    />
                    <InputError
                        className="text-xs"
                        message={errors.happy_customers}
                    />
                </div>
                <div>
                    <InputLabel value="Services Completed" isRequired={true} />
                    <TextInput
                        name="services_completed"
                        type="number"
                        value={data.services_completed}
                        className="my-2 w-full"
                        onChange={(e) =>
                            setData(
                                'services_completed',
                                Number(e.target.value),
                            )
                        }
                        onFocus={() => clearErrors('services_completed')}
                    />
                    <InputError
                        className="text-xs"
                        message={errors.services_completed}
                    />
                </div>
                <div>
                    <InputLabel
                        value="Customer Satisfaction (%)"
                        isRequired={true}
                    />
                    <TextInput
                        name="customer_satisfaction"
                        type="number"
                        step="0.01"
                        value={data.customer_satisfaction}
                        className="my-2 w-full"
                        onChange={(e) =>
                            setData(
                                'customer_satisfaction',
                                Number(e.target.value),
                            )
                        }
                        onFocus={() => clearErrors('customer_satisfaction')}
                    />
                    <InputError
                        className="text-xs"
                        message={errors.customer_satisfaction}
                    />
                </div>
            </div>
            <div className="flex items-end justify-end">
                <div className="div">
                    <CustomButton
                        onClick={submit}
                        disabled={processing}
                        className="w-full md:w-52"
                        type="submit"
                    >
                        {processing ? 'Updating...' : 'Update'}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default UserStatisticsConfig;
