import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function BarChartOne() {
    const options: ApexOptions = {
        colors: ["#465fff", "#ff2676", "#26ff55","#ff26f8"],
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
            name: "Мехслужба",
            data: [8.43, 8.62, 4.13, 1.77, 3.12, 6.07, 3.10, 2.65, 0.32, 1.93, 0.93, 3.05],
        },
        {
            name: "Электрослужба",
            data: [0.6, 0.85, 1.93, 0.47, 2.65, 0.52, 0.47, 2.47, 0, 9.05, 2.7, 1.02],
        },
        {
            name: "Технологи",
            data: [17.23, 17.98, 37.40, 21.88, 13.98, 7.55, 19.67, 32.32, 15.05, 12.87, 9.23, 4.88],
        },
        {
            name: "Итого",
            data: [26.27, 27.45, 43.47, 24.12, 19.75, 14.13, 23.23, 37.43, 15.37, 23.85, 12.87, 8.95],
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
