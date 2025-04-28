import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function BarChartThree() {
    const options: ApexOptions = {
        colors: ["#465fff", "#ff2676", "#26ff55", "#ff26f8"],
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
                columnWidth: "69%",
                borderRadius: 5,
                borderRadiusApplication: "end",
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 4,
            colors: ["transparent"],
        },
        xaxis: {
            categories: [
                "Январь",
                "Февраль",
                "Март",
                "Апрель",
                "Май",
                "Июнь",
                "Июль",
                "Август",
                "Сентябрь",
                "Октябрь",
                "Ноябрь",
                "Декабрь",
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
            name: "План",
            data: [12500, 11150, 12000, 11000, 11500, ],
        },
        {
            name: "Факт",
            data: [12164, 10499, 11310, 10270, 0, ],
        }, 
    ];
    return (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div id="chartOne" className="min-w-[1000px]">
                <Chart options={options} series={series} type="bar" height={280} />
            </div>
        </div>
    );
}
