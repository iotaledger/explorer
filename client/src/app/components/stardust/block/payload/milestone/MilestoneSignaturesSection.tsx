import { Ed25519Signature } from "@iota/sdk-wasm-stardust/web";
import classNames from "classnames";
import React, { useState } from "react";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import KeyIcon from "~assets/key-icon.svg?react";
import "./MilestoneSignaturesSection.scss";

interface MilestoneSignaturesProps {
    readonly signatures: Ed25519Signature[];
}

const MilestoneSignaturesSection: React.FC<MilestoneSignaturesProps> = ({ signatures }) => {
    const [expanded, setExpanded] = useState<boolean>();

    return (
        <div className="section signatures-section">
            <div className="section--header signatures--header" onClick={() => setExpanded(!expanded)}>
                <div className={classNames("dropdown-arrow", { expanded })}>
                    <DropdownIcon />
                </div>
                <h2 className="label">Signatures</h2>
            </div>
            {expanded && (
                <div className="section--data signatures--content">
                    {signatures.map((signature, idx) => (
                        <div key={idx} className="signatures--entry">
                            <div className="key-icon">
                                <KeyIcon />
                            </div>
                            <div className="entry-content">
                                <div className="label indent">Public Key</div>
                                <div className="value code indent">{signature.publicKey}</div>
                                <div className="label indent margin-t-t">Signature</div>
                                <div className="value code indent signature-value">{signature.signature}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MilestoneSignaturesSection;
