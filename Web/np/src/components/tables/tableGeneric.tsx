import { useState, useMemo } from "react";
import { IColumn } from '../../interface/IColumn';

type Props<T> = {
    columns: Array<IColumn<T>>;
    data?: T[];
};

const Table = <T,>({ data, columns }: Props<T>) => {

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortKey, setSortKey] = useState<SortKey>("name");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [searchTerm, setSearchTerm] = useState("");


    const headers = columns.map((column, index) => {
        return (
            <th key={`headCell-${index}`} className="!z-0">
                {column.title}
            </th>
        );
    });

    const rows = !data?.length ? (
        <tr>
            <td colSpan={columns.length} className="text-center">
                No data
            </td>
        </tr>
    ) : (
        data?.map((row, index) => {
            return (
                <tr key={`row-${index}`}>
                    {columns.map((column, index2) => {
                        const value = column.render
                            ? column.render(column, row as T)
                            : (row[column.key as keyof typeof row] as string);

                        return <td key={`cell-${index2}`}>{value}</td>;
                    })}
                </tr>
            );
        })
    );

    return (
        <div className="overflow-x-auto">
            <table className="table w-full">
                <thead className="bg-slate-400 text-black">
                    <tr>{headers}</tr>
                </thead>

                <tbody>{rows}</tbody>
            </table>
        </div>
    );
};

export default Table;