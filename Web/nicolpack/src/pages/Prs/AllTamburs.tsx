import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { GridColDef } from '@mui/x-data-grid';
import { TamburHook } from '../../hooks';
import DataTable from '../../components/control/DataTable';

const columns: GridColDef[] = [
    {
        field: 'id',
        headerName: 'Идентификатор',
        width: 200,
    },
    {
        field: 'tamburContPrs',
        headerName: 'Идентификатор по ПРС',
        minWidth: 200,
        type: 'string',
        flex: 1,
    },
    {
        field: 'createAt',
        headerName: 'Время создания',
        minWidth: 200,
        type: 'string',
        flex: 1,
    },

];


export default function AllTamburs() {
    const { data: tamburs, loading, setData: setUser, error } = TamburHook(true);
    return (
        <>
            <PageMeta
                title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <div className="w-full p-0 m-0">
                <div className="w-full flex flex-col items-stretch gap-3">
                    <div className="w-full flex justify-between mb-5">
                        <div className="flex gap-1 justify-start flex-col items-start">
                            <h2 className="font-bold text-2xl xl:text-4xl mt-0 pt-0 text-base-content dark:text-neutral-200">
                                Тамбура
                            </h2>
                            {tamburs && tamburs.length > 0 && (
                                <span className="text-neutral dark:text-neutral-content font-medium text-base">
                                    Найдено {tamburs.length} тамбуров
                                </span>
                            )}
                        </div>
                    </div>
                    <DataTable
                        slug="Tamburs"
                        columns={columns}
                        rows={tamburs}
                        includeActionColumn={false}
                    />
                </div>
            </div>
        </>
       
    );
}