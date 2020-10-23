export interface MessageButtonProps {
    /**
     * The message to display.
     */
    message?: string;

    /**
     * The type of button to show.
     */
    buttonType: "copy";

    /**
     * The button click.
     */
    onClick(): void;
}
