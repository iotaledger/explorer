import { Ed25519Address } from "@iota/sdk-wasm-nova/web";
import React, { Reducer, useReducer } from "react";
import { useEd25519AddressState } from "~/helpers/nova/hooks/useEd25519AddressState";
import Bech32Address from "./Bech32Address";
import { AddressPageTabbedSections } from "./section/AddressPageTabbedSections";
import Spinner from "../../Spinner";

interface Ed25519AddressViewProps {
    ed25519Address: Ed25519Address;
}

export interface IEd25519AddressViewState {
    isAssociatedOutputsLoading: boolean;
}

const Ed25519AddressView: React.FC<Ed25519AddressViewProps> = ({ ed25519Address }) => {
    const { ed25519AddressDetails } = useEd25519AddressState(ed25519Address);
    const [state, setState] = useReducer<Reducer<IEd25519AddressViewState, Partial<IEd25519AddressViewState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        { isAssociatedOutputsLoading: false },
    );

    const { isAssociatedOutputsLoading } = state;
    const isPageLoading = isAssociatedOutputsLoading;

    return (
        <div className="address-page">
            <div className="wrapper">
                {ed25519AddressDetails && (
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>{ed25519AddressDetails.label?.replace("Ed25519", "Address")}</h1>
                                {isPageLoading && <Spinner />}
                            </div>
                        </div>
                        <div className="section no-border-bottom padding-b-0">
                            <div className="section--header">
                                <div className="row middle">
                                    <h2>General</h2>
                                </div>
                            </div>
                            <div className="general-content">
                                <div className="section--data">
                                    <Bech32Address addressDetails={ed25519AddressDetails} advancedMode={true} />
                                </div>
                            </div>
                        </div>
                        <AddressPageTabbedSections
                            key={ed25519AddressDetails.bech32}
                            addressDetails={ed25519AddressDetails}
                            setAssociatedOutputsLoading={(val) => setState({ isAssociatedOutputsLoading: val })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ed25519AddressView;
