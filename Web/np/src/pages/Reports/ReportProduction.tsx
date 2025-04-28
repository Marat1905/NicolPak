import BarChartFive from "../../components/charts/bar/BarChartFive";
import BarChartFour from "../../components/charts/bar/BarChartFour";
import BarChartThree from "../../components/charts/bar/BarChartThree";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function ReportProduction() {
    return (
        <div>
            <PageMeta
                title="React.js Chart Dashboard | TailAdmin - React.js Admin Dashboard Template"
                description="This is React.js Chart Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Выпуск ГП" />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12">
                    <ComponentCard title="Выпуск ГП текущий год">
                        <BarChartThree />
                    </ComponentCard>
                </div>

                <div className="col-span-12 xl:col-span-12">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <ComponentCard title="Выпуск ГП текущий год по сменам">
                            <BarChartFour />
                        </ComponentCard>
                        <ComponentCard title="Выпуск ГП текущий месяц по сменам">
                            <BarChartFive />
                        </ComponentCard>
                    </div>
                </div>
              
            </div>
        </div>
    );
}
