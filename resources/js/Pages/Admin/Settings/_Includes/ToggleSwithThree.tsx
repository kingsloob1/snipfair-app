import { Check, Edit3, Minus } from 'lucide-react';

interface ToggleSwitchProps {
    enabled: 'min' | 'custom' | 'max';
    onChange: (value: 'min' | 'custom' | 'max') => void;
}

const ToggleSwitch = ({ enabled, onChange }: ToggleSwitchProps) => {
    const handleClick = () => {
        if (enabled === 'min') onChange('custom');
        else if (enabled === 'custom') onChange('max');
        else onChange('min');
    };

    const getConfig = () => {
        switch (enabled) {
            case 'min':
                return {
                    position: 'translate-x-1',
                    background: 'bg-red-500 shadow-red-200',
                    icon: <Minus className="h-3 w-3 text-red-500" />,
                    label: 'Always',
                };
            case 'custom':
                return {
                    position: 'translate-x-8',
                    background: 'bg-green-500 shadow-green-200',
                    icon: <Edit3 className="h-3 w-3 text-green-500" />,
                    label: 'Custom',
                };
            case 'max':
                return {
                    position: 'translate-x-[3.75rem]',
                    background: 'bg-gray-400 shadow-gray-200',
                    icon: <Check className="h-3 w-3 text-gray-500" />,
                    label: 'Never',
                };
        }
    };

    const config = getConfig();

    return (
        <div className="flex flex-col items-center space-y-2">
            <button
                type="button"
                onClick={handleClick}
                className={`relative inline-flex h-8 w-[88px] items-center rounded-full transition-all duration-300 ease-in-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${config.background}`}
            >
                {/* Track background with subtle gradient */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-black/5 to-transparent" />

                {/* Sliding indicator */}
                <span
                    className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out hover:scale-110 ${config.position}`}
                >
                    {config.icon}
                </span>

                {/* State labels */}
                <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium text-white">
                    <span
                        className={`transition-all duration-200 ${enabled === 'min' ? 'opacity-0' : 'opacity-60'}`}
                    >
                        Min
                    </span>
                    <span
                        className={`transition-all duration-200 ${enabled === 'custom' ? 'opacity-0' : 'opacity-60'}`}
                    >
                        C
                    </span>
                    <span
                        className={`transition-all duration-200 ${enabled === 'max' ? 'opacity-0' : 'opacity-60'}`}
                    >
                        Max
                    </span>
                </div>
            </button>

            {/* Current state label */}
            <span className="text-xs font-medium text-gray-600">
                {config.label}
            </span>
        </div>
    );
};

export default ToggleSwitch;
