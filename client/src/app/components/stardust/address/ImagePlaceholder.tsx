import classNames from "classnames";
import React from "react";
import Spinner from "../../Spinner";
import "./ImagePlaceholder.scss";

interface ImagePlaceholderProps {
    message: string;
    color?: string;
    compact?: boolean;
    isLoading?: boolean;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ message, color, compact, isLoading }) => (
    <div
        className={classNames("nft-image-placeholder", { compact })}
        style={{ backgroundColor: color ?? "#00e0ca" }}
    >
        <div className="nft-image-placeholder__content">
            {message}
            {isLoading && (
                <Spinner />
            )}
        </div>
    </div>
);

ImagePlaceholder.defaultProps = {
    color: undefined,
    compact: false,
    isLoading: false
};

