export interface BlockTreeProps {
    parentsIds: string[];
    childrenIds: string[];
    blockId: string;
    onSelected: (blockId: string, updateUrl: boolean) => void;
}
