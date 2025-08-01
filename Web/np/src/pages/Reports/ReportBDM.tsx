import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

interface Downtime {
    id: number;
    start_time: string;
    end_time: string;
    duration: number;
    reason: string;
    department: string;
}

interface Transition {
    id: number;
    product_name: string;
    start_time: string;
    end_time: string;
    duration: number;
    waste: number;
}

interface Staff {
    id: number;
    name: string;
    position: string;
    shift: "day" | "night";
}

interface Resources {
    electricity: number;
    steam: number;
    water: number;
    date: string;
    shift: "day" | "night";
}

interface Report {
    id: string;
    date: string;
    shift: "day" | "night";
    downtimes: Downtime[];
    transitions: Transition[];
    staff: Staff[];
    resources: Resources;
}

const reasons = [
    "Обрыв полотна",
    "Смена рулона",
    "Техническое обслуживание",
    "Авария",
    "Отсутствие сырья",
    "Проблемы с гидравликой"
];

const departments = [
    "Намотка",
    "Пресс",
    "Сушка",
    "Подготовка массы",
    "Насосная"
];

const products = [
    "Бумага газетная 45г/м2",
    "Бумага офсетная 80г/м2",
    "Картон 250г/м2",
    "Бумага мелованная 90г/м2",
    "Бумага упаковочная 120г/м2"
];

const positions = [
    "Оператор БДМ",
    "Мастер смены",
    "Наладчик",
    "Слесарь",
    "Электрик",
    "Инженер"
];

const names = [
    "Иванов А.П.",
    "Петров С.М.",
    "Сидоров В.Н.",
    "Кузнецова О.И.",
    "Смирнов Д.В.",
    "Васильева Е.К."
];

const randomShiftTime = (date: Date, shift: "day" | "night") => {
    const shiftStart = new Date(date);
    shiftStart.setHours(shift === "day" ? 8 : 20, 0, 0, 0);
    const randomMinutes = Math.floor(Math.random() * 720);
    return new Date(shiftStart.getTime() + randomMinutes * 60000);
};

const generateRandomReport = (date: Date, shift: "day" | "night"): Report => {
    const downtimeCount = 3 + Math.floor(Math.random() * 6);
    const downtimes: Downtime[] = [];

    for (let i = 0; i < downtimeCount; i++) {
        const start = randomShiftTime(date, shift);
        const duration = 5 + Math.floor(Math.random() * 55);
        const end = new Date(start.getTime() + duration * 60000);

        downtimes.push({
            id: i + 1,
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            duration,
            reason: reasons[Math.floor(Math.random() * reasons.length)],
            department: departments[Math.floor(Math.random() * departments.length)]
        });
    }

    const transitionCount = 2 + Math.floor(Math.random() * 3);
    const transitions: Transition[] = [];

    for (let i = 0; i < transitionCount; i++) {
        const start = randomShiftTime(date, shift);
        const duration = 10 + Math.floor(Math.random() * 50);
        const end = new Date(start.getTime() + duration * 60000);

        transitions.push({
            id: i + 1,
            product_name: products[Math.floor(Math.random() * products.length)],
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            duration,
            waste: Math.floor(Math.random() * 500)
        });
    }

    const staffCount = 5 + Math.floor(Math.random() * 4);
    const staff: Staff[] = [];

    for (let i = 0; i < staffCount; i++) {
        staff.push({
            id: i + 1,
            name: names[Math.floor(Math.random() * names.length)],
            position: positions[Math.floor(Math.random() * positions.length)],
            shift
        });
    }

    const resources: Resources = {
        electricity: 5000 + Math.floor(Math.random() * 10000),
        steam: 10 + Math.floor(Math.random() * 20),
        water: 100 + Math.floor(Math.random() * 400),
        date: date.toISOString().split('T')[0],
        shift
    };

    return {
        id: `${date.toISOString().split('T')[0]}_${shift}`,
        date: date.toISOString().split('T')[0],
        shift,
        downtimes,
        transitions,
        staff,
        resources
    };
};

