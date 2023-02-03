import React from "react";
import CopyButton from "../CopyButton";
import "./TruncatedId.scss";

interface TruncatedIdProps {
    id: string;
    showCopyButton?: boolean;
}

const TruncatedId: React.FC<TruncatedIdProps> = ({ id, showCopyButton }) => (
    <div className="row middle truncated-id">
        <span>{id}</span>
        {showCopyButton && <CopyButton copy={id} />}
    </div>
);

TruncatedId.defaultProps = { showCopyButton: undefined };

export default TruncatedId;
