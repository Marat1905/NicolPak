import React, { useState, useEffect, forwardRef } from "react";
import { FiFolderPlus, FiFolderMinus, FiFile, FiPlus, FiChevronDown, FiChevronRight, FiCalendar, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { v4 as uuidv4 } from 'uuid';
import { Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ru from 'date-fns/locale/ru';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import moment from "moment";

registerLocale('ru', ru);
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface TreeNode {
    key: string;
    title: string;
    type: 'equipment' | 'component' | 'point';
    children?: TreeNode[];
    parentKey?: string;
}

interface Reading {
    id: string;
    pointId: string;
    date: string;
    vibration: number;
    temperature: number;
    comment?: string;
}

const generateInitialTreeData = (): TreeNode[] => [
    {
        key: 'equip-1',
        title: 'PSN-40',
        type: 'equipment',
        children: [
            {
                key: 'comp-1',
                title: 'Электродвигатель',
                type: 'component',
                parentKey: 'equip-1',
                children: [
                    {
                        key: 'point-1',
                        title: 'Передний подшипник',
                        type: 'point',
                        parentKey: 'comp-1'
                    },
                    {
                        key: 'point-2',
                        title: 'Задний подшипник',
                        type: 'point',
                        parentKey: 'comp-1'
                    }
                ]
            },
            {
                key: 'comp-2',
                title: 'Насос',
                type: 'component',
                parentKey: 'equip-1',
                children: [
                    {
                        key: 'point-3',
                        title: 'Передний подшипник',
                        type: 'point',
                        parentKey: 'comp-2'
                    },
                    {
                        key: 'point-4',
                        title: 'Задний подшипник',
                        type: 'point',
                        parentKey: 'comp-2'
                    }
                ]
            }
        ]
    }
];

const generateRandomReadings = (pointId: string, days: number = 30): Reading[] => {
    const readings: Reading[] = [];
    const baseTemp = 30 + Math.random() * 10;
    const baseVibration = 2 + Math.random() * 3;

    for (let i = 0; i < days; i++) {
        const date = moment().subtract(days - i, 'days').format('YYYY-MM-DD');
        const tempFluctuation = Math.sin(i * 0.3) * 5 + (Math.random() * 4 - 2);
        const vibrationFluctuation = Math.sin(i * 0.5) * 1.5 + (Math.random() * 0.5 - 0.25);

        readings.push({
            id: uuidv4(),
            pointId,
            date,
            temperature: +(baseTemp + tempFluctuation).toFixed(1),
            vibration: +(baseVibration + vibrationFluctuation).toFixed(2),
            comment: i % 5 === 0 ? 'Плановый замер' : undefined
        });
    }

    return readings;
};

const Input = ({
    value,
    onChange,
    placeholder,
    type = 'text',
    className = ''
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    className?: string;
}) => {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-full ${className}`}
        />
    );
};

const InputNumber = ({
    value,
    onChange,
    placeholder,
    min,
    max,
    step,
    className = ''
}: {
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
}) => {
    return (
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className={`border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-full ${className}`}
        />
    );
};

const TextArea = ({
    value,
    onChange,
    placeholder,
    rows = 3,
    className = ''
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
}) => {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={`border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-full ${className}`}
        />
    );
};

const Table = ({
    columns,
    data,
    onEdit,
    onDelete,
    className = ''
}: {
    columns: {
        title: string;
        dataIndex: string;
        key: string;
        render?: (value: any, record: any) => React.ReactNode;
        sorter?: (a: any, b: any) => number;
    }[];
    data: any[];
    onEdit?: (record: any) => void;
    onDelete?: (record: any) => void;
    className?: string;
}) => {
    const [sortedData, setSortedData] = useState(data);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    useEffect(() => {
        setSortedData(data);
    }, [data]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        const column = columns.find(col => col.key === key);
        if (column?.sorter) {
            const sorted = [...data].sort((a, b) => {
                if (direction === 'asc') {
                    return column.sorter!(a, b);
                } else {
                    return column.sorter!(b, a);
                }
            });
            setSortedData(sorted);
        }

        setSortConfig({ key, direction });
    };

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                onClick={() => column.sorter && requestSort(column.key)}
                            >
                                <div className="flex items-center">
                                    {column.title}
                                    {sortConfig?.key === column.key && (
                                        <span className="ml-1">
                                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                        {(onEdit || onDelete) && (
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Действия
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                    {sortedData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            {columns.map((column) => (
                                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                    {column.render ? column.render(item[column.dataIndex], item) : item[column.dataIndex]}
                                </td>
                            ))}
                            {(onEdit || onDelete) && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
                                                title="Редактировать"
                                            >
                                                <FiEdit2 />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={() => onDelete(item)}
                                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                                title="Удалить"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const CustomDatePickerInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
        <button
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 flex items-center justify-between w-full"
            onClick={onClick}
            ref={ref}
        >
            {value || "Выберите дату"}
            <FiCalendar className="ml-2 text-gray-500 dark:text-gray-400" />
        </button>
    )
);

const RangeDatePicker = ({ startDate, endDate, onChange }: {
    startDate: Date | null;
    endDate: Date | null;
    onChange: (dates: [Date | null, Date | null]) => void
}) => {
    return (
        <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={onChange}
            customInput={<CustomDatePickerInput />}
            dateFormat="dd.MM.yyyy"
            locale="ru"
            className="w-full"
            popperClassName="z-50"
            popperPlacement="bottom-start"
            withPortal
            shouldCloseOnSelect={false}
        />
    );
};

const VibrationTemperatureMonitoring: React.FC = () => {
    const [treeData, setTreeData] = useState<TreeNode[]>(generateInitialTreeData());
    const [readings, setReadings] = useState<Reading[]>([]);
    const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
        moment().subtract(7, 'days').toDate(),
        moment().toDate()
    ]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isReadingModalVisible, setIsReadingModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
        'equip-1': true,
        'comp-1': true,
        'comp-2': true
    });
    const [addFormValues, setAddFormValues] = useState({
        type: 'equipment',
        name: ''
    });
    const [readingFormValues, setReadingFormValues] = useState<Omit<Reading, 'date'> & { date: Date }>({
        id: '',
        pointId: '',
        date: moment().toDate(),
        vibration: 0,
        temperature: 0,
        comment: ''
    });
    const [dateError, setDateError] = useState(false);

    const toggleNode = (key: string) => {
        setExpandedNodes(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const getAllPoints = (nodes: TreeNode[]): TreeNode[] => {
        let points: TreeNode[] = [];

        nodes.forEach(node => {
            if (node.type === 'point') {
                points.push(node);
            }

            if (node.children) {
                points = [...points, ...getAllPoints(node.children)];
            }
        });

        return points;
    };

    useEffect(() => {
        const points = getAllPoints(treeData);
        const testReadings = points.flatMap(point =>
            generateRandomReadings(point.key, 30)
        );
        setReadings(testReadings);
    }, [treeData]);

    const handleNodeClick = (node: TreeNode) => {
        setSelectedNode(node);

        if (node.type === 'point') {
            setSelectedPoint(node.key);
        } else {
            setSelectedPoint(null);
        }
    };

    const handleDateChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setDateError(false);

        if (start && end) {
            if (start > end) {
                setDateError(true);
                return;
            }
            setDateRange([start, end]);
        } else if (start) {
            setDateRange([start, null]);
        } else {
            setDateRange([null, null]);
        }
    };

    const renderTree = (nodes: TreeNode[]) => (
        <ul className="ml-4">
            {nodes.map((node) => (
                <li key={node.key} className="my-1">
                    <div
                        className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${selectedNode?.key === node.key ? 'bg-blue-100 dark:bg-blue-900' : ''
                            }`}
                        onClick={() => {
                            if (node.children) {
                                toggleNode(node.key);
                            }
                            handleNodeClick(node);
                        }}
                    >
                        <span className="mr-2">
                            {node.children ? (
                                expandedNodes[node.key] ? (
                                    <FiChevronDown className="text-blue-500 dark:text-blue-400" />
                                ) : (
                                    <FiChevronRight className="text-blue-500 dark:text-blue-400" />
                                )
                            ) : (
                                <FiFile className="text-gray-500 dark:text-gray-400" />
                            )}
                        </span>
                        <span className="dark:text-gray-100">{node.title}</span>
                        <div className="ml-auto">
                            {node.type === 'equipment' && (
                                <button
                                    className="text-blue-500 dark:text-blue-400 text-sm hover:text-blue-700 dark:hover:text-blue-300"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNode(node);
                                        setAddFormValues({ type: 'component', name: '' });
                                        setIsAddModalVisible(true);
                                    }}
                                >
                                    <FiPlus className="inline mr-1" />
                                    Компонент
                                </button>
                            )}
                            {node.type === 'component' && (
                                <button
                                    className="text-blue-500 dark:text-blue-400 text-sm hover:text-blue-700 dark:hover:text-blue-300"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNode(node);
                                        setAddFormValues({ type: 'point', name: '' });
                                        setIsAddModalVisible(true);
                                    }}
                                >
                                    <FiPlus className="inline mr-1" />
                                    Точка
                                </button>
                            )}
                        </div>
                    </div>
                    {node.children && expandedNodes[node.key] && renderTree(node.children)}
                </li>
            ))}
        </ul>
    );

    const handleAddNode = () => {
        if (!addFormValues.name.trim()) {
            alert('Пожалуйста, введите название');
            return;
        }

        const newNode: TreeNode = {
            key: uuidv4(),
            title: addFormValues.name,
            type: addFormValues.type as 'equipment' | 'component' | 'point',
            parentKey: selectedNode?.key || undefined
        };

        const addNode = (nodes: TreeNode[]): TreeNode[] => {
            return nodes.map(node => {
                if (node.key === selectedNode?.key) {
                    return {
                        ...node,
                        children: [...(node.children || []), newNode]
                    };
                }

                if (node.children) {
                    return {
                        ...node,
                        children: addNode(node.children)
                    };
                }

                return node;
            });
        };

        const newTreeData = selectedNode ? addNode(treeData) : [...treeData, newNode];
        setTreeData(newTreeData);

        if (addFormValues.type === 'point') {
            const newReadings = generateRandomReadings(newNode.key, 30);
            setReadings([...readings, ...newReadings]);
        }

        setIsAddModalVisible(false);
        setAddFormValues({ type: 'equipment', name: '' });
    };

    const handleAddReading = () => {
        if (!readingFormValues.date || !readingFormValues.vibration || !readingFormValues.temperature) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        const newReading: Reading = {
            id: uuidv4(),
            pointId: selectedPoint!,
            date: moment(readingFormValues.date).format('YYYY-MM-DD'),
            vibration: readingFormValues.vibration,
            temperature: readingFormValues.temperature,
            comment: readingFormValues.comment
        };

        setReadings([...readings, newReading]);
        setIsReadingModalVisible(false);
        setReadingFormValues({
            id: '',
            pointId: '',
            date: moment().toDate(),
            vibration: 0,
            temperature: 0,
            comment: ''
        });
    };

    const handleEditReading = (reading: Reading) => {
        setReadingFormValues({
            id: reading.id,
            pointId: reading.pointId,
            date: moment(reading.date).toDate(),
            vibration: reading.vibration,
            temperature: reading.temperature,
            comment: reading.comment || ''
        });
        setIsEditModalVisible(true);
    };

    const handleUpdateReading = () => {
        if (!readingFormValues.date || !readingFormValues.vibration || !readingFormValues.temperature) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        setReadings(readings.map(r =>
            r.id === readingFormValues.id ? {
                ...r,
                date: moment(readingFormValues.date).format('YYYY-MM-DD'),
                vibration: readingFormValues.vibration,
                temperature: readingFormValues.temperature,
                comment: readingFormValues.comment
            } : r
        ));

        setIsEditModalVisible(false);
        setReadingFormValues({
            id: '',
            pointId: '',
            date: moment().toDate(),
            vibration: 0,
            temperature: 0,
            comment: ''
        });
    };

    const handleDeleteReading = (reading: Reading) => {
        if (window.confirm('Вы уверены, что хотите удалить это показание?')) {
            setReadings(readings.filter(r => r.id !== reading.id));
        }
    };

    const filteredReadings = readings
        .filter(reading => {
            if (selectedPoint && reading.pointId !== selectedPoint) return false;
            if (dateRange[0] && dateRange[1]) {
                const date = moment(reading.date);
                return date.isBetween(moment(dateRange[0]), moment(dateRange[1]), null, "[]");
            }
            return true;
        })
        .sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());

    const prepareChartData = () => {
        const sortedReadings = [...filteredReadings].sort((a, b) =>
            moment(a.date).valueOf() - moment(b.date).valueOf()
        );

        const labels = sortedReadings.map(reading =>
            moment(reading.date).format("DD.MM.YYYY")
        );

        const vibrationData = sortedReadings.map(reading => reading.vibration);
        const temperatureData = sortedReadings.map(reading => reading.temperature);

        return {
            labels,
            datasets: [
                {
                    label: "Вибрация, мм/с",
                    data: vibrationData,
                    borderColor: "rgb(255, 99, 132)",
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    yAxisID: "y",
                },
                {
                    label: "Температура, °C",
                    data: temperatureData,
                    borderColor: "rgb(53, 162, 235)",
                    backgroundColor: "rgba(53, 162, 235, 0.5)",
                    yAxisID: "y1",
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        interaction: {
            mode: "index",
            intersect: false,
        },
        scales: {
            y: {
                type: "linear" as const,
                display: true,
                position: "left" as const,
                title: {
                    display: true,
                    text: "Вибрация, мм/с",
                    color: '#9CA3AF',
                },
                grid: {
                    color: '#4B5563',
                },
                ticks: {
                    color: '#9CA3AF',
                }
            },
            y1: {
                type: "linear" as const,
                display: true,
                position: "right" as const,
                grid: {
                    drawOnChartArea: false,
                },
                title: {
                    display: true,
                    text: "Температура, °C",
                    color: '#9CA3AF',
                },
                ticks: {
                    color: '#9CA3AF',
                }
            },
            x: {
                grid: {
                    color: '#4B5563',
                },
                ticks: {
                    color: '#9CA3AF',
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#9CA3AF',
                }
            }
        }
    };

    const readingsColumns = [
        {
            title: 'Дата',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => <span className="dark:text-gray-200">{moment(date).format('DD.MM.YYYY')}</span>,
            sorter: (a: Reading, b: Reading) => moment(a.date).valueOf() - moment(b.date).valueOf(),
        },
        {
            title: 'Вибрация, мм/с',
            dataIndex: 'vibration',
            key: 'vibration',
            render: (value: number) => <span className="dark:text-gray-200">{value}</span>,
            sorter: (a: Reading, b: Reading) => a.vibration - b.vibration,
        },
        {
            title: 'Температура, °C',
            dataIndex: 'temperature',
            key: 'temperature',
            render: (value: number) => <span className="dark:text-gray-200">{value}</span>,
            sorter: (a: Reading, b: Reading) => a.temperature - b.temperature,
        },
        {
            title: 'Комментарий',
            dataIndex: 'comment',
            key: 'comment',
            render: (comment: string | undefined, record: Reading) => (
                <span className="dark:text-gray-200">{comment || '-'}</span>
            ),
        },
    ];

    return (
        <div className="flex gap-5 p-5 bg-gray-50 dark:bg-gray-800 min-h-screen transition-colors duration-300">
            {/* Панель оборудования */}
            <div className="w-[400px] bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Оборудование</h3>
                </div>
                <div className="p-4">
                    {renderTree(treeData)}
                    <button
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 py-2 px-4 rounded transition-colors"
                        onClick={() => {
                            setSelectedNode(null);
                            setAddFormValues({ type: 'equipment', name: '' });
                            setIsAddModalVisible(true);
                        }}
                    >
                        Добавить оборудование
                    </button>
                </div>
            </div>

            {/* Основное содержимое */}
            <div className="flex-1 flex flex-col gap-5">
                {/* Графики показаний */}
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Графики показаний</h3>
                    </div>
                    <div className="p-4">
                        <div className="mb-4 flex items-center">
                            <div className="w-64">
                                <RangeDatePicker
                                    startDate={dateRange[0]}
                                    endDate={dateRange[1]}
                                    onChange={handleDateChange}
                                />
                                {dateError && (
                                    <p className="text-red-500 text-sm mt-1">Конечная дата должна быть после начальной</p>
                                )}
                            </div>
                            {selectedPoint && (
                                <button
                                    className="ml-4 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 py-1 px-4 rounded transition-colors"
                                    onClick={() => {
                                        setReadingFormValues({
                                            id: '',
                                            pointId: selectedPoint,
                                            date: moment().toDate(),
                                            vibration: 0,
                                            temperature: 0,
                                            comment: ''
                                        });
                                        setIsReadingModalVisible(true);
                                    }}
                                >
                                    Добавить показания
                                </button>
                            )}
                        </div>

                        {selectedPoint ? (
                            <div className="h-[400px]">
                                <Line data={prepareChartData()} options={chartOptions} />
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                Выберите контрольную точку для отображения графиков
                            </div>
                        )}
                    </div>
                </div>

                {/* История показаний */}
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">История показаний</h3>
                    </div>
                    <div className="p-4">
                        <Table
                            columns={readingsColumns}
                            data={filteredReadings}
                            onEdit={handleEditReading}
                            onDelete={handleDeleteReading}
                            className="[&_th]:px-4 [&_th]:py-2 [&_td]:px-4 [&_td]:py-2"
                        />
                    </div>
                </div>
            </div>

            {/* Модальное окно добавления узла */}
            {isAddModalVisible && (
                <div className="fixed inset-0 bg-black/50 dark:bg-gray-900/70 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                    <div className="rounded-lg shadow-xl w-full max-w-md flex flex-col bg-white dark:bg-gray-800 transition-colors duration-300">
                        <div className="px-6 py-4 bg-blue-600 dark:bg-gray-700 text-white flex justify-between items-center">
                            <h2 className="text-xl font-semibold">
                                Добавить {addFormValues.type === 'equipment' ? 'оборудование' :
                                    addFormValues.type === 'component' ? 'компонент' : 'контрольную точку'}
                            </h2>
                            <button
                                onClick={() => setIsAddModalVisible(false)}
                                className="p-1 rounded-full hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
                                aria-label="Закрыть"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Тип
                                    </label>
                                    <select
                                        value={addFormValues.type}
                                        onChange={(e) => setAddFormValues({ ...addFormValues, type: e.target.value })}
                                        className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-full"
                                    >
                                        <option value="equipment">Оборудование</option>
                                        <option value="component">Компонент</option>
                                        <option value="point">Контрольная точка</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Название
                                    </label>
                                    <Input
                                        value={addFormValues.name}
                                        onChange={(value) => setAddFormValues({ ...addFormValues, name: value })}
                                        placeholder="Введите название"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-2">
                            <button
                                onClick={() => setIsAddModalVisible(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleAddNode}
                                disabled={!addFormValues.name.trim()}
                                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors ${!addFormValues.name.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Добавить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно добавления показаний */}
            {isReadingModalVisible && (
                <div className="fixed inset-0 bg-black/50 dark:bg-gray-900/70 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                    <div className="rounded-lg shadow-xl w-full max-w-md flex flex-col bg-white dark:bg-gray-800 transition-colors duration-300">
                        <div className="px-6 py-4 bg-blue-600 dark:bg-gray-700 text-white flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Добавить показания</h2>
                            <button
                                onClick={() => setIsReadingModalVisible(false)}
                                className="p-1 rounded-full hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
                                aria-label="Закрыть"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Дата
                                    </label>
                                    <DatePicker
                                        selected={readingFormValues.date}
                                        onChange={(date) => setReadingFormValues({ ...readingFormValues, date: date || new Date() })}
                                        customInput={<CustomDatePickerInput />}
                                        dateFormat="dd.MM.yyyy"
                                        locale="ru"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Вибрация, мм/с
                                    </label>
                                    <InputNumber
                                        value={readingFormValues.vibration}
                                        onChange={(value) => setReadingFormValues({ ...readingFormValues, vibration: value })}
                                        min={0}
                                        max={20}
                                        step={0.01}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Температура, °C
                                    </label>
                                    <InputNumber
                                        value={readingFormValues.temperature}
                                        onChange={(value) => setReadingFormValues({ ...readingFormValues, temperature: value })}
                                        min={-50}
                                        max={150}
                                        step={0.1}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Комментарий
                                    </label>
                                    <TextArea
                                        value={readingFormValues.comment}
                                        onChange={(value) => setReadingFormValues({ ...readingFormValues, comment: value })}
                                        placeholder="Введите комментарий"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-2">
                            <button
                                onClick={() => setIsReadingModalVisible(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleAddReading}
                                disabled={!readingFormValues.date || !readingFormValues.vibration || !readingFormValues.temperature}
                                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors ${!readingFormValues.date || !readingFormValues.vibration || !readingFormValues.temperature ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Добавить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно редактирования показаний */}
            {isEditModalVisible && (
                <div className="fixed inset-0 bg-black/50 dark:bg-gray-900/70 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                    <div className="rounded-lg shadow-xl w-full max-w-md flex flex-col bg-white dark:bg-gray-800 transition-colors duration-300">
                        <div className="px-6 py-4 bg-blue-600 dark:bg-gray-700 text-white flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Редактировать показания</h2>
                            <button
                                onClick={() => setIsEditModalVisible(false)}
                                className="p-1 rounded-full hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
                                aria-label="Закрыть"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Дата
                                    </label>
                                    <DatePicker
                                        selected={readingFormValues.date}
                                        onChange={(date) => setReadingFormValues({ ...readingFormValues, date: date || new Date() })}
                                        customInput={<CustomDatePickerInput />}
                                        dateFormat="dd.MM.yyyy"
                                        locale="ru"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Вибрация, мм/с
                                    </label>
                                    <InputNumber
                                        value={readingFormValues.vibration}
                                        onChange={(value) => setReadingFormValues({ ...readingFormValues, vibration: value })}
                                        min={0}
                                        max={20}
                                        step={0.01}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Температура, °C
                                    </label>
                                    <InputNumber
                                        value={readingFormValues.temperature}
                                        onChange={(value) => setReadingFormValues({ ...readingFormValues, temperature: value })}
                                        min={-50}
                                        max={150}
                                        step={0.1}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Комментарий
                                    </label>
                                    <TextArea
                                        value={readingFormValues.comment}
                                        onChange={(value) => setReadingFormValues({ ...readingFormValues, comment: value })}
                                        placeholder="Введите комментарий"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-2">
                            <button
                                onClick={() => setIsEditModalVisible(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleUpdateReading}
                                disabled={!readingFormValues.date || !readingFormValues.vibration || !readingFormValues.temperature}
                                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors ${!readingFormValues.date || !readingFormValues.vibration || !readingFormValues.temperature ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VibrationTemperatureMonitoring;