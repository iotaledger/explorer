import { AnchorAddress } from "@iota/sdk-wasm-nova/web";
import React, { Reducer, useReducer } from "react";
import { useAnchorAddressState } from "~/helpers/nova/hooks/useAnchorAddressState";
import Spinner from "../../Spinner";
import Bech32Address from "./Bech32Address";
import { IEd25519AddressViewState } from "./Ed25519AddressView";
import { AddressPageTabbedSections } from "./section/AddressPageTabbedSections";

interface AnchorAddressViewProps {
    anchorAddress: AnchorAddress;
}

export interface IAnchorAddressViewState {
    isAssociatedOutputsLoading: boolean;
}

const AnchorAddressView: React.FC<AnchorAddressViewProps> = ({ anchorAddress }) => {
    const { anchorAddressDetails, isAnchorDetailsLoading } = useAnchorAddressState(anchorAddress);
    const [state, setState] = useReducer<Reducer<IEd25519AddressViewState, Partial<IEd25519AddressViewState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        { isAssociatedOutputsLoading: false },
    );
    const { isAssociatedOutputsLoading } = state;
    const isPageLoading = isAnchorDetailsLoading || isAssociatedOutputsLoading;

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
                                </div>
                            </div>
                        </div>
                        <AddressPageTabbedSections
                            key={anchorAddressDetails.bech32}
                            addressDetails={anchorAddressDetails}
                            setAssociatedOutputsLoading={(val) => setState({ isAssociatedOutputsLoading: val })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnchorAddressView;
