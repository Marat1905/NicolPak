import React, { useState, useEffect, useMemo } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

type Shift = 'День' | 'Ночь' | 'Отсыпной' | 'Выходной' | 'Отпуск' | 'Больничный';

interface Employee {
    id: number;
    name: string;
    position: string;
    shifts: Shift[];
}

interface WorkScheduleProps {
    initialEmployees?: Employee[];
}

const generateVacationPeriods = (daysInMonth: number, employeeCount: number) => {
    const vacationPeriods: { employeeId: number, startDay: number, endDay: number }[] = [];
    const vacationDays = new Set<number>();

    for (let empId = 1; empId <= employeeCount; empId++) {
        if (Math.random() > 0.5) {
            const minLength = 3;
            const maxLength = 14;
            const maxStartDay = daysInMonth - minLength;

            if (maxStartDay > 0) {
                let startDay, endDay;
                let attempts = 0;
                const maxAttempts = 100;

                let found = false;
                while (attempts < maxAttempts && !found) {
                    startDay = Math.floor(Math.random() * maxStartDay);
                    const length = minLength + Math.floor(Math.random() * (maxLength - minLength + 1));
                    endDay = Math.min(startDay + length - 1, daysInMonth - 1);

                    let isAvailable = true;
                    for (let day = startDay; day <= endDay; day++) {
                        if (vacationDays.has(day)) {
                            isAvailable = false;
                            break;
                        }
                    }

                    if (isAvailable) {
                        for (let day = startDay; day <= endDay; day++) {
                            vacationDays.add(day);
                        }
                        vacationPeriods.push({
                            employeeId: empId,
                            startDay,
                            endDay
                        });
                        found = true;
                    }
                    attempts++;
                }
            }
        }
    }

    return vacationPeriods;
};

const generateShiftSequence = (daysInMonth: number, employeeId: number, vacationPeriods: any[]) => {
    const shifts: Shift[] = Array(daysInMonth).fill(null);

    const vacation = vacationPeriods.find(v => v.employeeId === employeeId);
    if (vacation) {
        for (let i = vacation.startDay; i <= vacation.endDay; i++) {
            shifts[i] = 'Отпуск';
        }
    }

    if (Math.random() > 0.7) {
        let start, end;
        let attempts = 0;

        do {
            start = Math.floor(Math.random() * (daysInMonth - 3));
            const length = 3 + Math.floor(Math.random() * 5);
            end = Math.min(start + length - 1, daysInMonth - 1);

            let isValid = true;
            for (let i = start; i <= end; i++) {
                if (shifts[i] === 'Отпуск') {
                    isValid = false;
                    break;
                }
            }

            if (isValid || attempts >= 10) {
                if (isValid) {
                    for (let i = start; i <= end; i++) {
                        shifts[i] = 'Больничный';
                    }
                }
                break;
            }
            attempts++;
        } while (attempts < 10);
    }

    const patterns = [
        ['День', 'Ночь', 'Отсыпной', 'Выходной'],
        ['День', 'День', 'Ночь', 'Ночь', 'Отсыпной', 'Выходной']
    ];

    let currentPattern = patterns[Math.floor(Math.random() * patterns.length)];
    let patternIndex = 0;

    for (let i = 0; i < daysInMonth; i++) {
        if (!shifts[i]) {
            shifts[i] = currentPattern[patternIndex % currentPattern.length] as Shift;
            patternIndex++;

            if (i > 0 && shifts[i - 1] === 'Больничный') {
                currentPattern = patterns[0];
                patternIndex = 0;
                shifts[i] = 'День';
            }
        }
    }

    return shifts;
};

