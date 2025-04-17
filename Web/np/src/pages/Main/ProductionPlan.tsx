import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TaskListPage from "../../components/task/task-list/TaskListPage";

export default function ProductionPlan() {
    return (
        <>
            <PageMeta
                title="Домашняя - План производства"
                description="Домашняя - План производства"
            />

            <PageBreadcrumb pageTitle="План производства" />

            <TaskListPage />




        </>
    );
}