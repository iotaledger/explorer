import React from "react";
import "./TruncatedId.scss";

interface TruncatedIdProps {
    id: string;
}

const TruncatedId: React.FC<TruncatedIdProps> = ({ id }) => (
    <div className="truncated-id">
        <span>{id}</span>
    </div>
);

export default TruncatedId;
