import { AccountAddress } from "@iota/sdk-wasm-nova/web";
import React from "react";
import { useAccountAddressState } from "~/helpers/nova/hooks/useAccountAddressState";
import Spinner from "../../Spinner";
import Bech32Address from "../../nova/address/Bech32Address";
import AssociatedOutputs from "./section/association/AssociatedOutputs";
import AddressBalance from "./AddressBalance";

interface AccountAddressViewProps {
    accountAddress: AccountAddress;
}

const AccountAddressView: React.FC<AccountAddressViewProps> = ({ accountAddress }) => {
    const [state] = useAccountAddressState(accountAddress);
    const { accountAddressDetails, totalBalance, availableBalance, isAccountDetailsLoading } = state;
    const isPageLoading = isAccountDetailsLoading;

    return (
        <div className="address-page">
            <div className="wrapper">
                {accountAddressDetails && (
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>{accountAddressDetails.label?.replace("Ed25519", "Address")}</h1>
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
                                    <Bech32Address addressDetails={accountAddressDetails} advancedMode={true} />
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
                            <AssociatedOutputs addressDetails={accountAddressDetails} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountAddressView;
