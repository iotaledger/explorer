import React, { useCallback, useLayoutEffect, useState } from "react";
import "./ChartTooltip.scss";

interface ChartTooltipProps {
  readonly tooltipRef: React.RefObject<HTMLDivElement>;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ tooltipRef }) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const getPosition = useCallback(
    ({ clientX, clientY }: { clientX: number; clientY: number }) => setPosition({ x: clientX, y: clientY }),
    [],
  );

  useLayoutEffect(() => {
    window.addEventListener("mousemove", getPosition);
    return () => {
      window.removeEventListener("mousemove", getPosition);
    };
  }, []);

  const getX = () => {
    let x = position.x + 8;
    const tooltipWidth = tooltipRef.current?.offsetWidth ?? 0;
    const remainingWidthRight = window.innerWidth - (position.x + 20);
    const remainingWidthLeft = position.x;

    if (remainingWidthRight <= tooltipWidth && remainingWidthLeft <= tooltipWidth) {
      x = position.x - tooltipWidth / 2;
    } else if (remainingWidthRight <= tooltipWidth) {
      x = position.x - tooltipWidth;
    }

    return x;
  };

  return (
    <div
      id="tooltip"
      ref={tooltipRef}
      style={{
        top: position.y + 16,
        left: getX(),
      }}
    >
      <div id="content" />
    </div>
  );
};

export default ChartTooltip;
