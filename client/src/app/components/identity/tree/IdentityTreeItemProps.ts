import { IIdentityMessageWrapper } from "./../../../../models/identity/IIdentityMessageWrapper";

export interface IdentityTreeItemProps {
    /**
     * Network name
     */
    network: string;

    /**
     * If item is nested (Diff message, Error Message, No Diffs, Diffs are loading)
     */
    nested?: boolean;

    /**
     * If item is the first in the list (of integration or diffs).
     */
    firstMsg?: boolean;

    /**
     * If item is the last in the list.
     */
    lastMsg?: boolean;

    /**
     * in case of nested item, if parent is first integration message
     */
    parentFirstMsg?: boolean;

    /**
     * message that is represented by this tree item.
     */
    itemMessage: IIdentityMessageWrapper;

    /**
     * the selected message in the tree.
     */
    selectedMessage: IIdentityMessageWrapper;

    /**
     * mouse click on item.
     * @param selectedItem message of item that has been clicked.
     * @param compareWith (in case of diff message) previous diff messages that can be compared with clicked message.
     */
    onItemClick(selectedItem: IIdentityMessageWrapper, compareWith?: IIdentityMessageWrapper[]): void;
}
