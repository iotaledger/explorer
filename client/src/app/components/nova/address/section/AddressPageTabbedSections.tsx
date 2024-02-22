import React, { useState } from "react";
import associatedOuputsMessage from "~assets/modals/stardust/address/associated-outputs.json";
import foundriesMessage from "~assets/modals/stardust/alias/foundries.json";
import stateMessage from "~assets/modals/stardust/alias/state.json";
import bicMessage from "~assets/modals/nova/account/bic.json";
import TabbedSection from "../../../hoc/TabbedSection";
import AssociatedOutputs from "./association/AssociatedOutputs";
import nativeTokensMessage from "~assets/modals/stardust/address/assets-in-wallet.json";
import { IAccountAddressState } from "~/helpers/nova/hooks/useAccountAddressState";
import { INftAddressState } from "~/helpers/nova/hooks/useNftAddressState";
import { IAnchorAddressState } from "~/helpers/nova/hooks/useAnchorAddressState";
import { IEd25519AddressState } from "~/helpers/nova/hooks/useEd25519AddressState";
import AssetsTable from "./native-tokens/AssetsTable";
import { IImplicitAccountCreationAddressState } from "~/helpers/nova/hooks/useImplicitAccountCreationAddressState";
import { AddressType } from "@iota/sdk-wasm-nova/web";
import AccountFoundriesSection from "./account/AccountFoundriesSection";
import AccountBlockIssuanceSection from "./account/AccountBlockIssuanceSection";
import AnchorStateSection from "./anchor/AnchorStateSection";

enum DEFAULT_TABS {
    AssocOutputs = "Outputs",
    NativeTokens = "Native Tokens",
    Nfts = "NFTs",
}

enum ACCOUNT_TABS {
    BlockIssuance = "Block Issuance",
    Foundries = "Foundries",
}

enum ANCHOR_TABS {
    State = "State",
}

// enum NFT_TABS {
//     NftMetadata = "Metadata",
// }

const buildDefaultTabsOptions = (tokensCount: number, associatedOutputCount: number) => ({
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
    // [DEFAULT_TABS.Nfts]: {
    //     disabled: nftCount === 0,
    //     hidden: nftCount === 0,
    //     counter: nftCount,
    //     isLoading: isNftOutputsLoading,
    //     infoContent: addressNftsMessage,
    // },
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

// const buildNftAddressTabsOptions = (isNftMetadataTabDisabled: boolean, isNftDetailsLoading: boolean) => ({
//     [NFT_TABS.NftMetadata]: {
//         disabled: isNftMetadataTabDisabled,
//         hidden: isNftMetadataTabDisabled,
//         isLoading: isNftDetailsLoading,
//         infoContent: nftMetadataMessage,
//     },
// });

interface IAddressPageTabbedSectionsProps {
    readonly addressState:
        | IEd25519AddressState
        | IAccountAddressState
        | INftAddressState
        | IAnchorAddressState
        | IImplicitAccountCreationAddressState;
    readonly setAssociatedOutputsLoading: (isLoading: boolean) => void;
}

export const AddressPageTabbedSections: React.FC<IAddressPageTabbedSectionsProps> = ({ addressState, setAssociatedOutputsLoading }) => {
    const [outputCount, setOutputCount] = useState<number>(0);
    const [tokensCount, setTokensCount] = useState<number>(0);

    if (!addressState.addressDetails) {
        return null;
    }
    const { addressDetails, addressBasicOutputs } = addressState;

    const defaultSections = [
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
    const defaultTabsOptions = buildDefaultTabsOptions(tokensCount, outputCount);
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
