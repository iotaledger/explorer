import React from "react";
import * as H from "history";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import TruncatedId from "../../stardust/TruncatedId";
import { CAPABILITY_FLAG_TO_DESCRIPTION } from "~/app/lib/constants/allowed.capabilities";

interface Bech32AddressProps {
    network?: string;
    history?: H.History;
    addressDetails?: IAddressDetails;
    advancedMode: boolean;
    hideLabel?: boolean;
}

const Bech32Address: React.FC<Bech32AddressProps> = ({ network, history, addressDetails, advancedMode, hideLabel }) => {
    const isRestricted = !!addressDetails?.restricted;
    const capabilites = addressDetails?.restricted?.capabilities ?? [];

    return (
        <div className="bech32-address">
            {addressDetails?.bech32 && (
                <div className="section--data">
                    {!hideLabel && <div className="label">{addressDetails.label} Address</div>}
                    <div className="value row middle code">
                        {history && (
                            <button
                                type="button"
                                className="margin-r-t"
                                onClick={() => history?.push(`/${network}/addr/${addressDetails?.bech32}`)}
                            >
                                <TruncatedId id={addressDetails.bech32} showCopyButton />
                            </button>
                        )}
                        {!history && <TruncatedId id={addressDetails.bech32} showCopyButton />}
                    </div>
                </div>
            )}
            {advancedMode && addressDetails?.label && addressDetails?.hex && (
                <div className="section--data">
                    <div className="label">{addressDetails.label} Id</div>
                    <div className="value row middle code">
                        {history && (
                            <button
                                type="button"
                                className="margin-r-t"
                                onClick={() => history?.push(`/${network}/addr/${addressDetails?.bech32}`)}
                            >
                                <TruncatedId id={addressDetails?.hex} showCopyButton />
                            </button>
                        )}
                        {!history && <TruncatedId id={addressDetails?.hex} showCopyButton />}
                    </div>
                </div>
            )}
            {isRestricted && capabilites.length > 0 && (
                <div className="section--data">
                    <div className="label">Allowed capabilities</div>
                    <ul style={{ marginLeft: "24px" }}>
                        {capabilites.map((capability, index) => (
                            <li key={index} className="value">
                                {CAPABILITY_FLAG_TO_DESCRIPTION[capability] ?? "unknown"}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Bech32Address;
