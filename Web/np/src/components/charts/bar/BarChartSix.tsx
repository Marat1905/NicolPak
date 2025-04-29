import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function BarChartSix() {
    const options: ApexOptions = {
        chart: {
            height: 300,
            stacked: true,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            },
            type: "line"
        },
        colors: ["red", "blue", "green"],
        dataLabels: {
            enabled: true,
        },
        noData: {
            align: "center",
            text: "No data available at the moment",
            verticalAlign: "middle"
        },
        plotOptions: {
            bar: {
                borderRadius: 8,
                horizontal: false
            }
        },
        stroke: {
            width: [0, 5, 5]
        },
       
        xaxis: {
            categories: ["Смена 1", "Смена 2", "Смена 3", "Смена 4"],
            type: "category"
        },
        yaxis: [
            {
                title: {
                    text: "(%) OEE"
                }
            },
            
        ]
    };
    const series = [
        {
            name: "OEE",
            data: [68.4, 51.9, 76.3, 79.5],
            type: "column"
        },
        {
            name: "Коэф. производ-ти",
            data: [85.7, 73.4, 88.3, 87.1],
            type: "line"
        },
        {
            name: "Коэф. доступности",
            data: [79.9, 72, 86.4, 91.3],
            type: "line"
        },

    ];
    return (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div id="chartSix" className="min-w-[500px]">
                <Chart options={options} series={series} type="area" height={380} />
            </div>
        </div>
    );
}
