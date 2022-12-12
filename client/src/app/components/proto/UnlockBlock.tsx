import { IUnlockBlock } from "@iota/protonet.js";
import classNames from "classnames";
import React, { useState } from "react";
import { ReactComponent as DropdownIcon } from "../../../assets/dropdown-arrow.svg";
import { cleanTypeName } from "../../../helpers/proto/misc";
import "./TransactionPayload.scss";

interface OutputProps {
    unlockBlock: IUnlockBlock;
    isPreExpanded: boolean;
}

const UnlockBlock: React.FC<OutputProps> = (
    { unlockBlock, isPreExpanded }
) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const cleanedTypeName = cleanTypeName(unlockBlock.type);

    const header = (
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="card--value card-header--wrapper"
        >
            <div className={classNames("margin-r-t", "card--content--dropdown", { opened: isExpanded })}>
                <DropdownIcon />
            </div>
            <div className="output-header">
                <button
                    type="button"
                    className="output-type--name margin-r-t color"
                >
                    {cleanedTypeName}
                </button>
            </div>
        </div>
    );

    return (
        <div className="card--content__output">
            <div className="card--content__output">
                {header}
                {isExpanded && (
                    <div className="margin-l-t">
                        <div className="card--label">Public Key:</div>
                        <div className="card--value row middle">
                            {unlockBlock.publicKey ?? "-"}
                        </div>
                        <div className="card--label">Signature:</div>
                        <div className="card--value row middle">
                            {unlockBlock.signature ?? "-"}
                        </div>
                        <div className="card--label">Reference Index:</div>
                        <div className="card--value row middle">
                            {unlockBlock.referencedIndex ?? "-"}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnlockBlock;
