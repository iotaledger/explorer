import {
    AddressUnlockCondition, ExpirationUnlockCondition, GovernorAddressUnlockCondition,
    ImmutableAliasAddressUnlockCondition, INodeInfoBaseToken,
    StateControllerAddressUnlockCondition, StorageDepositReturnUnlockCondition,
    TimelockUnlockCondition, UnlockConditionType
} from "@iota/iota.js-stardust";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { DateHelper } from "../../../helpers/dateHelper";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import NetworkContext from "../../context/NetworkContext";
import AsyncComponent from "../AsyncComponent";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import Address from "./address/Address";
import { UnlockConditionProps } from "./UnlockConditionProps";
import { UnlockConditionState } from "./UnlockConditionState";

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
            isExpanded: this.props.isPreExpanded ?? false
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
                <div
                    className="card--content__input card--value row middle"
                    onClick={() => this.setState({ isExpanded: !isExpanded })}
                >
                    <div className={classNames("margin-r-t", "card--content--dropdown", { opened: isExpanded })}>
                        <DropdownIcon />
                    </div>
                    <div className="card--label">
                        {NameHelper.getUnlockConditionTypeName(unlockCondition.type)}
                    </div>
                </div>
                {isExpanded && (
                    <div className="padding-l-t left-border">
                        {unlockCondition.type === UnlockConditionType.Address && (
                            <Address
                                address={(unlockCondition as AddressUnlockCondition).getAddress()}
                            />
                        )}
                        {unlockCondition.type === UnlockConditionType.StorageDepositReturn && (
                            <React.Fragment>
                                <div className="card--label">
                                    Return address
                                </div>
                                <Address
                                    address={
                                        (unlockCondition as StorageDepositReturnUnlockCondition).getReturnAddress()
                                    }
                                />
                                <div className="card--label">
                                    Amount:
                                </div>
                                <div className="card--value row">
                                    <span
                                        className="pointer margin-r-t"
                                        onClick={() => this.setState({ isFormattedBalance: !isFormattedBalance })}
                                    >
                                        {formatAmount(
                                            Number(
                                                (unlockCondition as StorageDepositReturnUnlockCondition).getAmount()
                                            ),
                                            tokenInfo,
                                            !isFormattedBalance
                                        )}
                                    </span>
                                </div>
                            </React.Fragment>
                        )}
                        {unlockCondition.type === UnlockConditionType.Timelock &&
                            (unlockCondition as TimelockUnlockCondition).getUnixTime() && (
                                <React.Fragment>
                                    <div className="card--label">
                                        Unix time
                                    </div>
                                    <div className="card--value row">
                                        {DateHelper.formatShort(
                                            (unlockCondition as TimelockUnlockCondition).getUnixTime() * 1000
                                        )}
                                    </div>
                                </React.Fragment>
                            )}
                        {unlockCondition.type === UnlockConditionType.Expiration && (
                            <React.Fragment>
                                <Address
                                    address={(unlockCondition as ExpirationUnlockCondition).getReturnAddress()}
                                />
                                {(unlockCondition as ExpirationUnlockCondition).getUnixTime() && (
                                    <React.Fragment>
                                        <div className="card--label">
                                            Unix time
                                        </div>
                                        <div className="card--value row">
                                            {DateHelper.formatShort(
                                                (unlockCondition as ExpirationUnlockCondition).getUnixTime() * 1000
                                            )}
                                        </div>
                                    </React.Fragment>
                                )}
                            </React.Fragment>
                        )}
                        {unlockCondition.type === UnlockConditionType.GovernorAddress && (
                            <Address
                                address={(unlockCondition as GovernorAddressUnlockCondition).getAddress()}
                            />
                        )}
                        {unlockCondition.type === UnlockConditionType.ImmutableAliasAddress && (
                            <Address
                                address={(unlockCondition as ImmutableAliasAddressUnlockCondition).getAddress()}
                            />
                        )}
                        {unlockCondition.type === UnlockConditionType.StateControllerAddress && (
                            <Address
                                address={(unlockCondition as StateControllerAddressUnlockCondition).getAddress()}
                            />
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export default UnlockCondition;

