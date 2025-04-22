import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function BarChartTwo() {
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
        
    ];
    const options: ApexOptions = {
        colors: ["#465fff", "#ff2676", "#26ff55", "#ff26f8"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            stacked: true,
            height: 315,
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "39%",
                borderRadius: 10,
                borderRadiusApplication: "end",
                borderRadiusWhenStacked: "last",
            },
        },
        dataLabels: {
            enabled: false,
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
            fontSize: "14px",
            fontWeight: 400,
            markers: {
                size: 5,
                shape: "circle",
                strokeWidth: 0,
            },
            itemMargin: {
                horizontal: 10,
                vertical: 0,
            },
        },
        yaxis: {
            title: {
                text: undefined, // Hide the title by setting text to undefined
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
                formatter: (val: number) => val.toString(), // Simplified formatter
            },
        },
    };

    return (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div id="chartSix" className="min-w-[1000px]">
                <Chart options={options} series={series} type="bar" height={315} />
            </div>
        </div>
    );
}
