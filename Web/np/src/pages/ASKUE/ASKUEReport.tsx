import React, { useState, useEffect, useRef } from 'react';
import { FiFolderPlus, FiFolderMinus, FiFile, FiCalendar, FiRefreshCw } from 'react-icons/fi';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ru from 'date-fns/locale/ru';
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';

registerLocale('ru', ru);
Chart.register(...registerables);

interface TreeNode {
    id: number;
    name: string;
    children?: TreeNode[];
    data?: {
        currentValue: number;
        previousValue: number;
        consumption: number;
        unit: string;
    };
}

interface ReportData {
    id: number;
    name: string;
    currentValue: number;
    previousValue: number;
    consumption: number;
    unit: string;
}

const getRandomValue = (min: number, max: number, precision = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
};

const generateChartData = (start: Date, end: Date) => {
    const labels = [];
    const consumptionData = [];

    const currentDate = new Date(start);
    const endDate = new Date(end);

    currentDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    while (currentDate <= endDate) {
        labels.push(currentDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        }));
        consumptionData.push(getRandomValue(50, 500));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
        labels,
        datasets: [{
            label: `Потребление (кВт·ч) ${start.toLocaleDateString('ru-RU')} - ${end.toLocaleDateString('ru-RU')}`,
            data: consumptionData,
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1,
            borderRadius: 4,
        }]
    };
};

const generateRandomData = (node: TreeNode): TreeNode => {
    if (node.data) {
        const currentValue = getRandomValue(100, 5000);
        const previousValue = currentValue - getRandomValue(10, 500);
        const consumption = currentValue - previousValue;

        return {
            ...node,
            data: {
                currentValue,
                previousValue,
                consumption: consumption > 0 ? consumption : 0,
                unit: "кВт·ч"
            }
        };
    }
    return node;
};

const generateRandomTreeData = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.map(node => {
        const updatedNode = generateRandomData(node);
        if (updatedNode.children) {
            return {
                ...updatedNode,
                children: generateRandomTreeData(updatedNode.children)
            };
        }
        return updatedNode;
    });
};

