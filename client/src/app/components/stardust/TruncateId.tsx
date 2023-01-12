import React from "react";
import "./TruncateId.scss";

interface TruncateIdProps {
    id: string;
}

const TruncateId: React.FC<TruncateIdProps> = ({ id }) => (
    <div className="truncate-id">
        <span>{id}</span>
    </div>
);

export default TruncateId;
