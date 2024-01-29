import {
    AddressUnlockCondition,
    ExpirationUnlockCondition,
    GovernorAddressUnlockCondition,
    ImmutableAliasAddressUnlockCondition,
    INodeInfoBaseToken,
    StateControllerAddressUnlockCondition,
    StorageDepositReturnUnlockCondition,
    TimelockUnlockCondition,
    UnlockConditionType,
} from "@iota/sdk-wasm/web";
import classNames from "classnames";
import React, { useContext, useState, useEffect } from "react";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import Address from "./address/Address";
import { UnlockConditionProps } from "./UnlockConditionProps";
import { UnlockConditionState } from "./UnlockConditionState";
import { DateHelper } from "~helpers/dateHelper";
import { NameHelper } from "~helpers/stardust/nameHelper";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import NetworkContext from "../../context/NetworkContext";

/**
 * Component which will display an unlock condition.
 */
function UnlockCondition(props: UnlockConditionProps) {
    const [state, setState] = useState<UnlockConditionState>({
        isFormattedBalance: true,
        isExpanded: props.isPreExpanded ?? false,
    });
    const context = useContext(NetworkContext);
    const { isFormattedBalance, isExpanded } = state;
    const { unlockCondition } = props;
    const tokenInfo: INodeInfoBaseToken = context.tokenInfo;

    useEffect(() => {
        if (props.isPreExpanded !== undefined && props.isPreExpanded !== null) {
            setState((prevState) => ({
                ...prevState,
                isExpanded: props.isPreExpanded ?? false,
            }));
        }
    }, [props.isPreExpanded]);

    return (
        <div className="unlock-condition">
            <div
                className="card--content__input card--value row middle"
                onClick={() => setState((p) => ({ ...p, isExpanded: !isExpanded }))}
            >
                <div className={classNames("margin-r-t", "card--content--dropdown", { opened: isExpanded })}>
                    <DropdownIcon />
                </div>
                <div className="card--label">{NameHelper.getUnlockConditionTypeName(unlockCondition.type)}</div>
            </div>
            {isExpanded && (
                <div className="padding-l-t left-border">
                    {unlockCondition.type === UnlockConditionType.Address && (
                        <Address address={(unlockCondition as AddressUnlockCondition).address} />
                    )}
                    {unlockCondition.type === UnlockConditionType.StorageDepositReturn && (
                        <React.Fragment>
                            <div className="card--label">Return address</div>
                            <Address address={(unlockCondition as StorageDepositReturnUnlockCondition).returnAddress} />
                            <div className="card--label">Amount:</div>
                            <div className="card--value row">
                                <span
                                    className="pointer margin-r-t"
                                    onClick={() => setState((p) => ({ ...p, isFormattedBalance: !isFormattedBalance }))}
                                >
                                    {formatAmount(
                                        Number((unlockCondition as StorageDepositReturnUnlockCondition).amount),
                                        tokenInfo,
                                        !isFormattedBalance,
                                    )}
                                </span>
                            </div>
                        </React.Fragment>
                    )}
                    {unlockCondition.type === UnlockConditionType.Timelock && (unlockCondition as TimelockUnlockCondition).unixTime && (
                        <React.Fragment>
                            <div className="card--label">Unix time</div>
                            <div className="card--value row">
                                {DateHelper.formatShort((unlockCondition as TimelockUnlockCondition).unixTime * 1000)}
                            </div>
                        </React.Fragment>
                    )}
                    {unlockCondition.type === UnlockConditionType.Expiration && (
                        <React.Fragment>
                            <Address address={(unlockCondition as ExpirationUnlockCondition).returnAddress} />
                            {(unlockCondition as ExpirationUnlockCondition).unixTime && (
                                <React.Fragment>
                                    <div className="card--label">Unix time</div>
                                    <div className="card--value row">
                                        {DateHelper.formatShort((unlockCondition as ExpirationUnlockCondition).unixTime * 1000)}
                                    </div>
                                </React.Fragment>
                            )}
                        </React.Fragment>
                    )}
                    {unlockCondition.type === UnlockConditionType.GovernorAddress && (
                        <Address address={(unlockCondition as GovernorAddressUnlockCondition).address} />
                    )}
                    {unlockCondition.type === UnlockConditionType.ImmutableAliasAddress && (
                        <Address address={(unlockCondition as ImmutableAliasAddressUnlockCondition).address} />
                    )}
                    {unlockCondition.type === UnlockConditionType.StateControllerAddress && (
                        <Address address={(unlockCondition as StateControllerAddressUnlockCondition).address} />
                    )}
                </div>
            )}
        </div>
    );
}

export default UnlockCondition;