const ASKUEReport = () => {
    const [selectedNode, setSelectedNode] = useState<ReportData | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});
    const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() - 7)));
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [chartData, setChartData] = useState<any>(null);
    const [dateError, setDateError] = useState(false);
    const chartRef = useRef<any>(null);

    // Данные для дерева
    const baseTreeData: TreeNode[] = [
        {
            id: 1,
            name: "АБК",
            children: [
                {
                    id: 2,
                    name: "ТП-5",
                    children: [
                        {
                            id: 3,
                            name: "АБК",
                            children: [
                                { id: 4, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                                { id: 5, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                            ]
                        }
                    ]
                },
                { id: 6, name: "АБК R+", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                { id: 7, name: "АБК А+", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
            ]
        },
        {
            id: 8,
            name: "БОУ",
            children: [
                {
                    id: 9,
                    name: "КТПН",
                    children: [
                        {
                            id: 10,
                            name: "Воздуходувка №2",
                            children: [
                                { id: 11, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                                { id: 12, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                            ]
                        },
                        {
                            id: 13,
                            name: "Воздуходувка №3",
                            children: [
                                { id: 14, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                                { id: 15, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                            ]
                        },
                        {
                            id: 16,
                            name: "Дымосос",
                            children: [
                                { id: 17, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                                { id: 18, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                            ]
                        },
                        {
                            id: 19,
                            name: "Компр 250-1 (лев)",
                            children: [
                                { id: 20, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                                { id: 21, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                            ]
                        },
                        {
                            id: 22,
                            name: "Компр 250-2 (прав)",
                            children: [
                                { id: 23, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                                { id: 24, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                            ]
                        },
                        {
                            id: 25,
                            name: "ЩСУ",
                            children: [
                                { id: 26, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                                { id: 27, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                            ]
                        },
                        { id: 28, name: "Компр 250 A+ левый и правый вместе", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                        { id: 29, name: "Компр 250 R+ левый и правый вместе", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                    ]
                },
                {
                    id: 30,
                    name: "ТП-4",
                    children: [
                        {
                            id: 31,
                            name: "Битумоприемник",
                            children: [
                                { id: 32, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                                { id: 33, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                            ]
                        },
                        {
                            id: 34,
                            name: "БОУ",
                            children: [
                                { id: 35, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                                { id: 36, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                            ]
                        },
                        {
                            id: 37,
                            name: "Дымосос",
                            children: [
                                { id: 38, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                                { id: 39, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                            ]
                        }
                    ]
                },
                {
                    id: 40,
                    name: "ТП-5",
                    children: [
                        {
                            id: 41,
                            name: "Компрессор GA110",
                            children: [
                                { id: 42, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                                { id: 43, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                            ]
                        },
                        {
                            id: 44,
                            name: "Компрессор GA160",
                            children: [
                                { id: 45, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                                { id: 46, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                            ]
                        },
                        {
                            id: 47,
                            name: "Компрессор GA250",
                            children: [
                                { id: 48, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                                { id: 49, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                            ]
                        }
                    ]
                },
                {
                    id: 50,
                    name: "Воздуходувка №1",
                    children: [
                        { id: 51, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                        { id: 52, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                    ]
                },
                {
                    id: 53,
                    name: "Насосная дождевых стоков",
                    children: [
                        { id: 54, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                        { id: 55, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                    ]
                },
                { id: 56, name: "БОУ R+", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                { id: 57, name: "БОУ А+", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
            ]
        },
        {
            id: 58,
            name: "БОУ расчет",
            children: [
                { id: 59, name: "БОУ расчет R+", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                { id: 60, name: "БОУ расчет А+", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
            ]
        },
        {
            id: 61,
            name: "ЖДС",
            children: [
                {
                    id: 62,
                    name: "XPS-резка",
                    children: [
                        { id: 63, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                        { id: 64, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                    ]
                },
                {
                    id: 65,
                    name: "ТСХ",
                    children: [
                        { id: 66, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                        { id: 67, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                    ]
                },
                { id: 68, name: "ЖДС R+", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                { id: 69, name: "ЖДС А+", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
            ]
        },
        {
            id: 70,
            name: "ЗНП",
            children: [
                {
                    id: 71,
                    name: "БРЦ",
                    children: [
                        { id: 72, name: "(А+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                        { id: 73, name: "(R+)", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
                    ]
                },
                { id: 74, name: "БДМ А+", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                { id: 75, name: "БДМ R+", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                { id: 76, name: "ЗНП площадка", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                { id: 77, name: "ЗНП площадка + н-с УРАЛ", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                { id: 78, name: "котельня R+", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                { id: 79, name: "котельня А+", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                { id: 80, name: "макулатурное отд", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                { id: 81, name: "машина", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } },
                { id: 82, name: "ПРС", data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" } }
            ]
        },
        // Продолжение остальных разделов...
        {
            id: 200,
            name: "Центр-Инвест",
            data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" }
        },
        {
            id: 201,
            name: "Болланс",
            data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" }
        },
        {
            id: 202,
            name: "Расчет баланса R+",
            data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" }
        },
        {
            id: 203,
            name: "Расчет баланса А+",
            data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" }
        },
        {
            id: 204,
            name: "Суммарное потребление",
            data: { currentValue: 0, previousValue: 0, consumption: 0, unit: "кВт·ч" }
        }
    ];

    const getAllNodes = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.flatMap(node => [node, ...(node.children ? getAllNodes(node.children) : [])]);
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const generatedData = generateRandomTreeData(baseTreeData);
            setTreeData(generatedData);

            if (startDate && endDate) {
                updateChartData(startDate, endDate);
            }

            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleDateChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;

        setDateError(false);

        if (start && end) {
            if (start > end) {
                setDateError(true);
                return;
            }

            const startWithTime = new Date(start);
            startWithTime.setHours(0, 0, 0, 0);

            const endWithTime = new Date(end);
            endWithTime.setHours(23, 59, 59, 999);

            setStartDate(startWithTime);
            setEndDate(endWithTime);
            updateChartData(startWithTime, endWithTime);
        } else if (start) {
            setStartDate(start);
            setEndDate(null);
            setChartData(null);
        } else {
            setStartDate(null);
            setEndDate(null);
            setChartData(null);
        }
    };

    const updateChartData = (start: Date, end: Date) => {
        setIsLoading(true);
        setTimeout(() => {
            setChartData(generateChartData(start, end));
            setIsLoading(false);
        }, 500);
    };

    const handleRefresh = () => {
        setIsLoading(true);
        const newData = generateRandomTreeData(treeData);
        setTreeData(newData);

        if (startDate && endDate) {
            updateChartData(startDate, endDate);
        } else {
            setChartData(null);
        }

        setIsLoading(false);
    };

    const toggleNode = (nodeId: number) => {
        setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
    };

    const renderTree = (nodes: TreeNode[]) => (
        <ul className="ml-4">
            {nodes.map((node) => (
                <li key={node.id} className="my-1">
                    <div
                        className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${selectedNode?.id === node.id ? 'bg-blue-100 dark:bg-blue-900' : ''
                            }`}
                        onClick={() => {
                            if (node.children) {
                                toggleNode(node.id);
                            } else if (node.data) {
                                setSelectedNode({ id: node.id, name: node.name, ...node.data });
                            }
                        }}
                    >
                        <span className="mr-2">
                            {node.children ? (
                                expandedNodes[node.id] ? (
                                    <FiFolderMinus className="text-blue-500 dark:text-blue-400" />
                                ) : (
                                    <FiFolderPlus className="text-blue-500 dark:text-blue-400" />
                                )
                            ) : (
                                <FiFile className="text-gray-500 dark:text-gray-400" />
                            )}
                        </span>
                        <span>{node.name}</span>
                        {!node.children && node.data && (
                            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                                {node.data.consumption.toLocaleString()} {node.data.unit}
                            </span>
                        )}
                    </div>
                    {node.children && expandedNodes[node.id] && renderTree(node.children)}
                </li>
            ))}
        </ul>
    );

    const allNodes = getAllNodes(treeData);
    const totalConsumption = allNodes.reduce((sum, node) => sum + (node.data?.consumption || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold dark:text-white">
                        Система АСКУЭ
                    </h1>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded transition-colors"
                            disabled={isLoading}
                        >
                            <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Обновить
                        </button>

                        <div className="flex items-center space-x-2">
                            <FiCalendar className="text-gray-500 dark:text-gray-400" />
                            <DatePicker
                                selectsRange
                                startDate={startDate}
                                endDate={endDate}
                                onChange={handleDateChange}
                                isClearable
                                placeholderText="Выберите период"
                                className={`border rounded p-2 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 ${dateError ? 'border-red-500' : ''
                                    }`}
                                dateFormat="dd.MM.yyyy"
                                locale="ru"
                                withPortal
                                minDate={new Date(2020, 0, 1)}
                                maxDate={new Date()}
                                shouldCloseOnSelect={false}
                            />
                            {dateError && (
                                <span className="text-red-500 text-sm">Конечная дата должна быть после начальной</span>
                            )}
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-6 mt-6">
                        <div className="w-full md:w-1/3 p-4 rounded-lg shadow-md bg-white dark:bg-gray-800">
                            <h2 className="text-xl font-semibold mb-4 dark:text-white">
                                Узлы учёта
                            </h2>
                            <div className="overflow-y-auto max-h-[600px]">
                                {renderTree(treeData)}
                            </div>
                        </div>

                        <div className="w-full md:w-2/3 p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
                            {startDate && endDate && (
                                <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                                    Период: {startDate.toLocaleDateString('ru-RU')} - {endDate.toLocaleDateString('ru-RU')}
                                </div>
                            )}

                            {selectedNode ? (
                                <>
                                    <h2 className="text-xl font-semibold mb-6 dark:text-white">
                                        {selectedNode.name}
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                        <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
                                            <h3 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-300">
                                                Текущие показания
                                            </h3>
                                            <p className="text-2xl font-bold dark:text-white">
                                                {selectedNode.currentValue.toLocaleString()} {selectedNode.unit}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
                                            <h3 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-300">
                                                Предыдущие показания
                                            </h3>
                                            <p className="text-2xl font-bold dark:text-white">
                                                {selectedNode.previousValue.toLocaleString()} {selectedNode.unit}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
                                            <h3 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-300">
                                                Потребление
                                            </h3>
                                            <p className="text-2xl font-bold dark:text-white">
                                                {selectedNode.consumption.toLocaleString()} {selectedNode.unit}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-lg mb-6 bg-yellow-50 dark:bg-gray-700">
                                        <h3 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-300">
                                            График потребления
                                        </h3>
                                        <div className="h-64">
                                            {chartData ? (
                                                <Bar
                                                    ref={chartRef}
                                                    data={chartData}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: {
                                                            legend: {
                                                                position: 'top',
                                                                labels: {
                                                                    color: '#6B7280'
                                                                }
                                                            },
                                                            tooltip: {
                                                                mode: 'index',
                                                                intersect: false,
                                                            }
                                                        },
                                                        scales: {
                                                            y: {
                                                                beginAtZero: true,
                                                                grid: {
                                                                    color: 'rgba(209, 213, 219, 0.3)'
                                                                },
                                                                ticks: {
                                                                    color: '#6B7280'
                                                                }
                                                            },
                                                            x: {
                                                                grid: {
                                                                    display: false
                                                                },
                                                                ticks: {
                                                                    color: '#6B7280'
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-full flex items-center justify-center border border-gray-200 dark:border-gray-600 border-dashed rounded">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Выберите период для отображения графика
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-64">
                                    <p className="text-lg text-gray-500 dark:text-gray-400">
                                        Выберите узел учёта для просмотра информации
                                    </p>
                                </div>
                            )}

                            <div className="mt-8 p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
                                <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Общее потребление
                                </h3>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {totalConsumption.toLocaleString()} кВт·ч
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {startDate && endDate ? (
                                        `Суммарное потребление за ${startDate.toLocaleDateString('ru-RU')} - ${endDate.toLocaleDateString('ru-RU')}`
                                    ) : (
                                        "Суммарное потребление по всем узлам"
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ASKUEReport;