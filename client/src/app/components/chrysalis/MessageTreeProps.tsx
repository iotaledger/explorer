
export interface MessageTreeProps {
    parentsIds: string[];
    childrenIds: string[];
    messageId: string;
    onSelected: (messageId: string, updateUrl: boolean) => void;
}
