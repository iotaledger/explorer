export interface IdentityCompareDropdownProps {
    selectedMessageId?: string;
    messages: { messageId: string; content: { document: unknown; message: unknown } }[];
    onSelectionChange(messageId?: string, content?: { document: unknown; message: unknown }): void;
}
