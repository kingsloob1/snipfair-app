import { cn } from '@/lib/utils';
import { Check, Minus } from 'lucide-react';

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
}

const ToggleSwitch = ({ enabled, onChange, disabled }: ToggleSwitchProps) => (
    <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={cn(
            'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-0 focus:ring-blue-500 focus:ring-offset-2',
            enabled ? 'bg-green-500' : 'bg-gray-300',
            disabled && 'cursor-not-allowed opacity-50',
        )}
    >
        <span
            className={`inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
        >
            {enabled ? (
                <Check className="h-3 w-3 text-green-600" />
            ) : (
                <Minus className="h-3 w-3 text-sf-gray" />
            )}
        </span>
    </button>
);

export default ToggleSwitch;
