import { useState, useEffect, useRef, useCallback } from 'react';
import {
    FiChevronDown,
    FiChevronUp,
    FiTrendingUp,
    FiX,
    FiChevronLeft,
    FiChevronRight,
    FiCalendar
} from 'react-icons/fi';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { ru } from 'date-fns/locale';
import {
    subHours,
    subDays,
    subWeeks,
    subMonths,
    addHours,
    addDays,
    addWeeks,
    addMonths,
    format,
    startOfWeek,
    endOfWeek,
    startOfDay,
    endOfDay,
    startOfHour,
    startOfMonth,
    endOfMonth
} from 'date-fns';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

Chart.register(...registerables);

type MeterNode = {
    id: number;
    name: string;
    values: {
        instantFlow: number;
        currentHour: number;
        currentDay: number;
        currentMonth: number;
        previousDay: number;
        previousMonth: number;
        total: number;
        time: string;
    };
};

type TimeRange = 'hour' | 'day' | 'week' | 'month';

const WaterPage = () => {
    const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>(
        Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, true])
        ));
    const [showTrendsModal, setShowTrendsModal] = useState(false);
    const [currentNode, setCurrentNode] = useState<MeterNode | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('day');
    const [chartData, setChartData] = useState<{ date: Date, value: number }[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [dateRangeText, setDateRangeText] = useState('');
    const chartRef = useRef<Chart | null>(null);
    const chartCanvasRef = useRef<HTMLCanvasElement>(null);

    const useDarkMode = () => {
        const [isDark, setIsDark] = useState(false);

        useEffect(() => {
            const checkDarkMode = () => {
                setIsDark(document.documentElement.classList.contains('dark'));
            };

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class') {
                        checkDarkMode();
                    }
                });
            });

            checkDarkMode();
            observer.observe(document.documentElement, {
                attributes: true
            });

            return () => observer.disconnect();
        }, []);

        return isDark;
    };

    const isDark = useDarkMode();

    const generateTrendData = useCallback((nodeId: number, range: TimeRange, baseDate: Date) => {
        const baseValue = 100 + (nodeId * 20);
        let points = 24;
        let unit: 'hour' | 'day' = 'hour';
        let step = 1;

        const roundedDate = new Date(baseDate);
        switch (range) {
            case 'hour':
                roundedDate.setMinutes(0, 0, 0);
                points = 24;
                unit = 'hour';
                step = 1;
                break;
            case 'day':
                roundedDate.setHours(0, 0, 0, 0);
                points = 24;
                unit = 'hour';
                step = 1;
                break;
            case 'week':
                roundedDate.setHours(0, 0, 0, 0);
                points = 7;
                unit = 'day';
                break;
            case 'month':
                roundedDate.setHours(0, 0, 0, 0);
                points = 30;
                unit = 'day';
                break;
        }

        return Array.from({ length: points }, (_, i) => {
            const date = new Date(roundedDate);
            if (unit === 'hour') {
                date.setHours(date.getHours() - (points - i - 1) * step, 0, 0, 0);
                const hour = date.getHours();
                const hourFactor = 0.5 + 0.5 * Math.sin((hour - 8) * Math.PI / 12);
                const randomFactor = 0.8 + Math.random() * 0.4;
                return {
                    date,
                    value: Math.round(baseValue * hourFactor * randomFactor)
                };
            } else {
                date.setDate(date.getDate() - (points - i - 1));
                date.setHours(12, 0, 0, 0);
                const day = date.getDay();
                const dayFactor = day === 0 || day === 6 ? 0.6 : 1;
                const randomFactor = 0.7 + Math.random() * 0.6;
                return {
                    date,
                    value: Math.round(baseValue * dayFactor * randomFactor)
                };
            }
        });
    }, []);

    const updateDateRangeText = useCallback((range: TimeRange, date: Date) => {
        switch (range) {
            case 'hour':
                setDateRangeText(format(startOfHour(date), 'dd.MM.yyyy HH:mm'));
                break;
            case 'day':
                setDateRangeText(`${format(startOfDay(date), 'dd.MM.yyyy')} (00:00:00 - 23:59:59)`);
                break;
            case 'week':
                setDateRangeText(`${format(startOfWeek(date), 'dd.MM')} - ${format(endOfWeek(date), 'dd.MM.yyyy')}`);
                break;
            case 'month':
                setDateRangeText(`${format(startOfMonth(date), 'dd.MM.yyyy')} - ${format(endOfMonth(date), 'dd.MM.yyyy')}`);
                break;
        }
    }, []);

    const loadChartData = useCallback(() => {
        if (currentNode) {
            setChartData(generateTrendData(currentNode.id, timeRange, currentDate));
            updateDateRangeText(timeRange, currentDate);
        }
    }, [currentNode, timeRange, currentDate, generateTrendData, updateDateRangeText]);

    const handleTimeNavigation = (direction: 'prev' | 'next') => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            switch (timeRange) {
                case 'hour':
                    direction === 'prev' ? newDate.setHours(newDate.getHours() - 1) : newDate.setHours(newDate.getHours() + 1);
                    newDate.setMinutes(0, 0, 0);
                    break;
                case 'day':
                    direction === 'prev' ? newDate.setDate(newDate.getDate() - 1) : newDate.setDate(newDate.getDate() + 1);
                    newDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    direction === 'prev' ? newDate.setDate(newDate.getDate() - 7) : newDate.setDate(newDate.getDate() + 7);
                    newDate.setHours(0, 0, 0, 0);
                    break;
                case 'month':
                    direction === 'prev' ? newDate.setMonth(newDate.getMonth() - 1) : newDate.setMonth(newDate.getMonth() + 1);
                    newDate.setHours(0, 0, 0, 0);
                    break;
            }
            return newDate;
        });
    };

    const handleTrendsClick = (node: MeterNode) => {
        setCurrentNode(node);
        setTimeRange('day');
        setCurrentDate(startOfDay(new Date()));
        setShowTrendsModal(true);
    };

    const handleTimeRangeChange = (range: TimeRange) => {
        setTimeRange(range);
        const now = new Date();
        switch (range) {
            case 'hour':
                setCurrentDate(startOfHour(now));
                break;
            case 'day':
                setCurrentDate(startOfDay(now));
                break;
            case 'week':
                setCurrentDate(startOfWeek(now));
                break;
            case 'month':
                setCurrentDate(startOfMonth(now));
                break;
        }
    };

    const toggleCard = (id: number) => {
        setExpandedCards(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    useEffect(() => {
        loadChartData();
    }, [loadChartData]);

    useEffect(() => {
        if (!showTrendsModal || !chartCanvasRef.current || chartData.length === 0) return;

        const ctx = chartCanvasRef.current.getContext('2d');
        if (!ctx) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const textColor = isDark ? '#e5e7eb' : '#6b7280';
        const gridColor = isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)';
        const tooltipBgColor = isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)';

        const timeUnit = timeRange === 'hour' || timeRange === 'day' ? 'hour' : 'day';
        const tooltipFormat = timeRange === 'hour' ? 'HH:mm' :
            timeRange === 'day' ? 'HH:mm' :
                timeRange === 'week' ? 'EEE, dd.MM' : 'dd.MM.yyyy';

        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.map(d => d.date),
                datasets: [{
                    label: 'Потребление воды (m³)',
                    data: chartData.map(d => d.value),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true,
                    pointRadius: timeRange === 'hour' ? 3 : 0,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: textColor
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: tooltipBgColor,
                        bodyColor: textColor,
                        titleColor: textColor,
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)} m³`,
                            title: (items) => {
                                const date = new Date(items[0].label);
                                return timeRange === 'hour' || timeRange === 'day'
                                    ? date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                                    : date.toLocaleDateString('ru-RU', {
                                        weekday: timeRange === 'week' ? 'short' : undefined,
                                        day: '2-digit',
                                        month: timeRange === 'week' ? '2-digit' : 'long',
                                        year: timeRange !== 'week' ? 'numeric' : undefined
                                    });
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: timeUnit,
                            tooltipFormat: tooltipFormat,
                            displayFormats: {
                                hour: 'HH:mm',
                                day: 'dd.MM'
                            }
                        },
                        adapters: {
                            date: {
                                locale: ru
                            }
                        },
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor,
                            maxRotation: timeRange === 'hour' ? 0 : 45,
                            minRotation: timeRange === 'hour' ? 0 : 45,
                            autoSkip: true,
                            maxTicksLimit: timeRange === 'hour' ? 12 : 10
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        },
                        title: {
                            display: true,
                            text: 'Потребление (m³)',
                            color: textColor
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [chartData, showTrendsModal, timeRange, isDark]);

    const nodes: MeterNode[] = [
        {
            id: 1,
            name: "Входной коллектор",
            values: {
                instantFlow: 12.5,
                currentHour: 45.3,
                currentDay: 1024.7,
                currentMonth: 24567.2,
                previousDay: 987.6,
                previousMonth: 23548.1,
                total: 1245789.3,
                time: "10:15:23",
            }
        },
        {
            id: 2,
            name: "Уральская вода",
            values: {
                instantFlow: 8.2,
                currentHour: 32.1,
                currentDay: 876.5,
                currentMonth: 19876.4,
                previousDay: 854.3,
                previousMonth: 18765.2,
                total: 987654.1,
                time: "10:15:25",
            }
        },
        {
            id: 3,
            name: "Уральская вода на технологию",
            values: {
                instantFlow: 5.7,
                currentHour: 21.4,
                currentDay: 543.2,
                currentMonth: 12345.6,
                previousDay: 532.1,
                previousMonth: 11876.5,
                total: 765432.9,
                time: "10:15:27",
            }
        },
        {
            id: 4,
            name: "Пром.вода в котельную",
            values: {
                instantFlow: 3.8,
                currentHour: 15.2,
                currentDay: 432.1,
                currentMonth: 9876.5,
                previousDay: 421.3,
                previousMonth: 9543.2,
                total: 543219.8,
                time: "10:15:29",
            }
        },
        {
            id: 5,
            name: "Пром. вода на ОС",
            values: {
                instantFlow: 2.9,
                currentHour: 12.3,
                currentDay: 321.4,
                currentMonth: 7654.3,
                previousDay: 312.5,
                previousMonth: 7432.1,
                total: 432198.7,
                time: "10:15:31",
            }
        },
        {
            id: 6,
            name: "ХПВ КДЦ",
            values: {
                instantFlow: 1.8,
                currentHour: 8.7,
                currentDay: 234.5,
                currentMonth: 5432.1,
                previousDay: 223.4,
                previousMonth: 5210.9,
                total: 321987.6,
                time: "10:15:33",
            }
        },
        {
            id: 7,
            name: "Насосная Урал",
            values: {
                instantFlow: 4.3,
                currentHour: 18.6,
                currentDay: 456.7,
                currentMonth: 10987.6,
                previousDay: 445.6,
                previousMonth: 10543.2,
                total: 654321.5,
                time: "10:15:35",
            }
        },
        {
            id: 8,
            name: "Артезианская вода",
            values: {
                instantFlow: 0.9,
                currentHour: 4.5,
                currentDay: 123.4,
                currentMonth: 3210.8,
                previousDay: 112.3,
                previousMonth: 2987.6,
                total: 219876.4,
                time: "10:15:37",
            }
        },
        {
            id: 9,
            name: "Бойлер KДЦ",
            values: {
                instantFlow: 1.2,
                currentHour: 6.7,
                currentDay: 187.6,
                currentMonth: 4321.9,
                previousDay: 176.5,
                previousMonth: 4109.8,
                total: 298765.3,
                time: "10:15:39",
            }
        }
    ];

    return (
        <>
            <PageMeta
                title="Энергоучет - Вода"
                description="Энергоучет - Вода"
            />

            <PageBreadcrumb pageTitle="Энергоучет - Вода" />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6 dark:text-white">Узлы учета воды</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nodes.map((node) => (
                        <div
                            key={node.id}
                            className="rounded-lg shadow-md overflow-hidden bg-white dark:bg-gray-800 transition-all duration-200"
                        >
                            <div className="px-4 py-3 bg-blue-600 dark:bg-gray-700 text-white flex justify-between items-center">
                                <h2 className="font-semibold text-lg">{node.name}</h2>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleTrendsClick(node)}
                                        className="p-1 rounded hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
                                        title="Просмотреть тренды"
                                        aria-label="Тренды"
                                    >
                                        <FiTrendingUp className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => toggleCard(node.id)}
                                        className="p-1 rounded hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
                                        aria-label={expandedCards[node.id] ? "Свернуть" : "Развернуть"}
                                    >
                                        {expandedCards[node.id] ? (
                                            <FiChevronUp className="w-5 h-5" />
                                        ) : (
                                            <FiChevronDown className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {expandedCards[node.id] && (
                                <div className="p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Мгновенный расход</p>
                                                <p className="font-medium dark:text-white">{node.values.instantFlow} m³</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Текущий час</p>
                                                <p className="font-medium dark:text-white">{node.values.currentHour} m³</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Текущие сутки</p>
                                                <p className="font-medium dark:text-white">{node.values.currentDay} m³</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Текущий месяц</p>
                                                <p className="font-medium dark:text-white">{node.values.currentMonth} m³</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Предыдущие сутки</p>
                                                <p className="font-medium dark:text-white">{node.values.previousDay} m³</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Предыдущий месяц</p>
                                                <p className="font-medium dark:text-white">{node.values.previousMonth} m³</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Общий</p>
                                                <p className="font-medium dark:text-white">{node.values.total} m³</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Время</p>
                                                <p className="font-medium dark:text-white">{node.values.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {showTrendsModal && currentNode && (
                <div className="fixed inset-0 bg-black/50 dark:bg-gray-900/70 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                    <div className="rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col bg-white dark:bg-gray-800 transition-colors duration-300">
                        <div className="px-6 py-4 bg-blue-600 dark:bg-gray-700 text-white flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Тренды: {currentNode.name}</h2>
                            <button
                                onClick={() => setShowTrendsModal(false)}
                                className="p-1 rounded-full hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
                                aria-label="Закрыть"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleTimeNavigation('prev')}
                                        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        aria-label="Предыдущий период"
                                    >
                                        <FiChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded">
                                        <FiCalendar className="mr-2 text-gray-500 dark:text-gray-300" />
                                        <span className="font-medium dark:text-white">{dateRangeText}</span>
                                    </div>
                                    <button
                                        onClick={() => handleTimeNavigation('next')}
                                        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        aria-label="Следующий период"
                                    >
                                        <FiChevronRight className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    {(['hour', 'day', 'week', 'month'] as TimeRange[]).map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => handleTimeRangeChange(range)}
                                            className={`px-4 py-2 rounded whitespace-nowrap ${timeRange === range
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                                                }`}
                                        >
                                            {range === 'hour' && 'Почасовой'}
                                            {range === 'day' && 'Суточный'}
                                            {range === 'week' && 'Недельный'}
                                            {range === 'month' && 'Месячный'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 relative">
                                <canvas ref={chartCanvasRef} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WaterPage;