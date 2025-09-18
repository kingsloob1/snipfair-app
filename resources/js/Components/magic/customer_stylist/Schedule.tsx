import { WorkingHour } from '@/types';
import React from 'react';

interface WorkingHoursProps {
    workingHours: WorkingHour[];
    title?: string;
}

const Schedule: React.FC<WorkingHoursProps> = ({
    workingHours,
    title = 'Working Hours',
}) => {
    const formatDay = (day: string): string => {
        return day.toLowerCase();
    };

    const formatTimeRange = (hour: WorkingHour): string => {
        if (hour.isClosed) {
            return 'Closed';
        }

        if (hour.openTime && hour.closeTime) {
            return `${hour.openTime} - ${hour.closeTime}`;
        }

        return 'Closed';
    };

    return (
        <div className="w-full space-y-6 overflow-hidden rounded-2xl border border-sf-stroke p-3.5 shadow-sm shadow-sf-gray/20 md:p-6">
            <h2 className="mb-5 text-base font-bold text-sf-black md:text-lg">
                {title}
            </h2>
            <div className="space-y-4">
                {workingHours.map((hour, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                    >
                        <span className="font-medium capitalize text-sf-primary-paragraph">
                            {formatDay(hour.day)}
                        </span>
                        <span
                            className={`font-medium ${
                                hour.isClosed
                                    ? 'text-sf-primary-paragraph'
                                    : 'text-sf-gray-zinc'
                            }`}
                        >
                            {formatTimeRange(hour)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Example usage component to demonstrate the data structure
// const WorkingHoursExample: React.FC = () => {
//   const sampleWorkingHours: WorkingHour[] = [
//     { day: "monday", openTime: "9:00 AM", closeTime: "7:00 PM" },
//     { day: "tuesday", openTime: "9:00 AM", closeTime: "7:00 PM" },
//     { day: "wednesday", openTime: "10:00 AM", closeTime: "8:00 PM" },
//     { day: "thursday", openTime: "9:00 AM", closeTime: "7:00 PM" },
//     { day: "friday", openTime: "9:00 AM", closeTime: "8:00 PM" },
//     { day: "saturday", openTime: "8:00 AM", closeTime: "6:00 PM" },
//     { day: "sunday", isClosed: true }
//   ];

//   return <WorkingHours workingHours={sampleWorkingHours} />;
// };

export default Schedule;
