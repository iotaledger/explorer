import React from "react";
import { BlockIssuerFeature, CongestionResponse, Ed25519PublicKeyHashBlockIssuerKey } from "@iota/sdk-wasm-nova/web";
import TruncatedId from "~/app/components/stardust/TruncatedId";
import "./AccountBlockIssuanceSection.scss";

interface AccountBlockIssuanceSectionProps {
    readonly blockIssuerFeature: BlockIssuerFeature | null;
    readonly congestion: CongestionResponse | null;
}

const AccountBlockIssuanceSection: React.FC<AccountBlockIssuanceSectionProps> = ({ blockIssuerFeature, congestion }) => {
    return (
        <div className="section transaction--section">
            <div className="card block-issuance--card">
                {congestion && (
                    <>
                        <div className="field">
                            <div className="card--label margin-b-t">Current Slot</div>
                            <div className="card--value">{congestion.slot}</div>
                        </div>
                        <div className="field">
                            <div className="card--label margin-b-t">Block Issuance Credit</div>
                            <div className="card--value">{congestion.blockIssuanceCredits.toString()}</div>
                        </div>
                        <div className="field">
                            <div className="card--label margin-b-t">Referenced Mana Cost</div>
                            <div className="card--value">{congestion.referenceManaCost.toString()}</div>
                        </div>
                    </>
                )}
                {blockIssuerFeature && (
                    <>
                        <div className="field">
                            <div className="card--label margin-b-t">Expiry Slot</div>
                            <div className="card--value">{blockIssuerFeature.expirySlot}</div>
                        </div>
                        <div className="field">
                            {blockIssuerFeature.blockIssuerKeys.map((key) => (
                                <React.Fragment key={(key as Ed25519PublicKeyHashBlockIssuerKey).pubKeyHash}>
                                    <span className="card--label margin-b-t">Public Key:</span>
                                    <div className="card--value public-key">
                                        <TruncatedId id={(key as Ed25519PublicKeyHashBlockIssuerKey).pubKeyHash} showCopyButton />
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AccountBlockIssuanceSection;
