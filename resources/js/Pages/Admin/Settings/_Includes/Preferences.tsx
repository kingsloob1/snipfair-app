import CustomButton from '@/Components/common/CustomButton';
import { useForm } from '@inertiajs/react';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

// Toggle Switch Component
interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (value: boolean) => void;
}

const ToggleSwitch = ({ enabled, onChange }: ToggleSwitchProps) => (
    <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            enabled ? 'bg-green-500' : 'bg-gray-300'
        }`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
    </button>
);

// Custom Select Component
interface SelectOption {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder: string;
}

const CustomSelect = ({
    value,
    onChange,
    options,
    placeholder,
}: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <span className={value ? 'text-gray-900' : 'text-gray-500'}>
                    {value || placeholder}
                </span>
                <ChevronDown className="h-5 w-5 text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50"
                        >
                            <span className="text-gray-900">
                                {option.label}
                            </span>
                            {value === option.value && (
                                <Check className="h-4 w-4 text-blue-500" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Booking Preferences Card
interface BookingPreferencesData {
    preferred_time: string;
    preferred_stylist: string;
    auto_rebooking: boolean;
    enable_mobile_appointment: boolean;
    email_reminders: boolean;
    sms_reminders: boolean;
    phone_reminders: boolean;
    language: string;
    currency: string;
}

interface BookingPreferencesCardProps {
    data: BookingPreferencesData;
    setData: (
        key: keyof BookingPreferencesData,
        value: string | boolean,
    ) => void;
}

const BookingPreferencesCard = ({
    data,
    setData,
}: BookingPreferencesCardProps) => {
    const timeOptions = [
        { value: '', label: 'No Preference' },
        { value: 'morning', label: 'Morning (8 - 12PM)' },
        { value: 'afternoon', label: 'Afternoon (12 - 4PM)' },
        { value: 'evening', label: 'Evening (4 - 8PM)' },
        { value: 'special', label: 'Special Booking' },
    ];

    const genderOptions = [
        { value: '', label: 'No Preference' },
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
    ];

    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Booking Preferences
            </h2>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Preferred Service Time
                    </label>
                    <CustomSelect
                        value={data.preferred_time}
                        onChange={(value) => setData('preferred_time', value)}
                        options={timeOptions}
                        placeholder="No Preference"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Preferred Stylist Gender
                    </label>
                    <CustomSelect
                        value={data.preferred_stylist}
                        onChange={(value) =>
                            setData('preferred_stylist', value)
                        }
                        options={genderOptions}
                        placeholder="No Preference"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Auto-rebooking
                        </h3>
                        <p className="text-sm text-gray-500">
                            Automatically suggest rebooking based on your
                            service history
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.auto_rebooking}
                        onChange={(value) => setData('auto_rebooking', value)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Mobile Stylist Services
                        </h3>
                        <p className="text-sm text-gray-500">
                            Include mobile stylists in search results
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.enable_mobile_appointment}
                        onChange={(value) =>
                            setData('enable_mobile_appointment', value)
                        }
                    />
                </div>
            </div>
        </div>
    );
};

// Communication Preferences Card
interface CommunicationPreferencesData {
    email_reminders: boolean;
    sms_reminders: boolean;
    phone_reminders: boolean;
}

interface CommunicationPreferencesCardProps {
    data: CommunicationPreferencesData;
    setData: (key: keyof CommunicationPreferencesData, value: boolean) => void;
}

const CommunicationPreferencesCard = ({
    data,
    setData,
}: CommunicationPreferencesCardProps) => {
    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Communication Preferences
            </h2>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Email Reminders
                        </h3>
                        <p className="text-sm text-gray-500">
                            Receive appointment reminders via email
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.email_reminders}
                        onChange={(value) => setData('email_reminders', value)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            SMS Reminders
                        </h3>
                        <p className="text-sm text-gray-500">
                            Receive appointment reminders via text message
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.sms_reminders}
                        onChange={(value) => setData('sms_reminders', value)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Phone Calls
                        </h3>
                        <p className="text-sm text-gray-500">
                            Receive appointment reminders via text message
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.phone_reminders}
                        onChange={(value) => setData('phone_reminders', value)}
                    />
                </div>
            </div>
        </div>
    );
};

// Regional Settings Card
interface RegionalSettingsData {
    language: string;
    currency: string;
}

interface RegionalSettingsCardProps {
    data: RegionalSettingsData;
    setData: (key: keyof RegionalSettingsData, value: string) => void;
    onSubmit: () => void;
    processing: boolean;
}

const RegionalSettingsCard = ({
    data,
    setData,
    onSubmit,
    processing,
}: RegionalSettingsCardProps) => {
    const languageOptions = [
        { value: 'english', label: 'English' },
        { value: 'spanish', label: 'Spanish' },
        { value: 'french', label: 'French' },
    ];

    const currencyOptions = [
        { value: 'R', label: 'R (ZAR)' },
        { value: '$', label: '$ (USD)' },
        { value: '€', label: '€ (EUR)' },
        { value: '£', label: '£ (GBP)' },
    ];

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Regional Settings
            </h2>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Language
                    </label>
                    <CustomSelect
                        value={data.language}
                        onChange={(value) => setData('language', value)}
                        options={languageOptions}
                        placeholder="English"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Currency
                    </label>
                    <CustomSelect
                        value={data.currency}
                        onChange={(value) => setData('currency', value)}
                        options={currencyOptions}
                        placeholder="R"
                    />
                </div>
            </div>
            <div className="flex justify-end pb-3 pt-8">
                <CustomButton
                    type="submit"
                    className="w-full md:w-64"
                    onClick={onSubmit}
                    disabled={processing}
                >
                    {processing ? 'Saving...' : 'Save Changes'}
                </CustomButton>
            </div>
        </div>
    );
};

// Main Component
interface PreferencesData {
    preferred_time: string;
    preferred_stylist: string;
    auto_rebooking: boolean;
    enable_mobile_appointment: boolean;
    email_reminders: boolean;
    sms_reminders: boolean;
    phone_reminders: boolean;
    language: string;
    currency: string;
}

interface PreferencesProps {
    preferences?: PreferencesData | null;
}

const Preferences = ({ preferences }: PreferencesProps) => {
    const defaultPreferences: PreferencesData = {
        preferred_time: '',
        preferred_stylist: '',
        auto_rebooking: true,
        enable_mobile_appointment: true,
        email_reminders: true,
        sms_reminders: true,
        phone_reminders: true,
        language: 'english',
        currency: '$',
    };

    const { data, setData, patch, processing } = useForm({
        preferred_time:
            preferences?.preferred_time || defaultPreferences.preferred_time,
        preferred_stylist:
            preferences?.preferred_stylist ||
            defaultPreferences.preferred_stylist,
        auto_rebooking:
            preferences?.auto_rebooking ?? defaultPreferences.auto_rebooking,
        enable_mobile_appointment:
            preferences?.enable_mobile_appointment ??
            defaultPreferences.enable_mobile_appointment,
        email_reminders:
            preferences?.email_reminders ?? defaultPreferences.email_reminders,
        sms_reminders:
            preferences?.sms_reminders ?? defaultPreferences.sms_reminders,
        phone_reminders:
            preferences?.phone_reminders ?? defaultPreferences.phone_reminders,
        language: preferences?.language || defaultPreferences.language,
        currency: preferences?.currency || defaultPreferences.currency,
    });

    const handleSubmit = () => {
        patch(route('customer.preferences.update'), {
            preserveScroll: true,
            onSuccess: () => {
                //
            },
        });
    };

    return [
        <BookingPreferencesCard key="booking" data={data} setData={setData} />,
        <CommunicationPreferencesCard
            key="communication"
            data={data}
            setData={setData}
        />,
        <RegionalSettingsCard
            key="regional"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            processing={processing}
        />,
    ];
};

export default Preferences;
