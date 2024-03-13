import { AccountAddress } from "@iota/sdk-wasm-nova/web";
import React from "react";
import { useAccountAddressState } from "~/helpers/nova/hooks/useAccountAddressState";
import Spinner from "~/app/components/Spinner";
import Bech32Address from "../../nova/address/Bech32Address";
import { AddressPageTabbedSections } from "./section/AddressPageTabbedSections";
import AddressBalance from "./AddressBalance";

interface AccountAddressViewProps {
    accountAddress: AccountAddress;
}

const AccountAddressView: React.FC<AccountAddressViewProps> = ({ accountAddress }) => {
    const [state, setState] = useAccountAddressState(accountAddress);
    const {
        addressDetails,
        storageDeposit,
        totalBaseTokenBalance,
        availableBaseTokenBalance,
        totalManaBalance,
        availableManaBalance,
        congestion,
        manaRewards,
        isAccountDetailsLoading,
        isAssociatedOutputsLoading,
    } = state;
    const isPageLoading = isAccountDetailsLoading || isAssociatedOutputsLoading;

    return (
        <div className="address-page">
            <div className="wrapper">
                {addressDetails && (
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>{addressDetails.label?.replace("Ed25519", "Address")}</h1>
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
                                    <Bech32Address addressDetails={addressDetails} advancedMode={true} />
                                    <AddressBalance
                                        totalBaseTokenBalance={totalBaseTokenBalance}
                                        availableBaseTokenBalance={availableBaseTokenBalance}
                                        totalManaBalance={totalManaBalance}
                                        availableManaBalance={availableManaBalance}
                                        blockIssuanceCredits={congestion?.blockIssuanceCredits}
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

export default AccountAddressView;
