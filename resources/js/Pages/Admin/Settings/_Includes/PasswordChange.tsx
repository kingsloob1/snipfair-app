import CustomButton from '@/Components/common/CustomButton';
import { useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';

interface PasswordInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    showPassword: boolean;
    onToggleVisibility: () => void;
    error?: string;
    required?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
    label,
    value,
    onChange,
    placeholder,
    showPassword,
    onToggleVisibility,
    error,
    required = false,
}) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <div className="relative">
            <input
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full rounded-lg border px-4 py-3 pr-12 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    error
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                }`}
            />
            <button
                type="button"
                onClick={onToggleVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700 focus:outline-none"
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
        {error && (
            <p className="flex items-center gap-1 text-sm text-red-600">
                <span className="text-red-500">⚠</span>
                {error}
            </p>
        )}
    </div>
);

const PasswordChange: React.FC = () => {
    const { data, setData, put, processing, errors, clearErrors, reset } =
        useForm({
            current_password: '',
            password: '',
            password_confirmation: '',
        });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const handleInputChange =
        (field: keyof typeof data) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setData(field, e.target.value);
        };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('admin.settings.update-password'), {
            preserveScroll: true,
            onSuccess: () => {
                clearErrors();
                reset();
            },
        });
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Change Password
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <PasswordInput
                        label="Current Password"
                        value={data.current_password}
                        onChange={handleInputChange('current_password')}
                        placeholder="Confirm your password"
                        showPassword={showPasswords.current}
                        onToggleVisibility={() =>
                            togglePasswordVisibility('current')
                        }
                        error={errors.current_password}
                        required
                    />

                    <PasswordInput
                        label="New Password"
                        value={data.password}
                        onChange={handleInputChange('password')}
                        placeholder="Create password"
                        showPassword={showPasswords.new}
                        onToggleVisibility={() =>
                            togglePasswordVisibility('new')
                        }
                        error={errors.password}
                        required
                    />
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="flex flex-col">
                        <PasswordInput
                            label="Confirm Password"
                            value={data.password_confirmation}
                            onChange={handleInputChange(
                                'password_confirmation',
                            )}
                            placeholder="Confirm your password"
                            showPassword={showPasswords.confirm}
                            onToggleVisibility={() =>
                                togglePasswordVisibility('confirm')
                            }
                            error={errors.password_confirmation}
                            required
                        />
                    </div>

                    <div className="flex items-end justify-end">
                        <div className="div">
                            <CustomButton
                                variant="black"
                                disabled={processing}
                                className="w-full md:w-52"
                                type="submit"
                            >
                                {processing
                                    ? 'Updating Password...'
                                    : 'Update Password'}
                            </CustomButton>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PasswordChange;
