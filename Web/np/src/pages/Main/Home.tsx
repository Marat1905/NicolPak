import AnalyticsMetrics from "../../components/analytics/AnalyticsMetrics";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
    return (
        <>
            <PageMeta
                title="Домашняя - Главная"
                description="Домашняя - Главная"
            />
           
            <div className="grid grid-cols-12 gap-2 md:gap-6">
                <div className="col-span-12">
                    <AnalyticsMetrics />
                </div>
            </div>
           
        </>
    );
}