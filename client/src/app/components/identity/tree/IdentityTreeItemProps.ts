export interface IdentityTreeItemProps {
    nested?: boolean;
    firstMsg?: boolean;
    lastMsg?: boolean;
    hasChildren?: boolean;
    selected?: boolean;
    messageId?: string;

    onClick(): void;
}
