import AnalyticsMetrics from "../../components/analytics/AnalyticsMetrics";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
    return (
        <>
            <PageMeta
                title="Домашняя - Главная"
                description="Домашняя - Главная"
            />

            <PageBreadcrumb pageTitle="Главная" />
           

            <div className="grid grid-cols-12 gap-2 md:gap-6">
                <div className="col-span-12">
                    <AnalyticsMetrics />
                </div>
            </div>
           
        </>
    );
}



//import React from 'react';
//import PageBreadcrumb from "../../components/common/PageBreadCrumb";
//import PageMeta from "../../components/common/PageMeta";
//import {
//    BoltIcon,
//    ClockIcon,
//    ScaleIcon,
//    ExclamationCircleIcon,
//    CalendarIcon,
//    ArrowTrendingUpIcon,
//    ArrowTrendingDownIcon,
//    ArrowsRightLeftIcon,
//    DocumentChartBarIcon,
//    ChartBarIcon,
//    CpuChipIcon,
//    BuildingLibraryIcon,
//    CalendarDaysIcon,
//    ClockIcon as ClockSolidIcon
//} from "@heroicons/react/24/outline";

//// Определение типов для статистики
//interface StatItem {
//    title: string;
//    value: string;
//    unit?: string;
//    status?: 'positive' | 'negative' | 'neutral';
//    trend?: 'up' | 'down' | 'stable';
//    icon?: React.ReactNode;
//}

//interface StatGroup {
//    title: string;
//    description?: string;
//    icon: React.ReactNode;
//    stats: StatItem[];
//}

