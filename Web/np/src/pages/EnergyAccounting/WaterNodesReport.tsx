import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiCalendar, FiDroplet, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import PageMeta from "../../components/common/PageMeta";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { registerLocale } from "react-datepicker";
import { ru } from 'date-fns/locale';

interface NodeData {
    id: number;
    name: string;
    dayShiftValue: number;
    nightShiftValue: number;
    total: number;
    unit: string;
}

// Регистрируем русскую локаль один раз (можно в корневом файле приложения)
registerLocale("ru", ru);

const WaterNodesReport = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Убираем время для точного сравнения дат
    const [currentDate, setCurrentDate] = useState<Date>(today);
    const [activeShift, setActiveShift] = useState<'day' | 'night'>('day');
    const [nodesData, setNodesData] = useState<NodeData[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Функция для генерации случайных данных
    const generateRandomData = (date: Date) => {
        const baseDate = date.getTime(); // Используем timestamp даты как seed для рандома
        const newNodes: NodeData[] = [
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

        // Генерация случайных значений на основе даты
        newNodes.forEach(node => {
            const seed = baseDate + node.id; // Уникальный seed для каждого узла
            const random = (seed * 9301 + 49297) % 233280 / 233280; // Простой псевдорандом

            // Генерация значений в разумных пределах для каждого узла
            const baseValue = 100 + Math.floor(random * 900); // Базовое значение от 100 до 1000
            const dayValue = baseValue + Math.floor(random * 200); // Дневное значение немного больше
            const nightValue = baseValue - Math.floor(random * 100); // Ночное значение немного меньше

            node.dayShiftValue = Math.max(50, dayValue); // Минимум 50
            node.nightShiftValue = Math.max(30, nightValue); // Минимум 30
            node.total = node.dayShiftValue + node.nightShiftValue;
        });

        return newNodes;
    };

    // При изменении даты генерируем новые данные
    useEffect(() => {
        setNodesData(generateRandomData(currentDate));
    }, [currentDate]);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ru-RU');
    };

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);

        // Проверяем, чтобы новая дата не была в будущем
        if (newDate <= today) {
            setCurrentDate(newDate);
        }
    };

    const handleDateChange = (date: Date) => {
        if (date <= today) {
            setCurrentDate(date);
        }
        setShowDatePicker(false);
    };

    // Расчет итоговых значений
    const totalDay = nodesData.reduce((sum, node) => sum + node.dayShiftValue, 0);
    const totalNight = nodesData.reduce((sum, node) => sum + node.nightShiftValue, 0);
    const grandTotal = nodesData.reduce((sum, node) => sum + node.total, 0);

    const maxDayValue = Math.max(...nodesData.map(n => n.dayShiftValue));
    const maxNightValue = Math.max(...nodesData.map(n => n.nightShiftValue));

    // Проверяем, является ли текущая дата сегодняшним днем
    const isToday = currentDate.toDateString() === today.toDateString();

    return (
        <>
            <PageMeta
                title="Энергоучет - сменный отчет по воде"
                description="Энергоучет - сменный отчет по воде"
            />

            <PageBreadcrumb pageTitle="Энергоучет - сменный отчет по воде" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
                <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mt-4">
                    {/* Header с навигацией по датам */}
                    <div className="bg-blue-600 dark:bg-blue-800 text-white dark:text-gray-100 p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="flex items-center mb-4 md:mb-0">
                                <FiDroplet className="text-2xl mr-3 text-white dark:text-gray-100" />
                                <h1 className="text-2xl font-bold text-white dark:text-gray-100">Отчет по узлам учета воды</h1>
                            </div>
                            <div className="flex items-center bg-white/20 dark:bg-gray-900/30 px-4 py-2 rounded-lg text-white dark:text-gray-100 relative">
                                <button
                                    onClick={() => changeDate(-1)}
                                    className="mr-2 hover:bg-white/20 p-1 rounded"
                                    aria-label="Предыдущий день"
                                >
                                    <FiChevronLeft className="text-xl" />
                                </button>

                                <button
                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                    className="flex items-center hover:bg-white/20 px-2 py-1 rounded transition-colors"
                                >
                                    <FiCalendar className="mr-2 text-white dark:text-gray-100" />
                                    <span>{formatDate(currentDate)}</span>
                                </button>

                                {showDatePicker && (
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10">
                                        <DatePicker
                                            selected={currentDate}
                                            onChange={handleDateChange}
                                            maxDate={today}
                                            inline
                                            locale="ru" // Устанавливаем русский язык
                                            dateFormat="dd.MM.yyyy" // Формат даты (день.месяц.год)
                                            className="border-0 shadow-lg rounded-lg"
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={() => changeDate(1)}
                                    className={`ml-2 hover:bg-white/20 p-1 rounded ${isToday ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isToday}
                                    aria-label="Следующий день"
                                >
                                    <FiChevronRight className="text-xl" />
                                </button>
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
                                    Дневная смена (08:00-20:00)
                                </button>
                                <button
                                    onClick={() => setActiveShift('night')}
                                    className={`flex items-center px-4 py-2 rounded-lg transition-all ${activeShift === 'night'
                                        ? 'bg-white text-blue-600 dark:bg-gray-100 dark:text-blue-800 shadow-md'
                                        : 'bg-white/30 dark:bg-gray-900/30 text-white dark:text-gray-100 hover:bg-white/40 dark:hover:bg-gray-900/40'
                                        }`}
                                >
                                    <FiMoon className="mr-2" />
                                    Ночная смена (20:00-08:00)
                                </button>
                            </div>

                            <div className="bg-white/20 dark:bg-gray-900/30 px-4 py-2 rounded-lg text-white dark:text-gray-100">
                                <span className="mr-2">Всего за сутки:</span>
                                <span className="font-bold">{grandTotal.toLocaleString('ru-RU')} m³</span>
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
                                            Узел учета
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
                                    {nodesData.map((node) => (
                                        <tr
                                            key={node.id}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${(activeShift === 'day' && node.dayShiftValue === maxDayValue) ||
                                                (activeShift === 'night' && node.nightShiftValue === maxNightValue)
                                                ? 'bg-blue-50 dark:bg-blue-900/30 font-semibold'
                                                : ''
                                                }`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="text-sm font-medium">{node.name}</div>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${activeShift === 'day'
                                                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                                                : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {node.dayShiftValue.toLocaleString('ru-RU')} {node.unit}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${activeShift === 'night'
                                                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                                                : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {node.nightShiftValue.toLocaleString('ru-RU')} {node.unit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {node.total.toLocaleString('ru-RU')} {node.unit}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium rounded-bl-lg">
                                            Итого
                                        </th>
                                        <td className="px-6 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                                            {totalDay.toLocaleString('ru-RU')} m³
                                        </td>
                                        <td className="px-6 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                                            {totalNight.toLocaleString('ru-RU')} m³
                                        </td>
                                        <td className="px-6 py-3 text-sm font-medium rounded-br-lg">
                                            {grandTotal.toLocaleString('ru-RU')} m³
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
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Дневная смена</h3>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalDay.toLocaleString('ru-RU')} m³</p>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded inline-block">
                                08:00 - 20:00
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-indigo-500 hover:shadow-md transition-all">
                            <div className="flex items-center">
                                <FiMoon className="text-indigo-500 mr-3 text-xl" />
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ночная смена</h3>
                                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalNight.toLocaleString('ru-RU')} m³</p>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded inline-block">
                                20:00 - 08:00
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-all">
                            <div className="flex items-center">
                                <FiDroplet className="text-green-500 mr-3 text-xl" />
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Всего за сутки</h3>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{grandTotal.toLocaleString('ru-RU')} m³</p>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded inline-block">
                                Суммарный расход
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WaterNodesReport;