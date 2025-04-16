import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";

// Define the TypeScript interface for the table rows
interface ShiftWork {
    id: number; //
    place: string; // 
    shift: string;
    numberOfShifts: number; // 
    breakWet: number; // 
    breakSush: number; // 
    plan: string;
    fact: string;
    deviation: string;
    downtime: string;
    averageOutput: string;
}

// Define the table data using the interface
const tableData: ShiftWork[] = [
    {
        id: 1,
        place: "1 место",
        shift: "Смена 3",
        numberOfShifts: 15,
        breakWet: 3,
        breakSush: 14,
        plan: "2 868 000",
        fact: "2 881 848",
        deviation: "13 848",
        downtime: "17 ч. 22 мин.",
        averageOutput: "192 123",
    },
    {
        id: 2,
        place: "2 место",
        shift: "Смена 2",
        numberOfShifts: 16,
        breakWet: 2,
        breakSush: 17,
        plan: "2 878 000",
        fact: "2 879 360",
        deviation: "1 360",
        downtime: "34 ч. 41 мин.",
        averageOutput: "179 960",
    },
    {
        id: 3,
        place: "3 место",
        shift: "Смена 1",
        numberOfShifts: 15,
        breakWet: 5,
        breakSush: 16,
        plan: "2 648 000",
        fact: "2 648 561",
        deviation: "561",
        downtime: "24 ч. 36 мин.",
        averageOutput: "176 570",
    },
    {
        id: 4,
        place: "4 место",
        shift: "Смена 4",
        numberOfShifts: 16,
        breakWet: 11,
        breakSush: 11,
        plan: "2 858 000",
        fact: "2 858 360",
        deviation: "360",
        downtime: "26 ч. 57 мин.",
        averageOutput: "178 647",
    },

];

export default function RecentOrderAnalytics() {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white  dark:border-white/[0.05] dark:bg-white/[0.03] ">
            <div className="px-4 pt-4 sm:px-6">
                <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Предыдущий месяц
                        </h3>
                    </div>
                </div>
            </div>
            <div className="max-w-full ">
                <div className="overflow-x-auto">
                    <Table>
                        {/* Table Header */}
                        <TableHeader className="border-gray-100 border-y dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Место
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Смена
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Количество смен
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Обрывы сеточная часть
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Обрывы сушильная часть
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
                                >
                                    План
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Факт.
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Отклонение
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Простои
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Средняя сменная выроботка
                                </TableCell>

                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {tableData.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="px-4 py-3 font-medium text-gray-800 sm:px-6 text-start text-theme-sm dark:text-white/90">
                                        {product.place}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                                        {product.shift}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                                        {product.numberOfShifts}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                                        {product.breakWet}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                                        {product.breakSush}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                                        {product.plan}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                                        {product.fact}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                                        {product.deviation}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                                        {product.downtime}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                                        {product.averageOutput}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
