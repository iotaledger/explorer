import { ReactNode } from "react";
import { NetworkProps } from "../NetworkProps";

export interface LandingProps extends NetworkProps {
    /**
     * Switcher component to display.
     */
    switcher: ReactNode;

    /**
     * Search component to display.
     */
    search: ReactNode;
}
