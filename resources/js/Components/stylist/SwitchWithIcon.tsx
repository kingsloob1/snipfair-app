import { Check } from 'lucide-react';

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

const SwitchWithIcon = ({ enabled, onChange }: ToggleSwitchProps) => {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-gray-300'} `}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'} `}
            >
                {enabled && (
                    <Check
                        className="absolute left-0.5 top-0.5 h-3 w-3 text-green-500"
                        strokeWidth={3}
                    />
                )}
            </span>
        </button>
    );
};

export default SwitchWithIcon;