export default function WorkSchedule({
    initialEmployees = []
}: WorkScheduleProps) {
    const currentDate = new Date();
    const [month, setMonth] = useState(currentDate.getMonth());
    const [year, setYear] = useState(currentDate.getFullYear());
    const [currentDay, setCurrentDay] = useState<number | null>(null);

    const generateEmployees = useMemo(() => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const employeeCount = 4;
        const vacationPeriods = generateVacationPeriods(daysInMonth, employeeCount);

        return [
            {
                id: 1,
                name: 'Иванов И.И.',
                position: 'Оператор',
                shifts: generateShiftSequence(daysInMonth, 1, vacationPeriods)
            },
            {
                id: 2,
                name: 'Петров П.П.',
                position: 'Техник',
                shifts: generateShiftSequence(daysInMonth, 2, vacationPeriods)
            },
            {
                id: 3,
                name: 'Сидоров С.С.',
                position: 'Мастер',
                shifts: generateShiftSequence(daysInMonth, 3, vacationPeriods)
            },
            {
                id: 4,
                name: 'Кузнецова А.В.',
                position: 'Инженер',
                shifts: generateShiftSequence(daysInMonth, 4, vacationPeriods)
            }
        ];
    }, [month, year]);

    const [employees] = useState<Employee[]>(generateEmployees);

    useEffect(() => {
        const today = new Date();
        setCurrentDay(
            today.getMonth() === month && today.getFullYear() === year
                ? today.getDate()
                : null
        );
    }, [month, year]);

    const isWeekend = (dayIndex: number): boolean => {
        const day = new Date(year, month, dayIndex + 1).getDay();
        return day === 0 || day === 6;
    };

    const monthName = new Date(year, month).toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric'
    });

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const getShiftAbbreviation = (shift: Shift): string => {
        switch (shift) {
            case 'День': return 'Д';
            case 'Ночь': return 'Н';
            case 'Отсыпной': return 'Отс';
            case 'Отпуск': return 'Отп';
            case 'Больничный': return 'Бол';
            default: return 'Вых';
        }
    };

    const handlePrevMonth = () => {
        if (month === 0) {
            setMonth(11);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };

    const handleNextMonth = () => {
        if (month === 11) {
            setMonth(0);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };

    return (
        <>
            <PageMeta
                title="График работы сменного персонала"
                description="Управление графиком работы сменного персонала"
            />

            <PageBreadcrumb pageTitle="График работы" />

            <div className="col-span-12 xl:col-span-7">
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                            График работы на {monthName}
                        </h2>

                        <div className="flex items-center gap-4 mb-6">
                            <button
                                onClick={handlePrevMonth}
                                className="px-3 h-[42px] bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                            >
                                ←
                            </button>

                            <select
                                className="border rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white/90 border-gray-300 dark:border-gray-600 h-[42px]"
                                value={month}
                                onChange={(e) => setMonth(Number(e.target.value))}
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {new Date(year, i).toLocaleDateString('ru-RU', { month: 'long' })}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                className="border rounded px-3 py-2 w-24 bg-white dark:bg-gray-700 text-gray-800 dark:text-white/90 border-gray-300 dark:border-gray-600 h-[42px]"
                                value={year}
                                min={2020}
                                max={2030}
                                onChange={(e) => setYear(Number(e.target.value))}
                            />

                            <button
                                onClick={handleNextMonth}
                                className="px-3 h-[42px] bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                            >
                                →
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300 dark:border-gray-600">
                                <thead>
                                    <tr>
                                        <th className="border px-4 py-2 text-left bg-gray-100 dark:bg-gray-700">Сотрудник</th>
                                        <th className="border px-4 py-2 text-left bg-gray-100 dark:bg-gray-700">Должность</th>
                                        {Array.from({ length: daysInMonth }, (_, i) => {
                                            const date = new Date(year, month, i + 1);
                                            const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' }).substring(0, 2);
                                            return (
                                                <th
                                                    key={i}
                                                    className={`border px-2 py-1 text-center ${isWeekend(i) ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                                                >
                                                    <div>{i + 1}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-300">{dayName}</div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((employee) => (
                                        <tr key={employee.id}>
                                            <td className="border px-4 py-2 text-gray-800 dark:text-white/90">{employee.name}</td>
                                            <td className="border px-4 py-2 text-gray-800 dark:text-white/90">{employee.position}</td>
                                            {employee.shifts.map((shift, dayIndex) => (
                                                <td
                                                    key={dayIndex}
                                                    className={`border px-2 py-1 text-center ${isWeekend(dayIndex) ? 'bg-gray-50 dark:bg-gray-700' : ''} ${shift === 'День' ? 'bg-green-50 dark:bg-green-900/30' :
                                                            shift === 'Ночь' ? 'bg-blue-50 dark:bg-blue-900/30' :
                                                                shift === 'Отсыпной' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                                                    shift === 'Отпуск' ? 'bg-yellow-100 dark:bg-yellow-800/30' :
                                                                        shift === 'Больничный' ? 'bg-purple-50 dark:bg-purple-900/30' :
                                                                            'bg-gray-50 dark:bg-gray-700'
                                                        } ${currentDay === dayIndex + 1 ? 'border-2 border-red-500 dark:border-red-400' : ''}`}
                                                >
                                                    <span className="font-medium">
                                                        {getShiftAbbreviation(shift)}
                                                    </span>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-green-50 dark:bg-green-900/30 mr-2 border border-gray-300 dark:border-gray-600"></div>
                                <span className="text-sm">День</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-blue-50 dark:bg-blue-900/30 mr-2 border border-gray-300 dark:border-gray-600"></div>
                                <span className="text-sm">Ночь</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-amber-100 dark:bg-amber-900/30 mr-2 border border-gray-300 dark:border-gray-600"></div>
                                <span className="text-sm">Отсыпной</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-800/30 mr-2 border border-gray-300 dark:border-gray-600"></div>
                                <span className="text-sm">Отпуск</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-purple-50 dark:bg-purple-900/30 mr-2 border border-gray-300 dark:border-gray-600"></div>
                                <span className="text-sm">Больничный</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-gray-50 dark:bg-gray-700 mr-2 border border-gray-300 dark:border-gray-600"></div>
                                <span className="text-sm">Выходной</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}