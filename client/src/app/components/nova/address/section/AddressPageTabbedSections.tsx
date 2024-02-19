import React, { useState } from "react";
import associatedOuputsMessage from "~assets/modals/stardust/address/associated-outputs.json";
import foundriesMessage from "~assets/modals/stardust/alias/foundries.json";
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

enum DEFAULT_TABS {
    AssocOutputs = "Outputs",
    NativeTokens = "Native Tokens",
}

enum ACCOUNT_TABS {
    Foundries = "Foundries",
}

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
});

const buildAccountAddressTabsOptions = (foundriesCount: number, isAccountFoundriesLoading: boolean) => ({
    [ACCOUNT_TABS.Foundries]: {
        disabled: foundriesCount === 0,
        hidden: foundriesCount === 0,
        isLoading: isAccountFoundriesLoading,
        infoContent: foundriesMessage,
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
                  <AccountFoundriesSection
                      key={`account-foundry-${addressDetails.bech32}`}
                      foundries={(addressState as IAccountAddressState).foundries}
                  />,
              ]
            : null;

    let tabEnums = DEFAULT_TABS;
    const defaultTabsOptions = buildDefaultTabsOptions(tokensCount, outputCount);
    let tabOptions = defaultTabsOptions;
    let tabbedSections = defaultSections;

    switch (addressDetails.type) {
        case AddressType.Account: {
            tabEnums = { ...DEFAULT_TABS, ...ACCOUNT_TABS };
            tabOptions = {
                ...defaultTabsOptions,
                ...buildAccountAddressTabsOptions(
                    (addressState as IAccountAddressState).accountOutput?.foundryCounter ?? 0,
                    (addressState as IAccountAddressState).isFoundriesLoading,
                ),
            };
            tabbedSections = [...defaultSections, ...(accountAddressSections ?? [])];
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