//export default function Home() {
//    // Группировка показателей по категориям с явной типизацией
//    const statGroups: StatGroup[] = [
//        {
//            title: "Производительность",
//            description: "Текущие показатели скорости и эффективности",
//            icon: <BoltIcon className="w-5 h-5" />,
//            stats: [
//                {
//                    title: "Скорость сетки",
//                    value: "120",
//                    unit: "м/мин",
//                    icon: <ArrowsRightLeftIcon className="w-5 h-5 text-blue-500" />
//                },
//                {
//                    title: "Скорость наката",
//                    value: "115",
//                    unit: "м/мин",
//                    icon: <ArrowsRightLeftIcon className="w-5 h-5 text-blue-500" />
//                },
//                {
//                    title: "OEE (месяц)",
//                    value: "85%",
//                    status: "positive",
//                    trend: "up",
//                    icon: <ChartBarIcon className="w-5 h-5 text-green-500" />
//                },
//                {
//                    title: "OEE (год)",
//                    value: "88%",
//                    status: "positive",
//                    trend: "stable",
//                    icon: <ChartBarIcon className="w-5 h-5 text-green-500" />
//                },
//            ]
//        },
//        {
//            title: "Параметры бумаги",
//            description: "Характеристики бумажного полотна",
//            icon: <ScaleIcon className="w-5 h-5" />,
//            stats: [
//                {
//                    title: "Заданный вес",
//                    value: "80",
//                    unit: "г/м²",
//                    icon: <DocumentChartBarIcon className="w-5 h-5 text-indigo-500" />
//                },
//                {
//                    title: "Фактический вес",
//                    value: "82",
//                    unit: "г/м²",
//                    icon: <DocumentChartBarIcon className="w-5 h-5 text-indigo-500" />
//                },
//            ]
//        },
//        {
//            title: "Обрывы и простои",
//            description: "Статистика остановок производства",
//            icon: <ExclamationCircleIcon className="w-5 h-5" />,
//            stats: [
//                {
//                    title: "Обрывы (текущая смена)",
//                    value: "2",
//                    trend: "down",
//                    icon: <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />
//                },
//                {
//                    title: "Обрывы (пред. смена)",
//                    value: "3",
//                    trend: "up",
//                    icon: <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />
//                },
//                {
//                    title: "Простой (текущ. смена)",
//                    value: "2",
//                    unit: "ч",
//                    status: "negative",
//                    icon: <ClockSolidIcon className="w-5 h-5 text-red-500" />
//                },
//                {
//                    title: "Простой (пред. смена)",
//                    value: "1",
//                    unit: "ч",
//                    status: "negative",
//                    icon: <ClockSolidIcon className="w-5 h-5 text-red-500" />
//                },
//            ]
//        },
//        {
//            title: "Планы производства",
//            description: "Выполнение производственных заданий",
//            icon: <CalendarIcon className="w-5 h-5" />,
//            stats: [
//                {
//                    title: "План смены",
//                    value: "5000",
//                    icon: <CalendarDaysIcon className="w-5 h-5 text-purple-500" />
//                },
//                {
//                    title: "Выполнено (смена)",
//                    value: "4800",
//                    icon: <CalendarDaysIcon className="w-5 h-5 text-purple-500" />
//                },
//                {
//                    title: "План месяца",
//                    value: "100 000",
//                    icon: <CalendarDaysIcon className="w-5 h-5 text-purple-500" />
//                },
//                {
//                    title: "Выполнено (месяц)",
//                    value: "75 000",
//                    icon: <CalendarDaysIcon className="w-5 h-5 text-purple-500" />
//                },
//                {
//                    title: "Отклонение (месяц)",
//                    value: "-25 000",
//                    status: "negative",
//                    icon: <ArrowsRightLeftIcon className="w-5 h-5 text-red-500" />
//                },
//                {
//                    title: "План года",
//                    value: "1 000 000",
//                    icon: <BuildingLibraryIcon className="w-5 h-5 text-blue-500" />
//                },
//                {
//                    title: "Выполнено (год)",
//                    value: "980 000",
//                    icon: <BuildingLibraryIcon className="w-5 h-5 text-blue-500" />
//                },
//                {
//                    title: "Отклонение (год)",
//                    value: "-20 000",
//                    status: "negative",
//                    icon: <ArrowsRightLeftIcon className="w-5 h-5 text-red-500" />
//                },
//                {
//                    title: "Предыдущий год",
//                    value: "950 000",
//                    icon: <BuildingLibraryIcon className="w-5 h-5 text-blue-500" />
//                },
//            ]
//        },
//        {
//            title: "Работа оборудования",
//            description: "Статистика использования БДМ",
//            icon: <CpuChipIcon className="w-5 h-5" />,
//            stats: [
//                {
//                    title: "Работа БДМ (год)",
//                    value: "5000",
//                    unit: "ч",
//                    icon: <ClockIcon className="w-5 h-5 text-green-500" />
//                },
//                {
//                    title: "Простой БДМ (год)",
//                    value: "120",
//                    unit: "ч",
//                    status: "negative",
//                    icon: <ClockIcon className="w-5 h-5 text-red-500" />
//                },
//                {
//                    title: "Простой БДМ (месяц)",
//                    value: "30",
//                    unit: "ч",
//                    status: "negative",
//                    icon: <ClockIcon className="w-5 h-5 text-red-500" />
//                },
//            ]
//        }
//    ];

//    // Функция для определения цвета значения
//    const getValueColor = (status?: 'positive' | 'negative' | 'neutral') => {
//        switch (status) {
//            case "positive": return "text-green-600 dark:text-green-400";
//            case "negative": return "text-red-600 dark:text-red-400";
//            default: return "text-gray-900 dark:text-gray-100";
//        }
//    };

//    // Функция для определения цвета фона карточки
//    const getCardColor = (status?: 'positive' | 'negative' | 'neutral') => {
//        switch (status) {
//            case "positive": return "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30";
//            case "negative": return "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30";
//            default: return "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/80";
//        }
//    };

//    // Функция для определения цвета границы
//    const getBorderColor = (status?: 'positive' | 'negative' | 'neutral') => {
//        switch (status) {
//            case "positive": return "border-green-200 dark:border-green-700/50";
//            case "negative": return "border-red-200 dark:border-red-700/50";
//            default: return "border-gray-200 dark:border-gray-700";
//        }
//    };

