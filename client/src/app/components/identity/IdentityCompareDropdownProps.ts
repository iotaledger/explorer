export interface IdentityCompareDropdownProps {
    selectedMessageId?: string;
    messages: { messageId: string; content: unknown }[];
    onSelectionChange(messageId?: string, content?: unknown): void;
}
