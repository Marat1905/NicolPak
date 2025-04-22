import TopChannel from "../../components/analytics/TopChannel";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SalePieChart from "../../components/crm/SalePieChart";

export default function DowntimeByServices() {
    return (
        <>
            <PageMeta
                title="Домашняя - Простои по службам"
                description="Домашняя - Простои по службам"
            />

            <PageBreadcrumb pageTitle="Простои по службам" />
            <div className="col-span-12 xl:col-span-7">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <TopChannel />
                    <SalePieChart />
                </div>
            </div>
           
        </>
    );
}