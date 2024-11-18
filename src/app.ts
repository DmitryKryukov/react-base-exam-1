import './styles.scss';
import { InterfaceManager } from './scripts/InterfaceManager';
import { TaskStatus, ITask, Task } from './scripts/Task';
import { TaskManager } from './scripts/TaskManager';
import { TaskModalManager } from "./scripts/TaskModalManager";

class App {
    private interfaceManager = new InterfaceManager();
    private taskManager = new TaskManager();
    private modalManager = new TaskModalManager();
    private renderedTasks: ITask[] = [];
    private filter = { searchValue: '', status: '' };

    constructor() {
        this.init();
    }

    private init() {
        this.taskManager.loadFromLocalStorage();
        this.updateRenderedTasks();
        this.bindEvents();
    }

    private updateRenderedTasks() {
        this.renderedTasks = this.taskManager.filterTasks(this.filter.searchValue, this.filter.status);
        this.interfaceManager.renderTasks(this.renderedTasks);
    }

    private bindEvents() {
        document.addEventListener('createTask', (evt: CustomEvent) => this.handleCreateTask(evt));
        document.addEventListener('editTask', (evt: CustomEvent) => this.handleEditTask(evt));
        document.addEventListener('removeTask', (evt: CustomEvent) => this.handleRemoveTask(evt));
        document.addEventListener('openTaskModal', (evt: CustomEvent) => this.handleOpenTaskModal(evt));
        document.addEventListener('searchInput', (evt: CustomEvent) => this.handleSearch(evt));
    }

    private handleCreateTask(evt: CustomEvent) {
        const { taskTitle, taskDescription, taskDueDate } = evt.detail;
        const newTask = new Task(Date.now().toString(), taskTitle, taskDescription, TaskStatus.Open, new Date(), taskDueDate);
        this.taskManager.addTask(newTask);
        this.updateRenderedTasks();
    }

    private handleEditTask(evt: CustomEvent) {
        const { task } = evt.detail;
        this.taskManager.editTask(task);
        this.updateRenderedTasks();
    }

    private handleRemoveTask(evt: CustomEvent) {
        this.taskManager.deleteTask(evt.detail.taskID);
        this.updateRenderedTasks();
    }

    private handleOpenTaskModal(evt: CustomEvent) {
        const { task } = evt.detail;
        task ? this.modalManager.openModalEditTask(task) : this.modalManager.openModalNewTask();
    }

    private handleSearch(evt: CustomEvent) {
        this.filter = { searchValue: evt.detail.searchValue, status: evt.detail.status };
        this.updateRenderedTasks();
    }
}

const app = new App();
export { App };