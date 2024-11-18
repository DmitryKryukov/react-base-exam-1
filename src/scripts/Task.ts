enum TaskStatus {
    Open = 'Open',
    Closed = 'Closed',
}

const statusLabels: { [key: string]: string } = {
    [TaskStatus.Open]: "Открытые",
    [TaskStatus.Closed]: "Закрытые"
};

interface ITask {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    createdAt: Date;
    dueDate?: Date;
}

class Task implements ITask {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public status: TaskStatus,
        public createdAt: Date = new Date(),
        public dueDate?: Date,
    ) { }
}
export { ITask, Task, TaskStatus, statusLabels };