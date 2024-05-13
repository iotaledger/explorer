import { Ed25519Address } from "@iota/sdk-wasm-nova/web";
import React from "react";
import { useEd25519AddressState } from "~/helpers/nova/hooks/useEd25519AddressState";
import AddressBalance from "./AddressBalance";
import Bech32Address from "./Bech32Address";
import { AddressPageTabbedSections } from "./section/AddressPageTabbedSections";
import Spinner from "~/app/components/Spinner";

interface Ed25519AddressViewProps {
    ed25519Address: Ed25519Address;
}

const Ed25519AddressView: React.FC<Ed25519AddressViewProps> = ({ ed25519Address }) => {
    const [state, setState] = useEd25519AddressState(ed25519Address);
    const {
        addressDetails,
        storageDeposit,
        totalBaseTokenBalance,
        availableBaseTokenBalance,
        totalManaBalance,
        availableManaBalance,
        manaRewards,
        isAssociatedOutputsLoading,
        isBasicOutputsLoading,
    } = state;
    const isPageLoading = isAssociatedOutputsLoading || isBasicOutputsLoading;

    return (
        <div className="address-page">
            <div className="wrapper">
                {addressDetails && (
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>{addressDetails.label?.replace("Ed25519", "Address")}</h1>
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
                                    <Bech32Address addressDetails={addressDetails} advancedMode={true} />
                                    <AddressBalance
                                        totalBaseTokenBalance={totalBaseTokenBalance}
                                        availableBaseTokenBalance={availableBaseTokenBalance}
                                        totalManaBalance={totalManaBalance}
                                        availableManaBalance={availableManaBalance}
                                        storageDeposit={storageDeposit}
                                        manaRewards={manaRewards}
                                    />
                                </div>
                            </div>
                        </div>
                        <AddressPageTabbedSections
                            key={addressDetails.bech32}
                            addressState={state}
                            setAssociatedOutputsLoading={(val) => setState({ isAssociatedOutputsLoading: val })}
                            setTransactionHistoryLoading={(isLoading) => setState({ isAddressHistoryLoading: isLoading })}
                            setTransactionHistoryDisabled={(val) => setState({ isAddressHistoryDisabled: val })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ed25519AddressView;
