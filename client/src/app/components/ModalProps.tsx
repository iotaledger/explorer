// eslint-disable-next-line no-shadow
export enum ModalIcon {
    Dots = "dots",
    Info = "info"
}

export interface ModalProps {
    /**
     * The clickable icon path to show the modal.
     */
    icon: ModalIcon;
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
