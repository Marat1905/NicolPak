import { useState, useEffect, useId } from 'react';
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
    FiSettings,
    FiArrowUp,
    FiArrowDown,
    FiCheck,
    FiX,
    FiEye,
    FiBarChart,
    FiCpu,
    FiDownload,
    FiBell,
    FiFilter,
    FiRefreshCw,
    FiGrid,
    FiList,
    FiMaximize2,
    FiMinimize2,
    FiUser,
    FiHome
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
    availability: number;
    performance: number;
    quality: number;
    previousShiftAvailability: number;
    previousShiftPerformance: number;
    previousShiftQuality: number;
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
    shiftStartTime: string;
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
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
    const [fullscreenCard, setFullscreenCard] = useState<string | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'reports'>('overview');

    const [filters, setFilters] = useState({
        productType: 'all',
        efficiencyRange: [0, 100],
    });

    const [notifications, setNotifications] = useState([
        { id: 1, type: 'warning', message: 'Скорость сетки превышает норму', time: '2 мин назад', read: false },
        { id: 2, type: 'info', message: 'Запланировано обслуживание', time: '1 час назад', read: true },
        { id: 3, type: 'error', message: 'Обрыв бумажного полотна', time: '5 мин назад', read: false },
    ]);

    const [currentMetrics, setCurrentMetrics] = useState<MachineMetrics>({
        status: 'running',
        wireSpeed: 580.6,
        windSpeed: 590.3,
        targetWeight: 125.0,
        actualWeight: 124.8,
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
        previousShiftAvgSpeed: 575.8,
        previousShiftPlan: 14800,
        previousShiftCompleted: 14200,
        availability: 94.2,
        performance: 92.8,
        quality: 98.5,
        previousShiftAvailability: 93.0,
        previousShiftPerformance: 90.7,
        previousShiftQuality: 97.7,
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
        previousShiftProductType: "125г/м² ширина 3800",
        shiftStartTime: new Date().toISOString().slice(0, 10) + 'T08:00:00'
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

    // Функции для интерактивности
    const toggleCard = (cardId: string) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cardId)) {
                newSet.delete(cardId);
            } else {
                newSet.add(cardId);
            }
            return newSet;
        });
    };

    const toggleFullscreen = (cardId: string) => {
        setFullscreenCard(fullscreenCard === cardId ? null : cardId);
    };

    const refreshData = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
    };

    const markNotificationAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const clearAllNotifications = () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    };

    // Анимированный круговой индикатор с градиентом
    const CircularProgress: React.FC<{
        value: number;
        max: number;
        size?: number;
        strokeWidth?: number;
        label: string;
        unit: string;
        gradient?: { from: string; to: string };
    }> = ({ value, max, size = 100, strokeWidth = 8, label, unit, gradient }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const progress = (value / max) * circumference;
        const percentage = (value / max) * 100;
        const gradientId = useId();

        const getColor = (percent: number) => {
            if (gradient) return `url(#${gradientId})`;
            if (percent >= 90) return '#10B981';
            if (percent >= 70) return '#F59E0B';
            return '#EF4444';
        };

        const progressColor = getColor(percentage);

        return (
            <div className="flex flex-col items-center group">
                <div className="relative" style={{ width: size, height: size }}>
                    <svg width={size} height={size} className="transform -rotate-90">
                        {gradient && (
                            <defs>
                                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor={gradient.from} />
                                    <stop offset="100%" stopColor={gradient.to} />
                                </linearGradient>
                            </defs>
                        )}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            fill="none"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={progressColor}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - progress}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out group-hover:stroke-width-[12px]"
                            style={{
                                filter: `drop-shadow(0 0 8px ${gradient ? '#3b82f640' : progressColor + '40'})`
                            }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {value.toFixed(0)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{unit}</span>
                    </div>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{label}</span>
            </div>
        );
    };

    // Интерактивный статус машины
    const StatusIndicator: React.FC<{ status: MachineMetrics['status'] }> = ({ status }) => {
        const statusConfig = {
            running: {
                color: 'bg-gradient-to-r from-green-500 to-emerald-500',
                text: 'В работе',
                icon: <FiPlay className="w-4 h-4" />,
                bgColor: 'bg-green-500/20',
                textColor: 'text-green-600 dark:text-green-400',
                pulse: 'animate-pulse'
            },
            break: {
                color: 'bg-gradient-to-r from-red-500 to-rose-500',
                text: 'Обрыв',
                icon: <FiAlertTriangle className="w-4 h-4" />,
                bgColor: 'bg-red-500/20',
                textColor: 'text-red-600 dark:text-red-400',
                pulse: 'animate-pulse'
            },
            unplanned_stop: {
                color: 'bg-gradient-to-r from-red-500 to-rose-500',
                text: 'Незап. останов',
                icon: <FiAlertCircle className="w-4 h-4" />,
                bgColor: 'bg-red-500/20',
                textColor: 'text-red-600 dark:text-red-400',
                pulse: ''
            },
            maintenance: {
                color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
                text: 'Обслуживание',
                icon: <FiSettings className="w-4 h-4" />,
                bgColor: 'bg-blue-500/20',
                textColor: 'text-blue-600 dark:text-blue-400',
                pulse: ''
            },
            changeover: {
                color: 'bg-gradient-to-r from-amber-500 to-yellow-500',
                text: 'Смена продукции',
                icon: <FiPackage className="w-4 h-4" />,
                bgColor: 'bg-yellow-500/20',
                textColor: 'text-yellow-600 dark:text-yellow-400',
                pulse: ''
            }
        };

        const config = statusConfig[status];

        return (
            <div className={`flex items-center space-x-2 px-4 py-3 rounded-xl ${config.bgColor} ${config.textColor} font-medium backdrop-blur-sm border ${config.textColor.replace('text', 'border')} border-opacity-30 transition-all duration-300 hover:scale-105 cursor-pointer group hover:shadow-lg`}>
                <div className={`w-3 h-3 rounded-full ${config.color} ${config.pulse} group-hover:scale-150 transition-transform`}></div>
                <span className="text-sm font-semibold">{config.text}</span>
                {config.icon}
            </div>
        );
    };

    // Интерактивный индикатор тренда
    const TrendIndicator: React.FC<{ current: number; previous: number; unit?: string }> = ({
        current,
        previous,
        unit = ''
    }) => {
        const trend = current - previous;
        const isPositive = trend > 0;
        const percentage = previous > 0 ? (Math.abs(trend) / previous) * 100 : 0;

        return (
            <div className={`flex items-center text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 cursor-pointer ${isPositive
                ? 'text-green-600 dark:text-green-400 bg-green-500/20 hover:bg-green-500/30 hover:shadow-lg'
                : 'text-red-600 dark:text-red-400 bg-red-500/20 hover:bg-red-500/30 hover:shadow-lg'
                }`}>
                {isPositive ? <FiArrowUp className="w-3 h-3 mr-1" /> : <FiArrowDown className="w-3 h-3 mr-1" />}
                <span>{Math.abs(trend).toFixed(1)}{unit} ({percentage.toFixed(1)}%)</span>
            </div>
        );
    };

    // Красивая карточка параметра с интерактивностью
    const BeautifulParameterCard: React.FC<{
        title: string;
        value: number;
        unit: string;
        target: number;
        icon: React.ReactNode;
        previousValue?: number;
        cardId: string;
        gradient: string;
    }> = ({ title, value, unit, target, icon, previousValue, cardId, gradient }) => {
        const deviation = ((value - target) / target) * 100;
        const status = Math.abs(deviation) < 1 ? 'normal' : Math.abs(deviation) < 3 ? 'warning' : 'critical';
        const isExpanded = expandedCards.has(cardId);

        const statusColors = {
            normal: 'from-green-500 to-emerald-500',
            warning: 'from-amber-500 to-yellow-500',
            critical: 'from-red-500 to-rose-500'
        };

        return (
            <div
                className={`bg-white/80 dark:bg-gray-800/80 rounded-2xl p-5 border border-gray-200/80 dark:border-gray-700/80 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group backdrop-blur-sm hover:scale-105 hover:border-blue-300/50 dark:hover:border-blue-600/50 ${isExpanded ? 'ring-2 ring-blue-500/20' : ''}`}
                onClick={() => toggleCard(cardId)}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} text-white group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">Цель: {target} {unit}</p>
                        </div>
                    </div>
                    <div className={`text-xs font-medium px-3 py-1 rounded-full transition-all duration-300 hover:scale-110 ${Math.abs(deviation) < 1 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200' :
                        Math.abs(deviation) < 3 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200'
                        }`}>
                        {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
                    </div>
                </div>

                <div className="flex items-baseline justify-between mb-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all">
                        {value.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{unit}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3 overflow-hidden group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors">
                    <div
                        className={`h-2 rounded-full bg-gradient-to-r ${statusColors[status]} transition-all duration-1000 ease-out group-hover:shadow-lg`}
                        style={{
                            width: `${Math.min((value / target) * 100, 100)}%`
                        }}
                    ></div>
                </div>

                {previousValue !== undefined && (
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                            Пред. смена: {previousValue.toFixed(1)} {unit}
                        </span>
                        <TrendIndicator current={value} previous={previousValue} unit={unit} />
                    </div>
                )}
            </div>
        );
    };

    // Карточка выполнения плана смены с интерактивностью
    const PlanProgressCard: React.FC<{
        title: string;
        completed: number;
        total: number;
        unit: string;
        gradient: string;
        icon: React.ReactNode;
        timeText: string;
        breaks?: number;
        previousBreaks?: number;
        shiftStartTime?: string;
        currentShiftBreaks?: number;
    }> = ({ title, completed, total, unit, gradient, icon, timeText, breaks, previousBreaks, shiftStartTime, currentShiftBreaks }) => {
        const percentage = (completed / total) * 100;

        const calculateTimeMetrics = () => {
            if (!shiftStartTime) return null;

            const now = new Date();
            const startTime = new Date(shiftStartTime);
            const totalShiftTime = (now.getTime() - startTime.getTime()) / (1000 * 60);

            const breakTimePerIncident = 5;
            const totalBreakTime = (currentShiftBreaks || 0) * breakTimePerIncident;

            const uptime = totalShiftTime - totalBreakTime;

            return {
                totalShiftTime: Math.max(0, totalShiftTime),
                totalBreakTime: Math.max(0, totalBreakTime),
                uptime: Math.max(0, uptime)
            };
        };

        const timeMetrics = calculateTimeMetrics();

        const formatTime = (minutes: number) => {
            const hours = Math.floor(minutes / 60);
            const mins = Math.round(minutes % 60);
            return `${hours}ч ${mins}м`;
        };

        return (
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-lg hover:shadow-2xl transition-all duration-300 group backdrop-blur-sm hover:scale-105 hover:border-blue-300/50 dark:hover:border-blue-600/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} text-white group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{timeText}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all">
                            {percentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">Выполнено</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                            Выполнено: {completed.toLocaleString('ru-RU')} {unit}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                            План: {total.toLocaleString('ru-RU')} {unit}
                        </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors">
                        <div
                            className={`h-3 rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out relative group-hover:shadow-lg`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>

                    {breaks !== undefined && (
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                                <FiAlertTriangle className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Обрывы за смену:</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`text-sm font-bold ${breaks > 5 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                    {breaks} шт
                                </span>
                                {previousBreaks !== undefined && (
                                    <TrendIndicator current={breaks} previous={previousBreaks} unit="шт" />
                                )}
                            </div>
                        </div>
                    )}

                    {timeMetrics && (
                        <>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-2">
                                    <FiClock className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Время на обрывы:</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                        {formatTime(timeMetrics.totalBreakTime)}
                                    </span>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        ({currentShiftBreaks} × 5м)
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-2">
                                    <FiActivity className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Работа без обрыва:</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                        {formatTime(timeMetrics.uptime)}
                                    </span>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        ({((timeMetrics.uptime / timeMetrics.totalShiftTime) * 100).toFixed(1)}%)
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-2">
                                    <FiClock className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Всего времени:</span>
                                </div>
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                    {formatTime(timeMetrics.totalShiftTime)}
                                </span>
                            </div>
                        </>
                    )}

                    <div className="flex justify-between text-xs">
                        <span className="text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                            Осталось: {Math.max(total - completed, 0).toLocaleString('ru-RU')} {unit}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                            {completed.toLocaleString('ru-RU')} / {total.toLocaleString('ru-RU')} {unit}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto p-6">
                {/* Улучшенный Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="relative group">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                                    <FiCpu className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse group-hover:scale-150 transition-transform"></div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all">
                                    Учалы БДМ
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 flex items-center group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse group-hover:scale-150 transition-transform"></span>
                                    Бумагоделательная машина • Режим реального времени
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Навигация по вкладкам */}
                            <div className="flex bg-white/80 dark:bg-gray-800/80 rounded-xl p-1 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                                {[
                                    { id: 'overview', label: 'Обзор', icon: FiHome },
                                    { id: 'analytics', label: 'Аналитика', icon: FiBarChart },
                                    { id: 'reports', label: 'Отчеты', icon: FiDatabase }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm hover:from-blue-700 hover:to-purple-700'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4 mr-2" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Управление интерфейсом */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={refreshData}
                                    className={`p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-300 dark:hover:border-blue-600 ${isLoading ? 'animate-spin' : ''
                                        }`}
                                >
                                    <FiRefreshCw className="w-5 h-5 text-blue-600" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Статус и переключение смен */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <StatusIndicator status={currentMetrics.status} />
                            <div className="bg-white/80 dark:bg-gray-800/80 px-4 py-3 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105 hover:border-blue-300 dark:hover:border-blue-600">
                                <div className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Текущая продукция</div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {currentMetrics.productType}
                                    <FiChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setActiveShift('current')}
                                className={`flex items-center px-5 py-3 rounded-xl transition-all duration-300 font-medium hover:scale-105 ${activeShift === 'current'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700'
                                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 shadow-sm hover:shadow-md backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                            >
                                <FiSun className="w-5 h-5 mr-2" />
                                Текущая смена
                            </button>
                            <button
                                onClick={() => setActiveShift('previous')}
                                className={`flex items-center px-5 py-3 rounded-xl transition-all duration-300 font-medium hover:scale-105 ${activeShift === 'previous'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700'
                                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 shadow-sm hover:shadow-md backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                            >
                                <FiMoon className="w-5 h-5 mr-2" />
                                Предыдущая
                            </button>
                        </div>
                    </div>
                </div>

                {/* Основные показатели производительности */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    <BeautifulParameterCard
                        title="Скорость сетки"
                        value={currentMetrics.wireSpeed}
                        unit="м/мин"
                        target={580}
                        icon={<FiZap className="w-5 h-5" />}
                        previousValue={currentMetrics.previousShiftAvgSpeed}
                        cardId="wireSpeed"
                        gradient="from-blue-500 to-cyan-500"
                    />
                    <BeautifulParameterCard
                        title="Скорость наката"
                        value={currentMetrics.windSpeed}
                        unit="м/мин"
                        target={590}
                        icon={<FiActivity className="w-5 h-5" />}
                        previousValue={585.2}
                        cardId="windSpeed"
                        gradient="from-purple-500 to-pink-500"
                    />
                    <BeautifulParameterCard
                        title="Граммаж факт."
                        value={currentMetrics.actualWeight}
                        unit="г/м²"
                        target={currentMetrics.targetWeight}
                        icon={<FiTarget className="w-5 h-5" />}
                        previousValue={124.9}
                        cardId="actualWeight"
                        gradient="from-green-500 to-emerald-500"
                    />
                    <BeautifulParameterCard
                        title="Макс. скорость"
                        value={currentMetrics.maxSpeedForWeight}
                        unit="м/мин"
                        target={600}
                        icon={<FiBarChart2 className="w-5 h-5" />}
                        previousValue={598.5}
                        cardId="maxSpeed"
                        gradient="from-orange-500 to-amber-500"
                    />
                </div>

                {/* Показатели эффективности и выполнения */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* OEE - Обновленная карточка как на изображении */}
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-lg hover:shadow-2xl transition-all duration-300 group backdrop-blur-sm hover:scale-105 hover:border-blue-300/50 dark:hover:border-blue-600/50">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg group-hover:scale-110 transition-transform group-hover:shadow-xl">
                                    <FiTrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">OEE</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">Общая эффективность</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            {/* Круговой индикатор OEE с градиентом */}
                            <div className="flex-1 flex justify-center">
                                <CircularProgress
                                    value={activeShift === 'current' ? currentMetrics.efficiency : currentMetrics.previousShiftEfficiency}
                                    max={100}
                                    size={120}
                                    strokeWidth={10}
                                    label={activeShift === 'current' ? 'Текущая смена' : 'Предыдущая смена'}
                                    unit="%"
                                    gradient={{ from: '#3b82f6', to: '#8b5cf6' }}
                                />
                            </div>

                            {/* Блок с трендом */}
                            <div className="flex-1 flex justify-end">
                                <TrendIndicator
                                    current={activeShift === 'current' ? currentMetrics.efficiency : currentMetrics.previousShiftEfficiency}
                                    previous={activeShift === 'current' ? currentMetrics.previousShiftEfficiency : 82.1}
                                    unit="%"
                                />
                            </div>
                        </div>

                        {/* Компоненты OEE */}
                        <div className="space-y-3">
                            {/* Доступность */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-md">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white group-hover:scale-110 transition-transform">
                                        <FiActivity className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">Доступность</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {activeShift === 'current' ? currentMetrics.availability : currentMetrics.previousShiftAvailability}%
                                    </div>
                                    <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                                        <FiArrowUp className="w-3 h-3 mr-1" />
                                        <span>+{Math.abs((activeShift === 'current' ? currentMetrics.availability : currentMetrics.previousShiftAvailability) - (activeShift === 'current' ? currentMetrics.previousShiftAvailability : 92.0)).toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Производительность */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-md">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white group-hover:scale-110 transition-transform">
                                        <FiZap className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">Производительность</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {activeShift === 'current' ? currentMetrics.performance : currentMetrics.previousShiftPerformance}%
                                    </div>
                                    <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                                        <FiArrowUp className="w-3 h-3 mr-1" />
                                        <span>+{Math.abs((activeShift === 'current' ? currentMetrics.performance : currentMetrics.previousShiftPerformance) - (activeShift === 'current' ? currentMetrics.previousShiftPerformance : 89.5)).toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Выполнение плана смены */}
                    <PlanProgressCard
                        title="Выполнение плана смены"
                        completed={activeShift === 'current' ? currentMetrics.shiftCompleted : currentMetrics.previousShiftCompleted}
                        total={activeShift === 'current' ? currentMetrics.shiftPlan : currentMetrics.previousShiftPlan}
                        unit="кг"
                        gradient="from-blue-500 to-purple-500"
                        icon={<FiPackage className="w-6 h-6" />}
                        timeText={activeShift === 'current' ? 'Текущая смена' : 'Предыдущая смена'}
                        breaks={activeShift === 'current' ? currentMetrics.currentShiftBreaks : currentMetrics.previousShiftBreaks}
                        previousBreaks={activeShift === 'current' ? currentMetrics.previousShiftBreaks : 5}
                        shiftStartTime={activeShift === 'current' ? currentMetrics.shiftStartTime : undefined}
                        currentShiftBreaks={activeShift === 'current' ? currentMetrics.currentShiftBreaks : undefined}
                    />

                    {/* Ресурсы */}
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-lg hover:shadow-2xl transition-all duration-300 group backdrop-blur-sm hover:scale-105 hover:border-blue-300/50 dark:hover:border-blue-600/50">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg group-hover:scale-110 transition-transform group-hover:shadow-xl">
                                    <FiDatabase className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">Ресурсы</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">За смену</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    icon: <FiDroplet className="w-5 h-5" />,
                                    label: 'Вода',
                                    value: activeShift === 'current' ? currentMetrics.resources.water : currentMetrics.previousShiftResources.water,
                                    unit: 'м³',
                                    color: 'from-blue-500 to-cyan-500'
                                },
                                {
                                    icon: <FiPower className="w-5 h-5" />,
                                    label: 'Электричество',
                                    value: activeShift === 'current' ? currentMetrics.resources.electricity : currentMetrics.previousShiftResources.electricity,
                                    unit: 'кВт·ч',
                                    color: 'from-yellow-500 to-amber-500'
                                },
                                {
                                    icon: <FiThermometer className="w-5 h-5" />,
                                    label: 'Пар',
                                    value: activeShift === 'current' ? currentMetrics.resources.steam : currentMetrics.previousShiftResources.steam,
                                    unit: 'кг',
                                    color: 'from-red-500 to-rose-500'
                                }
                            ].map((resource, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-md">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg bg-gradient-to-r ${resource.color} text-white group-hover:scale-110 transition-transform`}>
                                            {resource.icon}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{resource.label}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{resource.unit}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {(resource.value / 1000).toFixed(1)}к
                                        </div>
                                        <TrendIndicator
                                            current={resource.value}
                                            previous={activeShift === 'current' ?
                                                (index === 0 ? currentMetrics.previousShiftResources.water :
                                                    index === 1 ? currentMetrics.previousShiftResources.electricity :
                                                        currentMetrics.previousShiftResources.steam) :
                                                (index === 0 ? 11500 : index === 1 ? 2300 : 2950)
                                            }
                                            unit={resource.unit}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Долгосрочные планы */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <PlanProgressCard
                        title="Месячный план"
                        completed={currentMetrics.monthlyCompleted}
                        total={currentMetrics.monthlyPlan}
                        unit="кг"
                        gradient="from-green-500 to-emerald-500"
                        icon={<FiCalendar className="w-6 h-6" />}
                        timeText={`Осталось дней: ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()}`}
                    />

                    <PlanProgressCard
                        title="Годовой план"
                        completed={currentMetrics.yearlyCompleted}
                        total={currentMetrics.yearlyPlan}
                        unit="кг"
                        gradient="from-purple-500 to-pink-500"
                        icon={<FiBarChart className="w-6 h-6" />}
                        timeText={`Осталось месяцев: ${12 - new Date().getMonth()}`}
                    />
                </div>

                {/* Статистика за 7 дней */}
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700/80 overflow-hidden hover:shadow-2xl transition-all duration-300 group backdrop-blur-sm hover:border-blue-300/50 dark:hover:border-blue-600/50">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            <FiBarChart2 className="w-5 h-5 mr-3 text-purple-600 group-hover:scale-110 transition-transform" />
                            Статистика за 7 дней
                        </h2>
                        <div className="flex space-x-3">
                            <select className="bg-white/50 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors hover:shadow-md">
                                <option>Последние 7 дней</option>
                                <option>Последние 30 дней</option>
                                <option>Текущий месяц</option>
                            </select>
                            <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm hover:shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700">
                                <FiDownload className="w-4 h-4 mr-2" />
                                Экспорт
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-300">Дата</th>
                                    <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-300">Производство</th>
                                    <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-300">Обрывы</th>
                                    <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-300">Эффективность</th>
                                    <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-300">Простой</th>
                                    <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-300">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {monthlyData.slice(-7).map((day, index) => (
                                    <tr
                                        key={index}
                                        className={`hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer group ${selectedDate === day.date ? 'bg-blue-100 dark:bg-blue-900/30' : ''
                                            }`}
                                        onClick={() => setSelectedDate(day.date)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {new Date(day.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {(day.totalProduction / 1000).toFixed(1)} т
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:scale-110 ${day.totalBreaks > 8 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200' :
                                                day.totalBreaks > 4 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200' :
                                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200'
                                                }`}>
                                                {day.totalBreaks} шт
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3 overflow-hidden group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 group-hover:shadow-lg ${day.avgEfficiency > 85 ? 'bg-green-500' :
                                                            day.avgEfficiency > 75 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${day.avgEfficiency}%` }}
                                                    ></div>
                                                </div>
                                                <span className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{day.avgEfficiency.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs transition-all duration-300 hover:scale-110 ${day.downtime > 2 ?
                                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200' :
                                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200'
                                                }`}>
                                                {day.downtime.toFixed(1)} ч
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button className="text-blue-600 hover:text-blue-700 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:scale-110">
                                                <FiEye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Детали выбранного дня */}
                {selectedDate && (
                    <div className="mt-6 bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 shadow-lg border border-gray-200/80 dark:border-gray-700/80 animate-fadeIn backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Детали за {new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </h3>
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer hover:shadow-lg hover:bg-blue-100 dark:hover:bg-blue-900/30">
                                <div className="text-gray-600 dark:text-gray-400 text-sm mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300">Производство</div>
                                <div className="font-bold text-2xl text-blue-600 group-hover:text-blue-700 transition-colors">
                                    {((monthlyData.find(d => d.date === selectedDate)?.totalProduction || 0) / 1000).toFixed(1)}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm group-hover:text-gray-600 dark:group-hover:text-gray-300">тонн</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer hover:shadow-lg hover:bg-green-100 dark:hover:bg-green-900/30">
                                <div className="text-gray-600 dark:text-gray-400 text-sm mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300">Эффективность</div>
                                <div className="font-bold text-2xl text-green-600 group-hover:text-green-700 transition-colors">
                                    {monthlyData.find(d => d.date === selectedDate)?.avgEfficiency.toFixed(1)}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm group-hover:text-gray-600 dark:group-hover:text-gray-300">%</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer hover:shadow-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                                <div className="text-gray-600 dark:text-gray-400 text-sm mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300">Обрывы</div>
                                <div className="font-bold text-2xl text-red-600 group-hover:text-red-700 transition-colors">
                                    {monthlyData.find(d => d.date === selectedDate)?.totalBreaks}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm group-hover:text-gray-600 dark:group-hover:text-gray-300">шт</div>
                            </div>
                            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer hover:shadow-lg hover:bg-amber-100 dark:hover:bg-amber-900/30">
                                <div className="text-gray-600 dark:text-gray-400 text-sm mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300">Простой</div>
                                <div className="font-bold text-2xl text-amber-600 group-hover:text-amber-700 transition-colors">
                                    {monthlyData.find(d => d.date === selectedDate)?.downtime.toFixed(1)}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm group-hover:text-gray-600 dark:group-hover:text-gray-300">часов</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Быстрые действия */}
                <div className="mt-8 flex justify-center space-x-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-6 py-3 bg-white/80 dark:bg-gray-800/80 rounded-xl text-sm backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        <FiFilter className="w-4 h-4 mr-2" />
                        Фильтры и настройки
                    </button>
                    <button className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm hover:shadow-lg hover:scale-105 transition-all duration-300 hover:from-blue-700 hover:to-purple-700">
                        <FiDownload className="w-4 h-4 mr-2" />
                        Экспорт отчета
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaperMachineDashboard;