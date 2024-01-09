import { INetwork } from "~models/config/INetwork";

/**
 * The props for the Header component.
 */
export interface NetworkSwitcherProps {
    /**
     * The dropdown title.
     */
    label?: string;
    /**
     * The label above the main title.
     */
    eyebrow?: string;
    /**
     * The networks grouped by network type.
     */
    networks: INetwork[];
    /**
     * Is the switcher opened.
     */
    isExpanded?: boolean;
    /**
     * What to do when network is selected.
     */
    onChange(value: string): void;
    /**
     * What to do when dropdown is clicked.
     */
    onClick(): void;
}
