import { BasicBlockBody, Parents, BlockState } from "@iota/sdk-wasm-nova/web";
import { IFeedBlockData } from "~models/api/nova/feed/IFeedBlockData";
import { ThemeMode } from "../definitions/enums";
import { THEME_BLOCK_COLORS } from "../definitions/constants";

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

export function hexToDecimalColor(hex: string) {
    if (hex.startsWith("#")) {
        hex = hex.slice(1);
    }

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return String(r * 65536 + g * 256 + b);
}

export const randomIntFromInterval = (min: number, max: number) => {
    const randomFraction = Math.random();
    const range = max - min + 1;
    const randomInRange = Math.floor(randomFraction * range);
    return randomInRange + min;
};

export function getBlockColorByState(theme: ThemeMode, blockState: BlockState): string {
    const targetColor = THEME_BLOCK_COLORS[theme][blockState];

    if (Array.isArray(targetColor)) {
        const index = randomIntFromInterval(0, targetColor.length - 1);
        return targetColor[index];
    }

    return targetColor;
}
