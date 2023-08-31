import Konva from "konva";
import { useState, useEffect, RefObject } from "react";

/**
 *
 * @param ref
 */

const handler = {
    // @ts-expect-error fff
    set(obj, prop, value) {
        console.log("--- handler");
        console.log(`Setting value of ${prop} to ${value}`);
        obj[prop] = value;
        return true;
    }
};

/**
 *
 * @param ref
 */
function useDimensionsWithRef(ref: RefObject<Konva.Stage>) {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const updateDimensions = () => {
        if (ref.current) {
            const w = ref.current.content.offsetWidth;
            const h = ref.current.content.offsetHeight;
            // const rect = ref.current.getBoundingClientRect();
            setDimensions({
                width: w,
                height: h
            });
        }
    };
    // useEffect(() => {
    //     if (!ref.current) {
    //         return;
    //     }
    //     const observedObject = new Proxy(ref?.current, handler);
    //     // console.log("--- ref", ?.clientWidth);
    //
    //     // const resizeObserver = new ResizeObserver(updateDimensions);
    //     //
    //     // console.log("--- ref.current", ref.current);
    //     // if (ref.current) {
    //     //     resizeObserver.observe(ref.current);
    //     // }
    //
    //     updateDimensions(); // Initial dimensions
    //
    //     // return () => {
    //     //     if (ref.current) {
    //     //         resizeObserver.unobserve(ref.current);
    //     //     }
    //     // };
    // }, [ref.current]);

    useEffect(() => {
        const handleMeasure = () => {
            if (ref.current) {
                const rect = ref.current.content.offsetWidth;
                console.log(rect);
            }
        };

        window.requestAnimationFrame(handleMeasure);
    }, [ref.current]);

    return dimensions;
}

export default useDimensionsWithRef;
