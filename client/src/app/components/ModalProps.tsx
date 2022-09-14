export interface ModalProps {
    /**
     * The clickable icon in "material icon string" format to show modal.
     */
    icon: string;
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

    /**
     * Show and hide state of modal.
     */
    showModal?: (a: boolean) => void;
}
