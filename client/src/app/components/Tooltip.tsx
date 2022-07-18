/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
import classNames from "classnames";
import React, { useRef } from "react";
import "./Tooltip.scss";

interface TooltipProps {
    tooltipContent: string | React.ReactNode;
    children: React.ReactNode;
    position: "right" | "left";
}

/**
 * Component to display a tooltip on hover.
 */
const Tooltip: React.FC<TooltipProps> = ({ children, tooltipContent, position }) => {
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

    return (
        <div className="tooltip">
            <div className={classNames("wrap", position)} ref={tooltip}>
                <div className={classNames("arrow", position)} />
                {tooltipContent}
            </div>
            <div
                className={classNames("children", position === "left" ? "error" : "")}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
            >
                {children}
            </div>
        </div>
    );
};

export default Tooltip;


