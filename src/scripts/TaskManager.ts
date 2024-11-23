import { TaskStatus, ITask, Task } from "./Task";

class TaskManager {
    private tasks: ITask[] = [];

    addTask(task: ITask): void {
        this.tasks.push(task);
        this.saveToLocalStorage();
    }

    editTask(updatedTask: Task): void {
        this.tasks = this.tasks.map(task => (task.id === updatedTask.id ? updatedTask : task));
        this.saveToLocalStorage();
    }

    deleteTask(taskID: string): void {
        this.tasks = this.tasks.filter(task => task.id !== taskID);
        this.saveToLocalStorage();
    }

    filterTasks(searchValue: string, status?: TaskStatus | string): Task[] {
        return this.tasks.filter(task => {
            const searchValueMatches = searchValue
                ? (task.title.toLowerCase().includes(searchValue.toLowerCase()) ||
                    task.description.toLowerCase().includes(searchValue.toLowerCase()))
                : true;

            const statusMatches = status ? status == task.status : true;

            return searchValueMatches && statusMatches;
        });
    }

    getTasks(): ITask[] {
        return this.tasks;
    }

    saveToLocalStorage(): void {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadFromLocalStorage(): boolean {
        const data = localStorage.getItem('tasks');
        if (!data) return false;

        try {
            const parsedTasks = JSON.parse(data);
            this.validateParsedTasks(parsedTasks);

            this.tasks = parsedTasks.map(this.createTaskFromParsedData);
        } catch (error) {
            console.error('Ошибка загрузки данных из localStorage:', error);
            return false;
        }

        return true;
    }

    private validateParsedTasks(parsedTasks: any): void {
        if (!Array.isArray(parsedTasks)) {
            throw new Error('Загруженные данные — не массив');
        }

        parsedTasks.forEach(task => {
            if (!this.isValidTask(task)) {
                throw new Error('Неизвестный формат задачи');
            }
        });
    }

    private isValidTask(task: any): boolean {
        return (
            typeof task.id === 'string' &&
            typeof task.title === 'string' &&
            (task.description === undefined || typeof task.description === 'string') &&
            Object.values(TaskStatus).includes(task.status) &&
            !isNaN(new Date(task.createdAt).getTime()) &&
            (typeof task.dueDate === 'undefined' || typeof task.dueDate === 'boolean' || !isNaN(new Date(task.dueDate).getTime()))
            );
    }

    private createTaskFromParsedData(task: any): Task {
        return new Task(
            task.id,
            task.title,
            task.description || '',
            task.status,
            new Date(task.createdAt),
            task.dueDate ? new Date(task.dueDate) : undefined
        );
    }

}

export { TaskManager }
