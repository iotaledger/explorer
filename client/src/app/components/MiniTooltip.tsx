/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import React, { useEffect, useRef, useState } from "react";
import "./MiniTooltip.scss";

interface MiniTooltipProps {
    tooltipContent: string | React.ReactNode;
    children: React.ReactNode;
}

/**
 * Component to display a tooltip on hover.
 */
const MiniTooltip: React.FC<MiniTooltipProps> = ({ children, tooltipContent }) => {
    const tooltip = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        const ele = tooltip.current as HTMLDivElement;
        setHeight(ele.clientHeight + 20);
    }, [tooltip]);

    const onEnter = () => {
        if (tooltip?.current) {
            tooltip.current.style.visibility = "visible";
            tooltip.current.style.opacity = "1";
        }
    };

    const onLeave = () => {
        if (tooltip?.current) {
            tooltip.current.style.visibility = "hidden";
            tooltip.current.style.opacity = "0";
        }
    };

    return (
        <div className="tooltip">
            <div className="wrap" ref={tooltip} style={{ top: -height }}>
                {tooltipContent}
            </div>
            <div className="children" onMouseEnter={onEnter} onMouseLeave={onLeave}>
                {children}
            </div>
        </div>
    );
};

export default MiniTooltip;


