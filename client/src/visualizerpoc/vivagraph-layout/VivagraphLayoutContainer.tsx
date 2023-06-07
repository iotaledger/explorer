import React, { useRef } from "react";
// import { useVisualizerViva } from "./useVisualizerViva";

const VivagraphLayoutContainer = () => {
    const graphElement = useRef<HTMLDivElement | null>(null);

    // const [
    //     toggleActivity,
    //     selectNode,
    //     filter,
    //     setFilter,
    //     isActive,
    //     blocksCount,
    //     selectedFeedItem,
    //     isFormatAmountsFull,
    //     setIsFormatAmountsFull,
    //     lastClick
    // ] = useVisualizerViva(network, graphElement);

    return (<div
        className="viva"
        // onClick={() => {
        //         if (lastClick && Date.now() - lastClick > 300) {
        //             selectNode();
        //         }
        //     }}
        ref={graphElement}
            />);
};

export default VivagraphLayoutContainer;
