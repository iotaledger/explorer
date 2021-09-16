export interface IdentityJsonCompareProps {
    messageId: string;
    content: unknown;

    network: string;

    selectedComparedMessageId?: string;
    selectedComparedContent?: unknown;
    compareWith?: {
        messageId: string;
        content: unknown;
    }[];

    onCompareSelectionChange(messageId?: string, content?: unknown): void;
}
