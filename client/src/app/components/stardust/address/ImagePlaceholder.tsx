import classNames from "classnames";
import React from "react";
import "./ImagePlaceholder.scss";

interface ImagePlaceholderProps {
    message: string;
    color?: string;
    compact?: boolean;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ message, color, compact }) => (
    <div
        className={classNames("nft-image-placeholder", { compact })}
        style={{ backgroundColor: color ?? "#00e0ca" }}
    >
        <div className="nft-image-placeholder__content">
            {message}
        </div>
    </div>
);

ImagePlaceholder.defaultProps = {
    color: undefined,
    compact: false
};

