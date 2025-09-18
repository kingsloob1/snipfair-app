import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CalendarEvent {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    color: 'purple' | 'orange';
    date: string; // Added date field for better event management
    recipient: string;
}

interface DayEvents {
    [key: string]: CalendarEvent[];
}

const ScheduleCalendar = ({ events }: { events: DayEvents }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'Daily' | 'Weekly' | 'Monthly'>(
        'Weekly',
    );

    const timeSlots = [
        '6:00 AM',
        '7:00 AM',
        '8:00 AM',
        '9:00 AM',
        '10:00 AM',
        '11:00 AM',
        '12:00 PM',
        '1:00 PM',
        '2:00 PM',
        '3:00 PM',
        '4:00 PM',
        '5:00 PM',
        '6:00 PM',
        '7:00 PM',
        '8:00 PM',
        '9:00 PM',
        '10:00 PM',
        '11:00 PM',
        '12:00 AM',
        '1:00 AM',
        '2:00 AM',
        '3:00 AM',
        '4:00 AM',
        '5:00 AM',
    ];

    // const months = [
    //     'January',
    //     'February',
    //     'March',
    //     'April',
    //     'May',
    //     'June',
    //     'July',
    //     'August',
    //     'September',
    //     'October',
    //     'November',
    //     'December',
    // ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Helper functions
    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const getWeekDays = (date: Date): Date[] => {
        const week = [];
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - day);

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            week.push(day);
        }
        return week;
    };

    const getMonthDays = (date: Date): Date[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const currentDate = new Date(startDate);

        while (currentDate <= lastDay || currentDate.getDay() !== 0) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days;
    };

    const parseTime = (timeStr: string): number => {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let hour24 = hours;

        if (period === 'PM' && hours !== 12) {
            hour24 += 12;
        } else if (period === 'AM' && hours === 12) {
            hour24 = 0;
        }

        return hour24 * 60 + minutes;
    };

    const getEventsForDate = (date: string): CalendarEvent[] => {
        return events[date] || [];
    };

    const getEventsForTimeSlot = (
        date: string,
        timeSlot: string,
    ): CalendarEvent[] => {
        const dayEvents = events[date] || [];
        return dayEvents.filter((event) => {
            const eventStart = parseTime(event.startTime);
            const eventEnd = parseTime(event.endTime);
            const slotTime = parseTime(timeSlot);
            return slotTime >= eventStart && slotTime < eventEnd;
        });
    };

    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);

        if (viewMode === 'Daily') {
            newDate.setDate(
                newDate.getDate() + (direction === 'next' ? 1 : -1),
            );
        } else if (viewMode === 'Weekly') {
            newDate.setDate(
                newDate.getDate() + (direction === 'next' ? 7 : -7),
            );
        } else if (viewMode === 'Monthly') {
            newDate.setMonth(
                newDate.getMonth() + (direction === 'next' ? 1 : -1),
            );
        }

        setCurrentDate(newDate);
    };

    const getDateRange = (): string => {
        if (viewMode === 'Daily') {
            return currentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } else if (viewMode === 'Weekly') {
            const weekDays = getWeekDays(currentDate);
            const start = weekDays[0];
            const end = weekDays[6];
            return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        } else {
            return currentDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
            });
        }
    };

    // Render different views
    const renderDailyView = () => {
        const dateStr = formatDate(currentDate);
        const dayEvents = getEventsForDate(dateStr);

        return (
            <div className="overflow-x-auto">
                <div className="min-w-full">
                    <div className="grid grid-cols-2 border-b bg-gray-50">
                        <div className="p-4 text-sm font-medium">Time</div>
                        <div className="border-l p-4 text-sm font-medium">
                            {currentDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                            })}
                            <div className="text-sm font-normal text-gray-500">
                                {dayEvents.length} Task(s)
                            </div>
                        </div>
                    </div>

                    {timeSlots.map((timeSlot) => {
                        const slotEvents = getEventsForTimeSlot(
                            dateStr,
                            timeSlot,
                        );
                        return (
                            <div
                                key={timeSlot}
                                className="grid min-h-[80px] grid-cols-2 border-b"
                            >
                                <div className="border-r bg-gray-50 p-4 text-xs font-medium text-gray-600">
                                    {timeSlot}
                                </div>
                                <div className="border-l p-2">
                                    {slotEvents.map((event, index) => (
                                        <div
                                            key={`${event.id}-${index}`}
                                            className={`mb-1 rounded-lg p-2 text-xs text-white ${
                                                event.color === 'purple'
                                                    ? 'bg-sf-gradient-primary'
                                                    : 'bg-sf-gradient-secondary'
                                            }`}
                                        >
                                            <div>
                                                {event.startTime} -{' '}
                                                {event.endTime}
                                            </div>
                                            <div>{event.recipient}</div>
                                            <div className="text-[10px] font-medium">
                                                {event.title}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderWeeklyView = () => {
        const weekDays = getWeekDays(currentDate);

        return (
            <div className="overflow-x-auto">
                <div className="min-w-[680px]">
                    <div className="grid grid-cols-8 border-b bg-gray-50">
                        <div className="p-4"></div>
                        {weekDays.map((day, index) => {
                            const dateStr = formatDate(day);
                            const dayEvents = getEventsForDate(dateStr);
                            return (
                                <div
                                    key={index}
                                    className="border-l p-4 text-center"
                                >
                                    <div className="mb-1 font-medium text-gray-900">
                                        {dayNames[day.getDay()]}{' '}
                                        {day.getMonth() + 1}/{day.getDate()}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {dayEvents.length} Task(s)
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {timeSlots.map((timeSlot) => (
                        <div
                            key={timeSlot}
                            className="grid min-h-[80px] grid-cols-8 border-b"
                        >
                            <div className="border-r bg-gray-50 p-4 text-sm font-medium text-gray-600">
                                {timeSlot}
                            </div>
                            {weekDays.map((day, dayIndex) => {
                                const dateStr = formatDate(day);
                                const slotEvents = getEventsForTimeSlot(
                                    dateStr,
                                    timeSlot,
                                );
                                return (
                                    <div
                                        key={`${dayIndex}-${timeSlot}`}
                                        className="border-l p-2"
                                    >
                                        {slotEvents.map((event, eventIndex) => (
                                            <div
                                                key={`${event.id}-${eventIndex}`}
                                                className={`mb-1 rounded-lg p-2 text-xs text-white ${
                                                    event.color === 'purple'
                                                        ? 'bg-sf-gradient-primary'
                                                        : 'bg-sf-gradient-secondary'
                                                }`}
                                            >
                                                <div>
                                                    {event.startTime} -{' '}
                                                    {event.endTime}
                                                </div>
                                                <div>{event.recipient}</div>
                                                <div className="text-[10px] font-medium">
                                                    {event.title}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderMonthlyView = () => {
        const monthDays = getMonthDays(currentDate);
        const weeks = [];

        for (let i = 0; i < monthDays.length; i += 7) {
            weeks.push(monthDays.slice(i, i + 7));
        }

        return (
            <div className="overflow-x-auto">
                <div className="min-w-full">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 border-b bg-gray-50">
                        {dayNames.map((dayName) => (
                            <div
                                key={dayName}
                                className="border-r p-4 text-center font-medium text-gray-900 last:border-r-0"
                            >
                                {dayName}
                            </div>
                        ))}
                    </div>

                    {/* Calendar weeks */}
                    {weeks.map((week, weekIndex) => (
                        <div
                            key={weekIndex}
                            className="grid grid-cols-7 border-b"
                        >
                            {week.map((day, dayIndex) => {
                                const dateStr = formatDate(day);
                                const dayEvents = getEventsForDate(dateStr);
                                const isCurrentMonth =
                                    day.getMonth() === currentDate.getMonth();
                                const isToday =
                                    dateStr === formatDate(new Date());

                                return (
                                    <div
                                        key={`${weekIndex}-${dayIndex}`}
                                        className={`min-h-[120px] border-r p-2 last:border-r-0 ${
                                            !isCurrentMonth
                                                ? 'bg-gray-50 text-gray-400'
                                                : ''
                                        } ${isToday ? 'bg-blue-50' : ''}`}
                                    >
                                        <div
                                            className={`mb-2 text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}
                                        >
                                            {day.getDate()}
                                        </div>
                                        <div className="space-y-1">
                                            {dayEvents
                                                .slice(0, 3)
                                                .map((event, eventIndex) => (
                                                    <div
                                                        key={`${event.id}-${eventIndex}`}
                                                        className={`truncate rounded p-1 text-xs text-white ${
                                                            event.color ===
                                                            'purple'
                                                                ? 'bg-sf-gradient-primary'
                                                                : 'bg-sf-gradient-secondary'
                                                        }`}
                                                    >
                                                        {event.startTime}{' '}
                                                        {event.title}
                                                    </div>
                                                ))}
                                            {dayEvents.length > 3 && (
                                                <div className="text-xs text-gray-500">
                                                    +{dayEvents.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="mx-auto w-full max-w-7xl bg-white">
            {/* Header */}
            <div className="flex flex-col items-center justify-between border-b pb-4 sm:p-4 md:flex-row md:p-6">
                <div className="flex items-center gap-4">
                    <Calendar className="hidden h-6 w-6 text-sf-primary-paragraph md:block" />
                    {/* View Mode Buttons */}
                    <div className="flex rounded-lg bg-gray-100 p-1">
                        {(['Daily', 'Weekly', 'Monthly'] as const).map(
                            (mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                        viewMode === mode
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {mode}
                                </button>
                            ),
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4 md:flex-row">
                    <div className="flex gap-4">
                        {/* Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigateDate('prev')}
                                className="flex gap-0.5 rounded-md p-2 hover:bg-gray-100"
                            >
                                <ChevronLeft className="h-5 w-5" />
                                <span className="hidden text-sm font-medium sm:inline-block">
                                    Back
                                </span>
                            </button>
                        </div>

                        <div className="rounded-lg bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700">
                            {getDateRange()}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigateDate('next')}
                                className="flex gap-0.5 rounded-md p-2 hover:bg-gray-100"
                            >
                                <span className="hidden text-sm font-medium sm:inline-block">
                                    Next
                                </span>
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Content */}
            {viewMode === 'Daily' && renderDailyView()}
            {viewMode === 'Weekly' && renderWeeklyView()}
            {viewMode === 'Monthly' && renderMonthlyView()}
        </div>
    );
};

export default ScheduleCalendar;
