import { GridColDef } from '@mui/x-data-grid';
import { TamburHook } from '../../hooks';
import DataTable from '../control/DataTable';

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
        flex:1,
    },
    {
        field: 'createAt',
        headerName: 'Время создания',
        minWidth: 200,
        type: 'string',
        flex: 1,
    },

];

export const Tamburs = () => {

    const { data: tamburs, loading, setData: setUser, error } = TamburHook(true);

    return (
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
    );
};
export default Tamburs;