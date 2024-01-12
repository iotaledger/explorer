/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import React, { useRef } from "react";
import "./Tooltip.scss";

interface TooltipProps {
    readonly tooltipContent: string | React.ReactNode;
    readonly children: React.ReactNode;
    readonly childrenClass?: string;
}

/**
 * Component to display a tooltip on hover.
 */
const Tooltip: React.FC<TooltipProps> = ({ children, tooltipContent, childrenClass }) => {
    const tooltip = useRef<HTMLDivElement>(null);

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

    const childrenClassname = childrenClass ? `children ${childrenClass}` : "children";

    return (
        <div className="tooltip">
            <div className="wrap" ref={tooltip}>
                <div className="arrow" />
                {tooltipContent}
            </div>
            <div className={childrenClassname} onMouseEnter={onEnter} onMouseLeave={onLeave}>
                {children}
            </div>
        </div>
    );
};

Tooltip.defaultProps = {
    childrenClass: undefined,
};

export default Tooltip;
