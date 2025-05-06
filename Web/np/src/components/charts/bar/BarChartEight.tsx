import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function BarChartEight() {
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
                "FS",
                "LS",
                "FLp",
                "FS",
                "LS",
                "LSk",
                "LSp",
                "LSv",
                "FLp",
                "FS_E",
                "LSp",
                "LSpk",
            ],
            axisBorder: {
                show: true,
            },
            axisTicks: {
                show: true,
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
            data: [1057719,22076,2823866,439086,119172,288413,2042120,1746739,1196412,109556,554696,259948],
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
