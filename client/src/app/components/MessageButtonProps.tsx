import { ReactNode } from "react";

export interface MessageButtonProps {
    /**
     * The message to display.
     */
    message: string;

    /**
     * The switch elements to display as content.
     */
    children: ReactNode | ReactNode[];

    /**
     * The button click.
     */
    onClick(): void;
}
