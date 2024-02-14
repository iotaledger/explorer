import { AnchorAddress } from "@iota/sdk-wasm-nova/web";
import React from "react";
import { useAnchorAddressState } from "~/helpers/nova/hooks/useAnchorAddressState";
import Spinner from "../../Spinner";
import AddressBalance from "./AddressBalance";
import Bech32Address from "./Bech32Address";
import AssociatedOutputs from "./section/association/AssociatedOutputs";

interface AnchorAddressViewProps {
    anchorAddress: AnchorAddress;
}

const AnchorAddressView: React.FC<AnchorAddressViewProps> = ({ anchorAddress }) => {
    const { anchorAddressDetails, totalBalance, availableBalance, isAnchorDetailsLoading } = useAnchorAddressState(anchorAddress);
    const isPageLoading = isAnchorDetailsLoading;

    return (
        <div className="address-page">
            <div className="wrapper">
                {anchorAddressDetails && (
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>{anchorAddressDetails.label?.replace("Ed25519", "Address")}</h1>
                            </div>
                            {isPageLoading && <Spinner />}
                        </div>
                        <div className="section no-border-bottom padding-b-0">
                            <div className="section--header">
                                <div className="row middle">
                                    <h2>General</h2>
                                </div>
                            </div>
                            <div className="general-content">
                                <div className="section--data">
                                    <Bech32Address addressDetails={anchorAddressDetails} advancedMode={true} />
                                    {totalBalance !== null && (
                                        <AddressBalance
                                            totalBalance={totalBalance}
                                            availableBalance={availableBalance}
                                            storageDeposit={null}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="section no-border-bottom padding-b-0">
                            <div className="row middle">
                                <h2>Associated Outputs</h2>
                            </div>
                            <AssociatedOutputs addressDetails={anchorAddressDetails} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnchorAddressView;
