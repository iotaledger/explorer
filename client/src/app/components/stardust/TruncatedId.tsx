import classNames from "classnames";
import React from "react";
import { Link } from "react-router-dom";
import CopyButton from "../CopyButton";

interface TruncatedIdProps {
    readonly id: string;
    readonly link?: string;
    readonly showCopyButton?: boolean;
}

const TruncatedId: React.FC<TruncatedIdProps> = ({ id, link, showCopyButton }) => {
    const content =
        link && link.length > 0 ? (
            <Link to={link} className={classNames("truncate", "highlight", { "margin-r-t": showCopyButton })}>
                {id}
            </Link>
        ) : (
            <span className={classNames("truncate", { "margin-r-t": showCopyButton })}>{id}</span>
        );

    return (
        <div className="row middle truncate">
            {content}
            {showCopyButton && <CopyButton copy={id} />}
        </div>
    );
};

TruncatedId.defaultProps = {
    link: undefined,
    showCopyButton: undefined,
};

export default TruncatedId;
