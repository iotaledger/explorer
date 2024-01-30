import {
    AddressUnlockCondition,
    CommonOutput,
    ExpirationUnlockCondition,
    GovernorAddressUnlockCondition,
    ReferenceUnlock,
    SignatureUnlock,
    StateControllerAddressUnlockCondition,
    UnlockConditionType,
    UnlockType,
    Utils,
} from "@iota/sdk-wasm/web";
import React, { useContext, useEffect, useState } from "react";
import NetworkContext from "~/app/context/NetworkContext";
import { Bech32AddressHelper } from "~/helpers/stardust/bech32AddressHelper";
import transactionPayloadMessage from "~assets/modals/stardust/block/transaction-payload.json";
import Modal from "../../../Modal";
import Input from "../../Input";
import Output from "../../Output";
import Unlocks from "../../Unlocks";
import { IPreExpandedConfig } from "../../interfaces";
import "./TransactionPayload.scss";
import { TransactionPayloadProps } from "./TransactionPayloadProps";

/**
 * Component which will display a transaction payload.
 */
const TransactionPayload: React.FC<TransactionPayloadProps> = ({ network, inputs, unlocks, outputs, header, isLinksDisabled }) => {
    const [inputsPreExpandedConfig, setInputsPreExpandedConfig] = useState<IPreExpandedConfig[]>([]);
    const { bech32Hrp } = useContext(NetworkContext);

    const OUTPUT_EXPAND_CONDITIONS: UnlockConditionType[] = [
        UnlockConditionType.Address,
        UnlockConditionType.StateControllerAddress,
        UnlockConditionType.GovernorAddress,
    ];

    const INPUT_EXPAND_CONDITIONS: UnlockConditionType[] = [...OUTPUT_EXPAND_CONDITIONS, UnlockConditionType.Expiration];

    useEffect(() => {
        if (bech32Hrp) {
            // given the unlocks, expand the correct address unlock condition
            const inputsPreExpandedConfig: IPreExpandedConfig[] = inputs.map((input, idx) => {
                const commonOutput = input?.output?.output as unknown as CommonOutput;
                let preExpandedConfig: IPreExpandedConfig = {};
                if (commonOutput) {
                    const matchExpandCondition = commonOutput.unlockConditions?.find((unlockCondition) =>
                        INPUT_EXPAND_CONDITIONS.includes(unlockCondition.type),
                    );
                    preExpandedConfig = {
                        isPreExpanded: !!matchExpandCondition,
                    };
                    if (input?.output?.output && "unlockConditions" in input.output.output) {
                        const commmonOutput = input.output.output as unknown as CommonOutput;
                        let unlock = unlocks[idx];
                        if (unlock.type === UnlockType.Reference) {
                            const referenceUnlock = unlock as ReferenceUnlock;
                            unlock = unlocks[referenceUnlock.reference];
                        }
                        const unlockSignatureAddress = Utils.hexPublicKeyToBech32Address(
                            (unlock as SignatureUnlock).signature.publicKey,
                            bech32Hrp,
                        );
                        preExpandedConfig = {
                            ...preExpandedConfig,
                            unlockConditions: commmonOutput.unlockConditions?.map((unlockCondition) => {
                                switch (unlockCondition.type) {
                                    case UnlockConditionType.Address: {
                                        const unlockAddress = Bech32AddressHelper.buildAddress(
                                            bech32Hrp,
                                            (unlockCondition as AddressUnlockCondition).address,
                                        )?.bech32;
                                        return unlockAddress === unlockSignatureAddress;
                                    }
                                    case UnlockConditionType.Expiration: {
                                        const unlockAddress = Bech32AddressHelper.buildAddress(
                                            bech32Hrp,
                                            (unlockCondition as ExpirationUnlockCondition).returnAddress,
                                        )?.bech32;
                                        return unlockAddress === unlockSignatureAddress;
                                    }
                                    case UnlockConditionType.StateControllerAddress: {
                                        const unlockAddress = Bech32AddressHelper.buildAddress(
                                            bech32Hrp,
                                            (unlockCondition as StateControllerAddressUnlockCondition).address,
                                        )?.bech32;
                                        return unlockAddress === unlockSignatureAddress;
                                    }
                                    case UnlockConditionType.GovernorAddress: {
                                        const unlockAddress = Bech32AddressHelper.buildAddress(
                                            bech32Hrp,
                                            (unlockCondition as GovernorAddressUnlockCondition).address,
                                        )?.bech32;
                                        return unlockAddress === unlockSignatureAddress;
                                    }
                                    default:
                                        return false;
                                }
                            }),
                        };
                    }
                }
                return preExpandedConfig;
            });
            setInputsPreExpandedConfig(inputsPreExpandedConfig);
        }
    });

    // for basic outputs, always expand all the OUTPUT_EXPAND_CONDITIONS
    const outputsPreExpandedConfig: IPreExpandedConfig[] = outputs.map((output) => {
        const commonOutput = output.output as CommonOutput;
        let preExpandedConfig: IPreExpandedConfig = {};
        if (commonOutput) {
            const matchExpandCondition = commonOutput.unlockConditions?.find((unlockCondition) =>
                OUTPUT_EXPAND_CONDITIONS.includes(unlockCondition.type),
            );
            preExpandedConfig = {
                isPreExpanded: !!matchExpandCondition,
            };
            preExpandedConfig = {
                ...preExpandedConfig,
                unlockConditions: commonOutput.unlockConditions?.map((unlockCondition) =>
                    OUTPUT_EXPAND_CONDITIONS.includes(unlockCondition.type),
                ),
            };
        }
        return preExpandedConfig;
    });

    return (
        <div className="transaction-payload">
            {header && (
                <div className="section--header">
                    <div className="row middle">
                        <h2>{header}</h2>
                        <Modal icon="info" data={transactionPayloadMessage} />
                    </div>
                </div>
            )}
            <div className="row row--tablet-responsive fill">
                <div className="card col fill">
                    <div className="card--header">
                        <h2 className="card--header__title">From</h2>
                        <span className="dot-separator">•</span>
                        <span>{inputs.length}</span>
                    </div>
                    <div className="transaction-payload_outputs card--content">
                        {inputs.map((input, idx) => (
                            <Input key={idx} network={network} input={input} preExpandedConfig={inputsPreExpandedConfig[idx]} />
                        ))}
                        <Unlocks unlocks={unlocks} />
                    </div>
                </div>

                <div className="card col fill">
                    <div className="card--header">
                        <h2 className="card--header__title">To</h2>
                        <span className="dot-separator">•</span>
                        <span>{outputs.length}</span>
                    </div>
                    <div className="transaction-payload_outputs card--content">
                        {outputs.map((output, idx) => (
                            <Output
                                key={idx}
                                outputId={output.id}
                                output={output.output}
                                amount={output.amount}
                                network={network}
                                showCopyAmount={true}
                                isLinksDisabled={isLinksDisabled}
                                preExpandedConfig={outputsPreExpandedConfig[idx]}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionPayload;
