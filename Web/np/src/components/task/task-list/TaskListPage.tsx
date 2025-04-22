import React, { useState } from "react";
import { Task } from "./types/Task";
import TaskLane from "./TaskLane";

const initialTasks: Task[] = [
    {
        id: "1",
        title: "FS_1101900 NP_Fluting Standart 110 (1900) FS",
        isChecked: false,
        dueDate: "16.04.2025",
        comment: "ЮЖУК",
        category: "18 000 кг.",
        status: "Выполнить",
        toggleChecked: () => { }, // This will be replaced
    },
    {
        id: "2",
        title: "FS_1101900 NP_Fluting Standart 110 (1900) FS",
        isChecked: false,
        dueDate: "16.04.2025",
        comment: "ЮЖУК",
        category: "7 000 кг.",
        status: "Выполнить",
        toggleChecked: () => { }, // This will be replaced
    },
    {
        id: "3",
        title: "FS_1102100 NP_Fluting Standart 110 (2100) FS",
        isChecked: false,
        dueDate: "16.04.2025",
        comment: "ЮЖУК",
        category: "7 000 кг.",
        status: "Выполнить",
        toggleChecked: () => { }, // This will be replaced
    },
    {
        id: "4",
        title: "FS_1101700 NP_Fluting Standart 110 (1700) FS",
        isChecked: false,
        dueDate: "16.04.2025",
        comment: "ЮЖУК",
        category: "13 000 кг.",
        status: "Выполнить",
        toggleChecked: () => { }, // This will be replaced
    },
    {
        id: "5",
        title: "FS_1102200 NP_Fluting Standart 110 (2200) FS",
        isChecked: false,
        dueDate: "16.04.2025",
        comment: "ЮЖУК",
        category: "17 000 кг.",
        status: "Выполнить",
        toggleChecked: () => { }, // This will be replaced
    },
    {
        id: "6",
        title: "FS_1102100 NP_Fluting Standart 110 (2100) FS",
        isChecked: false,
        dueDate: "16.04.2025",
        comment: "ЮЖУК",
        category: "7 000 кг.",
        status: "Выполнить",
        toggleChecked: () => { }, // This will be replaced
    },
    {
        id: "7",
        title: "LSK_1152000 NP_Liner Standart 115 (2000) LSk",
        isChecked: false,
        dueDate: "17.04.2025",
        comment: "Компаунт",
        category: "20 000 кг.",
        status: "Выполнить",
        toggleChecked: () => { }, // This will be replaced
    },
    {
        id: "8",
        title: "LSK_1252200 NP_Liner Standart 125 (2000) LSk",
        isChecked: false,
        dueDate: "17.04.2025",
        comment: "Компаунт",
        category: "30 000 кг.",
        status: "Выполнить",
        toggleChecked: () => { }, // This will be replaced
    },
    {
        id: "9",
        title: "LSv_1752000 NP_Liner Statdart 175 (2000) LSv",
        isChecked: false,
        dueDate: "15.04.2025",
        category: "20 000 кг.",
        comment: "Готек Лебедянь",
        status: "В процессе",
        toggleChecked: () => { }, // This will be replaced
    },
    {
        id: "10",
        title: "LSv_1751950 NP_Liner Statdart 175 (1950) LSv",
        isChecked: false,
        dueDate: "15.04.2025",
        category: "20 000 кг.",
        comment: "Готек Лебедянь",
        status: "В процессе",
        toggleChecked: () => { }, // This will be replaced
    },
    {
        id: "11",
        title: "LSp_1152100 NP_Liner Statdart 115 (2100) LS p",
        isChecked: false,
        dueDate: "15.04.2025",
        category: "20 000 кг.",
        comment: "Тюмень",
        status: "Выполнено",
        toggleChecked: () => { }, // This will be replaced
    },
    {
        id: "12",
        title: "LSp_1151900 NP_Liner Statdart 115 (1900) LS p",
        isChecked: false,
        dueDate: "15.04.2025",
        category: "20 000 кг.",
        comment: "Тюмень",
        status: "Выполнено",
        toggleChecked: () => { }, // This will be replaced
    },
    {
        id: "13",
        title: "LSv_1152200 NP_Liner Statdart 115 (2200) LS v",
        isChecked: false,
        dueDate: "15.04.2025",
        category: "20 000 кг.",
        comment: "1",
        status: "ПромТара",
        toggleChecked: () => { }, // This will be replaced
    },
    {
        id: "14",
        title: "LSv_1151800 NP_Liner Statdart 115 (1800) LS v",
        isChecked: false,
        category: "20 000 кг.",
        dueDate: "15.04.2025",
        comment: "ПромТара",
        status: "Выполнено",
        toggleChecked: () => { }, // This will be replaced
    },
];

const lanes = ["Выполнить", "В процессе", "Выполнено"];

export default function TaskList() {
    const [tasks, setTasks] = useState<Task[]>(
        initialTasks.map((task) => ({
            ...task,
            toggleChecked: () => toggleChecked(task.id),
        }))
    );
    const [dragging, setDragging] = useState<string | null>(null);

    const handleDragStart = (
        _: React.DragEvent<HTMLDivElement>,
        taskId: string
    ) => {
        setDragging(taskId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: string) => {
        e.preventDefault();
        if (dragging === null) return;

        const updatedTasks = tasks.map((task) =>
            task.id === dragging ? { ...task, status } : task
        );

        // Sort tasks within the same status
        const statusTasks = updatedTasks.filter((task) => task.status === status);
        const otherTasks = updatedTasks.filter((task) => task.status !== status);

        const dropY = e.clientY;
        const droppedIndex = statusTasks.findIndex((task) => {
            const taskElement = document.getElementById(`task-${task.id}`);
            if (!taskElement) return false;
            const rect = taskElement.getBoundingClientRect();
            const taskMiddleY = rect.top + rect.height / 2;
            return dropY < taskMiddleY;
        });

        if (droppedIndex !== -1) {
            const draggedTask = statusTasks.find((task) => task.id === dragging);
            if (draggedTask) {
                statusTasks.splice(statusTasks.indexOf(draggedTask), 1);
                statusTasks.splice(droppedIndex, 0, draggedTask);
            }
        }

        setTasks([...otherTasks, ...statusTasks]);
        setDragging(null);
    };

    const toggleChecked = (taskId: string) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === taskId ? { ...task, isChecked: !task.isChecked } : task
            )
        );
    };

    return (
        <>
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">


                <div className="p-4 space-y-8 border-t border-gray-200 mt-7 dark:border-gray-800 sm:mt-0 xl:p-6">
                    {lanes.map((lane) => (
                        <TaskLane
                            key={lane}
                            lane={lane}
                            tasks={tasks.filter((task) => task.status === lane)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, lane)}
                            onDragStart={handleDragStart}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
