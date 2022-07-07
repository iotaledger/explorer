export interface DataToggleState {
    /**
     * The index of active tab.
     */
    activeTab: number;

    /**
     * Hex view of the data.
     */
    hexView: string;

    /**
     * UTF8 view of data.
     */
    utf8View?: string;

    /**
     * JSON view of data.
     */
    jsonView?: string;
}
