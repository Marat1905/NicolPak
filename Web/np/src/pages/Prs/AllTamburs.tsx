import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

import PageMeta from "../../components/common/PageMeta";
import DataTable from "../../components/tables/DataTable";
import { TamburHook } from '../../hooks';


export default function DataTables() {
    const { data: tamburs, loading, setData: setUser, error } = TamburHook(true);
    return (
         
        <>
            <PageMeta
                title="ПРС-Все тамбура"
                description="ПРС-Все тамбура 1"
            />
            <PageBreadcrumb pageTitle="ПРС" />
            <div className="space-y-5 sm:space-y-6">

                <ComponentCard title="Все тамбура">
                    <DataTable  />
                </ComponentCard>

            </div>
        </>
    );
}