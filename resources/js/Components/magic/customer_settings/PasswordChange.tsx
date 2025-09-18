import CustomButton from '@/Components/common/CustomButton';
import { useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

// Define PasswordInput as a separate component
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
    const { data, setData, put, processing, errors, reset } = useForm({
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

        put(route('password.update'), {
            onSuccess: () => {
                reset();
                toast.success('Password updated successfully!');
            },
        });
    };

    const getPasswordStrength = (
        password: string,
    ): { strength: number; label: string; color: string } => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };

        let score = 0;
        if (password.length >= 8) score += 25;
        if (password.length >= 12) score += 25;
        if (/[a-z]/.test(password)) score += 12.5;
        if (/[A-Z]/.test(password)) score += 12.5;
        if (/[0-9]/.test(password)) score += 12.5;
        if (/[^A-Za-z0-9]/.test(password)) score += 12.5;

        if (score < 25)
            return { strength: score, label: 'Weak', color: 'bg-red-500' };
        if (score < 50)
            return { strength: score, label: 'Fair', color: 'bg-orange-500' };
        if (score < 75)
            return { strength: score, label: 'Good', color: 'bg-yellow-500' };
        return { strength: score, label: 'Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(data.password);

    return (
        <div>
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
                        {data.password && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>Password Strength</span>
                                    <span
                                        className={`font-medium ${
                                            passwordStrength.label === 'Weak'
                                                ? 'text-red-600'
                                                : passwordStrength.label ===
                                                    'Fair'
                                                  ? 'text-orange-600'
                                                  : passwordStrength.label ===
                                                      'Good'
                                                    ? 'text-yellow-600'
                                                    : 'text-green-600'
                                        }`}
                                    >
                                        {passwordStrength.label}
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-200">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                        style={{
                                            width: `${passwordStrength.strength}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-end justify-end">
                        <div className="div">
                            <CustomButton
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

            <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                    Password Requirements:
                </h4>
                <ul className="space-y-1 text-xs text-gray-600">
                    <li className="flex items-center gap-2">
                        <span
                            className={
                                data.password.length >= 8
                                    ? 'text-green-600'
                                    : 'text-gray-400'
                            }
                        >
                            {data.password.length >= 8 ? '✓' : '○'}
                        </span>
                        At least 8 characters long
                    </li>
                    <li className="flex items-center gap-2">
                        <span
                            className={
                                /[A-Z]/.test(data.password)
                                    ? 'text-green-600'
                                    : 'text-gray-400'
                            }
                        >
                            {/[A-Z]/.test(data.password) ? '✓' : '○'}
                        </span>
                        One uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                        <span
                            className={
                                /[a-z]/.test(data.password)
                                    ? 'text-green-600'
                                    : 'text-gray-400'
                            }
                        >
                            {/[a-z]/.test(data.password) ? '✓' : '○'}
                        </span>
                        One lowercase letter
                    </li>
                    <li className="flex items-center gap-2">
                        <span
                            className={
                                /[0-9]/.test(data.password)
                                    ? 'text-green-600'
                                    : 'text-gray-400'
                            }
                        >
                            {/[0-9]/.test(data.password) ? '✓' : '○'}
                        </span>
                        One number
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default PasswordChange;
