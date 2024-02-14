import React, { useState } from "react";
import associatedOuputsMessage from "~assets/modals/stardust/address/associated-outputs.json";
import TabbedSection from "../../../hoc/TabbedSection";
import AssociatedOutputs from "./association/AssociatedOutputs";
import nativeTokensMessage from "~assets/modals/stardust/address/assets-in-wallet.json";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";
// import AssetsTable from "./native-tokens/AssetsTable";

enum DEFAULT_TABS {
    NativeTokens = "Native Tokens",
    AssocOutputs = "Outputs",
}

const buildDefaultTabsOptions = (tokensCount: number, associatedOutputCount: number) => ({
    [DEFAULT_TABS.AssocOutputs]: {
        disabled: associatedOutputCount === 0,
        counter: associatedOutputCount,
        infoContent: associatedOuputsMessage,
    },
    [DEFAULT_TABS.NativeTokens]: {
        disabled: tokensCount === 0,
        counter: tokensCount,
        infoContent: nativeTokensMessage,
    },
});

interface IAddressPageTabbedSectionsProps {
    readonly addressDetails: IAddressDetails;
    readonly setAssociatedOutputsLoading: (isLoading: boolean) => void;
}

export const AddressPageTabbedSections: React.FC<IAddressPageTabbedSectionsProps> = ({ addressDetails, setAssociatedOutputsLoading }) => {
    const [outputCount, setOutputCount] = useState<number>(0);
    const [tokensCount] = useState<number>(0);

    if (!addressDetails) {
        return null;
    }

    const defaultSections = [
        // <AssetsTable key={`assets-table-${addressDetails.bech32}`} outputs={addressOutputs} setTokensCount={setTokensCount} />,
        <AssociatedOutputs
            key={`assoc-outputs-${addressDetails.bech32}`}
            addressDetails={addressDetails}
            setOutputCount={setOutputCount}
            setIsLoading={setAssociatedOutputsLoading}
        />,
    ];

    const tabEnums = DEFAULT_TABS;
    const defaultTabsOptions = buildDefaultTabsOptions(tokensCount, outputCount);
    const tabOptions = defaultTabsOptions;
    const tabbedSections = defaultSections;

    return (
        <TabbedSection key={addressDetails.bech32} tabsEnum={tabEnums} tabOptions={tabOptions}>
            {tabbedSections}
        </TabbedSection>
    );
};
