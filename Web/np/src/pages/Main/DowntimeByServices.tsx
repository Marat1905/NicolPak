import TopChannel from "../../components/analytics/TopChannel";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function DowntimeByServices() {
    return (
        <>
            <PageMeta
                title="Домашняя - Простои по службам"
                description="Домашняя - Простои по службам"
            />

            <PageBreadcrumb pageTitle="Простои по службам" />

            <div className="grid grid-cols-12 gap-2 md:gap-6">
                <div className="col-span-12">
                    <TopChannel />
                </div>
            </div>

        </>
    );
}