const generateReportsHistory = () => {
    const reports: Report[] = [];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        reports.push(generateRandomReport(date, "day"));
        reports.push(generateRandomReport(date, "night"));
    }

    return reports;
};

export default function ReportBDM() {
    const [currentReport, setCurrentReport] = useState<Report | null>(null);
    const [reportsHistory, setReportsHistory] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentShift, setCurrentShift] = useState<"day" | "night">("day");
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<Report>>({});
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const now = new Date();
        const hours = now.getHours();
        const shift = hours >= 8 && hours < 20 ? "day" : "night";
        setCurrentShift(shift);
    }, []);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            try {
                const now = new Date();
                const history = generateReportsHistory();
                setReportsHistory(history);

                const currentId = `${now.toISOString().split('T')[0]}_${currentShift}`;
                let report = history.find(r => r.id === currentId);

                if (!report) {
                    report = generateRandomReport(now, currentShift);
                    setReportsHistory([report, ...history]);
                }

                setCurrentReport(report);
                setEditData({ ...report });
            } catch (err) {
                setError("Ошибка загрузки данных");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [currentShift]);

    const loadReport = (reportId: string) => {
        const report = reportsHistory.find(r => r.id === reportId);
        if (report) {
            setCurrentReport(report);
            setEditData({ ...report });
            setEditing(false);
            setShowHistory(false);
        }
    };

    const handleEditChange = (field: keyof Report, value: any) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        if (currentReport) {
            const updatedReport = { ...currentReport, ...editData };
            setCurrentReport(updatedReport);
            setReportsHistory(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
            setEditing(false);
        }
    };

    if (!currentReport) return null;

    const totalDowntime = currentReport.downtimes.reduce((sum, item) => sum + item.duration, 0);
    const totalTransitionTime = currentReport.transitions.reduce((sum, item) => sum + item.duration, 0);
    const totalWaste = currentReport.transitions.reduce((sum, item) => sum + item.waste, 0);
    const productiveTime = 720 - totalDowntime - totalTransitionTime;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <PageMeta title="Отчет БДМ" description="Отчет БДМ" />
            <PageBreadcrumb pageTitle="Отчет БДМ" />

            <div className="space-y-6 p-4">
                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Отчет БДМ</h2>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Смена: {currentReport.shift === "day" ? "Дневная (08:00-20:00)" : "Ночная (20:00-08:00)"}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Дата: {new Date(currentReport.date).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setShowHistory(!showHistory)}
                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-800 dark:text-gray-100"
                                    >
                                        {showHistory ? "Скрыть историю" : "История смен"}
                                    </button>

                                    {!editing ? (
                                        <button
                                            onClick={() => setEditing(true)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded text-white"
                                        >
                                            Редактировать
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleSave}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 rounded text-white"
                                            >
                                                Сохранить
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditing(false);
                                                    setEditData({ ...currentReport });
                                                }}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded text-white"
                                            >
                                                Отмена
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {showHistory && (
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">История смен</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Дата</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Смена</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Обрывов</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Простой (мин)</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Действия</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {reportsHistory.map((report) => (
                                                <tr key={report.id} className={report.id === currentReport.id ? "bg-blue-50 dark:bg-blue-900" : "hover:bg-gray-50 dark:hover:bg-gray-700"}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {new Date(report.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {report.shift === "day" ? "Дневная" : "Ночная"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {report.downtimes.length}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {report.downtimes.reduce((sum, item) => sum + item.duration, 0)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        <button
                                                            onClick={() => loadReport(report.id)}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            Просмотреть
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Общее время простоя</h3>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{totalDowntime} мин</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Время переходов</h3>
                                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{totalTransitionTime} мин</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Продуктивное время</h3>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{productiveTime} мин</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Обрывов</h3>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentReport.downtimes.length}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Обрывы</h3>
                                {editing && (
                                    <button
                                        onClick={() => {
                                            const newDowntime: Downtime = {
                                                id: Math.max(...editData.downtimes?.map(d => d.id) || [0]) + 1,
                                                start_time: new Date().toISOString(),
                                                end_time: new Date(Date.now() + 5 * 60000).toISOString(),
                                                duration: 5,
                                                reason: "Новый обрыв",
                                                department: "Общее"
                                            };
                                            handleEditChange("downtimes", [...(editData.downtimes || []), newDowntime]);
                                        }}
                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 rounded text-white text-sm"
                                    >
                                        + Добавить обрыв
                                    </button>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Время начала</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Время окончания</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Длительность (мин)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Причина</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Участок</th>
                                            {editing && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Действия</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {(editing ? editData.downtimes : currentReport.downtimes)?.map((downtime, index) => (
                                            <tr key={downtime.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {new Date(downtime.start_time).toLocaleTimeString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {new Date(downtime.end_time).toLocaleTimeString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {downtime.duration}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {downtime.reason}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {downtime.department}
                                                </td>
                                                {editing && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        <button
                                                            onClick={() => {
                                                                handleEditChange("downtimes", (editData.downtimes || []).filter((_, i) => i !== index));
                                                            }}
                                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        >
                                                            Удалить
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Переходы</h3>
                                {editing && (
                                    <button
                                        onClick={() => {
                                            const newTransition: Transition = {
                                                id: Math.max(...editData.transitions?.map(t => t.id) || [0]) + 1,
                                                product_name: "Новый переход",
                                                start_time: new Date().toISOString(),
                                                end_time: new Date(Date.now() + 30 * 60000).toISOString(),
                                                duration: 30,
                                                waste: 0
                                            };
                                            handleEditChange("transitions", [...(editData.transitions || []), newTransition]);
                                        }}
                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 rounded text-white text-sm"
                                    >
                                        + Добавить переход
                                    </button>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Продукция</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Время начала</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Время окончания</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Длительность (мин)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Брак (кг)</th>
                                            {editing && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Действия</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {(editing ? editData.transitions : currentReport.transitions)?.map((transition, index) => (
                                            <tr key={transition.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {transition.product_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {new Date(transition.start_time).toLocaleTimeString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {new Date(transition.end_time).toLocaleTimeString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {transition.duration}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {transition.waste}
                                                </td>
                                                {editing && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        <button
                                                            onClick={() => {
                                                                handleEditChange("transitions", (editData.transitions || []).filter((_, i) => i !== index));
                                                            }}
                                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        >
                                                            Удалить
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <td colSpan={editing ? 4 : 3} className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase">
                                                Итого
                                            </td>
                                            <td className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                                                {totalWaste} кг
                                            </td>
                                            {editing && <td></td>}
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Рабочий персонал</h3>
                                    {editing && (
                                        <button
                                            onClick={() => {
                                                const newStaff: Staff = {
                                                    id: Math.max(...editData.staff?.map(s => s.id) || [0]) + 1,
                                                    name: "Новый сотрудник",
                                                    position: "Оператор",
                                                    shift: currentShift
                                                };
                                                handleEditChange("staff", [...(editData.staff || []), newStaff]);
                                            }}
                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 rounded text-white text-sm"
                                        >
                                            + Добавить
                                        </button>
                                    )}
                                </div>
                                <ul className="space-y-2">
                                    {(editing ? editData.staff : currentReport.staff)?.map((person, index) => (
                                        <li key={person.id} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                            <span className="text-gray-800 dark:text-gray-100">{person.name}</span>
                                            <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-2 py-1 rounded">
                                                {person.position}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Ресурсы</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-800 dark:text-gray-100">Электроэнергия</span>
                                        <span className="font-medium">{currentReport.resources.electricity.toLocaleString()} кВт*ч</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-800 dark:text-gray-100">Пар</span>
                                        <span className="font-medium">{currentReport.resources.steam} т</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-800 dark:text-gray-100">Вода</span>
                                        <span className="font-medium">{currentReport.resources.water} м³</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}