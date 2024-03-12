import { IFeedBlockData } from "~models/api/nova/feed/IFeedBlockData";

export const getBlockParents = (block: IFeedBlockData): string[] => {

    // @ts-ignore
    const parents = block.block?.body?.strongParents;

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
}
