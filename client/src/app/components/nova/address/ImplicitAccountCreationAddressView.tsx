import { ImplicitAccountCreationAddress } from "@iota/sdk-wasm-nova/web";
import React from "react";
import { useImplicitAccountCreationAddressState } from "~/helpers/nova/hooks/useImplicitAccountCreationAddressState";
import AddressBalance from "./AddressBalance";
import Bech32Address from "./Bech32Address";
import Spinner from "../../Spinner";
import { AddressPageTabbedSections } from "./section/AddressPageTabbedSections";

interface ImplicitAccountCreationAddressViewProps {
    implicitAccountCreationAddress: ImplicitAccountCreationAddress;
}

const ImplicitAccountCreationAddressView: React.FC<ImplicitAccountCreationAddressViewProps> = ({ implicitAccountCreationAddress }) => {
    const [state, setState] = useImplicitAccountCreationAddressState(implicitAccountCreationAddress);
    const { implicitAccountCreationAddressDetails, totalBalance, availableBalance, isAssociatedOutputsLoading } = state;
    const isPageLoading = isAssociatedOutputsLoading;

    return (
        <div className="address-page">
            <div className="wrapper">
                {implicitAccountCreationAddressDetails && (
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>{implicitAccountCreationAddressDetails.label?.replace("Ed25519", "Address")}</h1>
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
                                    <Bech32Address addressDetails={implicitAccountCreationAddressDetails} advancedMode={true} />
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
                        <AddressPageTabbedSections
                            key={implicitAccountCreationAddressDetails.bech32}
                            addressDetails={implicitAccountCreationAddressDetails}
                            setAssociatedOutputsLoading={(val) => setState({ isAssociatedOutputsLoading: val })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImplicitAccountCreationAddressView;
