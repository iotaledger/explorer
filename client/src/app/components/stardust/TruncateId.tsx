import React from "react";
import "./TruncateId.scss";

interface TruncateIdProps {
    id: string;
}

const TruncateId: React.FC<TruncateIdProps> = ({ id }) => {
    const lastPart = id.slice(-10);

    /**
     * Render the component.
     * @returns The node to render.
     */
    return (
        <div className="truncate-id">
            <span>{id}</span>
            <span>{lastPart}</span>
        </div>
    );
};

export default TruncateId;
