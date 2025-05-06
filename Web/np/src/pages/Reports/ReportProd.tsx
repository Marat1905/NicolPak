import BarChartEight from "../../components/charts/bar/BarChartEight";
import BarChartFive from "../../components/charts/bar/BarChartFive";
import BarChartNine from "../../components/charts/bar/BarChartNine";
import BarChartSeven from "../../components/charts/bar/BarChartSeven";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function ReportProd() {
    return (
        <div>
            <PageMeta
                title="React.js Chart Dashboard | TailAdmin - React.js Admin Dashboard Template"
                description="This is React.js Chart Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Отчет по выпущенной продукции за апрель" />
            <div className="space-y-6">
                <div className="grid grid-cols-12 gap-4 md:gap-6">

                    <div className="col-span-12 xl:col-span-12">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <ComponentCard title="Выпуск продукции по граммажу">
                                <BarChartSeven />
                            </ComponentCard>
                            <ComponentCard title="Выпуск продукции по марке">
                                <BarChartEight />
                            </ComponentCard>
                        </div>
                    </div>

                    {/*<div className="col-span-12 xl:col-span-12">*/}
                    {/*    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">*/}
                    {/*        <ComponentCard title="Выпуск продукции по месяцу">*/}

                    {/*        </ComponentCard>*/}

                    {/*    </div>*/}
                    {/*</div>*/}

                    <div className="col-span-12">
                        <ComponentCard title="Выпуск продукции по месяцу">
                            <BarChartNine/>
                        </ComponentCard>
                    </div>

                </div>
            </div>
        </div>
    );
}
