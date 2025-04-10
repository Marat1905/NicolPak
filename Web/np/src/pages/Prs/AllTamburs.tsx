import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

import PageMeta from "../../components/common/PageMeta";
import DataTable from "../../components/tables/DataTable";
import { TamburHook } from '../../hooks';
import { IColumn } from '../../interface/IColumn'
import Table  from '../../components/tables/tableGeneric'
import { IData } from "../../interface/IData";




export default function DataTables() {
    const { data: tamburs, loading, setData: setUser, error } = TamburHook(true);

    const tableRowData: IData[] = [
        {
            id: 1,
            name: "Abram Schleifer",
            position: "Sales Assistant",
            location: "Edinburgh",
            age: 57,
            date: "25 Apr, 2027",
            salary: "$89,500",
        },
        {
            id: 2,
            name: "Charlotte Anderson",
            position: "Marketing Manager",
            location: "London",
            age: 42,
            date: "12 Mar, 2025",
            salary: "$105,000",
        },
        {
            id: 3,
            name: "Ethan Brown",
            position: "Software Engineer",
            location: "San Francisco",
            age: 30,
            date: "01 Jan, 2024",
            salary: "$120,000",
        },
        {
            id: 4,
            name: "Sophia Martinez",
            position: "Product Manager",
            location: "New York",
            age: 35,
            date: "15 Jun, 2026",
            salary: "$95,000",
        },
        {
            id: 5,
            name: "James Wilson",
            position: "Data Analyst",
            location: "Chicago",
            age: 28,
            date: "20 Sep, 2025",
            salary: "$80,000",
        },
        {
            id: 6,
            name: "Olivia Johnson",
            position: "HR Specialist",
            location: "Los Angeles",
            age: 40,
            date: "08 Nov, 2026",
            salary: "$75,000",
        },
        {
            id: 7,
            name: "William Smith",
            position: "Financial Analyst",
            location: "Seattle",
            age: 38,
            date: "03 Feb, 2026",
            salary: "$88,000",
        },
        {
            id: 8,
            name: "Isabella Davis",
            position: "UI/UX Designer",
            location: "Austin",
            age: 29,
            date: "18 Jul, 2025",
            salary: "$92,000",
        },
        {
            id: 9,
            name: "Liam Moore",
            position: "DevOps Engineer",
            location: "Boston",
            age: 33,
            date: "30 Oct, 2024",
            salary: "$115,000",
        },
        {
            id: 10,
            name: "Mia Garcia",
            position: "Content Strategist",
            location: "Denver",
            age: 27,
            date: "12 Dec, 2027",
            salary: "$70,000",
        },
        {
            id: 11,
            name: "Mia Garcia1",
            position: "Content Strategist1",
            location: "Denver1",
            age: 271,
            date: "12 Dec, 2028",
            salary: "$70,0001",
        },
    ];

    const columns: IColumn<IData, keyof IData>[] = [
        {
            key: 'id',
            title: 'Идентификатор',
            filter: true
        },
        {
            key: 'name',
            title: 'Имя',
            filter: true
        },
        {
            key: 'position',
            title: 'Позиция',
            filter: true
        },
        {
            key: 'location',
            title: 'Местонахождение',
        },
        {
            key: 'age',
            title: 'возраст',
            filter: true
        },
        {
            key: 'date',
            title: 'Дата',
        },
        {
            key: 'salary',
            title: 'Зарплата11',
        },
    ]


    //const columns: Array<IColumn<Data>> = [
    //    {
    //        key: 'id',
    //        title: 'Идентификатор',
    //    },
    //    {
    //        key: 'tamburContPrs',
    //        title: 'Идентификатор в ПЛК',
    //    },
    //    {
    //        key: 'createAt',
    //        title: 'Время создания',
    //    },
    //];

    return (
         
        <>
            <PageMeta
                title="ПРС-Все тамбура"
                description="ПРС-Все тамбура 1"
            />
            <PageBreadcrumb pageTitle="ПРС" />
            <div className="space-y-5 sm:space-y-6">

                <ComponentCard title="Все тамбура">
                    <>
                        <div>
                            <Table data={tableRowData} columns={columns} />
                        </div>
                      {/*  <DataTable />*/}
                    </>
                </ComponentCard>

            </div>
        </>
    );
}