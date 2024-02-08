import React from "react";
import * as H from "history";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
import TruncatedId from "../../stardust/TruncatedId";

interface Bech32AddressProps {
    network?: string;
    history?: H.History;
    addressDetails?: IAddressDetails;
    advancedMode: boolean;
    hideLabel?: boolean;
}

const Bech32Address: React.FC<Bech32AddressProps> = ({ network, history, addressDetails, advancedMode, hideLabel }) => {
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
        </div>
    );
};

export default Bech32Address;
