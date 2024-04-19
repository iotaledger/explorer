import { AssociationType, IAssociation } from "~models/api/stardust/IAssociationsResponse";

export type AssociatedOutputTab = "Basic" | "NFT" | "Alias" | "Foundry";

export const outputTypeToAssociations: Map<AssociatedOutputTab, AssociationType[]> = new Map([
    [
        "Basic",
        [
            AssociationType.BASIC_ADDRESS,
            AssociationType.BASIC_ADDRESS_EXPIRED,
            AssociationType.BASIC_SENDER,
            AssociationType.BASIC_EXPIRATION_RETURN,
            AssociationType.BASIC_STORAGE_RETURN,
        ],
    ],
    [
        "Alias",
        [
            AssociationType.ALIAS_STATE_CONTROLLER,
            AssociationType.ALIAS_GOVERNOR,
            AssociationType.ALIAS_ISSUER,
            AssociationType.ALIAS_SENDER,
            AssociationType.ALIAS_ID,
        ],
    ],
    ["Foundry", [AssociationType.FOUNDRY_ALIAS]],
    [
        "NFT",
        [
            AssociationType.NFT_ADDRESS,
            AssociationType.NFT_ADDRESS_EXPIRED,
            AssociationType.NFT_STORAGE_RETURN,
            AssociationType.NFT_EXPIRATION_RETURN,
            AssociationType.NFT_ISSUER,
            AssociationType.NFT_SENDER,
            AssociationType.NFT_ID,
        ],
    ],
]);

export const ASSOCIATION_TYPE_TO_LABEL = {
    [AssociationType.BASIC_ADDRESS]: "Address Unlock Condition",
    [AssociationType.BASIC_ADDRESS_EXPIRED]: "Address Unlock Condition (expired)",
    [AssociationType.BASIC_SENDER]: "Sender Feature",
    [AssociationType.BASIC_EXPIRATION_RETURN]: "Expiration Return Unlock Condtition",
    [AssociationType.BASIC_STORAGE_RETURN]: "Storage Deposit Return Unlock Condition",
    [AssociationType.ALIAS_ID]: "Alias Id",
    [AssociationType.ALIAS_STATE_CONTROLLER]: "State Controller Address Unlock Condition",
    [AssociationType.ALIAS_GOVERNOR]: "Governor Address Unlock Condition",
    [AssociationType.ALIAS_ISSUER]: "Issuer Feature",
    [AssociationType.ALIAS_SENDER]: "Sender Feature",
    [AssociationType.FOUNDRY_ALIAS]: "Immutable Alias Address Unlock Condition",
    [AssociationType.NFT_ID]: "Nft Id",
    [AssociationType.NFT_ADDRESS]: "Address Unlock Condition",
    [AssociationType.NFT_ADDRESS_EXPIRED]: "Address Unlock Condition (expired)",
    [AssociationType.NFT_STORAGE_RETURN]: "Storage Deposit Return Unlock Condition",
    [AssociationType.NFT_EXPIRATION_RETURN]: "Expiration Return Unlock Condtition",
    [AssociationType.NFT_ISSUER]: "Issuer Feature",
    [AssociationType.NFT_SENDER]: "Sender Feature",
};

export const buildAssociatedOutputsTabs = (associations: IAssociation[]): AssociatedOutputTab[] => {
    const tabs: AssociatedOutputTab[] = [];
    if (associations.length > 0) {
        if (associations.some((association) => AssociationType[association.type].startsWith("BASIC"))) {
            tabs.push("Basic");
        }
        if (associations.some((association) => AssociationType[association.type].startsWith("NFT"))) {
            tabs.push("NFT");
        }
        if (associations.some((association) => AssociationType[association.type].startsWith("ALIAS"))) {
            tabs.push("Alias");
        }
        if (associations.some((association) => AssociationType[association.type].startsWith("FOUNDRY"))) {
            tabs.push("Foundry");
        }
    }
    return tabs;
};
