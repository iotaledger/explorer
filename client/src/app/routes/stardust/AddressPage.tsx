import { AddressType } from "@iota/sdk-wasm-stardust/web";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { useAddressPageState } from "./AddressState";
import addressMainHeaderInfo from "~assets/modals/stardust/address/main-header.json";
import aliasMainHeaderInfo from "~assets/modals/stardust/alias/main-header.json";
import nftMainHeaderInfo from "~assets/modals/stardust/nft/main-header.json";
import Modal from "../../components/Modal";
import NotFound from "../../components/NotFound";
import Spinner from "../../components/Spinner";
import AddressBalance from "../../components/stardust/address/AddressBalance";
import Bech32Address from "../../components/stardust/address/Bech32Address";
import { AddressPageTabbedSections } from "../../components/stardust/address/section/AddressPageTabbedSections";
import { AddressRouteProps } from "../AddressRouteProps";
import "./AddressPage.scss";

const AddressPage: React.FC<RouteComponentProps<AddressRouteProps>> = ({
    match: {
        params: { network, address },
    },
}) => {
    const [state, setState] = useAddressPageState();
    const {
        bech32AddressDetails,
        balance,
        availableBalance,
        storageDeposit,
        isBasicOutputsLoading,
        isAliasOutputsLoading,
        isNftOutputsLoading,
        isNftDetailsLoading,
        isAddressHistoryLoading,
        isAssociatedOutputsLoading,
    } = state;

    if (!bech32AddressDetails) {
        return (
            <div className="address-page">
                <div className="wrapper">
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>Address</h1>
                                <Modal icon="info" data={addressMainHeaderInfo} />
                            </div>
                        </div>
                        <NotFound searchTarget="address" query={address} />
                    </div>
                </div>
            </div>
        );
    }

    const isAddressOutputsLoading = isBasicOutputsLoading || isAliasOutputsLoading || isNftOutputsLoading;
    const isPageLoading = isAddressOutputsLoading || isNftDetailsLoading || isAddressHistoryLoading || isAssociatedOutputsLoading;

    const addressType = bech32AddressDetails.type;

    let addressMessage = addressMainHeaderInfo;
    if (addressType === AddressType.Alias) {
        addressMessage = aliasMainHeaderInfo;
    } else if (addressType === AddressType.Nft) {
        addressMessage = nftMainHeaderInfo;
    }

    return (
        <div className="address-page">
            <div className="wrapper">
                {bech32AddressDetails && (
                    <div className="inner">
                        <div className="addr--header">
                            <div className="row middle">
                                <h1>{bech32AddressDetails.typeLabel?.replace("Ed25519", "Address")}</h1>
                                <Modal icon="info" data={addressMessage} />
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
                                    <Bech32Address addressDetails={bech32AddressDetails} advancedMode={true} />
                                    {balance !== null && (
                                        <AddressBalance
                                            balance={balance}
                                            spendableBalance={availableBalance}
                                            storageDeposit={storageDeposit}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <AddressPageTabbedSections
                            key={address}
                            network={network}
                            addressPageState={state}
                            setTransactionHistoryLoading={(isLoading) => setState({ isAddressHistoryLoading: isLoading })}
                            setTransactionHistoryDisabled={(val) => setState({ isAddressHistoryDisabled: val })}
                            setTokenCount={(count) => setState({ tokensCount: count })}
                            setNftCount={(count) => setState({ nftCount: count })}
                            setAssociatedOutputsLoading={(val) => setState({ isAssociatedOutputsLoading: val })}
                            setAssociatedOutputsCount={(count) => setState({ associatedOutputCount: count })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddressPage;
