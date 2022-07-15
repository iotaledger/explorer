import { ADDRESS_UNLOCK_CONDITION_TYPE, EXPIRATION_UNLOCK_CONDITION_TYPE, GOVERNOR_ADDRESS_UNLOCK_CONDITION_TYPE,
    IMMUTABLE_ALIAS_UNLOCK_CONDITION_TYPE, STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE, TIMELOCK_UNLOCK_CONDITION_TYPE,
    STATE_CONTROLLER_ADDRESS_UNLOCK_CONDITION_TYPE } from "@iota/iota.js-stardust";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { DateHelper } from "../../../helpers/dateHelper";
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
        const { isExpanded } = this.state;
        const { unlockCondition } = this.props;

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
                    <div className="margin-l-t">
                        {unlockCondition.type === ADDRESS_UNLOCK_CONDITION_TYPE && (
                            <Address
                                address={unlockCondition.address}
                            />
                        )}
                        {unlockCondition.type === STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE && (
                            <React.Fragment>
                                <div className="card--label">
                                    Return address
                                </div>
                                <Address
                                    address={unlockCondition.returnAddress}
                                />
                                <div className="card--label">
                                    Amount:
                                </div>
                                <div className="card--value row">
                                    {formatAmount(Number(unlockCondition.amount), this.context.tokenInfo, true)}
                                </div>
                            </React.Fragment>
                        )}
                        {unlockCondition.type === TIMELOCK_UNLOCK_CONDITION_TYPE &&
                            unlockCondition.unixTime && (
                                <React.Fragment>
                                    <div className="card--label">
                                        Unix time
                                    </div>
                                    <div className="card--value row">
                                        {DateHelper.formatShort(unlockCondition.unixTime)}
                                    </div>
                                </React.Fragment>
                        )}
                        {unlockCondition.type === EXPIRATION_UNLOCK_CONDITION_TYPE && (
                            <React.Fragment>
                                <Address
                                    address={unlockCondition.returnAddress}
                                />
                                {unlockCondition.unixTime && (
                                    <React.Fragment>
                                        <div className="card--label">
                                            Unix time
                                        </div>
                                        <div className="card--value row">
                                            {DateHelper.formatShort(unlockCondition.unixTime)}
                                        </div>
                                    </React.Fragment>
                                )}
                            </React.Fragment>
                        )}
                        {unlockCondition.type === GOVERNOR_ADDRESS_UNLOCK_CONDITION_TYPE && (
                            <Address
                                address={unlockCondition.address}
                            />
                        )}
                        {unlockCondition.type === IMMUTABLE_ALIAS_UNLOCK_CONDITION_TYPE && (
                            <Address
                                address={unlockCondition.address}
                            />
                        )}
                        {unlockCondition.type === STATE_CONTROLLER_ADDRESS_UNLOCK_CONDITION_TYPE && (
                            <Address
                                address={unlockCondition.address}
                            />
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export default UnlockCondition;
