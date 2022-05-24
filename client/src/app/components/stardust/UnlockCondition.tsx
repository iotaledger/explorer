import { ADDRESS_UNLOCK_CONDITION_TYPE, EXPIRATION_UNLOCK_CONDITION_TYPE, GOVERNOR_ADDRESS_UNLOCK_CONDITION_TYPE,
    IMMUTABLE_ALIAS_UNLOCK_CONDITION_TYPE, STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE, TIMELOCK_UNLOCK_CONDITION_TYPE,
    STATE_CONTROLLER_ADDRESS_UNLOCK_CONDITION_TYPE } from "@iota/iota.js-stardust";
import classNames from "classnames";
import moment from "moment";
import React, { ReactNode } from "react";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import { formatAmount } from "../../../helpers/stardust/valueFormatHelper";
import NetworkContext from "../../context/NetworkContext";
import AsyncComponent from "../AsyncComponent";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import Address from "./Address";
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

    constructor(props: UnlockConditionProps) {
        super(props);

        this.state = {
            showOutputDetails: -1
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
        return (
            <div className="unlock-condition">
                <div
                    className="card--content__input card--value row middle"
                    onClick={() => this.setState({ showOutputDetails: this.state.showOutputDetails === 1 ? -1 : 1 })}
                >
                    <div className={classNames("margin-r-t", "card--content__input--dropdown",
                        "card--content__flex_between", { opened: this.state.showOutputDetails === 1 })}
                    >
                        <DropdownIcon />
                    </div>
                    <div className="card--label">
                        {NameHelper.getUnlockConditionTypeName(this.props.unlockCondition.type)}
                    </div>
                </div>
                {this.state.showOutputDetails === 1 && (
                    <div className="margin-l-t">
                        {this.props.unlockCondition.type === ADDRESS_UNLOCK_CONDITION_TYPE && (
                            <Address
                                address={this.props.unlockCondition.address}
                            />
                        )}
                        {this.props.unlockCondition.type === STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE && (
                            <React.Fragment>
                                <div className="card--label">
                                    Return address
                                </div>
                                <Address
                                    address={this.props.unlockCondition.returnAddress}
                                />
                                <div className="card--label">
                                    Amount:
                                </div>
                                <div className="card--value row">
                                    {formatAmount(Number(this.props.unlockCondition.amount), this.context.tokenInfo)}
                                </div>
                            </React.Fragment>
                        )}
                        {this.props.unlockCondition.type === TIMELOCK_UNLOCK_CONDITION_TYPE && (
                            <React.Fragment>
                                {this.props.unlockCondition.milestoneIndex && (
                                    <React.Fragment>
                                        <div className="card--label">
                                            Milestone index
                                        </div>
                                        <div className="card--value row">
                                            {this.props.unlockCondition.milestoneIndex}
                                        </div>
                                    </React.Fragment>
                                )}
                                {this.props.unlockCondition.unixTime && (
                                    <React.Fragment>
                                        <div className="card--label">
                                            Unix time
                                        </div>
                                        <div className="card--value row">
                                            {this.formatUnixTime(this.props.unlockCondition.unixTime)}
                                        </div>
                                    </React.Fragment>
                                )}
                            </React.Fragment>
                        )}
                        {this.props.unlockCondition.type === EXPIRATION_UNLOCK_CONDITION_TYPE && (
                            <React.Fragment>
                                <Address
                                    address={this.props.unlockCondition.returnAddress}
                                />
                                {this.props.unlockCondition.milestoneIndex && (
                                    <React.Fragment>
                                        <div className="card--label">
                                            Milestone index
                                        </div>
                                        <div className="card--value row">
                                            {this.props.unlockCondition.milestoneIndex}
                                        </div>
                                    </React.Fragment>
                                )}
                                {this.props.unlockCondition.unixTime && (
                                    <React.Fragment>
                                        <div className="card--label">
                                            Unix time
                                        </div>
                                        <div className="card--value row">
                                            {this.formatUnixTime(this.props.unlockCondition.unixTime)}
                                        </div>
                                    </React.Fragment>
                                )}
                            </React.Fragment>
                        )}
                        {this.props.unlockCondition.type === GOVERNOR_ADDRESS_UNLOCK_CONDITION_TYPE && (
                            <Address
                                address={this.props.unlockCondition.address}
                            />
                        )}
                        {this.props.unlockCondition.type === IMMUTABLE_ALIAS_UNLOCK_CONDITION_TYPE && (
                            <Address
                                address={this.props.unlockCondition.address}
                            />
                        )}
                        {this.props.unlockCondition.type === STATE_CONTROLLER_ADDRESS_UNLOCK_CONDITION_TYPE && (
                            <Address
                                address={this.props.unlockCondition.address}
                            />
                        )}
                    </div>
                )}
            </div>
        );
    }

    private readonly formatUnixTime = (timestamp: number) => moment.unix(timestamp).format("DD/MM/YYYY HH:MM:ss");
}

export default UnlockCondition;
