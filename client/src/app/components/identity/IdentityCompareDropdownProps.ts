export interface IdentityCompareDropdownProps {
    messages: { messageId: string; content: unknown }[];
    onSelectionChange(messageId?: string, content?: unknown): void;
}
