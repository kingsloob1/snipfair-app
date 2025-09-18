import CustomButton from '@/Components/common/CustomButton';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface AdminProfileFormProps {
    admin: {
        id: number;
        name: string;
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
    };
    onClose: () => void;
}

const AdminProfileForm: React.FC<AdminProfileFormProps> = ({
    admin,
    onClose,
}) => {
    const [formData, setFormData] = useState({
        first_name: admin.first_name || '',
        last_name: admin.last_name || '',
        email: admin.email || '',
        phone: admin.phone || '',
    });

    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(route('admin.profile.update'), formData, {
            onSuccess: () => {
                onClose();
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    Edit Profile
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            First Name
                        </label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Last Name
                        </label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Optional"
                    />
                </div>

                <div className="flex gap-2 pt-4">
                    <CustomButton
                        type="submit"
                        disabled={processing}
                        fullWidth={false}
                    >
                        {processing ? 'Saving...' : 'Save Changes'}
                    </CustomButton>
                    <CustomButton
                        type="button"
                        onClick={onClose}
                        variant="secondary"
                        fullWidth={false}
                    >
                        Cancel
                    </CustomButton>
                </div>
            </form>
        </div>
    );
};

export default AdminProfileForm;
