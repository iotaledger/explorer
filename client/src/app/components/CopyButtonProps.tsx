export interface CopyButtonProps {
    /**
     * The type of button to show.
     */
    buttonType: "copy";

    /**
     * Position to show copied label.
     */
    labelPosition?: "top" | "right" | "bottom";

    /**
     * The button click.
     */
    onClick(event?: React.MouseEvent): void;
}
