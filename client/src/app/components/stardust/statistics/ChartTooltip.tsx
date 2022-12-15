import React, { useCallback, useLayoutEffect, useState } from "react";
import "./ChartTooltip.scss";

interface ChartTooltipProps {
    tooltipRef: React.RefObject<HTMLDivElement>;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ tooltipRef }) => {
    const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const getPosition = useCallback(
        ({ clientX, clientY }: { clientX: number; clientY: number }) => setPosition({ x: clientX, y: clientY }),
        []
    );

    useLayoutEffect(() => {
        window.addEventListener("mousemove", getPosition);
        return () => {
            window.removeEventListener("mousemove", getPosition);
        };
    }, []);

    const getX = () => {
        let x = position.x + 8;
        const remainingWidth = window.innerWidth - (position.x + 20);

        if (tooltipRef.current && remainingWidth <= tooltipRef.current.offsetWidth) {
            x = position.x - tooltipRef.current.offsetWidth;
        }
        return x;
    };

    return (
        <div
            id="tooltip"
            ref={tooltipRef}
            style={{
                top: position.y + 16,
                left: getX()
            }}
        >
            <div id="content" />
        </div>
    );
};

export default ChartTooltip;

