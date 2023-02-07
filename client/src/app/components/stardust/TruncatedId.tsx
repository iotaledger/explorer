import classNames from "classnames";
import React from "react";
import { Link } from "react-router-dom";
import CopyButton from "../CopyButton";
import "./TruncatedId.scss";

interface TruncatedIdProps {
    id: string;
    link?: string;
    showCopyButton?: boolean;
}

const TruncatedId: React.FC<TruncatedIdProps> = ({ id, link, showCopyButton }) => {
    const content = link && link.length > 0 ? (
        <span>
            <Link
                to={link}
            >
                {id}
            </Link>
        </span>
    ) : (<span>{id}</span>);

    return (
        <div className={classNames("row middle truncated-id", { "link": Boolean(link) })}>
            {content}
            {showCopyButton && <CopyButton copy={id} />}
        </div>
    );
};

TruncatedId.defaultProps = {
    link: undefined,
    showCopyButton: undefined
};

export default TruncatedId;

