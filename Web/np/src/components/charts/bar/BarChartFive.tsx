import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function BarChartFour() {
    const options: ApexOptions = {
        colors: ["#ff2676"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            height: 180,
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "40%",
                borderRadius: 5,
                borderRadiusApplication: "end",
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 1,
            colors: ["transparent"],
        },
        xaxis: {
            categories: [
                "Смена 1",
                "Смена 2",
                "Смена 3",
                "Смена 4",
            ],
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "left",
            fontFamily: "Outfit",
        },
        yaxis: {
            title: {
                text: undefined,
            },
        },
        grid: {
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        fill: {
            opacity: 1,
        },

        tooltip: {
            x: {
                show: false,
            },
            y: {
                formatter: (val: number) => `${val}`,
            },
        },
    };
    const series = [
        {
            name: "Выпуск",
            data: [2579, 2393, 2725, 2571],
        },

    ];
    return (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div id="chartOne" className="min-w-[500px]">
                <Chart options={options} series={series} type="bar" height={380} />
            </div>
        </div>
    );
}
