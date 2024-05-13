import {
    AccountUnlock,
    AnchorUnlock,
    EmptyUnlock,
    NftUnlock,
    ReferenceUnlock,
    SignatureUnlock,
    Unlock,
    UnlockType,
} from "@iota/sdk-wasm-nova/web";
import classNames from "classnames";
import React, { useState } from "react";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import TruncatedId from "../stardust/TruncatedId";
import { NameHelper } from "~helpers/nova/nameHelper";

interface IUnlocksProps {
    readonly unlocks: Unlock[];
}

interface UnlockTypeMap {
    [UnlockType.Signature]: SignatureUnlock;
    [UnlockType.Reference]: ReferenceUnlock;
    [UnlockType.Account]: AccountUnlock;
    [UnlockType.Anchor]: AnchorUnlock;
    [UnlockType.Nft]: NftUnlock;
    [UnlockType.Empty]: EmptyUnlock;
}

const Unlocks: React.FC<IUnlocksProps> = ({ unlocks }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const displayUnlocksTypeAndIndex = (type: number, index: number) => (
        <div>
            {type !== UnlockType.Empty && (
                <div className="unlocks-card--row">
                    <span className="label">Index:</span>
                    <span className="value">{index}</span>
                </div>
            )}
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
                    {unlocks.map((unlock, idx) => {
                        if (unlock.type === UnlockType.Signature) {
                            const signatureUnlock = unlock as SignatureUnlock;

                            return (
                                <div key={idx} className="unlocks-card margin-l-t">
                                    {displayUnlocksTypeAndIndex(unlock.type, idx)}
                                    <div className="unlocks-card--row">
                                        <span className="label">Public Key:</span>
                                        <div className="value public-key">
                                            <TruncatedId id={signatureUnlock.signature.publicKey} showCopyButton />
                                        </div>
                                    </div>
                                    <div className="unlocks-card--row">
                                        <span className="label">Signature:</span>
                                        <div className="value signature">
                                            <TruncatedId id={signatureUnlock.signature.signature} showCopyButton />
                                        </div>
                                    </div>
                                </div>
                            );
                        } else if (unlock.type === UnlockType.Empty) {
                            return (
                                <div key={idx} className="unlocks-card margin-l-t">
                                    {displayUnlocksTypeAndIndex(unlock.type, idx)}
                                </div>
                            );
                        } else {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            const referencedUnlock = unlock as UnlockTypeMap[typeof unlock.type];

                            return (
                                <div key={idx} className="unlocks-card margin-l-t">
                                    {displayUnlocksTypeAndIndex(unlock.type, idx)}
                                    <div className="unlocks-card--row">
                                        <span className="label">References unlock at index:</span>
                                        <span className="value">{referencedUnlock.reference}</span>
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            )}
        </div>
    );
};

export default Unlocks;
