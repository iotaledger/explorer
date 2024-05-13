import { ReferenceUnlock, SignatureUnlock, Unlock, UnlockType } from "@iota/sdk-wasm-nova/web";

export function resolveTransitiveUnlock(unlocks: Unlock[], unlockIndex: number): SignatureUnlock {
    const unlock = unlocks[unlockIndex];
    let signatureUnlock: SignatureUnlock;
    if (unlock.type === UnlockType.Signature) {
        signatureUnlock = unlock as SignatureUnlock;
    } else {
        let refUnlockIdx = unlockIndex;
        // unlock references can be transitive,
        // so we need to follow the path until we find the signature
        do {
            const referenceUnlock = unlocks[refUnlockIdx] as ReferenceUnlock;
            signatureUnlock = unlocks[referenceUnlock.reference] as SignatureUnlock;
            refUnlockIdx = referenceUnlock.reference;
        } while (!signatureUnlock.signature);
    }
    return signatureUnlock;
}
