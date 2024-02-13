import { NftAddress } from "@iota/sdk-wasm-nova/web";
import React, { Reducer, useReducer } from "react";
import { useNftAddressState } from "~/helpers/nova/hooks/useNftAddressState";
import Spinner from "../../Spinner";
import Bech32Address from "./Bech32Address";
import { IEd25519AddressViewState } from "./Ed25519AddressView";
import { AddressPageTabbedSections } from "./section/AddressPageTabbedSections";

interface NftAddressViewProps {
    nftAddress: NftAddress;
}

export interface INftAddressViewState {
    isAssociatedOutputsLoading: boolean;
}

const NftAddressView: React.FC<NftAddressViewProps> = ({ nftAddress }) => {
    const { nftAddressDetails, isNftDetailsLoading } = useNftAddressState(nftAddress);
    const [state, setState] = useReducer<Reducer<IEd25519AddressViewState, Partial<IEd25519AddressViewState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        { isAssociatedOutputsLoading: false },
    );
    const { isAssociatedOutputsLoading } = state;
    const isPageLoading = isNftDetailsLoading || isAssociatedOutputsLoading;

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
                                </div>
                            </div>
                        </div>
                        <AddressPageTabbedSections
                            key={nftAddressDetails.bech32}
                            addressDetails={nftAddressDetails}
                            setAssociatedOutputsLoading={(val) => setState({ isAssociatedOutputsLoading: val })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default NftAddressView;
