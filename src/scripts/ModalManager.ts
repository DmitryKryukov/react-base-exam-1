class ModalManager {
    protected modalWrapperNode: HTMLElement;
    protected modalOverlayNode: HTMLElement;

    constructor() {
        this.modalWrapperNode = document.querySelector('#modal-wrapper') as HTMLElement;
        this.modalOverlayNode = this.modalWrapperNode.querySelector('.modal-wrapper__overlay') as HTMLElement;
        this.modalOverlayNode.addEventListener("click", () => this.closeModal());
    }

    protected openModal(templateID: string): void {
        const template = document.querySelector(templateID) as HTMLTemplateElement;
        this.modalWrapperNode.removeAttribute('inert');
        this.resetModal();
        const modalNode = document.importNode(template.content, true);
        this.modalWrapperNode.append(modalNode);
        this.registerCloseButton();
        requestAnimationFrame(() => {
            this.modalWrapperNode.classList.add('modal-wrapper--open');
        });
    }

    protected resetModal(): void {
        const modal = this.modalWrapperNode.querySelector(".modal") as HTMLElement;
        modal?.remove();
    }

    protected closeModal(): void {
        this.modalWrapperNode.setAttribute('inert', '');
        this.modalWrapperNode.classList.remove("modal-wrapper--open");
    }

    private registerCloseButton(): void {
        const closeButton = this.modalWrapperNode.querySelector('.modal__close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeModal());
        }
    }
}

export { ModalManager };