export interface IdentityJsonDifferenceProps {
    messageId: string;
    content: unknown;

    selectedComparedMessageId?: string;
    selectedComparedContent?: unknown;

    onCompareSelectionChange(messageId?: string, content?: unknown): void;


    compareWith?: {
        messageId: string;
        content: unknown;
    }[];
}
