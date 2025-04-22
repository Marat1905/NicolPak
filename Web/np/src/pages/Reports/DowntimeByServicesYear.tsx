import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import BarChartOne from "../../components/charts/bar/BarChartOne";
import PageMeta from "../../components/common/PageMeta";
import BarChartTwo from "../../components/charts/bar/BarChartTwo";

export default function BarChart() {
    return (
        <div>
            <PageMeta
                title="React.js Chart Dashboard | TailAdmin - React.js Admin Dashboard Template"
                description="This is React.js Chart Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Простои по службам" />
            <div className="space-y-6">
                <ComponentCard title="Простои по службам КДЦ за 2024 год">
                    <BarChartOne />
                </ComponentCard>
                <ComponentCard title="Простои по службам КДЦ за 2024 год">
                    <BarChartTwo />
                </ComponentCard>
            </div>
        </div>
    );
}
