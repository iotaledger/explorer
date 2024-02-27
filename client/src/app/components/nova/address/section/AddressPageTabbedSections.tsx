import React, { useState } from "react";
import associatedOuputsMessage from "~assets/modals/stardust/address/associated-outputs.json";
import foundriesMessage from "~assets/modals/stardust/alias/foundries.json";
import stateMessage from "~assets/modals/stardust/alias/state.json";
import bicMessage from "~assets/modals/nova/account/bic.json";
import TabbedSection from "../../../hoc/TabbedSection";
import AssociatedOutputs from "./association/AssociatedOutputs";
import nativeTokensMessage from "~assets/modals/stardust/address/assets-in-wallet.json";
import transactionHistoryMessage from "~assets/modals/stardust/address/transaction-history.json";
import { IAccountAddressState } from "~/helpers/nova/hooks/useAccountAddressState";
import { INftAddressState } from "~/helpers/nova/hooks/useNftAddressState";
import { IAnchorAddressState } from "~/helpers/nova/hooks/useAnchorAddressState";
import { IEd25519AddressState } from "~/helpers/nova/hooks/useEd25519AddressState";
import AssetsTable from "./native-tokens/AssetsTable";
import { IImplicitAccountCreationAddressState } from "~/helpers/nova/hooks/useImplicitAccountCreationAddressState";
import { AddressType } from "@iota/sdk-wasm-nova/web";
import AccountFoundriesSection from "./account/AccountFoundriesSection";
import TransactionHistory from "../../history/TransactionHistoryView";
import { useNetworkInfoNova } from "~/helpers/nova/networkInfo";
import AccountBlockIssuanceSection from "./account/AccountBlockIssuanceSection";
import AnchorStateSection from "./anchor/AnchorStateSection";

enum DEFAULT_TABS {
    Transactions = "Transactions",
    AssocOutputs = "Outputs",
    NativeTokens = "Native Tokens",
}

enum ACCOUNT_TABS {
    BlockIssuance = "Block Issuance",
    Foundries = "Foundries",
}

enum ANCHOR_TABS {
    State = "State",
}

const buildDefaultTabsOptions = (
    tokensCount: number,
    associatedOutputCount: number,
    isAddressHistoryLoading: boolean,
    isAddressHistoryDisabled: boolean,
) => ({
    [DEFAULT_TABS.Transactions]: {
        disabled: isAddressHistoryDisabled,
        hidden: isAddressHistoryDisabled,
        isLoading: isAddressHistoryLoading,
        infoContent: transactionHistoryMessage,
    },
    [DEFAULT_TABS.AssocOutputs]: {
        disabled: associatedOutputCount === 0,
        hidden: associatedOutputCount === 0,
        counter: associatedOutputCount,
        infoContent: associatedOuputsMessage,
    },
    [DEFAULT_TABS.NativeTokens]: {
        disabled: tokensCount === 0,
        hidden: tokensCount === 0,
        counter: tokensCount,
        infoContent: nativeTokensMessage,
    },
});

const buildAccountAddressTabsOptions = (
    isBlockIssuer: boolean,
    isCongestionLoading: boolean,
    foundriesCount: number,
    isAccountFoundriesLoading: boolean,
) => ({
    [ACCOUNT_TABS.Foundries]: {
        disabled: foundriesCount === 0,
        hidden: foundriesCount === 0,
        isLoading: isAccountFoundriesLoading,
        infoContent: foundriesMessage,
    },
    [ACCOUNT_TABS.BlockIssuance]: {
        disabled: !isBlockIssuer,
        hidden: !isBlockIssuer,
        isLoading: isCongestionLoading,
        infoContent: bicMessage,
    },
});

const buildAnchorAddressTabsOptions = (isAnchorStateTabDisabled: boolean, isAnchorDetailsLoading: boolean) => ({
    [ANCHOR_TABS.State]: {
        disabled: isAnchorStateTabDisabled,
        hidden: isAnchorStateTabDisabled,
        isLoading: isAnchorDetailsLoading,
        infoContent: stateMessage,
    },
});

