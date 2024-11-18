import { ITask } from "./Task";
import { ModalManager } from "./ModalManager";
import { formatDate, parseFormattedDateTime } from "./Utility";

class TaskModalManager extends ModalManager {
    private handleTaskAction?: () => void;
    private deadlineInputElement: HTMLInputElement;
    private handleKeyPressEvent: (evt) => void;

    public openModalNewTask(): void {
        this.openTaskModal('Добавить задачу');
    }

    public closeModal(): void {
        super.closeModal();
        document.removeEventListener('keypress', this.handleKeyPressEvent, false);
    }

    public openModalEditTask(task: ITask): void {
        this.openTaskModal('Редактировать задачу', task);
    }

    private openTaskModal(modalTitle: string, task?: ITask): void {
        this.handleKeyPressEvent = (evt) => this.handleKeyPress(evt);
        this.openModal('#template-modal-task');
        this.initializeModalElements(modalTitle, task);
        this.setupModalEvents(task);
    }

    private getModalElements() {
        return {
            modalTitleElement: document.querySelector<HTMLElement>('.modal__title'),
            modalMainButton: document.querySelector<HTMLButtonElement>('#js-create-new-task-button'),
            taskTitleElement: document.querySelector<HTMLInputElement>("#js-input-task-name"),
            taskDescriptionElement: document.querySelector<HTMLInputElement>("#js-input-task-description"),
            taskDeadlineToggleElement: document.querySelector<HTMLInputElement>("#js-checkbox-deadline"),
            deadlineInputElement: this.deadlineInputElement = document.querySelector<HTMLInputElement>("#js-input-deadline-datetime")
        };
    }

    private initializeModalElements(modalTitle: string, task?: ITask): void {
        const elements = this.getModalElements();

        elements.modalTitleElement.textContent = modalTitle;
        this.setDeadlineDate(new Date(), new Date());

        if (task) {
            this.populateTaskFields(task, elements);
            elements.modalMainButton.textContent = modalTitle === 'Добавить задачу' ? "Добавить задачу" : "Сохранить задачу";
        }

        this.modalOverlayNode.addEventListener("transitionend", () => {
            elements.taskTitleElement.focus();
        }, false);
    }

    private populateTaskFields(task: ITask, elements: ReturnType<typeof this.getModalElements>): void {
        elements.taskTitleElement.value = task.title;
        elements.taskDescriptionElement.value = task.description;

        if (task.dueDate) {
            elements.taskDeadlineToggleElement.checked = true;
            this.toggleDeadlineInput(true);
            this.setDeadlineDate(task.dueDate, new Date());
        }
    }

    private setupModalEvents(task?: ITask): void {
        const elements = this.getModalElements();

        this.handleTaskAction = () => {
            if (elements.taskTitleElement.value) {
                this.toggleInputError(elements.taskTitleElement, false);
                if (task) {
                    task.title = elements.taskTitleElement.value;
                    task.description = elements.taskDescriptionElement.value;
                    task.dueDate = elements.taskDeadlineToggleElement.checked ? parseFormattedDateTime(this.deadlineInputElement.value) : undefined;
                    this.dispatchEditTaskEvent(task);
                } else {
                    this.dispatchCreateTaskEvent(
                        elements.taskTitleElement.value,
                        elements.taskDescriptionElement.value,
                        elements.taskDeadlineToggleElement.checked ? parseFormattedDateTime(this.deadlineInputElement.value) : undefined
                    );
                }
                this.closeModal();
            } else {
                this.toggleInputError(elements.taskTitleElement, true);
            }
        };

        elements.modalMainButton.addEventListener('click', this.handleTaskAction);
        elements.taskDeadlineToggleElement.addEventListener('change', (evt) => this.toggleDeadlineInput((evt.target as HTMLInputElement).checked));
        document.addEventListener('keypress', this.handleKeyPressEvent, false);
    }

    private dispatchEditTaskEvent(task: ITask): void {
        const evt = new CustomEvent("editTask", {
            bubbles: false,
            detail: {
                task
            }
        });
        document.dispatchEvent(evt);
    }

    private dispatchCreateTaskEvent(taskTitle: string, taskDescription: string, taskDueDate: Date | boolean): void {
        const evt = new CustomEvent("createTask", {
            bubbles: false,
            detail: {
                taskTitle,
                taskDescription,
                taskDueDate
            }
        });
        document.dispatchEvent(evt);
    }

    private handleKeyPress(evt: KeyboardEvent): void {
        if (evt.shiftKey && evt.key === 'Enter') {
            this.handleTaskAction();
            evt.preventDefault();
            document.removeEventListener('keypress', (evt) => this.handleKeyPress(evt), false);
        }
    }

    private toggleDeadlineInput(toggleValue: boolean): void {
        this.deadlineInputElement.classList.toggle("hide", !toggleValue);
    }

    private setDeadlineDate(date: Date, minDate: Date): void {
        this.deadlineInputElement.min = formatDate(minDate);
        this.deadlineInputElement.value = formatDate(date);
    }

    private toggleInputError(inputElement: HTMLInputElement, toggle: boolean): void {
        inputElement.classList.toggle("input--error", toggle);
        if (toggle) inputElement.focus();
    }
}

export { TaskModalManager };