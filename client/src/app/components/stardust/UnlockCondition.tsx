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
} from "@iota/sdk-wasm-stardust/web";
import classNames from "classnames";
import React, { ReactNode } from "react";
import DropdownIcon from "~assets/dropdown-arrow.svg?react";
import Address from "./address/Address";
import { UnlockConditionProps } from "./UnlockConditionProps";
import { UnlockConditionState } from "./UnlockConditionState";
import { DateHelper } from "~helpers/dateHelper";
import { NameHelper } from "~helpers/stardust/nameHelper";
import { formatAmount } from "~helpers/stardust/valueFormatHelper";
import NetworkContext from "../../context/NetworkContext";
import AsyncComponent from "../AsyncComponent";

/**
 * Component which will display an unlock condition.
 */
class UnlockCondition extends AsyncComponent<UnlockConditionProps, UnlockConditionState> {
    /**
     * The component context type.
     */
    public static contextType = NetworkContext;

    /**
     * The component context.
     */
    public declare context: React.ContextType<typeof NetworkContext>;

    constructor(props: UnlockConditionProps) {
        super(props);

        this.state = {
            isFormattedBalance: true,
            isExpanded: this.props.isPreExpanded ?? false,
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { isFormattedBalance, isExpanded } = this.state;
        const { unlockCondition } = this.props;
        const tokenInfo: INodeInfoBaseToken = this.context.tokenInfo;

        return (
            <div className="unlock-condition">
                <div className="card--content__input card--value row middle" onClick={() => this.setState({ isExpanded: !isExpanded })}>
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
                                        onClick={() => this.setState({ isFormattedBalance: !isFormattedBalance })}
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
}

export default UnlockCondition;
