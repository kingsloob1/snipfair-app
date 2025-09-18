import CustomButton from '@/Components/common/CustomButton';
import { useForm } from '@inertiajs/react';
import { Hash, Mail, MapPin, MapPinned, User } from 'lucide-react';
import React from 'react';

interface CustomerProfile {
    billing_name?: string;
    billing_email?: string;
    billing_city?: string;
    billing_zip?: string;
    billing_location?: string;
}

interface BillingInfoProps {
    customer_profile: CustomerProfile;
}

const BillingInfo: React.FC<BillingInfoProps> = ({ customer_profile }) => {
    const { data, setData, patch, processing, errors } = useForm({
        billing_name: customer_profile?.billing_name || '',
        billing_email: customer_profile?.billing_email || '',
        billing_city: customer_profile?.billing_city || '',
        billing_zip: customer_profile?.billing_zip || '',
        billing_location: customer_profile?.billing_location || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('customer.settings.billing'), {
            onSuccess: () => {
                // Handle success - could show a toast notification
                console.log('Billing information updated successfully');
            },
            onError: (errors) => {
                // Handle errors
                console.error('Update failed:', errors);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="mb-8 text-2xl font-bold text-gray-900">
                Payment & Billing
            </h2>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Full Name */}
                <div className="space-y-2">
                    <label
                        htmlFor="billing_name"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Full Name
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                        <input
                            id="billing_name"
                            type="text"
                            value={data.billing_name}
                            onChange={(e) =>
                                setData('billing_name', e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter your full name"
                        />
                        {errors.billing_name && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.billing_name}
                            </p>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label
                        htmlFor="billing_email"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                        <input
                            id="billing_email"
                            type="email"
                            value={data.billing_email}
                            onChange={(e) =>
                                setData('billing_email', e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter your email"
                        />
                        {errors.billing_email && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.billing_email}
                            </p>
                        )}
                    </div>
                </div>

                {/* City */}
                <div className="space-y-2">
                    <label
                        htmlFor="billing_city"
                        className="block text-sm font-medium text-gray-700"
                    >
                        City
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                        <input
                            id="billing_city"
                            type="text"
                            value={data.billing_city}
                            onChange={(e) =>
                                setData('billing_city', e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter your city"
                        />
                        {errors.billing_city && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.billing_city}
                            </p>
                        )}
                    </div>
                </div>

                {/* Zip Code */}
                <div className="space-y-2">
                    <label
                        htmlFor="billing_zip"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Zip Code
                    </label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                        <input
                            id="billing_zip"
                            type="text"
                            value={data.billing_zip}
                            onChange={(e) =>
                                setData('billing_zip', e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter zip code"
                        />
                        {errors.billing_zip && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.billing_zip}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Location */}
            <div className="mb-8 space-y-2">
                <label
                    htmlFor="billing_location"
                    className="block text-sm font-medium text-gray-700"
                >
                    Location
                </label>
                <div className="relative">
                    <MapPinned className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                    <textarea
                        id="billing_location"
                        value={data.billing_location}
                        onChange={(e) =>
                            setData('billing_location', e.target.value)
                        }
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-900 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your full address"
                    />
                    {errors.billing_location && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.billing_location}
                        </p>
                    )}
                </div>
            </div>

            {/* Update Button */}
            <div className="flex justify-end">
                <CustomButton
                    type="submit"
                    className="w-full md:w-64"
                    disabled={processing}
                >
                    {processing ? 'Updating...' : 'Update Billing Information'}
                </CustomButton>
            </div>
        </form>
    );
};

export default BillingInfo;
