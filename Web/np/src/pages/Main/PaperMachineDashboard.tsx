import { useState, useEffect } from 'react';
import {
    FiActivity,
    FiTarget,
    FiAlertTriangle,
    FiTrendingUp,
    FiClock,
    FiBarChart2,
    FiPackage,
    FiZap,
    FiCalendar,
    FiChevronRight,
    FiSun,
    FiMoon,
    FiDatabase,
    FiPieChart,
    FiDroplet,
    FiPower,
    FiThermometer,
    FiPlay,
    FiPause,
    FiAlertCircle,
    FiSettings
} from 'react-icons/fi';

// Типы данных
interface MachineMetrics {
    status: 'running' | 'break' | 'unplanned_stop' | 'maintenance' | 'changeover';
    wireSpeed: number;
    windSpeed: number;
    targetWeight: number;
    actualWeight: number;
    maxSpeedForWeight: number;
    currentShiftBreaks: number;
    previousShiftBreaks: number;
    shiftPlan: number;
    shiftCompleted: number;
    monthlyPlan: number;
    monthlyCompleted: number;
    yearlyPlan: number;
    yearlyCompleted: number;
    monthlyDowntime: number;
    yearlyOperation: number;
    yearlyDowntime: number;
    efficiency: number;
    previousShiftEfficiency: number;
    previousShiftAvgSpeed: number;
    previousShiftPlan: number;
    previousShiftCompleted: number;
    resources: {
        water: number;
        electricity: number;
        steam: number;
    };
    previousShiftResources: {
        water: number;
        electricity: number;
        steam: number;
    };
    productType: string;
    previousShiftProductType: string;
}

interface MonthlyData {
    date: string;
    totalProduction: number;
    totalBreaks: number;
    avgEfficiency: number;
    avgQuality: number;
    downtime: number;
}

