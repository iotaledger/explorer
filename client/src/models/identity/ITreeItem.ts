import { ITreeSubitem } from "./ITreeSubItem";

export interface ITreeItem {
    messageId: string;
    subItems: ITreeSubitem[];
}
