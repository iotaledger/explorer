import { Ed25519Address } from "@iota/sdk-wasm-nova/web";
import React from "react";
import { useEd25519AddressState } from "~/helpers/nova/hooks/useEd25519AddressState";
import AddressBalance from "./AddressBalance";
import Bech32Address from "./Bech32Address";
import AssociatedOutputs from "./section/association/AssociatedOutputs";

interface Ed25519AddressViewProps {
    ed25519Address: Ed25519Address;
}

const Ed25519AddressView: React.FC<Ed25519AddressViewProps> = ({ ed25519Address }) => {
    const [state] = useEd25519AddressState(ed25519Address);
    const { ed25519AddressDetails, totalBalance, availableBalance } = state;

    return (
        <div className="address-page">
            <div className="wrapper">
                {ed25519AddressDetails && (
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>{ed25519AddressDetails.label?.replace("Ed25519", "Address")}</h1>
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
                            <AssociatedOutputs addressDetails={ed25519AddressDetails} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ed25519AddressView;
