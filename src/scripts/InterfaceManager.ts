import { TaskStatus, ITask, statusLabels } from "./Task";
import { relativeTimeFormat, isBeforeNow } from "./Utility";

class InterfaceManager {
    private taskWrapperNode: HTMLElement;
    private intervalId: NodeJS.Timeout | null = null;
    private searchTaskInput: HTMLInputElement;
    private searchStatusInputs: NodeListOf<HTMLInputElement>;
    private searchStatusValue: TaskStatus | string;

    constructor() {
        this.init();
    }

    private init(): void {
        this.taskWrapperNode = document.querySelector('#js-task-wrapper') as HTMLElement;
        const addNewTaskButton = document.querySelector('#js-add-new-task-button') as HTMLElement;
        this.searchTaskInput = document.querySelector('#js-input-main-search') as HTMLInputElement;
        this.searchStatusValue = "";

        this.renderStateFilters();

        addNewTaskButton.addEventListener('click', () => this.dispatchOpenTaskModal());
        this.searchTaskInput.addEventListener("input", (inputEvent) => this.dispatchSearchInputEvent(inputEvent));

        this.searchStatusInputs.forEach((input: HTMLInputElement) => {
            input.addEventListener('change', (changeEvent) => this.dispatchUpdateSearchStatus(changeEvent));
        });
    }

    private dispatchOpenTaskModal(): void {
        const evt = new CustomEvent("openTaskModal", { detail: { task: null } });
        document.dispatchEvent(evt);
    }

    private dispatchSearchInputEvent(inputEvent: Event): void {
        const evt = new CustomEvent("searchInput", {
            detail: { searchValue: this.searchTaskInput.value, status: this.searchStatusValue }
        });
        document.dispatchEvent(evt);
        inputEvent.stopPropagation();
    }

    private dispatchUpdateSearchStatus(changeEvent: Event): void {
        this.searchStatusValue = (changeEvent.target as HTMLInputElement).value;
        this.dispatchSearchInputEvent(changeEvent);
    }

    private renderStateFilters(): void {
        const statusFilterWrapperElement = document.querySelector("#js-status-filter-set") as HTMLElement;
        const template = document.querySelector('#template-status-filter') as HTMLTemplateElement;
        if (!template) return;

        const statuses = Object.keys(TaskStatus);
        statusFilterWrapperElement.innerHTML = "";

        const createRadioButton = (value: string, labelText: string, checked: boolean = false): DocumentFragment => {
            const clone = document.importNode(template.content, true);
            const radioElement = clone.querySelector('.chip__input') as HTMLInputElement;
            const radioLabel = clone.querySelector('.chip__text') as HTMLElement;
            radioElement.value = value;
            radioElement.checked = checked;
            radioLabel.textContent = labelText;
            return clone;
        };

        statusFilterWrapperElement.append(createRadioButton('', "Все", true));

        statuses.forEach(status => {
            const labelText = statusLabels[TaskStatus[status]] || status;
            statusFilterWrapperElement.append(createRadioButton(TaskStatus[status], labelText));
        });

        this.searchStatusInputs = document.querySelectorAll('.filter-status-input') as NodeListOf<HTMLInputElement>;
    }

    private renderZeroState(): void {
        const template = document.querySelector('#template-task-zero-state') as HTMLTemplateElement;
        const clone = document.importNode(template.content, true);
        const headingElement = clone.querySelector('.task__title');
        if (this.searchTaskInput.value || this.searchStatusValue !== "") {
            headingElement.textContent = "Ничего не нашлось"
        }
        this.taskWrapperNode.innerHTML = '';
        this.taskWrapperNode.append(clone);
    }

    renderTasks(tasks: ITask[]): void {
        this.taskWrapperNode.innerHTML = '';
        clearInterval(this.intervalId);
        if (!tasks || tasks.length === 0) {
            this.renderZeroState();
            return;
        }

        const template = document.querySelector('#template-task') as HTMLTemplateElement;
        tasks.forEach(task => this.renderTask(task, template));


        this.intervalId = setInterval(() => { this.renderTasks(tasks); }, 60000);
    }

    private renderTask(task: ITask, template: HTMLTemplateElement): void {
        const clone = document.importNode(template.content, true);
        const titleElement = clone.querySelector('.task__title') as HTMLElement;
        const descriptionElement = clone.querySelector('.task__description') as HTMLElement;
        const createdAtElement = clone.querySelector('.task__created-at') as HTMLElement;
        const checkboxElement = clone.querySelector('#checkbox-task-status') as HTMLInputElement;
        const deleteButton = clone.querySelector('.button--task-delete') as HTMLElement;
        const dueDateElement = clone.querySelector('.task-due-date') as HTMLElement;
        const taskElement = clone.querySelector('.task') as HTMLElement;

        titleElement.textContent = task.title;
        descriptionElement.textContent = task.description || '';

        if (!task.description) descriptionElement.remove();
        dueDateElement.querySelector('.task-due-date__text').textContent = task.dueDate ? relativeTimeFormat(task.dueDate) : '';

        if (task.dueDate) {
            taskElement.classList.toggle('task--overdue', !isBeforeNow(task.dueDate));
        } else {
            dueDateElement.remove();
        }

        createdAtElement.textContent = relativeTimeFormat(task.createdAt);
        checkboxElement.checked = task.status === TaskStatus.Closed;

        if (taskElement) {
            taskElement.dataset.id = task.id;
            this.addTaskEventListeners(taskElement, checkboxElement, deleteButton, task);
            this.taskWrapperNode.append(clone);
        }
    }

    private addTaskEventListeners(taskElement: HTMLElement, checkboxElement: HTMLInputElement, deleteButton: HTMLElement, task: ITask): void {
        taskElement.addEventListener('click', (clickEvent) => {
            if (clickEvent.target !== checkboxElement && clickEvent.target !== deleteButton) {
                const evt = new CustomEvent('openTaskModal', { bubbles: false, detail: { task } });
                document.dispatchEvent(evt);
            }
            clickEvent.stopPropagation();
        });

        checkboxElement.addEventListener('change', (changeEvent) => {
            task.status = checkboxElement.checked ? TaskStatus.Closed : TaskStatus.Open;
            const evt = new CustomEvent('editTask', { bubbles: false, detail: { task } });
            document.dispatchEvent(evt);
            changeEvent.stopPropagation();
        });

        deleteButton.addEventListener('click', (clickEvent) => {
            const evt = new CustomEvent('removeTask', { bubbles: false, detail: { taskID: task.id } });
            document.dispatchEvent(evt);
            clickEvent.stopPropagation();
        });
    }
}

export { InterfaceManager };