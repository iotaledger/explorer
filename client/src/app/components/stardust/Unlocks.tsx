import { ISignatureUnlock } from "@iota/iota.js-stardust";
import classNames from "classnames";
import React, { useState } from "react";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";

interface IUnlocksProps {
    unlocks: ISignatureUnlock[];
}

const Unlocks: React.FC<IUnlocksProps> = ({ unlocks }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="card--content__output unlocks">
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="card--value card-header--wrapper"
            >
                <div className={classNames("margin-r-t", "card--content--dropdown", { opened: isExpanded })}>
                    <DropdownIcon />
                </div>
                <div className="output-header">
                    <button type="button">
                        Unlocks
                    </button>
                </div>
            </div>
            {
                isExpanded && (
                    <div className="left-border">
                        {
                            unlocks.map((unlock, idx) => (
                                <div key={idx} className="padding-l-t">
                                    <div className="card--label"> Public Key</div>
                                    <div className="card--value">{unlock.signature.publicKey}</div>
                                    <div className="card--label"> Signature</div>
                                    <div className="card--value">{unlock.signature.signature}</div>
                                </div>
                            ))
                        }
                    </div>
                )
            }
        </div>
    );
};

export default Unlocks;