const PaperMachineDashboard = () => {
    const [activeShift, setActiveShift] = useState<'current' | 'previous'>('current');
    const [timeRange, setTimeRange] = useState<'shift' | 'month' | 'year' | 'custom'>('shift');
    const [currentMetrics, setCurrentMetrics] = useState<MachineMetrics>({
        status: 'running',
        wireSpeed: 580.6,
        windSpeed: 590.3,
        targetWeight: 125.0,
        actualWeight: 46.2,
        maxSpeedForWeight: 600.0,
        currentShiftBreaks: 3,
        previousShiftBreaks: 5,
        shiftPlan: 15000,
        shiftCompleted: 12345,
        monthlyPlan: 450000,
        monthlyCompleted: 345670,
        yearlyPlan: 4500000,
        yearlyCompleted: 3456700,
        monthlyDowntime: 12.5,
        yearlyOperation: 2876,
        yearlyDowntime: 124,
        efficiency: 87.5,
        previousShiftEfficiency: 85.2,
        previousShiftAvgSpeed: 124.8,
        previousShiftPlan: 14800,
        previousShiftCompleted: 14200,
        resources: {
            water: 12500,
            electricity: 2450,
            steam: 3200
        },
        previousShiftResources: {
            water: 11800,
            electricity: 2380,
            steam: 3050
        },
        productType: "125г/м² ширина 3800",
        previousShiftProductType: "125г/м² ширина 3800"
    });

    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

    // Генерация данных за месяц
    useEffect(() => {
        const generateMonthlyData = () => {
            const data: MonthlyData[] = [];
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();

            for (let i = 1; i <= currentDate.getDate(); i++) {
                const date = new Date(currentYear, currentMonth, i);
                data.push({
                    date: date.toISOString().slice(0, 10),
                    totalProduction: 12000 + Math.random() * 6000,
                    totalBreaks: Math.floor(Math.random() * 10),
                    avgEfficiency: 80 + Math.random() * 15,
                    avgQuality: 90 + Math.random() * 8,
                    downtime: Math.random() * 4
                });
            }
            return data;
        };

        setMonthlyData(generateMonthlyData());
    }, []);

    // Имитация обновления данных в реальном времени
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMetrics(prev => ({
                ...prev,
                wireSpeed: 580.6 + (Math.random() - 0.5) * 2,
                windSpeed: 595.3 + (Math.random() - 0.5) * 2,
                actualWeight: 125.0 + (Math.random() - 0.5) * 0.5,
                shiftCompleted: prev.shiftCompleted + Math.random() * 50,
                monthlyCompleted: prev.monthlyCompleted + Math.random() * 500,
                yearlyCompleted: prev.yearlyCompleted + Math.random() * 1000
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Компонент карточки метрики
    const MetricCard: React.FC<{
        title: string;
        value: string | number;
        unit: string;
        icon: React.ReactNode;
        status?: 'normal' | 'warning' | 'critical';
        trend?: 'up' | 'down' | 'neutral';
        subtitle?: string;
    }> = ({ title, value, unit, icon, status = 'normal', trend = 'neutral', subtitle }) => (
        <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 ${status === 'normal' ? 'border-green-500' :
            status === 'warning' ? 'border-yellow-500' :
                'border-red-500'
            } shadow-sm hover:shadow-md transition-all duration-200`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${status === 'normal' ? 'bg-green-100 dark:bg-green-900/30' :
                    status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        'bg-red-100 dark:bg-red-900/30'
                    }`}>
                    {icon}
                </div>
                {trend !== 'neutral' && (
                    <div className={`p-1 rounded ${trend === 'up' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                        <FiTrendingUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
                    </div>
                )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
            <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{unit}</span>
            </div>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>}
        </div>
    );

    // Статус машины
    const StatusIndicator: React.FC<{ status: MachineMetrics['status'] }> = ({ status }) => {
        const statusConfig = {
            running: { color: 'bg-green-500', text: 'В работе', icon: <FiPlay className="w-4 h-4" /> },
            break: { color: 'bg-red-500', text: 'Обрыв', icon: <FiAlertTriangle className="w-4 h-4" /> },
            unplanned_stop: { color: 'bg-red-500', text: 'Незап. останов', icon: <FiAlertCircle className="w-4 h-4" /> },
            maintenance: { color: 'bg-blue-500', text: 'Обслуживание', icon: <FiSettings className="w-4 h-4" /> },
            changeover: { color: 'bg-yellow-500', text: 'Смена продукции', icon: <FiPackage className="w-4 h-4" /> }
        };

        const config = statusConfig[status];

        return (
            <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{config.text}</span>
                {config.icon}
            </div>
        );
    };

    // Прогресс бар
    const ProgressBar: React.FC<{
        completed: number;
        total: number;
        title: string;
        subtitle: string;
    }> = ({ completed, total, title, subtitle }) => {
        const percentage = (completed / total) * 100;
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {percentage.toFixed(1)}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                    <div
                        className={`h-3 rounded-full ${percentage >= 90 ? 'bg-green-500' :
                            percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{completed.toLocaleString('ru-RU')} кг</span>
                    <span>{total.toLocaleString('ru-RU')} кг</span>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</div>
            </div>
        );
    };

    // Карточка сводки
    const SummaryCard: React.FC<{
        title: string;
        value: string;
        description: string;
        icon: React.ReactNode;
        color: string;
    }> = ({ title, value, description, icon, color }) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    {icon}
                </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <div className="max-w-7xl mx-auto p-6">
                {/* Заголовок */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center space-x-4 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Панель управления БДМ
                                </h1>
                                <StatusIndicator status={currentMetrics.status} />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                Бумагоделательная машина - Мониторинг в реальном времени
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                                Тип продукции: {currentMetrics.productType}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1">
                                {(['shift', 'month', 'year', 'custom'] as const).map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${timeRange === range
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                            }`}
                                    >
                                        {range === 'shift' ? 'Смена' :
                                            range === 'month' ? 'Месяц' :
                                                range === 'year' ? 'Год' : 'Период'}
                                    </button>
                                ))}
                            </div>
                            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                                <FiDatabase className="w-5 h-5 mr-2" />
                                <span>Исторические данные</span>
                                <FiChevronRight className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    </div>

                    {/* Переключение смен */}
                    <div className="flex space-x-4 mb-6">
                        <button
                            onClick={() => setActiveShift('current')}
                            className={`flex items-center px-6 py-3 rounded-xl transition-all ${activeShift === 'current'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 shadow-sm hover:shadow-md'
                                }`}
                        >
                            <FiSun className="w-5 h-5 mr-2" />
                            Текущая смена
                        </button>
                        <button
                            onClick={() => setActiveShift('previous')}
                            className={`flex items-center px-6 py-3 rounded-xl transition-all ${activeShift === 'previous'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 shadow-sm hover:shadow-md'
                                }`}
                        >
                            <FiMoon className="w-5 h-5 mr-2" />
                            Предыдущая смена
                        </button>
                    </div>
                </div>

                {/* Основные показатели в реальном времени */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        Основные показатели в реальном времени
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard
                            title="Скорость сетки"
                            value={currentMetrics.wireSpeed.toFixed(1)}
                            unit="м/мин"
                            icon={<FiZap className="w-6 h-6 text-green-600 dark:text-green-400" />}
                            trend="up"
                            subtitle={`Макс: ${currentMetrics.maxSpeedForWeight} м/мин`}
                        />
                        <MetricCard
                            title="Скорость наката"
                            value={currentMetrics.windSpeed.toFixed(1)}
                            unit="м/мин"
                            icon={<FiActivity className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                            trend="neutral"
                        />
                        <MetricCard
                            title="Заданный граммаж"
                            value={currentMetrics.targetWeight.toFixed(1)}
                            unit="г/м²"
                            icon={<FiTarget className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                            status="normal"
                        />
                        <MetricCard
                            title="Фактический граммаж"
                            value={currentMetrics.actualWeight.toFixed(1)}
                            unit="г/м²"
                            icon={<FiBarChart2 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />}
                            status={Math.abs(currentMetrics.actualWeight - currentMetrics.targetWeight) > 0.5 ? 'warning' : 'normal'}
                        />
                    </div>
                </div>

                {/* Показатели смены и эффективности */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 space-y-6">
                        <ProgressBar
                            completed={activeShift === 'current' ? currentMetrics.shiftCompleted : currentMetrics.previousShiftCompleted}
                            total={activeShift === 'current' ? currentMetrics.shiftPlan : currentMetrics.previousShiftPlan}
                            title={`Выполнение плана ${activeShift === 'current' ? 'текущей' : 'предыдущей'} смены`}
                            subtitle={`Обрывы: ${activeShift === 'current' ? currentMetrics.currentShiftBreaks : currentMetrics.previousShiftBreaks} шт`}
                        />

                        <div className="grid grid-cols-2 gap-6">
                            <MetricCard
                                title="Эффективность OEE"
                                value={`${activeShift === 'current' ? currentMetrics.efficiency.toFixed(1) : currentMetrics.previousShiftEfficiency.toFixed(1)}%`}
                                unit=""
                                icon={<FiTrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />}
                                status={
                                    (activeShift === 'current' ? currentMetrics.efficiency : currentMetrics.previousShiftEfficiency) > 85 ? 'normal' :
                                        (activeShift === 'current' ? currentMetrics.efficiency : currentMetrics.previousShiftEfficiency) > 75 ? 'warning' : 'critical'
                                }
                            />
                            <MetricCard
                                title="Средняя скорость"
                                value={`${activeShift === 'current' ? currentMetrics.wireSpeed.toFixed(1) : currentMetrics.previousShiftAvgSpeed.toFixed(1)}`}
                                unit="м/мин"
                                icon={<FiActivity className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                                status="normal"
                            />
                        </div>

                        {/* Ресурсы */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Затраченные ресурсы за {activeShift === 'current' ? 'текущую' : 'предыдущую'} смену
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <FiDroplet className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Вода</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            {activeShift === 'current' ? currentMetrics.resources.water : currentMetrics.previousShiftResources.water} м³
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <FiPower className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Электричество</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            {activeShift === 'current' ? currentMetrics.resources.electricity : currentMetrics.previousShiftResources.electricity} кВт·ч
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <FiThermometer className="w-8 h-8 text-red-600 dark:text-red-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Пар</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            {activeShift === 'current' ? currentMetrics.resources.steam : currentMetrics.previousShiftResources.steam} кг
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <ProgressBar
                            completed={currentMetrics.monthlyCompleted}
                            total={currentMetrics.monthlyPlan}
                            title="План на текущий месяц"
                            subtitle={`Прогноз выполнения: ~${((currentMetrics.monthlyCompleted / currentMetrics.monthlyPlan) * 100).toFixed(1)}%`}
                        />
                        <ProgressBar
                            completed={currentMetrics.yearlyCompleted}
                            total={currentMetrics.yearlyPlan}
                            title="Годовой план"
                            subtitle={`Наработка: ${currentMetrics.yearlyOperation} ч`}
                        />

                        {/* Информация о простое */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Простой БДМ</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Текущий месяц</p>
                                    <p className="text-xl font-bold text-red-600 dark:text-red-400">{currentMetrics.monthlyDowntime} ч</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Текущий год</p>
                                    <p className="text-xl font-bold text-red-600 dark:text-red-400">{currentMetrics.yearlyDowntime} ч</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Сводка за месяц */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        Сводка за текущий месяц
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <SummaryCard
                            title="Всего произведено"
                            value={`${(currentMetrics.monthlyCompleted / 1000).toFixed(0)} т`}
                            description="За текущий месяц"
                            icon={<FiPackage className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                            color="bg-blue-100 dark:bg-blue-900/30"
                        />
                        <SummaryCard
                            title="Общее время работы"
                            value={`${Math.round(currentMetrics.yearlyOperation / 30)} ч`}
                            description="Среднее в день"
                            icon={<FiClock className="w-6 h-6 text-green-600 dark:text-green-400" />}
                            color="bg-green-100 dark:bg-green-900/30"
                        />
                        <SummaryCard
                            title="Всего обрывов"
                            value={`${monthlyData.reduce((sum, day) => sum + day.totalBreaks, 0)} шт`}
                            description="За текущий месяц"
                            icon={<FiAlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />}
                            color="bg-yellow-100 dark:bg-yellow-900/30"
                        />
                        <SummaryCard
                            title="Средняя эффективность"
                            value={`${(monthlyData.reduce((sum, day) => sum + day.avgEfficiency, 0) / monthlyData.length).toFixed(1)}%`}
                            description="За текущий месяц"
                            icon={<FiPieChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                            color="bg-purple-100 dark:bg-purple-900/30"
                        />
                    </div>
                </div>

                {/* Детальная статистика за месяц */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Детальная статистика по дням
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Дата
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Производство, кг
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Обрывы
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Эффективность
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Качество
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Простой, ч
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {monthlyData.map((day, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {new Date(day.date).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {day.totalProduction.toLocaleString('ru-RU')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${day.totalBreaks > 8 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                day.totalBreaks > 4 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                }`}>
                                                {day.totalBreaks} шт
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                                    <div
                                                        className={`h-2 rounded-full ${day.avgEfficiency > 85 ? 'bg-green-500' :
                                                            day.avgEfficiency > 75 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${day.avgEfficiency}%` }}
                                                    ></div>
                                                </div>
                                                <span>{day.avgEfficiency.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                                    <div
                                                        className={`h-2 rounded-full ${day.avgQuality > 92 ? 'bg-green-500' :
                                                            day.avgQuality > 85 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${day.avgQuality}%` }}
                                                    ></div>
                                                </div>
                                                <span>{day.avgQuality.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                                            {day.downtime.toFixed(1)} ч
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaperMachineDashboard;