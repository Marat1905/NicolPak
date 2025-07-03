import { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiCalendar, FiDroplet } from 'react-icons/fi';
import PageMeta from "../../../components/common/PageMeta";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import { registerLocale } from "react-datepicker";
import { ru } from 'date-fns/locale';
import { subDays, format, isSameDay, eachDayOfInterval } from 'date-fns';

interface NodeData {
    id: number;
    name: string;
    dayShiftValue: number;
    nightShiftValue: number;
    total: number;
    unit: string;
}

interface DailyData {
    date: Date;
    nodes: NodeData[];
    dayTotal: number;
    nightTotal: number;
    grandTotal: number;
}

registerLocale("ru", ru);

const WaterPeriodReport = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [startDate, setStartDate] = useState<Date>(subDays(today, 7));
    const [endDate, setEndDate] = useState<Date>(today);
    const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
    const [reportData, setReportData] = useState<DailyData[]>([]);
    const [activeShift, setActiveShift] = useState<'day' | 'night'>('day');

    // Генерация случайных данных для одного дня
    const generateDailyData = (date: Date): DailyData => {
        const baseDate = date.getTime();
        const nodes: NodeData[] = [
            { id: 1, name: 'Входной коллектор', dayShiftValue: 0, nightShiftValue: 0, total: 0, unit: 'm³' },
            { id: 2, name: 'Уральская вода', dayShiftValue: 0, nightShiftValue: 0, total: 0, unit: 'm³' },
            { id: 3, name: 'Уральская вода на технологию', dayShiftValue: 0, nightShiftValue: 0, total: 0, unit: 'm³' },
            { id: 4, name: 'Пром.вода в котельную', dayShiftValue: 0, nightShiftValue: 0, total: 0, unit: 'm³' },
            { id: 5, name: 'Пром. вода на ОС', dayShiftValue: 0, nightShiftValue: 0, total: 0, unit: 'm³' },
            { id: 6, name: 'ХПВ КДЦ', dayShiftValue: 0, nightShiftValue: 0, total: 0, unit: 'm³' },
            { id: 7, name: 'Насосная Урал', dayShiftValue: 0, nightShiftValue: 0, total: 0, unit: 'm³' },
            { id: 8, name: 'Артезианская вода', dayShiftValue: 0, nightShiftValue: 0, total: 0, unit: 'm³' },
            { id: 9, name: 'Бойлер ЦДЦ', dayShiftValue: 0, nightShiftValue: 0, total: 0, unit: 'm³' },
        ];

        nodes.forEach(node => {
            const seed = baseDate + node.id;
            const random = (seed * 9301 + 49297) % 233280 / 233280;
            const baseValue = 100 + Math.floor(random * 900);
            const dayValue = baseValue + Math.floor(random * 200);
            const nightValue = baseValue - Math.floor(random * 100);

            node.dayShiftValue = Math.max(50, dayValue);
            node.nightShiftValue = Math.max(30, nightValue);
            node.total = node.dayShiftValue + node.nightShiftValue;
        });

        const dayTotal = nodes.reduce((sum, node) => sum + node.dayShiftValue, 0);
        const nightTotal = nodes.reduce((sum, node) => sum + node.nightShiftValue, 0);
        const grandTotal = nodes.reduce((sum, node) => sum + node.total, 0);

        return {
            date,
            nodes,
            dayTotal,
            nightTotal,
            grandTotal
        };
    };

    // Генерация данных за период
    useEffect(() => {
        if (startDate && endDate) {
            const days = eachDayOfInterval({
                start: startDate,
                end: endDate
            }).reverse(); // Сортировка от новых к старым датам

            const data = days.map(day => generateDailyData(day));
            setReportData(data);
        }
    }, [startDate, endDate]);

    // Итоговые значения за период
    const periodDayTotal = reportData.reduce((sum, day) => sum + day.dayTotal, 0);
    const periodNightTotal = reportData.reduce((sum, day) => sum + day.nightTotal, 0);
    const periodGrandTotal = reportData.reduce((sum, day) => sum + day.grandTotal, 0);

    // Средние значения за период
    const daysCount = reportData.length;
    const avgDayTotal = daysCount > 0 ? periodDayTotal / daysCount : 0;
    const avgNightTotal = daysCount > 0 ? periodNightTotal / daysCount : 0;
    const avgGrandTotal = daysCount > 0 ? periodGrandTotal / daysCount : 0;

    // Форматирование даты
    const formatDate = (date: Date) => {
        return format(date, 'dd.MM.yyyy');
    };

    // Обработчик изменения даты
    const handleDateChange = (date: Date, type: 'start' | 'end') => {
        if (type === 'start') {
            if (date <= endDate) {
                setStartDate(date);
            } else {
                setStartDate(endDate);
                setEndDate(date);
            }
        } else {
            if (date >= startDate) {
                setEndDate(date);
            } else {
                setEndDate(startDate);
                setStartDate(date);
            }
        }
        setShowDatePicker(null);
    };

    return (
        <>
            <PageMeta
                title="Энергоучет - отчет по воде за период"
                description="Энергоучет - отчет по воде за период"
            />

            <PageBreadcrumb pageTitle="Энергоучет - отчет по воде за период" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
                <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mt-4">
                    {/* Header с выбором периода */}
                    <div className="bg-blue-600 dark:bg-blue-800 text-white dark:text-gray-100 p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="flex items-center mb-4 md:mb-0">
                                <FiDroplet className="text-2xl mr-3 text-white dark:text-gray-100" />
                                <h1 className="text-2xl font-bold text-white dark:text-gray-100">Отчет по узлам учета воды за период</h1>
                            </div>

                            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                                <div className="flex items-center bg-white/20 dark:bg-gray-900/30 px-4 py-2 rounded-lg text-white dark:text-gray-100 relative">
                                    <span className="mr-2">С:</span>
                                    <button
                                        onClick={() => setShowDatePicker('start')}
                                        className="flex items-center hover:bg-white/20 px-2 py-1 rounded transition-colors"
                                    >
                                        <FiCalendar className="mr-2 text-white dark:text-gray-100" />
                                        <span>{formatDate(startDate)}</span>
                                    </button>
                                    {showDatePicker === 'start' && (
                                        <div className="absolute top-full left-0 mt-2 z-10">
                                            <DatePicker
                                                selected={startDate}
                                                onChange={(date) => date && handleDateChange(date, 'start')}
                                                maxDate={endDate}
                                                inline
                                                locale="ru"
                                                className="border-0 shadow-lg rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center bg-white/20 dark:bg-gray-900/30 px-4 py-2 rounded-lg text-white dark:text-gray-100 relative">
                                    <span className="mr-2">По:</span>
                                    <button
                                        onClick={() => setShowDatePicker('end')}
                                        className="flex items-center hover:bg-white/20 px-2 py-1 rounded transition-colors"
                                    >
                                        <FiCalendar className="mr-2 text-white dark:text-gray-100" />
                                        <span>{formatDate(endDate)}</span>
                                    </button>
                                    {showDatePicker === 'end' && (
                                        <div className="absolute top-full left-0 mt-2 z-10">
                                            <DatePicker
                                                selected={endDate}
                                                onChange={(date) => date && handleDateChange(date, 'end')}
                                                minDate={startDate}
                                                maxDate={today}
                                                inline
                                                locale="ru"
                                                className="border-0 shadow-lg rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="flex space-x-2 mb-4 md:mb-0">
                                <button
                                    onClick={() => setActiveShift('day')}
                                    className={`flex items-center px-4 py-2 rounded-lg transition-all ${activeShift === 'day'
                                        ? 'bg-white text-blue-600 dark:bg-gray-100 dark:text-blue-800 shadow-md'
                                        : 'bg-white/30 dark:bg-gray-900/30 text-white dark:text-gray-100 hover:bg-white/40 dark:hover:bg-gray-900/40'
                                        }`}
                                >
                                    <FiSun className="mr-2" />
                                    Дневная смена
                                </button>
                                <button
                                    onClick={() => setActiveShift('night')}
                                    className={`flex items-center px-4 py-2 rounded-lg transition-all ${activeShift === 'night'
                                        ? 'bg-white text-blue-600 dark:bg-gray-100 dark:text-blue-800 shadow-md'
                                        : 'bg-white/30 dark:bg-gray-900/30 text-white dark:text-gray-100 hover:bg-white/40 dark:hover:bg-gray-900/40'
                                        }`}
                                >
                                    <FiMoon className="mr-2" />
                                    Ночная смена
                                </button>
                            </div>

                            <div className="bg-white/20 dark:bg-gray-900/30 px-4 py-2 rounded-lg text-white dark:text-gray-100">
                                <span className="mr-2">Всего за период:</span>
                                <span className="font-bold">{periodGrandTotal.toLocaleString('ru-RU')} m³</span>
                            </div>
                        </div>
                    </div>

                    {/* Таблица с данными */}
                    <div className="p-6">
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg">
                                            Дата
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Дневная смена
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Ночная смена
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg">
                                            Всего за сутки
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {reportData.map((dayData) => (
                                        <tr
                                            key={dayData.date.getTime()}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${isSameDay(dayData.date, today) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="text-sm font-medium">
                                                        {formatDate(dayData.date)}
                                                        {isSameDay(dayData.date, today) && (
                                                            <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs px-2 py-1 rounded">
                                                                Сегодня
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${activeShift === 'day'
                                                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                                                : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {dayData.dayTotal.toLocaleString('ru-RU')} m³
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${activeShift === 'night'
                                                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                                                : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {dayData.nightTotal.toLocaleString('ru-RU')} m³
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {dayData.grandTotal.toLocaleString('ru-RU')} m³
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium rounded-bl-lg">
                                            Итого за период
                                        </th>
                                        <td className="px-6 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                                            {periodDayTotal.toLocaleString('ru-RU')} m³
                                        </td>
                                        <td className="px-6 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                                            {periodNightTotal.toLocaleString('ru-RU')} m³
                                        </td>
                                        <td className="px-6 py-3 text-sm font-medium rounded-br-lg">
                                            {periodGrandTotal.toLocaleString('ru-RU')} m³
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium">
                                            Среднее за день
                                        </th>
                                        <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {avgDayTotal.toFixed(1).toLocaleString('ru-RU')} m³
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {avgNightTotal.toFixed(1).toLocaleString('ru-RU')} m³
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {avgGrandTotal.toFixed(1).toLocaleString('ru-RU')} m³
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Карточки с итогами */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-all">
                            <div className="flex items-center">
                                <FiSun className="text-blue-500 mr-3 text-xl" />
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Дневная смена (всего)</h3>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{periodDayTotal.toLocaleString('ru-RU')} m³</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Среднее: {avgDayTotal.toFixed(1).toLocaleString('ru-RU')} m³/день
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-indigo-500 hover:shadow-md transition-all">
                            <div className="flex items-center">
                                <FiMoon className="text-indigo-500 mr-3 text-xl" />
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ночная смена (всего)</h3>
                                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{periodNightTotal.toLocaleString('ru-RU')} m³</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Среднее: {avgNightTotal.toFixed(1).toLocaleString('ru-RU')} m³/день
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-all">
                            <div className="flex items-center">
                                <FiDroplet className="text-green-500 mr-3 text-xl" />
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Всего за период</h3>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{periodGrandTotal.toLocaleString('ru-RU')} m³</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Среднее: {avgGrandTotal.toFixed(1).toLocaleString('ru-RU')} m³/день
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Детализация по узлам учета (аккордеон) */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-600">
                        <h2 className="text-lg font-semibold mb-4">Детализация по узлам учета</h2>
                        <div className="space-y-4">
                            {reportData[0]?.nodes.map(node => (
                                <div key={node.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                        <h3 className="font-medium">{node.name}</h3>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Всего за период: {reportData.reduce((sum, day) => {
                                                const nodeData = day.nodes.find(n => n.id === node.id);
                                                return sum + (nodeData?.total || 0);
                                            }, 0).toLocaleString('ru-RU')} m³
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Дата
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        День
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Ночь
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Всего
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {reportData.map(day => {
                                                    const nodeData = day.nodes.find(n => n.id === node.id);
                                                    return (
                                                        <tr key={day.date.getTime()}>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {formatDate(day.date)}
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {nodeData?.dayShiftValue.toLocaleString('ru-RU')} m³
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {nodeData?.nightShiftValue.toLocaleString('ru-RU')} m³
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {nodeData?.total.toLocaleString('ru-RU')} m³
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WaterPeriodReport;