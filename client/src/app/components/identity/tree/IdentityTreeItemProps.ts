export interface IdentityTreeItemProps {
    network: string;
    nested?: boolean;
    firstMsg?: boolean;
    lastMsg?: boolean;
    hasChildren?: boolean;
    selectedMessageId: string;
    messageId?: string;
    messageContent?: unknown;
    parentMessageId?: string;

    onClick(): void;
}
