import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface DatePickerProps {
    selectedDate?: Date;
    onDateSelect: (date: Date) => void;
    className?: string;
    validateDate?: (date: Date) => boolean;
    enableCreate: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
    selectedDate,
    onDateSelect,
    className = '',
    validateDate = () => true,
    enableCreate,
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initialize to current month if no selected date
    useEffect(() => {
        if (selectedDate) {
            setCurrentMonth(
                new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    1,
                ),
            );
        } else if (!enableCreate) {
            // If enableCreate is false but no selectedDate yet, keep current month
            // This will be updated once selectedDate is set from appointment data
        }
    }, [selectedDate, enableCreate]);

    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const firstDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            1,
        ).getDay();
        return firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth((prev) => {
            const newMonth = new Date(prev);
            if (direction === 'prev') {
                newMonth.setMonth(prev.getMonth() - 1);
            } else {
                newMonth.setMonth(prev.getMonth() + 1);
            }
            return newMonth;
        });
    };

    const canNavigatePrev = () => {
        const prevMonth = new Date(currentMonth);
        prevMonth.setMonth(currentMonth.getMonth() - 1);
        const lastDayOfPrevMonth = new Date(
            prevMonth.getFullYear(),
            prevMonth.getMonth() + 1,
            0,
        );
        return lastDayOfPrevMonth >= today;
    };

    const isDateDisabled = (date: Date) => {
        return date < today || !validateDate(date);
    };

    const isDateSelected = (date: Date) => {
        if (!selectedDate) return false;

        const selectedDateOnly = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
        );
        const dateOnly = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
        );

        return dateOnly.getTime() === selectedDateOnly.getTime();
        // return date.getTime() === selectedDate.getTime();
    };

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day,
        );
        if (clickedDate < today) {
            toast.error('Cannot select past dates');
            return;
        }
        if (!validateDate(clickedDate)) {
            toast.error('This date is not available for booking');
            return;
        }
        onDateSelect(clickedDate);
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(
                <div key={`empty-${i}`} className="h-10 sm:h-12 md:h-14"></div>,
            );
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day,
            );
            const disabled = isDateDisabled(date);
            const selected = isDateSelected(date);

            days.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    disabled={disabled || !enableCreate}
                    className={`flex h-10 items-center justify-center border border-gray-200 text-sm font-medium transition-all duration-200 sm:h-12 sm:text-base md:h-14 ${
                        disabled
                            ? 'cursor-not-allowed bg-gray-50 text-gray-300'
                            : 'cursor-pointer text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-gray-50'
                    } ${
                        selected
                            ? 'border-purple-600 bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink text-white hover:bg-sf-gradient-purple disabled:opacity-60'
                            : ''
                    } `}
                >
                    {day}
                </button>,
            );
        }

        return days;
    };

    return (
        <div className={`max-w-md rounded-lg ${className}`}>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-sf-black md:text-xl">
                    Select Date
                </h2>
            </div>

            <div className="p-4 md:p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-base font-medium text-sf-black">
                        {monthNames[currentMonth.getMonth()]}{' '}
                        {currentMonth.getFullYear()}
                    </h3>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigateMonth('prev')}
                            disabled={!canNavigatePrev() || !enableCreate}
                            className={`rounded-full p-2 transition-colors ${
                                canNavigatePrev() && enableCreate
                                    ? 'text-gray-600 hover:bg-gray-100'
                                    : 'cursor-not-allowed text-gray-300'
                            }`}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => navigateMonth('next')}
                            disabled={!enableCreate}
                            className={`rounded-full p-2 transition-colors ${
                                enableCreate
                                    ? 'text-gray-600 hover:bg-gray-100'
                                    : 'cursor-not-allowed text-gray-300'
                            }`}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Day names header */}
                <div className="mb-2 grid grid-cols-7 gap-1">
                    {dayNames.map((day) => (
                        <div
                            key={day}
                            className="flex h-8 items-center justify-center text-xs font-medium text-gray-500 sm:h-10 sm:text-sm"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {renderCalendarDays()}
                </div>
            </div>
        </div>
    );
};

export default DatePicker;
