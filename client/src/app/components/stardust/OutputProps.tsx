import { Output } from "@iota/sdk-wasm-stardust/web";
import { IPreExpandedConfig } from "~models/components";

export interface OutputProps {
    /**
     * The output id.
     */
    outputId: string;

    /**
     * The output to display.
     */
    output: Output;

    /**
     * The amount to display.
     */
    amount: number;

    /**
     * Show amount and copy button.
     */
    showCopyAmount: boolean;

    /**
     * Should the outputId be displayed in full (default truncated).
     */
    displayFullOutputId?: boolean;

    /**
     * The network to lookup.
     */
    network: string;

    /**
     * Disable links if block is conflicting.
     */
    isLinksDisabled?: boolean;

    /**
     * Should the output and its fields be pre-expanded.
     */
    preExpandedConfig?: IPreExpandedConfig;
}
