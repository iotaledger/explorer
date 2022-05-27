export interface MessageButtonProps {
    /**
     * The type of button to show.
     */
    buttonType: "copy";

    /**
     * Position to show label.
     */
    labelPosition: "top" | "right";

    /**
     * The button click.
     */
    onClick(): void;
}
