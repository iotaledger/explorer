export interface IdentityTreeItemProps {
    network: string;
    nested?: boolean;
    firstMsg?: boolean;
    lastMsg?: boolean;
    hasChildren?: boolean;
    selected?: boolean;
    messageId?: string;
    messageContent?: unknown;
    parentMessageId?: string;

    onClick(): void;
}
