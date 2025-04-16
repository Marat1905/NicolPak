import RecentOrderAnalytics from "../../components/analytics/RecentOrderAnalytics";
import RecentOrderAnalyticsPred from "../../components/analytics/RecentOrderAnalyticsPred";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function ShiftWorkAnalysis() {
    return (
        <>
            <PageMeta
                title="Домашняя - Анализ работы смен"
                description="Домашняя - Анализ работы смен"
            />

            <PageBreadcrumb pageTitle="Анализ работы смен" />

            <div className="col-span-12 xl:col-span-7">
                <div className="grid grid-cols-1 gap-6 ">
                    <RecentOrderAnalytics />
                    <RecentOrderAnalyticsPred />
                </div>
            </div>

           


        </>
    );
}