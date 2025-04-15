import React from "react";
import Badge from "../ui/badge/Badge";

const mockData = [
    {
        id: 1,
        title: "Фактическая скорость сетки",
        value: "566 м/мин.",
        change: "+10%",
        direction: "up",
        comparisonText: "VS с прошлым месяцем",
    },
    {
        id: 2,
        title: "Фактическая скорость наката",
        value: "586 м/мин.",
        change: "+10%",
        direction: "up",
        comparisonText: "VS с прошлым месяцем",
    },
    {
        id: 3,
        title: "Заданный граммаж",
        value: "130 г/м2",
        change: "-1.59%",
        direction: "down",
        comparisonText: "Vs last month",
    },
    {
        id: 4,
        title: "Фактический граммаж",
        value: "132 г/м2",
        change: "+7%",
        direction: "up",
        comparisonText: "Vs last month",
    },
    {
        id: 5,
        title: "Количество обрывов за текущую смену",
        value: "0",
        change: "2",
        direction: "up",
        comparisonText: "По сравнению с предыдущей сменой",
    },
    {
        id: 6,
        title: "Количество обрывов за предыдущую смену",
        value: "2",
        change: "0",
        direction: "down",
        comparisonText: "По сравнению с предыдущей сменой",
    },
    {
        id: 7,
        title: "Заданный план на текущую смену",
        value: "205 000 кг.",
        change: "+7%",
        direction: "up",
        comparisonText: "Vs last month",
    },
    {
        id: 8,
        title: "Выполненный план на текущую смену",
        value: "61 584 кг.",
        change: "+7%",
        direction: "up",
        comparisonText: "Vs last month",
    },
    {
        id: 9,
        title: "Заданный план на текущий год",
        value: "138 000 000 кг.",
        change: "+7%",
        direction: "up",
        comparisonText: "Vs last month",
    },
    {
        id: 10,
        title: "Выполненный план на текущий год",
        value: "37 493 396 кг.",
        change: "+165 571",
        direction: "up",
        comparisonText: "Отклонение плана",
    },
    {
        id: 11,
        title: "Заданный план на текущий месяц",
        value: "11 350 000 кг.",
        change: "+7%",
        direction: "up",
        comparisonText: "Vs last month",
    },
    {
        id: 12,
        title: "Выполненный план на текущий месяц",
        value: "5 684 682 кг.",
        change: "+10 672",
        direction: "up",
        comparisonText: "Отклонение плана",
    },

    {
        id: 13,
        title: "Работа БДМ текущий год",
        value: " 2 239 ч. 19 мин.",
        change: "+7%",
        direction: "up",
        comparisonText: "Vs last month",
    },
    {
        id: 14,
        title: "Простой БДМ текущий год",
        value: " 269 ч. 35 мин.",
        change: "+10 672",
        direction: "up",
        comparisonText: "Отклонение плана",
    },

    {
        id: 13,
        title: "Простой БДМ текущий месяц",
        value: " 24 ч. 54 мин.",
        change: "+7%",
        direction: "up",
        comparisonText: "Vs last month",
    },
    {
        id: 14,
        title: "Простой БДМ в текущую смену",
        value: " 0 ч. 0 мин.",
        change: "+0",
        direction: "up",
        comparisonText: "Отклонение плана",
    },
    //{
    //    id: 14,
    //    title: "Простой БДМ в предыдущую смену",
    //    value: " 0 ч. 45 мин.",
    //    change: "+0",
    //    direction: "up",
    //    comparisonText: "Отклонение плана",
    //},
];

const AnalyticsMetrics: React.FC = () => {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-3 xl:grid-cols-2">
            {/* <!-- Metric Item Start --> */}
            {mockData.map((item) => (
                <div
                    key={item.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
                >
                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.title}
                    </p>
                    <div className="flex items-end justify-between mt-3">
                        <div>
                            <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                                {item.value}
                            </h4>
                        </div>
                        <div className="flex items-center gap-1">
                            <Badge
                                color={
                                    item.direction === "up"
                                        ? "success"
                                        : item.direction === "down"
                                            ? "error"
                                            : "warning"
                                }
                            >
                                <span className="text-xs"> {item.change}</span>
                            </Badge>
                            <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                                {item.comparisonText}
                            </span>
                        </div>
                    </div>
                </div>
            ))}

            {/* <!-- Metric Item End --> */}
        </div>
    );
};

export default AnalyticsMetrics;
