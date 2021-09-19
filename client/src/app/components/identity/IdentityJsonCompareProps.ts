export interface IdentityJsonCompareProps {
    messageId: string;
    content: { document: unknown; message: unknown };

    network: string;

    selectedComparedMessageId?: string;
    selectedComparedContent?: { document: unknown; message: unknown };
    compareWith?: {
        messageId: string;
        content: { document: unknown; message: unknown };
    }[];

    onCompareSelectionChange(messageId?: string, content?: { document: unknown; message: unknown }): void;
}
