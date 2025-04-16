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
        numberOfShifts: 8,
        breakWet: 0,
        breakSush: 5,
        plan: "1 571 000", 
        fact: "1 591 740", 
        deviation: "20 740", 
        downtime: "7 ч. 26 мин.", 
        averageOutput: "198 967", 
    },
    {
        id: 2,
        place: "2 место",
        shift: "Смена 1",
        numberOfShifts: 8,
        breakWet: 3,
        breakSush: 3,
        plan: "1 636 000",
        fact: "1 642 152",
        deviation: "6 152",
        downtime: "4 ч. 14 мин.",
        averageOutput: "205 269", 
    },
    {
        id: 3,
        place: "3 место",
        shift: "Смена 4",
        numberOfShifts: 8,
        breakWet: 6,
        breakSush: 1,
        plan: "1 421 000",
        fact: "1 40 400",
        deviation: "-11 600",
        downtime: "11 ч. 52 мин.",
        averageOutput: "176 175", 
    },
    {
        id: 4,
        place: "4 место",
        shift: "Смена 2",
        numberOfShifts: 7,
        breakWet: 4,
        breakSush: 5,
        plan: "1 408 000",
        fact: "1 395 846",
        deviation: "-12 154",
        downtime: "5 ч. 26 мин.",
        averageOutput: "199 406", 
    },
    
];

export default function RecentOrderAnalytics() {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white  dark:border-white/[0.05] dark:bg-white/[0.03] ">
            <div className="px-4 pt-4 sm:px-6">
                <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Текущий месяц
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
