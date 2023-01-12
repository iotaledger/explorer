export interface ModalData {
    /**
     * The title and description of Modal.
     */
    data: {
        title?: string;
        description: string;
        links?: {
            label?: string;
            href?: string;
            isExternal?: boolean;
        }[];
    };
}

export interface ModalProps extends ModalData {
    /**
     * The clickable icon in "material icon string" format to show modal.
     */
    icon: string;

    /**
     * Show and hide state of modal.
     */
    showModal?: (a: boolean) => void;
}