interface IAddressPageTabbedSectionsProps {
    readonly addressState:
        | IEd25519AddressState
        | IAccountAddressState
        | INftAddressState
        | IAnchorAddressState
        | IImplicitAccountCreationAddressState;
    readonly setAssociatedOutputsLoading: (isLoading: boolean) => void;
    readonly setTransactionHistoryLoading: (isLoading: boolean) => void;
    readonly setTransactionHistoryDisabled: (isDisabled: boolean) => void;
}

export const AddressPageTabbedSections: React.FC<IAddressPageTabbedSectionsProps> = ({
    addressState,
    setAssociatedOutputsLoading,
    setTransactionHistoryLoading,
    setTransactionHistoryDisabled,
}) => {
    const [outputCount, setOutputCount] = useState<number>(0);
    const [tokensCount, setTokensCount] = useState<number>(0);
    const networkInfo = useNetworkInfoNova((s) => s.networkInfo);

    if (!addressState.addressDetails) {
        return null;
    }
    const { addressDetails, addressBasicOutputs, isAddressHistoryLoading, isAddressHistoryDisabled } = addressState;
    const { bech32: addressBech32 } = addressDetails;
    const { name: network } = networkInfo;

    const defaultSections = [
        <TransactionHistory
            key={`txs-history-${addressBech32}`}
            network={network}
            address={addressBech32}
            setLoading={setTransactionHistoryLoading}
            setDisabled={setTransactionHistoryDisabled}
        />,
        <AssociatedOutputs
            key={`assoc-outputs-${addressDetails.bech32}`}
            addressDetails={addressDetails}
            setOutputCount={setOutputCount}
            setIsLoading={setAssociatedOutputsLoading}
        />,
        <AssetsTable key={`assets-table-${addressDetails.bech32}`} outputs={addressBasicOutputs} setTokensCount={setTokensCount} />,
    ];

    const accountAddressSections =
        addressDetails.type === AddressType.Account
            ? [
                  <AccountBlockIssuanceSection
                      key={`account-block-issuance-${addressDetails.bech32}`}
                      blockIssuerFeature={(addressState as IAccountAddressState).blockIssuerFeature}
                      congestion={(addressState as IAccountAddressState).congestion}
                  />,
                  <AccountFoundriesSection
                      key={`account-foundry-${addressDetails.bech32}`}
                      foundries={(addressState as IAccountAddressState).foundries}
                  />,
              ]
            : null;

    const anchorAddressSections =
        addressDetails.type === AddressType.Anchor
            ? [
                  <AnchorStateSection
                      key={`anchor-state-${addressDetails.bech32}`}
                      output={(addressState as IAnchorAddressState).anchorOutput}
                  />,
              ]
            : null;

    let tabEnums = DEFAULT_TABS;
    const defaultTabsOptions = buildDefaultTabsOptions(tokensCount, outputCount, isAddressHistoryLoading, isAddressHistoryDisabled);
    let tabOptions = defaultTabsOptions;
    let tabbedSections = defaultSections;

    switch (addressDetails.type) {
        case AddressType.Account: {
            const accountAddressState = addressState as IAccountAddressState;
            tabEnums = { ...DEFAULT_TABS, ...ACCOUNT_TABS };
            tabOptions = {
                ...defaultTabsOptions,
                ...buildAccountAddressTabsOptions(
                    accountAddressState.blockIssuerFeature !== null,
                    accountAddressState.isCongestionLoading,
                    accountAddressState.accountOutput?.foundryCounter ?? 0,
                    accountAddressState.isFoundriesLoading,
                ),
            };
            tabbedSections = [...defaultSections, ...(accountAddressSections ?? [])];
            break;
        }
        case AddressType.Anchor: {
            const anchorAddressState = addressState as IAnchorAddressState;
            tabEnums = { ...DEFAULT_TABS, ...ANCHOR_TABS };
            tabOptions = {
                ...defaultTabsOptions,
                ...buildAnchorAddressTabsOptions(anchorAddressState.anchorOutput === null, anchorAddressState.isAnchorDetailsLoading),
            };
            tabbedSections = [...defaultSections, ...(anchorAddressSections ?? [])];
            break;
        }
        default: {
            break;
        }
    }
    return (
        <TabbedSection key={addressDetails.bech32} tabsEnum={tabEnums} tabOptions={tabOptions}>
            {tabbedSections}
        </TabbedSection>
    );
};
