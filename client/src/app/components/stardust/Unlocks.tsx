import { ReferenceUnlock, SignatureUnlock, Unlock, UnlockType } from "@iota/sdk-wasm-stardust/web";
import classNames from "classnames";
import React, { useState } from "react";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import TruncatedId from "./TruncatedId";
import { NameHelper } from "~helpers/stardust/nameHelper";

interface IUnlocksProps {
    readonly unlocks: Unlock[];
}

const Unlocks: React.FC<IUnlocksProps> = ({ unlocks }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const displayUnlocksTypeAndIndex = (type: number, index: number) => (
        <div>
            <div className="unlocks-card--row">
                <span className="label">Index:</span>
                <span className="value">{index}</span>
            </div>
            <div className="unlocks-card--row">
                <span className="label">Type:</span>
                <span className="value">{NameHelper.getUnlockTypeName(type)}</span>
            </div>
        </div>
    );

    return (
        <div className="card--content__output unlocks">
            <div onClick={() => setIsExpanded(!isExpanded)} className="card--value card-header--wrapper">
                <div className={classNames("card--content--dropdown", { opened: isExpanded })}>
                    <DropdownIcon />
                </div>
                <div className="output-header">
                    <button type="button">Unlocks</button>
                </div>
            </div>
            {isExpanded && (
                <div>
                    {unlocks.map((unlock, idx) =>
                        unlock.type === UnlockType.Signature ? (
                            <div key={idx} className="unlocks-card margin-l-t">
                                {displayUnlocksTypeAndIndex(unlock.type, idx)}
                                <div className="unlocks-card--row">
                                    <span className="label">Public Key:</span>
                                    <div className="value public-key">
                                        <TruncatedId id={(unlock as SignatureUnlock).signature.publicKey} showCopyButton />
                                    </div>
                                </div>
                                <div className="unlocks-card--row">
                                    <span className="label">Signature:</span>
                                    <div className="value signature">
                                        <TruncatedId id={(unlock as SignatureUnlock).signature.signature} showCopyButton />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div key={idx} className="unlocks-card margin-l-t">
                                {displayUnlocksTypeAndIndex((unlock as ReferenceUnlock).type, idx)}
                                <div className="unlocks-card--row">
                                    <span className="label">References unlock at index:</span>
                                    <span className="value">{(unlock as ReferenceUnlock).reference}</span>
                                </div>
                            </div>
                        ),
                    )}
                </div>
            )}
        </div>
    );
};

export default Unlocks;