//    // Функция для отображения тренда
//    const renderTrend = (trend?: 'up' | 'down' | 'stable') => {
//        if (trend === "up") {
//            return (
//                <div className="flex items-center px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs">
//                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
//                    <span>Рост</span>
//                </div>
//            );
//        }
//        if (trend === "down") {
//            return (
//                <div className="flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
//                    <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
//                    <span>Снижение</span>
//                </div>
//            );
//        }
//        if (trend === "stable") {
//            return (
//                <div className="flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs">
//                    <div className="w-4 h-4 mr-1 flex items-center justify-center">—</div>
//                    <span>Стабильно</span>
//                </div>
//            );
//        }
//        return null;
//    };

//    return (
//        <>
//            <PageMeta
//                title="Домашняя - Главная"
//                description="Домашняя - Главная"
//            />

//            <PageBreadcrumb pageTitle="Главная" />

//            <div className="container mx-auto px-4 py-8">
//                <div className="mb-8">
//                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Панель управления производством</h1>
//                    <p className="text-gray-600 dark:text-gray-400 mt-2">
//                        Реальные показатели работы бумагоделательной машины
//                    </p>
//                </div>

//                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                    {statGroups.map((group, groupIndex) => (
//                        <div
//                            key={groupIndex}
//                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700/50 transition-all duration-300 hover:shadow-xl"
//                        >
//                            <div className="flex items-start mb-6">
//                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mr-4">
//                                    {group.icon}
//                                </div>
//                                <div>
//                                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{group.title}</h2>
//                                    {group.description && (
//                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                                            {group.description}
//                                        </p>
//                                    )}
//                                </div>
//                            </div>

//                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                {group.stats.map((stat, statIndex) => (
//                                    <div
//                                        key={statIndex}
//                                        className={`rounded-xl p-5 border ${getCardColor(stat.status)} ${getBorderColor(stat.status)} transition-all duration-200 hover:-translate-y-1`}
//                                    >
//                                        <div className="flex justify-between items-start">
//                                            <div className="flex items-center">
//                                                {stat.icon && (
//                                                    <div className="mr-3">
//                                                        {stat.icon}
//                                                    </div>
//                                                )}
//                                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                                                    {stat.title}
//                                                </h3>
//                                            </div>
//                                            {renderTrend(stat.trend)}
//                                        </div>

//                                        <div className="flex items-baseline mt-3">
//                                            <span className={`text-2xl font-bold ${getValueColor(stat.status)}`}>
//                                                {stat.value}
//                                            </span>
//                                            {stat.unit && (
//                                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
//                                                    {stat.unit}
//                                                </span>
//                                            )}
//                                        </div>

//                                        {stat.status && (
//                                            <div className="mt-3">
//                                                <div className={`h-1.5 rounded-full overflow-hidden ${stat.status === "positive"
//                                                    ? "bg-green-100 dark:bg-green-900/30"
//                                                    : stat.status === "negative"
//                                                        ? "bg-red-100 dark:bg-red-900/30"
//                                                        : "bg-gray-100 dark:bg-gray-700"
//                                                    }`}>
//                                                    <div
//                                                        className={`h-full ${stat.status === "positive"
//                                                            ? "bg-green-500"
//                                                            : stat.status === "negative"
//                                                                ? "bg-red-500"
//                                                                : "bg-blue-500"
//                                                            }`}
//                                                        style={{
//                                                            width: stat.value.replace('%', '')
//                                                                ? `${Math.min(100, parseInt(stat.value.replace('%', '')))}%`
//                                                                : '100%'
//                                                        }}
//                                                    ></div>
//                                                </div>
//                                            </div>
//                                        )}
//                                    </div>
//                                ))}
//                            </div>
//                        </div>
//                    ))}
//                </div>
//            </div>
//        </>
//    );
//}