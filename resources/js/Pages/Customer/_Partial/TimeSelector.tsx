import React, { useState } from 'react';

interface TimeSelectorProps {
    selectedTime?: string;
    onTimeSelect?: (time: string) => void;
    availableTimes?: string[];
    timeRange?: {
        start: number; // 24-hour format (0-23)
        end: number; // 24-hour format (0-23)
        interval?: number; // minutes between slots (default: 60)
    };
    enableCreate?: boolean;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
    selectedTime = '1:00 PM',
    onTimeSelect,
    availableTimes,
    timeRange,
    enableCreate,
}) => {
    // Generate times from timeRange if provided, otherwise use availableTimes or default
    const generateTimesFromRange = (range: {
        start: number;
        end: number;
        interval?: number;
    }): string[] => {
        const times: string[] = [];
        const interval = range.interval || 60; // default 60 minutes

        for (let hour = range.start; hour <= range.end; hour++) {
            for (let minute = 0; minute < 60; minute += interval) {
                // Skip if we've exceeded the end time
                if (hour === range.end && minute > 0) break;

                const time24 = hour * 60 + minute;
                const endTime24 = range.end * 60;
                if (time24 > endTime24) break;

                const displayHour =
                    hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                const period = hour < 12 ? 'AM' : 'PM';
                const minuteStr =
                    minute === 0
                        ? ''
                        : `:${minute.toString().padStart(2, '0')}`;

                times.push(`${displayHour}${minuteStr}:${period}`);
            }
        }

        return times;
    };

    const getAvailableTimes = (): string[] => {
        if (timeRange) {
            return generateTimesFromRange(timeRange);
        }
        if (availableTimes) {
            return availableTimes;
        }
        return [];
    };

    const times = getAvailableTimes();
    const [currentSelectedTime, setCurrentSelectedTime] = useState(
        selectedTime || (times.length > 0 ? times[0] : ''),
    );

    // Update selected time when prop changes (for existing appointments)
    React.useEffect(() => {
        if (selectedTime && selectedTime !== currentSelectedTime) {
            setCurrentSelectedTime(selectedTime);
            // Don't call onTimeSelect here to avoid infinite loops since this is coming from parent
        }
    }, [selectedTime, currentSelectedTime]);

    const handleTimeSelect = (time: string) => {
        setCurrentSelectedTime(time);
        onTimeSelect?.(time);
    };

    return (
        <div className="max-w-md rounded-lg">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-sf-black md:text-xl">
                    Select Time
                </h2>
            </div>

            <div className="grid w-full grid-cols-3 gap-4">
                {times.length === 0 && (
                    <div className="col-span-3 text-center italic text-sf-gray">
                        No available time, please check another date.
                    </div>
                )}
                {times &&
                    times.length > 0 &&
                    times.map((time) => (
                        <button
                            key={time}
                            disabled={!enableCreate}
                            onClick={() => handleTimeSelect(time)}
                            className={`relative transform rounded-2xl border-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-60 disabled:shadow-none disabled:hover:scale-100 disabled:hover:border-gray-200 disabled:hover:shadow-none md:text-base ${
                                currentSelectedTime === time
                                    ? 'border-transparent bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink text-white shadow-lg'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            } `}
                        >
                            {time}
                        </button>
                    ))}
            </div>
        </div>
    );
};

export default TimeSelector;
