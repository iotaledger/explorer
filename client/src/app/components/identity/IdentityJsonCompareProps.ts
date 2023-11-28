import { IIdentityMessageWrapper } from "~models/identity/IIdentityMessageWrapper";
export interface IdentityJsonCompareProps {
    /**
     * main message that is shown if no comparison is done.
     */
    selectedMessage?: IIdentityMessageWrapper;

    /**
     * network name
     */
    network: string;

    /**
     * selected message in the compare dropdown.
     */
    selectedComparisonMessage?: IIdentityMessageWrapper;

    /**
     * list of message to compare the main message with which will be shown in the dropdown menu.
     */
    compareWith: IIdentityMessageWrapper[];

    /**
     * version of did implementation
     */
    version: string;

    /**
     * on message click from the compare dropdown menu.
     * @param message message that has been clicked.
     */
    onCompareSelectionChange(message?: IIdentityMessageWrapper): void;

}
