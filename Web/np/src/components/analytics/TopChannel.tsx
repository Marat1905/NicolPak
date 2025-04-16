import { useState } from "react";

const mockData = [
    {
        id: 1,
        title: "Простои электрослужба",
        currentMonth: "0 ч. 0 мин.",
        previousMonth: "0 ч. 47 мин.",
        currentYear: "7 ч. 21 мин.",
        previousYear: "18 ч. 35 мин.",
    },
    {
        id: 2,
        title: "Простои службы механиков",
        currentMonth: "0 ч. 0 мин.",
        previousMonth: "2 ч. 48 мин.",
        currentYear: "4 ч. 23 мин.",
        previousYear: "17 ч. 9 мин.",
    },
    {
        id: 3,
        title: "Простои технологов",
        currentMonth: "8 ч. 19 мин.",
        previousMonth: "18 ч. 23 мин.",
        currentYear: "44 ч. 16 мин.",
        previousYear: "25 ч. 30 мин.",
    },
    {
        id: 4,
        title: "Плановые работы и ПТО",
        currentMonth: "20 ч. 45 мин.",
        previousMonth: "80 ч. 25 мин.",
        currentYear: "217 ч. 45 мин.",
        previousYear: "150 ч. 47 мин.",
    },
    {
        id: 5,
        title: "Прочие",
        currentMonth: "0 ч. 0 мин.",
        previousMonth: "0 ч. 0 мин.",
        currentYear: "0 ч. 0 мин.",
        previousYear: "1 ч. 36 мин.",
    },
    {
        id: 6,
        title: "Общее",
        currentMonth: "29 ч. 4 мин.",
        previousMonth: "102 ч. 23 мин.",
        currentYear: "273 ч. 45 мин.",
        previousYear: "214 ч. 37 мин.",
    },
]

const TopChannel: React.FC = () => {
    return (
        <>
            {mockData.map((item) => (
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            {item.title}
                        </h3>
                    </div>

                    <div className="my-6">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                                За текущий месяц
                            </span>
                            <span className="text-right text-gray-500 text-theme-sm dark:text-gray-400">
                                {item.currentMonth}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                                За предыдущий месяц
                            </span>
                            <span className="text-right text-gray-500 text-theme-sm dark:text-gray-400">
                                {item.previousMonth}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                                За текущий год
                            </span>
                            <span className="text-right text-gray-500 text-theme-sm dark:text-gray-400">
                                {item.currentYear}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                                За предыдущий год
                            </span>
                            <span className="text-right text-gray-500 text-theme-sm dark:text-gray-400">
                                {item.previousYear}
                            </span>
                        </div>
                    </div>


                </div>
            ))}
        </>
    );
};
export default  TopChannel;
