import { NftAddress } from "@iota/sdk-wasm-nova/web";
import React from "react";
import { useNftAddressState } from "~/helpers/nova/hooks/useNftAddressState";
import Spinner from "../../Spinner";
import AddressBalance from "./AddressBalance";
import Bech32Address from "./Bech32Address";
import AssociatedOutputs from "./section/association/AssociatedOutputs";

interface NftAddressViewProps {
    nftAddress: NftAddress;
}

const NftAddressView: React.FC<NftAddressViewProps> = ({ nftAddress }) => {
    const [state] = useNftAddressState(nftAddress);
    const { nftAddressDetails, totalBalance, availableBalance, isNftDetailsLoading } = state;
    const isPageLoading = isNftDetailsLoading;

    return (
        <div className="address-page">
            <div className="wrapper">
                {nftAddressDetails && (
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>{nftAddressDetails.label?.replace("Ed25519", "Address")}</h1>
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
                                    <Bech32Address addressDetails={nftAddressDetails} advancedMode={true} />
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
                            <AssociatedOutputs addressDetails={nftAddressDetails} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NftAddressView;
