import { AssociationType, IAssociation } from "~models/api/nova/IAssociationsResponse";

export type AssociatedOutputTab = "Basic" | "Account" | "Anchor" | "Delegation" | "Foundry" | "NFT";

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
        "Account",
        [AssociationType.ACCOUNT_ID, AssociationType.ACCOUNT_ADDRESS, AssociationType.ACCOUNT_ISSUER, AssociationType.ACCOUNT_SENDER],
    ],
    [
        "Anchor",
        [
            AssociationType.ANCHOR_ID,
            AssociationType.ANCHOR_STATE_CONTROLLER,
            AssociationType.ANCHOR_GOVERNOR,
            AssociationType.ANCHOR_ISSUER,
            AssociationType.ANCHOR_SENDER,
        ],
    ],
    ["Delegation", [AssociationType.DELEGATION_ADDRESS, AssociationType.DELEGATION_VALIDATOR]],
    ["Foundry", [AssociationType.FOUNDRY_ACCOUNT]],
    [
        "NFT",
        [
            AssociationType.NFT_ID,
            AssociationType.NFT_ADDRESS,
            AssociationType.NFT_ADDRESS_EXPIRED,
            AssociationType.NFT_STORAGE_RETURN,
            AssociationType.NFT_EXPIRATION_RETURN,
            AssociationType.NFT_ISSUER,
            AssociationType.NFT_SENDER,
        ],
    ],
]);

export const ASSOCIATION_TYPE_TO_LABEL = {
    [AssociationType.BASIC_ADDRESS]: "Address Unlock Condition",
    [AssociationType.BASIC_ADDRESS_EXPIRED]: "Address Unlock Condition (expired)",
    [AssociationType.BASIC_STORAGE_RETURN]: "Storage Deposit Return Unlock Condition",
    [AssociationType.BASIC_EXPIRATION_RETURN]: "Expiration Return Unlock Condtition",
    [AssociationType.BASIC_SENDER]: "Sender Feature",
    [AssociationType.ACCOUNT_ID]: "Account Id",
    [AssociationType.ACCOUNT_ADDRESS]: "Address Unlock Condition",
    [AssociationType.ACCOUNT_ISSUER]: "Issuer Feature",
    [AssociationType.ACCOUNT_SENDER]: "Sender Feature",
    [AssociationType.ANCHOR_ID]: "Anchor Id",
    [AssociationType.ANCHOR_STATE_CONTROLLER]: "Anchor State Controller Address Unlock Condition",
    [AssociationType.ANCHOR_GOVERNOR]: "Ancor Governor Address Unlock Condition",
    [AssociationType.ANCHOR_ISSUER]: "Issuer Feature",
    [AssociationType.ANCHOR_SENDER]: "Sender Feature",
    [AssociationType.DELEGATION_ADDRESS]: "Address Unlock Condition",
    [AssociationType.DELEGATION_VALIDATOR]: "Validator Address",
    [AssociationType.FOUNDRY_ACCOUNT]: "Controlling Account",
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
        if (associations.some((association) => AssociationType[association.type].startsWith("ACCOUNT"))) {
            tabs.push("Account");
        }
        if (associations.some((association) => AssociationType[association.type].startsWith("ANCHOR"))) {
            tabs.push("Anchor");
        }
        if (associations.some((association) => AssociationType[association.type].startsWith("DELEGATION"))) {
            tabs.push("Delegation");
        }
        if (associations.some((association) => AssociationType[association.type].startsWith("FOUNDRY"))) {
            tabs.push("Foundry");
        }
        if (associations.some((association) => AssociationType[association.type].startsWith("NFT"))) {
            tabs.push("NFT");
        }
    }
    return tabs;
};
