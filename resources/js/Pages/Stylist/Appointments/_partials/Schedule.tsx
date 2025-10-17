import { ChevronDown, Filter, Plus, Trash2 } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

interface TimeSlot {
    id: string;
    from: string;
    to: string;
    [key: string]: string;
}

type DaySchedule = {
    day: string;
    available: boolean;
    timeSlots: TimeSlot[];
};

interface AvailabilityProps {
    schedules: DaySchedule[];
    setSchedules: Dispatch<SetStateAction<DaySchedule[]>>;
}

const Schedule = ({ schedules, setSchedules }: AvailabilityProps) => {
    const toggleAvailability = (dayIndex: number) => {
        setSchedules((prev) =>
            prev.map((schedule, index) =>
                index === dayIndex
                    ? { ...schedule, available: !schedule.available }
                    : schedule,
            ),
        );
    };

    const addTimeSlot = (dayIndex: number) => {
        const newSlot: TimeSlot = {
            id: Date.now().toString(),
            from: '9:00',
            to: '9:00',
        };

        setSchedules((prev) =>
            prev.map((schedule, index) =>
                index === dayIndex
                    ? {
                          ...schedule,
                          timeSlots: [...schedule.timeSlots, newSlot],
                      }
                    : schedule,
            ),
        );
    };

    const removeTimeSlot = (dayIndex: number, slotId: string) => {
        setSchedules((prev) =>
            prev.map((schedule, index) =>
                index === dayIndex
                    ? {
                          ...schedule,
                          timeSlots: schedule.timeSlots.filter(
                              (slot) => slot.id != slotId,
                          ),
                      }
                    : schedule,
            ),
        );
    };

    const updateTimeSlot = (
        dayIndex: number,
        slotId: string,
        field: 'from' | 'to',
        value: string,
    ) => {
        setSchedules((prev) =>
            prev.map((schedule, index) =>
                index === dayIndex
                    ? {
                          ...schedule,
                          timeSlots: schedule.timeSlots.map((slot) =>
                              slot.id === slotId
                                  ? { ...slot, [field]: value }
                                  : slot,
                          ),
                      }
                    : schedule,
            ),
        );
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6 hidden">
                <h1 className="mb-4 text-xl font-semibold text-gray-900">
                    Search for Schedules
                </h1>

                {/* Filters */}
                <div className="mb-6 flex gap-4">
                    <button className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50">
                        <Filter size={16} />
                        Filter
                    </button>

                    <div className="relative">
                        <select className="appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 pr-8 hover:bg-gray-50">
                            <option>Today</option>
                            <option>This Week</option>
                            <option>This Month</option>
                        </select>
                        <ChevronDown
                            className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-400"
                            size={16}
                        />
                    </div>

                    <div className="relative">
                        <select className="appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 pr-8 hover:bg-gray-50">
                            <option>All Status</option>
                            <option>Available</option>
                            <option>Unavailable</option>
                        </select>
                        <ChevronDown
                            className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-400"
                            size={16}
                        />
                    </div>
                </div>
            </div>

            {/* Schedule Days */}
            <div className="space-y-6">
                {schedules &&
                    schedules.map((schedule, dayIndex) => (
                        <div
                            key={schedule.day}
                            className="rounded-lg border border-gray-200 p-4"
                        >
                            {/* Day Header */}
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-medium text-gray-900">
                                    {schedule.day}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-sm ${schedule.available ? 'text-green-600' : 'text-gray-400'}`}
                                    >
                                        {schedule.available
                                            ? 'Available'
                                            : 'Unavailable'}
                                    </span>
                                    <button
                                        onClick={() =>
                                            toggleAvailability(dayIndex)
                                        }
                                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                            schedule.available
                                                ? 'bg-green-600'
                                                : 'bg-gray-200'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                schedule.available
                                                    ? 'translate-x-6'
                                                    : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Time Slots */}
                            <div className="space-y-3">
                                {schedule.timeSlots.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-4"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="w-10 text-sm text-gray-600">
                                                From
                                            </span>
                                            <input
                                                type="time"
                                                value={slot.from}
                                                max={slot.to ?? undefined}
                                                step="3600"
                                                onChange={(e) =>
                                                    updateTimeSlot(
                                                        dayIndex,
                                                        slot.id,
                                                        'from',
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded border border-gray-300 px-3 py-1 text-sm"
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="w-10 text-sm text-gray-600">
                                                    To
                                                </span>
                                                <input
                                                    type="time"
                                                    value={slot.to}
                                                    min={slot.from ?? undefined}
                                                    step="3600"
                                                    onChange={(e) =>
                                                        updateTimeSlot(
                                                            dayIndex,
                                                            slot.id,
                                                            'to',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="rounded border border-gray-300 px-3 py-1 text-sm"
                                                />
                                            </div>

                                            {schedule.timeSlots.length > 1 && (
                                                <button
                                                    onClick={() =>
                                                        removeTimeSlot(
                                                            dayIndex,
                                                            slot.id,
                                                        )
                                                    }
                                                    className="p-1 text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Add Time Slot Button */}
                                <button
                                    onClick={() => addTimeSlot(dayIndex)}
                                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                                >
                                    <Plus size={16} />
                                    Add Time slot
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Schedule;
