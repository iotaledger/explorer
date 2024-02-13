import { AccountAddress } from "@iota/sdk-wasm-nova/web";
import React, { Reducer, useReducer } from "react";
import { useAccountAddressState } from "~/helpers/nova/hooks/useAccountAddressState";
import Spinner from "../../Spinner";
import Bech32Address from "../../nova/address/Bech32Address";
import { AddressPageTabbedSections } from "./section/AddressPageTabbedSections";

interface AccountAddressViewProps {
    accountAddress: AccountAddress;
}

export interface IAccountAddressViewState {
    isAssociatedOutputsLoading: boolean;
}

const AccountAddressView: React.FC<AccountAddressViewProps> = ({ accountAddress }) => {
    const { accountAddressDetails, isAccountDetailsLoading } = useAccountAddressState(accountAddress);
    const [state, setState] = useReducer<Reducer<IAccountAddressViewState, Partial<IAccountAddressViewState>>>(
        (currentState, newState) => ({ ...currentState, ...newState }),
        { isAssociatedOutputsLoading: false },
    );
    const { isAssociatedOutputsLoading } = state;
    const isPageLoading = isAccountDetailsLoading || isAssociatedOutputsLoading;

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
                                </div>
                            </div>
                        </div>
                        <AddressPageTabbedSections
                            key={accountAddressDetails.bech32}
                            addressDetails={accountAddressDetails}
                            setAssociatedOutputsLoading={(val) => setState({ isAssociatedOutputsLoading: val })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountAddressView;
