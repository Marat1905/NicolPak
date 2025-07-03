import { useState, useEffect } from 'react';
import {
    FiSun, FiMoon, FiCalendar, FiThermometer,
    FiChevronLeft, FiChevronRight, FiClock, FiTrendingUp,
    FiX, FiEye, FiEyeOff
} from 'react-icons/fi';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { ru } from 'date-fns/locale';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';

interface BoilerData {
    id: number;
    name: string;
    instantFlow: number;
    total: number;
    dayTotal: number;
    monthTotal: number;
    steamTemp: number;
    steamPressure: number;
    dayGcal: number;
    prevMonthTotal: number;
    prevDayGcal: number;
    time: string;
}

interface DeaeratorData {
    level: number;
    rouPressure: number;
    time: string;
}

interface DrumLevels {
    boiler1: number;
    boiler2: number;
    boiler3: number;
    boiler4: number;
    time: string;
}

interface GasData {
    instantFlow: number;
    total: number;
    temperature: number;
    pressure: number;
    time: string;
}

interface TrendData {
    time: string;
    value: number;
    name?: string;
}

registerLocale("ru", ru);

const BoilerReport = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [currentDate, setCurrentDate] = useState<Date>(today);
    const [activeShift, setActiveShift] = useState<'day' | 'night'>('day');
    const [boilersData, setBoilersData] = useState<BoilerData[]>([]);
    const [deaeratorData, setDeaeratorData] = useState<DeaeratorData>({ level: 0, rouPressure: 0, time: '' });
    const [drumLevels, setDrumLevels] = useState<DrumLevels>({ boiler1: 0, boiler2: 0, boiler3: 0, boiler4: 0, time: '' });
    const [gasData, setGasData] = useState<GasData>({ instantFlow: 0, total: 0, temperature: 0, pressure: 0, time: '' });
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [showSteamFlowModal, setShowSteamFlowModal] = useState(false);
    const [showSteamTempModal, setShowSteamTempModal] = useState(false);
    const [showSteamPressureModal, setShowSteamPressureModal] = useState(false);
    const [showDrumLevelsModal, setShowDrumLevelsModal] = useState(false);
    const [showGasFlowModal, setShowGasFlowModal] = useState(false);
    const [showDeaeratorModal, setShowDeaeratorModal] = useState(false);

    const [steamFlowTrend, setSteamFlowTrend] = useState<TrendData[]>([]);
    const [steamTempTrend, setSteamTempTrend] = useState<TrendData[]>([]);
    const [steamPressureTrend, setSteamPressureTrend] = useState<TrendData[]>([]);
    const [drumLevelsTrend, setDrumLevelsTrend] = useState<{ time: string, boiler1: number, boiler2: number, boiler3: number, boiler4: number }[]>([]);
    const [gasFlowTrend, setGasFlowTrend] = useState<TrendData[]>([]);
    const [deaeratorTrend, setDeaeratorTrend] = useState<TrendData[]>([]);

    const [visibleTrends, setVisibleTrends] = useState({
        steamFlow: true,
        steamTemp: true,
        steamPressure: true,
        drumLevels: {
            boiler1: true,
            boiler2: true,
            boiler3: true,
            boiler4: true
        },
        gasFlow: true,
        deaerator: true
    });

    const toggleTrendVisibility = (trendName: string) => {
        setVisibleTrends(prev => ({
            ...prev,
            [trendName]: !prev[trendName as keyof typeof prev]
        } as typeof prev));
    };

    const toggleDrumLevelVisibility = (boilerNum: number) => {
        setVisibleTrends(prev => ({
            ...prev,
            drumLevels: {
                ...prev.drumLevels,
                [`boiler${boilerNum}`]: !prev.drumLevels[`boiler${boilerNum}` as keyof typeof prev.drumLevels]
            }
        }));
    };

    const generateBoilersData = (date: Date): BoilerData[] => {
        const baseDate = date.getTime();
        return [
            {
                id: 1,
                name: 'Котлоагрегат №1',
                instantFlow: 10 + Math.sin(baseDate / 1000000) * 5,
                total: 50000 + Math.sin(baseDate / 1000000) * 10000,
                dayTotal: 500 + Math.sin(baseDate / 1000000) * 100,
                monthTotal: 15000 + Math.sin(baseDate / 1000000) * 3000,
                steamTemp: 240 + Math.sin(baseDate / 1000000) * 20,
                steamPressure: 12 + Math.sin(baseDate / 1000000) * 2,
                dayGcal: 300 + Math.sin(baseDate / 1000000) * 50,
                prevMonthTotal: 14500 + Math.sin(baseDate / 1000000) * 2000,
                prevDayGcal: 290 + Math.sin(baseDate / 1000000) * 40,
                time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            },
            {
                id: 2,
                name: 'Котлоагрегат №2',
                instantFlow: 8 + Math.cos(baseDate / 1000000) * 4,
                total: 45000 + Math.cos(baseDate / 1000000) * 8000,
                dayTotal: 450 + Math.cos(baseDate / 1000000) * 90,
                monthTotal: 13500 + Math.cos(baseDate / 1000000) * 2700,
                steamTemp: 235 + Math.cos(baseDate / 1000000) * 15,
                steamPressure: 11 + Math.cos(baseDate / 1000000) * 1.5,
                dayGcal: 280 + Math.cos(baseDate / 1000000) * 45,
                prevMonthTotal: 14000 + Math.cos(baseDate / 1000000) * 1800,
                prevDayGcal: 270 + Math.cos(baseDate / 1000000) * 35,
                time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            },
            {
                id: 3,
                name: 'Котлоагрегат №3',
                instantFlow: 12 + Math.sin(baseDate / 1200000) * 6,
                total: 55000 + Math.sin(baseDate / 1200000) * 12000,
                dayTotal: 550 + Math.sin(baseDate / 1200000) * 110,
                monthTotal: 16500 + Math.sin(baseDate / 1200000) * 3300,
                steamTemp: 245 + Math.sin(baseDate / 1200000) * 25,
                steamPressure: 13 + Math.sin(baseDate / 1200000) * 2.5,
                dayGcal: 320 + Math.sin(baseDate / 1200000) * 60,
                prevMonthTotal: 16000 + Math.sin(baseDate / 1200000) * 2200,
                prevDayGcal: 310 + Math.sin(baseDate / 1200000) * 50,
                time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            },
            {
                id: 4,
                name: 'Котлоагрегат №4',
                instantFlow: 9 + Math.cos(baseDate / 1400000) * 5,
                total: 48000 + Math.cos(baseDate / 1400000) * 9000,
                dayTotal: 480 + Math.cos(baseDate / 1400000) * 95,
                monthTotal: 14400 + Math.cos(baseDate / 1400000) * 2800,
                steamTemp: 238 + Math.cos(baseDate / 1400000) * 18,
                steamPressure: 11.5 + Math.cos(baseDate / 1400000) * 1.8,
                dayGcal: 290 + Math.cos(baseDate / 1400000) * 48,
                prevMonthTotal: 14200 + Math.cos(baseDate / 1400000) * 1900,
                prevDayGcal: 280 + Math.cos(baseDate / 1400000) * 38,
                time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            },
            {
                id: 5,
                name: 'Общее по котлоагрегатам',
                instantFlow: 39 + Math.sin(baseDate / 1000000) * 20,
                total: 198000 + Math.sin(baseDate / 1000000) * 39000,
                dayTotal: 1980 + Math.sin(baseDate / 1000000) * 395,
                monthTotal: 59400 + Math.sin(baseDate / 1000000) * 11800,
                steamTemp: 239.5 + Math.sin(baseDate / 1000000) * 19.5,
                steamPressure: 11.875 + Math.sin(baseDate / 1000000) * 1.95,
                dayGcal: 1190 + Math.sin(baseDate / 1000000) * 203,
                prevMonthTotal: 58700 + Math.sin(baseDate / 1000000) * 7900,
                prevDayGcal: 1150 + Math.sin(baseDate / 1000000) * 163,
                time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            }
        ];
    };

    const generateTrendData = (baseValue: number, variation: number, count: number = 24): TrendData[] => {
        const now = new Date();
        return Array.from({ length: count }, (_, i) => {
            const time = new Date(now.getTime() - (count - i - 1) * 3600000);
            return {
                time: time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                value: baseValue + Math.sin(time.getTime() / 1000000) * variation
            };
        });
    };

    const generateDrumLevelsTrend = (count: number = 24) => {
        const now = new Date();
        return Array.from({ length: count }, (_, i) => {
            const time = new Date(now.getTime() - (count - i - 1) * 3600000);
            return {
                time: time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                boiler1: 50 + Math.sin(time.getTime() / 700000) * 15,
                boiler2: 55 + Math.cos(time.getTime() / 750000) * 18,
                boiler3: 52 + Math.sin(time.getTime() / 650000) * 16,
                boiler4: 53 + Math.cos(time.getTime() / 720000) * 17
            };
        });
    };

    useEffect(() => {
        const updateData = () => {
            const now = new Date();
            const newBoilersData = generateBoilersData(currentDate);
            const newDeaeratorData = {
                level: 50 + Math.sin(now.getTime() / 800000) * 20,
                rouPressure: 5 + Math.cos(now.getTime() / 900000) * 2,
                time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            };
            const newDrumLevels = {
                boiler1: 50 + Math.sin(now.getTime() / 700000) * 15,
                boiler2: 55 + Math.cos(now.getTime() / 750000) * 18,
                boiler3: 52 + Math.sin(now.getTime() / 650000) * 16,
                boiler4: 53 + Math.cos(now.getTime() / 720000) * 17,
                time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            };
            const newGasData = {
                instantFlow: 2000 + Math.sin(now.getTime() / 500000) * 500,
                total: 500000 + Math.sin(now.getTime() / 500000) * 100000,
                temperature: 15 + Math.cos(now.getTime() / 600000) * 10,
                pressure: 200 + Math.sin(now.getTime() / 550000) * 50,
                time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            };

            setBoilersData(newBoilersData);
            setDeaeratorData(newDeaeratorData);
            setDrumLevels(newDrumLevels);
            setGasData(newGasData);

            setSteamFlowTrend(generateTrendData(40, 15));
            setSteamTempTrend(generateTrendData(240, 20));
            setSteamPressureTrend(generateTrendData(12, 2));
            setDrumLevelsTrend(generateDrumLevelsTrend());
            setGasFlowTrend(generateTrendData(2000, 500));
            setDeaeratorTrend(generateTrendData(50, 15));
        };

        updateData();
        const interval = setInterval(updateData, 60000);

        return () => clearInterval(interval);
    }, [currentDate]);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ru-RU');
    };

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);

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

    const TrendModal = ({ title, onClose, children }: {
        title: string;
        onClose: () => void;
        children: React.ReactNode;
    }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <FiX size={24} />
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );

    const totalInstantFlow = boilersData.slice(0, 4).reduce((sum, boiler) => sum + boiler.instantFlow, 0);
    const totalDayTotal = boilersData.slice(0, 4).reduce((sum, boiler) => sum + boiler.dayTotal, 0);
    const totalDayGcal = boilersData.slice(0, 4).reduce((sum, boiler) => sum + boiler.dayGcal, 0);

    const isToday = currentDate.toDateString() === today.toDateString();

    return (
        <>
            <PageMeta
                title="Энергоучет - отчет по котельной"
                description="Энергоучет - отчет по котельной"
            />

            <PageBreadcrumb pageTitle="Энергоучет - отчет по котельной" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
                <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mt-4">
                    <div className="bg-blue-600 dark:bg-blue-800 text-white dark:text-gray-100 p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="flex items-center mb-4 md:mb-0">
                                <FiThermometer className="text-2xl mr-3 text-white dark:text-gray-100" />
                                <h1 className="text-2xl font-bold text-white dark:text-gray-100">Отчет по котельной</h1>
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
                                            locale="ru"
                                            dateFormat="dd.MM.yyyy"
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
                                <span className="font-bold">{totalDayTotal.toFixed(1)} Тн</span>
                                <span className="mx-2">|</span>
                                <span className="font-bold">{totalDayGcal.toFixed(1)} Гкалл</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => setShowSteamFlowModal(true)}
                                className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
                            >
                                <FiTrendingUp className="text-blue-500 text-3xl mb-2" />
                                <span className="font-medium">Тренд расхода пара</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Суммарный (Тн/ч)</span>
                            </button>

                            <button
                                onClick={() => setShowSteamTempModal(true)}
                                className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
                            >
                                <FiTrendingUp className="text-red-500 text-3xl mb-2" />
                                <span className="font-medium">Тренд температуры</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Средняя (°C)</span>
                            </button>

                            <button
                                onClick={() => setShowSteamPressureModal(true)}
                                className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
                            >
                                <FiTrendingUp className="text-green-500 text-3xl mb-2" />
                                <span className="font-medium">Тренд давления</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Среднее (кгс/см²)</span>
                            </button>

                            <button
                                onClick={() => setShowDrumLevelsModal(true)}
                                className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
                            >
                                <FiTrendingUp className="text-purple-500 text-3xl mb-2" />
                                <span className="font-medium">Тренд уровней</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">В барабанах (%)</span>
                            </button>

                            <button
                                onClick={() => setShowGasFlowModal(true)}
                                className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
                            >
                                <FiTrendingUp className="text-amber-500 text-3xl mb-2" />
                                <span className="font-medium">Тренд расхода газа</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">(м³/ч)</span>
                            </button>

                            <button
                                onClick={() => setShowDeaeratorModal(true)}
                                className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
                            >
                                <FiTrendingUp className="text-cyan-500 text-3xl mb-2" />
                                <span className="font-medium">Тренд деаэратора</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Уровень (%)</span>
                            </button>
                        </div>

                        {/* Таблица котлоагрегатов */}
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th rowSpan={2} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg">
                                            Котлоагрегат
                                        </th>
                                        <th colSpan={9} className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Параметры работы
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Мгнов. расход (Тн/ч)
                                        </th>
                                        <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Общий (Тн)
                                        </th>
                                        <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Тек. сутки (Тн)
                                        </th>
                                        <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Тек. месяц (Тн)
                                        </th>
                                        <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Темп. пара (°C)
                                        </th>
                                        <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Давл. пара (кгс/см²)
                                        </th>
                                        <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Тек. сутки (Гкалл)
                                        </th>
                                        <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Пред. месяц (Тн)
                                        </th>
                                        <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg">
                                            Время
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {boilersData.map((boiler) => (
                                        <tr key={boiler.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {boiler.name}
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap text-sm">
                                                {boiler.instantFlow.toFixed(2)}
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap text-sm">
                                                {boiler.total.toFixed(1)}
                                            </td>
                                            <td className={`px-2 py-4 whitespace-nowrap text-sm ${activeShift === 'day' ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}>
                                                {boiler.dayTotal.toFixed(1)}
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap text-sm">
                                                {boiler.monthTotal.toFixed(1)}
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap text-sm">
                                                {boiler.steamTemp.toFixed(1)}
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap text-sm">
                                                {boiler.steamPressure.toFixed(2)}
                                            </td>
                                            <td className={`px-2 py-4 whitespace-nowrap text-sm ${activeShift === 'day' ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}>
                                                {boiler.dayGcal.toFixed(1)}
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap text-sm">
                                                {boiler.prevMonthTotal.toFixed(1)}
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap text-sm">
                                                {boiler.time}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Таблицы деаэратора, уровней в барабанах и газа */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Деаэратор */}
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th colSpan={3} className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Деаэратор и РОУ
                                            </th>
                                        </tr>
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg">
                                                Уровень (%)
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Давление РОУ (кгс/см²)
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg">
                                                Время
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800">
                                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {deaeratorData.level.toFixed(1)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {deaeratorData.rouPressure.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {deaeratorData.time}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Уровни в барабанах */}
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th colSpan={5} className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Уровни в барабанах котлоагрегатов (%)
                                            </th>
                                        </tr>
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg">
                                                КА №1
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                КА №2
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                КА №3
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                КА №4
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg">
                                                Время
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800">
                                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {drumLevels.boiler1.toFixed(1)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {drumLevels.boiler2.toFixed(1)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {drumLevels.boiler3.toFixed(1)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {drumLevels.boiler4.toFixed(1)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {drumLevels.time}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Таблица расхода газа */}
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th colSpan={5} className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Расход газа
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg">
                                            Мгнов. расход (м³/ч)
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Общий (м³)
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Температура (°C)
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Давление (кПа)
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg">
                                            Время
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800">
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {gasData.instantFlow.toFixed(1)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {gasData.total.toFixed(1)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {gasData.temperature.toFixed(1)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {gasData.pressure.toFixed(1)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {gasData.time}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Карточки с итогами */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-all">
                                <div className="flex items-center">
                                    <FiThermometer className="text-blue-500 mr-3 text-xl" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Суммарный расход пара</h3>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalInstantFlow.toFixed(1)} Тн/ч</p>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded inline-block">
                                    {activeShift === 'day' ? 'Дневная смена' : 'Ночная смена'}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-all">
                                <div className="flex items-center">
                                    <FiThermometer className="text-green-500 mr-3 text-xl" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Выработка пара за сутки</h3>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalDayTotal.toFixed(1)} Тн</p>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded inline-block">
                                    {activeShift === 'day' ? 'Дневная смена' : 'Ночная смена'}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-all">
                                <div className="flex items-center">
                                    <FiThermometer className="text-orange-500 mr-3 text-xl" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Выработка тепла за сутки</h3>
                                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalDayGcal.toFixed(1)} Гкалл</p>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded inline-block">
                                    {activeShift === 'day' ? 'Дневная смена' : 'Ночная смена'}
                                </div>
                            </div>
                        </div>

                        {/* Модальные окна с трендами */}
                        {showSteamFlowModal && (
                            <TrendModal
                                title="Тренд расхода пара (суммарный)"
                                onClose={() => setShowSteamFlowModal(false)}
                            >
                                <div className="flex justify-end mb-2">
                                    <button
                                        onClick={() => toggleTrendVisibility('steamFlow')}
                                        className={`flex items-center px-3 py-1 rounded-md text-sm ${visibleTrends.steamFlow ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700'}`}
                                    >
                                        {visibleTrends.steamFlow ? (
                                            <>
                                                <FiEyeOff className="mr-1" />
                                                Скрыть тренд
                                            </>
                                        ) : (
                                            <>
                                                <FiEye className="mr-1" />
                                                Показать тренд
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={steamFlowTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                            <XAxis dataKey="time" />
                                            <YAxis label={{ value: 'Тн/ч', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip />
                                            {visibleTrends.steamFlow && (
                                                <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#93c5fd" />
                                            )}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </TrendModal>
                        )}

                        {showSteamTempModal && (
                            <TrendModal
                                title="Тренд температуры пара (средняя)"
                                onClose={() => setShowSteamTempModal(false)}
                            >
                                <div className="flex justify-end mb-2">
                                    <button
                                        onClick={() => toggleTrendVisibility('steamTemp')}
                                        className={`flex items-center px-3 py-1 rounded-md text-sm ${visibleTrends.steamTemp ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-700'}`}
                                    >
                                        {visibleTrends.steamTemp ? (
                                            <>
                                                <FiEyeOff className="mr-1" />
                                                Скрыть тренд
                                            </>
                                        ) : (
                                            <>
                                                <FiEye className="mr-1" />
                                                Показать тренд
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={steamTempTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                            <XAxis dataKey="time" />
                                            <YAxis label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip />
                                            {visibleTrends.steamTemp && (
                                                <Line type="monotone" dataKey="value" stroke="#ef4444" />
                                            )}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </TrendModal>
                        )}

                        {showSteamPressureModal && (
                            <TrendModal
                                title="Тренд давления пара (среднее)"
                                onClose={() => setShowSteamPressureModal(false)}
                            >
                                <div className="flex justify-end mb-2">
                                    <button
                                        onClick={() => toggleTrendVisibility('steamPressure')}
                                        className={`flex items-center px-3 py-1 rounded-md text-sm ${visibleTrends.steamPressure ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700'}`}
                                    >
                                        {visibleTrends.steamPressure ? (
                                            <>
                                                <FiEyeOff className="mr-1" />
                                                Скрыть тренд
                                            </>
                                        ) : (
                                            <>
                                                <FiEye className="mr-1" />
                                                Показать тренд
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={steamPressureTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                            <XAxis dataKey="time" />
                                            <YAxis label={{ value: 'кгс/см²', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip />
                                            {visibleTrends.steamPressure && (
                                                <Line type="monotone" dataKey="value" stroke="#10b981" />
                                            )}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </TrendModal>
                        )}

                        {showDrumLevelsModal && (
                            <TrendModal
                                title="Тренд уровней в барабанах"
                                onClose={() => setShowDrumLevelsModal(false)}
                            >
                                <div className="flex flex-wrap justify-end gap-2 mb-2">
                                    {[1, 2, 3, 4].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => toggleDrumLevelVisibility(num)}
                                            className={`flex items-center px-3 py-1 rounded-md text-sm ${visibleTrends.drumLevels[`boiler${num}` as keyof typeof visibleTrends.drumLevels]
                                                    ? `bg-${['purple', 'pink', 'teal', 'yellow'][num - 1]}-100 text-${['purple', 'pink', 'teal', 'yellow'][num - 1]}-800 dark:bg-${['purple', 'pink', 'teal', 'yellow'][num - 1]}-900/20 dark:text-${['purple', 'pink', 'teal', 'yellow'][num - 1]}-300`
                                                    : 'bg-gray-100 dark:bg-gray-700'
                                                }`}
                                        >
                                            {visibleTrends.drumLevels[`boiler${num}` as keyof typeof visibleTrends.drumLevels] ? (
                                                <>
                                                    <FiEyeOff className="mr-1" />
                                                    КА №{num}
                                                </>
                                            ) : (
                                                <>
                                                    <FiEye className="mr-1" />
                                                    КА №{num}
                                                </>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={drumLevelsTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                            <XAxis dataKey="time" />
                                            <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip />
                                            <Legend />
                                            {visibleTrends.drumLevels.boiler1 && (
                                                <Line type="monotone" dataKey="boiler1" stroke="#8b5cf6" name="КА №1" />
                                            )}
                                            {visibleTrends.drumLevels.boiler2 && (
                                                <Line type="monotone" dataKey="boiler2" stroke="#ec4899" name="КА №2" />
                                            )}
                                            {visibleTrends.drumLevels.boiler3 && (
                                                <Line type="monotone" dataKey="boiler3" stroke="#14b8a6" name="КА №3" />
                                            )}
                                            {visibleTrends.drumLevels.boiler4 && (
                                                <Line type="monotone" dataKey="boiler4" stroke="#f59e0b" name="КА №4" />
                                            )}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </TrendModal>
                        )}

                        {showGasFlowModal && (
                            <TrendModal
                                title="Тренд расхода газа"
                                onClose={() => setShowGasFlowModal(false)}
                            >
                                <div className="flex justify-end mb-2">
                                    <button
                                        onClick={() => toggleTrendVisibility('gasFlow')}
                                        className={`flex items-center px-3 py-1 rounded-md text-sm ${visibleTrends.gasFlow ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700'}`}
                                    >
                                        {visibleTrends.gasFlow ? (
                                            <>
                                                <FiEyeOff className="mr-1" />
                                                Скрыть тренд
                                            </>
                                        ) : (
                                            <>
                                                <FiEye className="mr-1" />
                                                Показать тренд
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={gasFlowTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                            <XAxis dataKey="time" />
                                            <YAxis label={{ value: 'м³/ч', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip />
                                            {visibleTrends.gasFlow && (
                                                <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="#fde68a" />
                                            )}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </TrendModal>
                        )}

                        {showDeaeratorModal && (
                            <TrendModal
                                title="Тренд уровня в деаэраторе"
                                onClose={() => setShowDeaeratorModal(false)}
                            >
                                <div className="flex justify-end mb-2">
                                    <button
                                        onClick={() => toggleTrendVisibility('deaerator')}
                                        className={`flex items-center px-3 py-1 rounded-md text-sm ${visibleTrends.deaerator ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300' : 'bg-gray-100 dark:bg-gray-700'}`}
                                    >
                                        {visibleTrends.deaerator ? (
                                            <>
                                                <FiEyeOff className="mr-1" />
                                                Скрыть тренд
                                            </>
                                        ) : (
                                            <>
                                                <FiEye className="mr-1" />
                                                Показать тренд
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={deaeratorTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                            <XAxis dataKey="time" />
                                            <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip />
                                            {visibleTrends.deaerator && (
                                                <Line type="monotone" dataKey="value" stroke="#06b6d4" />
                                            )}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </TrendModal>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default BoilerReport;