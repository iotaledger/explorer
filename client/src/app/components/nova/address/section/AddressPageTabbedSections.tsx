import { AddressType } from "@iota/sdk-wasm-nova/web";
import React, { useState } from "react";
import associatedOuputsMessage from "~assets/modals/stardust/address/associated-outputs.json";
import TabbedSection from "../../../hoc/TabbedSection";
import AssociatedOutputs from "./association/AssociatedOutputs";
import { IAddressDetails } from "~/models/api/nova/IAddressDetails";

enum DEFAULT_TABS {
    AssocOutputs = "Outputs",
}

const buildDefaultTabsOptions = (associatedOutputCount: number) => ({
    [DEFAULT_TABS.AssocOutputs]: {
        disabled: associatedOutputCount === 0,
        counter: associatedOutputCount,
        infoContent: associatedOuputsMessage,
    },
});

interface IAddressPageTabbedSectionsProps {
    readonly addressDetails: IAddressDetails;
    readonly setAssociatedOutputsLoading: (isLoading: boolean) => void;
}

export const AddressPageTabbedSections: React.FC<IAddressPageTabbedSectionsProps> = ({ addressDetails, setAssociatedOutputsLoading }) => {
    const [outputCount, setOutputCount] = useState<number>(0);

    if (!addressDetails) {
        return null;
    }

    const defaultSections = [
        <AssociatedOutputs
            key={`assoc-outputs-${addressDetails.bech32}`}
            addressDetails={addressDetails}
            setOutputCount={setOutputCount}
            setIsLoading={setAssociatedOutputsLoading}
        />,
    ];

    const tabEnums = DEFAULT_TABS;
    const defaultTabsOptions = buildDefaultTabsOptions(outputCount);
    const tabOptions = defaultTabsOptions;
    const tabbedSections = defaultSections;

    switch (addressDetails.type) {
        case AddressType.Account: {
            break;
        }
        case AddressType.Nft: {
            break;
        }
        case AddressType.Anchor: {
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
