export interface Task {
    id: string;
    title: string;
    isChecked: boolean;
    dueDate: string;
    comment: string;
    category?: string;
    status: string;
    toggleChecked: () => void;
}