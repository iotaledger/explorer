export interface ModalProps {
    /**
     * The clickable icon path to show the modal.
     */
    icon: string;
    /**
     * The title and description of Modal.
     */
    data: {
        title?: string;
        description: string;
    };
}
