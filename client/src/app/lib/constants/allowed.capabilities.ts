export const CAPABILITY_FLAG_TO_DESCRIPTION: Record<number, string> = {
    0: "Can receive Outputs with Native Tokens.",
    1: "Can receive Outputs with Mana.",
    2: "Can receive Outputs with a Timelock Unlock Condition.",
    3: "Can receive Outputs with an Expiration Unlock Condition.",
    4: "Can receive Outputs with a Storage Deposit Return Unlock Condition.",
    5: "Can receive Account Outputs.",
    6: "Can receive Anchor Outputs.",
    7: "Can receive NFT Outputs.",
    8: "Can receive Delegation Outputs.",
};
