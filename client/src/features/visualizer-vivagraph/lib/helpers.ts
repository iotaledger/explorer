import { BasicBlockBody, Parents } from "@iota/sdk-wasm-nova/web";
import { IFeedBlockData } from "~models/api/nova/feed/IFeedBlockData";

export const getBlockParents = (blockData: IFeedBlockData): string[] => {
    const parents: Parents = [];
    const blockStrongParents = (blockData?.block?.body as BasicBlockBody).strongParents ?? [];
    const blockWeakParents = (blockData?.block?.body as BasicBlockBody).weakParents ?? [];
    parents.push(...blockStrongParents, ...blockWeakParents);

    if (parents && parents.length) {
        return parents;
    }

    // TODO confusing, because in interface method isBasic() exists, but in the implementation it does not
    // if (block.block?.body?.isBasic()) {
    //     return block.block?.body?.asBasic().strongParents;
    // }

    // if (block.block?.body?.isValidation()) {
    //     return block.block?.body?.asValidation().strongParents;
    // }

    return [];
};
