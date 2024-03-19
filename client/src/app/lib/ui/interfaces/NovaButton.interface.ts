import { NovaButtonVariant } from "../enums";

export interface INovaButton {
    onClick?: () => void;
    disabled?: boolean;
    variant?: NovaButtonVariant;
}
