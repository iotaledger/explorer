import { useCallback, useState, useEffect } from "react";

import { useEventListener } from "./useEventListener";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

interface Size {
    width: number;
    height: number;
}

/**
 *  Hook grabbed from
 *  https://github.com/juliencrn/usehooks-ts/blob/master/packages/usehooks-ts/src/useElementSize/useElementSize.ts
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>(): [
    (node: T | null) => void,
    Size
] {
    // Mutable values like 'ref.current' aren't valid dependencies
    // because mutating them doesn't re-render the component.
    // Instead, we use a state as a ref to be reactive.
    const [ref, setRef] = useState<T | null>(null);
    const [size, setSize] = useState<Size>({
        width: 0,
        height: 0
    });

    // Prevent too many rendering using useCallback
    const handleSize = useCallback(() => {
        setSize({
            width: ref?.offsetWidth ?? 0,
            height: ref?.offsetHeight ?? 0
        });
    }, [ref?.offsetHeight, ref?.offsetWidth]);

    useEventListener("resize", handleSize);

    useEffect(() => {
        handleSize();
    }, [ref?.offsetHeight, ref?.offsetWidth]);

    return [setRef, size];
}
