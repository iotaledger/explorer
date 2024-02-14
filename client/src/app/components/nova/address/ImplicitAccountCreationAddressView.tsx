import { ImplicitAccountCreationAddress } from "@iota/sdk-wasm-nova/web";
import React from "react";
import { useImplicitAccountCreationAddressState } from "~/helpers/nova/hooks/useImplicitAccountCreationAddressState";
import AddressBalance from "./AddressBalance";
import Bech32Address from "./Bech32Address";
import AssociatedOutputs from "./section/association/AssociatedOutputs";

interface ImplicitAccountCreationAddressViewProps {
    implicitAccountCreationAddress: ImplicitAccountCreationAddress;
}

const ImplicitAccountCreationAddressView: React.FC<ImplicitAccountCreationAddressViewProps> = ({ implicitAccountCreationAddress }) => {
    const { implicitAccountCreationAddressDetails, totalBalance, availableBalance } =
        useImplicitAccountCreationAddressState(implicitAccountCreationAddress);

    return (
        <div className="address-page">
            <div className="wrapper">
                {implicitAccountCreationAddressDetails && (
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>{implicitAccountCreationAddressDetails.label?.replace("Ed25519", "Address")}</h1>
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
                        <div className="section no-border-bottom padding-b-0">
                            <div className="row middle">
                                <h2>Associated Outputs</h2>
                            </div>
                            <AssociatedOutputs addressDetails={implicitAccountCreationAddressDetails} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImplicitAccountCreationAddressView;
