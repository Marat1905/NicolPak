import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function BarChartSeven() {
    const options: ApexOptions = {
        colors: ["#465fff"],
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
                "100 г/м2",
                "110 г/м2",
                "115 г/м2",
                "120 г/м2",
                "125 г/м2",
                "130 г/м2",
                "135 г/м2",
                "140 г/м2",
                "150 г/м2",
                "160 г/м2",
                "175 г/м2",
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
            data: [41416, 1208340, 2248092, 1032802, 2802393,490822,1464718, 211248,422504,625266,112202],
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
