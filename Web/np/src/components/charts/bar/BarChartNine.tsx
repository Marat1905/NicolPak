import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";


export default function BarChartNine() {
    const series = [
        {
            name: "FS",
            //100,110,115,120,125,130,135,140,150,160,170
            data: [41416, 278388, 0, 0, 135176, 381266, 19053, 15266, 9478, 17910, 9766],
        },
        {
            name: "LS",
            //100,110,115,120,125,130,135,140,150,160,170
            data: [0, 0, 0, 0, 22076, 0, 0, 0, 0, 0, 0],
        },
        {
            name: "FLp",
            //100,110,115,120,125,130,135,140,150,160,170
            data: [0, 490866, 539156, 293012, 785844, 0, 388830, 42176, 204244, 17948, 61790],
        },
        {
            name: "FS",
            //100,110,115,120,125,130,135,140,150,160,170
            data: [0, 439086, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
            name: "-LS",
            //100,110,115,120,125,130,135,140,150,160,170
            data: [0, 0, 119174, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
            name: "LSk",
            //100,110,115,120,125,130,135,140,150,160,170
            data: [0, 0, 19142, 0, 218785, 0, 0, 50486, 0, 0, 0],
        },
        {
            name: "LSp",
            //100,110,115,120,125,130,135,140,150,160,170
            data: [0, 0, 610902, 226398, 632392, 0, 302016, 48176, 88314, 115052, 18870],
        },
        {
            name: "LSv",
            //100,110,115,120,125,130,135,140,150,160,170
            data: [0, 0, 108498, 0, 685318, 0, 754819, 0, 56776, 119552, 21776],
        },
        {
            name: "FLp",
            //100,110,115,120,125,130,135,140,150,160,170
            data: [0, 0, 851222, 0, 322802, 0, 0, 0, 22388, 0, 0],
        },
        {
            name: "FS_E",
            //100,110,115,120,125,130,135,140,150,160,170
            data: [0, 0, 0, 0, 0, 109556, 0, 0, 0, 0, 0],
        },
        {
            name: "-LSp",
            //100,110,115,120,125,130,135,140,150,160,170
            data: [0, 0, 0, 513392, 0, 0, 0, 0, 41304, 0, 0],
        },
        {
            name: "LSpk",
            //100,110,115,120,125,130,135,140,150,160,170
            data: [0, 0, 0, 0, 0, 0, 0, 55144, 0, 204804, 0],
        },
    ];
    const options: ApexOptions = {
        colors: ["#465fff", "#ff2676", "#26ff55", "#ff26f8", "#fcba03", "#bafa03", "#bafb03", "#0373fc", "#8403fc", "#8403fc", "#e703fc","#fc03b5"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            stacked: true,
            height: 380,
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
                columnWidth: "50%",
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




//export default function BarChartNine() {
//    const options: ApexOptions = {
//        colors: ["#465fff", "#ff2676", "#26ff55", "#ff26f8"],
//        chart: {
//            fontFamily: "Outfit, sans-serif",
//            type: "bar",
//            height: 180,
//            toolbar: {
//                show: false,
//            },
//        },
//        plotOptions: {
//            bar: {
//                horizontal: false,
//                columnWidth: "69%",
//                borderRadius: 5,
//                borderRadiusApplication: "end",
//            },
//        },
//        dataLabels: {
//            enabled: false,
//        },
//        stroke: {
//            show: true,
//            width: 4,
//            colors: ["transparent"],
//        },
//        xaxis: {
//            categories: [
//                "100 г/м2",
//                "110 г/м2",
//                "115 г/м2",
//                "120 г/м2",
//                "125 г/м2",
//                "130 г/м2",
//                "135 г/м2",
//                "140 г/м2",
//                "150 г/м2",
//                "160 г/м2",
//                "175 г/м2",
//            ],
//            axisBorder: {
//                show: false,
//            },
//            axisTicks: {
//                show: false,
//            },
//        },
//        legend: {
//            show: true,
//            position: "top",
//            horizontalAlign: "left",
//            fontFamily: "Outfit",
//        },
//        yaxis: {
//            title: {
//                text: undefined,
//            },
//        },
//        grid: {
//            yaxis: {
//                lines: {
//                    show: true,
//                },
//            },
//        },
//        fill: {
//            opacity: 1,
//        },

//        tooltip: {
//            x: {
//                show: false,
//            },
//            y: {
//                formatter: (val: number) => `${val}`,
//            },
//        },
//    };
//    const series = [
//        {
//            name: "FS",
//            //100,110,115,120,125,130,135,140,150,160,170
//            data: [41416, 278388,  0, 0, 135176, 381266, 19053,15266, 9478,17910,9766],
//        },
//        {
//            name: "LS",
//            //100,110,115,120,125,130,135,140,150,160,170
//            data: [0, 0, 0, 0, 22076, 0, 0, 0, 0, 0, 0],
//        }, 
//        {
//            name: "FLp",
//            //100,110,115,120,125,130,135,140,150,160,170
//            data: [0, 490866, 539156, 293012, 785844, 0, 388830, 42176, 204244, 17948, 61790],
//        }, 
//        {
//            name: "FS",
//            //100,110,115,120,125,130,135,140,150,160,170
//            data: [0, 439086, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//        }, 
//        {
//            name: "-LS",
//            //100,110,115,120,125,130,135,140,150,160,170
//            data: [0, 0, 119174, 0, 0, 0, 0, 0, 0, 0, 0],
//        }, 
//        {
//            name: "LSk",
//            //100,110,115,120,125,130,135,140,150,160,170
//            data: [0, 0, 19142, 0, 218785, 0, 0, 50486, 0, 0, 0],
//        }, 
//        {
//            name: "LSp",
//            //100,110,115,120,125,130,135,140,150,160,170
//            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//        }, 
//        {
//            name: "LS",
//            //100,110,115,120,125,130,135,140,150,160,170
//            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//        }, 
//        {
//            name: "LS",
//            //100,110,115,120,125,130,135,140,150,160,170
//            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//        }, 
//    ];
//    return (
//        <div className="max-w-full overflow-x-auto custom-scrollbar">
//            <div id="chartOne" className="min-w-[1000px]">
//                <Chart options={options} series={series} type="bar" height={280} />
//            </div>
//        </div>
//    );
//}
