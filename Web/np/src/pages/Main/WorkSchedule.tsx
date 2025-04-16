import RecentOrderAnalytics from "../../components/analytics/RecentOrderAnalytics";
import RecentOrderAnalyticsPred from "../../components/analytics/RecentOrderAnalyticsPred";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function WorkSchedule() {
    return (
        <>
            <PageMeta
                title="Домашняя - График работы сменного персонала"
                description="Домашняя - График работы сменного персонала"
            />

            <PageBreadcrumb pageTitle="График работы" />

            <div className="col-span-12 xl:col-span-7">
                <div className="grid grid-cols-1 gap-6 ">

                </div>
            </div>




        </>
    );
}