import {
    AddressUnlockCondition,
    ExpirationUnlockCondition,
    GovernorAddressUnlockCondition,
    StateControllerAddressUnlockCondition,
    StorageDepositReturnUnlockCondition,
    TimelockUnlockCondition,
    UnlockConditionType,
    UnlockCondition,
    ImmutableAccountAddressUnlockCondition,
} from "@iota/sdk-wasm-nova/web";
import classNames from "classnames";
import React from "react";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import AddressView from "./AddressView";

interface UnlockConditionViewProps {
    unlockCondition: UnlockCondition;
    isPreExpanded?: boolean;
}

const UnlockConditionView: React.FC<UnlockConditionViewProps> = ({
    unlockCondition,
    isPreExpanded,
}) => {
    const [isFormattedBalance, setIsFormattedBalance] = React.useState(true);
    const [isExpanded, setIsExpanded] = React.useState(isPreExpanded ?? false);

    return (
        <div className="unlock-condition">
            <div
                className="card--content__input card--value row middle"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div
                    className={classNames(
                        "margin-r-t",
                        "card--content--dropdown",
                        { opened: isExpanded },
                    )}
                >
                    <DropdownIcon />
                </div>
                <div className="card--label">
                    {getUnlockConditionTypeName(unlockCondition.type)}
                </div>
            </div>
            {isExpanded && (
                <div className="padding-l-t left-border">
                    {unlockCondition.type === UnlockConditionType.Address && (
                        <AddressView
                            address={
                                (unlockCondition as AddressUnlockCondition)
                                    .address
                            }
                        />
                    )}
                    {unlockCondition.type ===
                        UnlockConditionType.StorageDepositReturn && (
                        <React.Fragment>
                            <div className="card--label">Return address</div>
                            <AddressView
                                address={
                                    (
                                        unlockCondition as StorageDepositReturnUnlockCondition
                                    ).returnAddress
                                }
                            />
                            <div className="card--label">Amount:</div>
                            <div className="card--value row">
                                <span
                                    className="pointer margin-r-t"
                                    onClick={() =>
                                        setIsFormattedBalance(
                                            !isFormattedBalance,
                                        )
                                    }
                                >
                                    {Number(
                                        (
                                            unlockCondition as StorageDepositReturnUnlockCondition
                                        ).amount,
                                    )}
                                </span>
                            </div>
                        </React.Fragment>
                    )}
                    {unlockCondition.type === UnlockConditionType.Timelock &&
                        (unlockCondition as TimelockUnlockCondition)
                            .slotIndex && (
                            <React.Fragment>
                                <div className="card--label">Slot index</div>
                                <div className="card--value row">
                                    {
                                        (
                                            unlockCondition as TimelockUnlockCondition
                                        ).slotIndex
                                    }
                                </div>
                            </React.Fragment>
                        )}
                    {unlockCondition.type ===
                        UnlockConditionType.Expiration && (
                        <React.Fragment>
                            <AddressView
                                address={
                                    (
                                        unlockCondition as ExpirationUnlockCondition
                                    ).returnAddress
                                }
                            />
                            {(unlockCondition as ExpirationUnlockCondition)
                                .slotIndex && (
                                <React.Fragment>
                                    <div className="card--label">
                                        Slot index
                                    </div>
                                    <div className="card--value row">
                                        {
                                            (
                                                unlockCondition as ExpirationUnlockCondition
                                            ).slotIndex
                                        }
                                    </div>
                                </React.Fragment>
                            )}
                        </React.Fragment>
                    )}
                    {unlockCondition.type ===
                        UnlockConditionType.GovernorAddress && (
                        <AddressView
                            address={
                                (
                                    unlockCondition as GovernorAddressUnlockCondition
                                ).address
                            }
                        />
                    )}
                    {unlockCondition.type ===
                        UnlockConditionType.ImmutableAccountAddress && (
                        <AddressView
                            address={
                                (
                                    unlockCondition as ImmutableAccountAddressUnlockCondition
                                ).address
                            }
                        />
                    )}
                    {unlockCondition.type ===
                        UnlockConditionType.StateControllerAddress && (
                        <AddressView
                            address={
                                (
                                    unlockCondition as StateControllerAddressUnlockCondition
                                ).address
                            }
                        />
                    )}
                </div>
            )}
        </div>
    );
};

function getUnlockConditionTypeName(type: UnlockConditionType): string {
    switch (type) {
        case UnlockConditionType.Address:
            return "Address";
        case UnlockConditionType.StorageDepositReturn:
            return "Storage deposit return";
        case UnlockConditionType.Timelock:
            return "Timelock";
        case UnlockConditionType.Expiration:
            return "Expiration";
        case UnlockConditionType.GovernorAddress:
            return "Governor address";
        case UnlockConditionType.StateControllerAddress:
            return "State controller address";
        case UnlockConditionType.ImmutableAccountAddress:
            return "Immutable account address";
    }
}

export default UnlockConditionView;
