import { ADDRESS_UNLOCK_CONDITION_TYPE, EXPIRATION_UNLOCK_CONDITION_TYPE, GOVERNOR_ADDRESS_UNLOCK_CONDITION_TYPE, IMMUTABLE_ALIAS_UNLOCK_CONDITION_TYPE, STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE, TIMELOCK_UNLOCK_CONDITION_TYPE, STATE_CONTROLLER_ADDRESS_UNLOCK_CONDITION_TYPE } from "@iota/iota.js-stardust";
import classNames from "classnames";
import React, { ReactNode } from "react";
import { ServiceFactory } from "../../../factories/serviceFactory";
import Bech32HrpContext from "../../../helpers/stardust/bech32HrpContext";
import { NameHelper } from "../../../helpers/stardust/nameHelper";
import { INetwork } from "../../../models/db/INetwork";
import { NetworkService } from "../../../services/networkService";
import AsyncComponent from "../AsyncComponent";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import Address from "./Address";
import { UnlockConditionProps } from "./UnlockConditionProps";
import { UnlockConditionState } from "./UnlockConditionState";

/**
 * Component which will display an unlock condition.
 */
class UnlockCondition extends AsyncComponent<UnlockConditionProps, UnlockConditionState> {
    private readonly networkConfig: INetwork | undefined;

    constructor(props: UnlockConditionProps) {
        super(props);

        const networkService = ServiceFactory.get<NetworkService>("network");
        this.networkConfig = props.network
            ? networkService.get(props.network)
            : undefined;

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
                            <React.Fragment>
                                <div className="card--label">
                                    Name:
                                </div>
                                <div className="card--value row">
                                    {NameHelper.getAddressTypeName(this.props.unlockCondition.address.type)}
                                </div>
                                <Bech32HrpContext.Provider
                                    value={{
                                        bech32Hrp: this.networkConfig?.bechHrp ?? "iota"
                                    }}
                                >
                                    <Address
                                        address={this.props.unlockCondition.address}
                                    />
                                </Bech32HrpContext.Provider>
                            </React.Fragment>
                        )}
                        {this.props.unlockCondition.type === STORAGE_DEPOSIT_RETURN_UNLOCK_CONDITION_TYPE && (
                            <React.Fragment>
                                <div className="card--label">
                                    Return address
                                </div>
                                <Bech32HrpContext.Provider
                                    value={{
                                        bech32Hrp: this.networkConfig?.bechHrp ?? "iota"
                                    }}
                                >
                                    <Address
                                        address={this.props.unlockCondition.returnAddress}
                                    />
                                </Bech32HrpContext.Provider>
                                <div className="card--label">
                                    Amount:
                                </div>
                                <div className="card--value row">
                                    {this.props.unlockCondition.amount}
                                </div>
                            </React.Fragment>
                        )}
                        {this.props.unlockCondition.type === TIMELOCK_UNLOCK_CONDITION_TYPE && (
                            <React.Fragment>
                                <div className="card--label">
                                    Milestone index
                                </div>
                                <div className="card--value row">
                                    {this.props.unlockCondition.milestoneIndex}
                                </div>
                                <div className="card--label">
                                    Unix time
                                </div>
                                <div className="card--value row">
                                    {this.props.unlockCondition.unixTime}
                                </div>
                            </React.Fragment>
                        )}
                        {this.props.unlockCondition.type === EXPIRATION_UNLOCK_CONDITION_TYPE && (
                            <React.Fragment>
                                <Bech32HrpContext.Provider
                                    value={{
                                        bech32Hrp: this.networkConfig?.bechHrp ?? "iota"
                                    }}
                                >
                                    <Address
                                        address={this.props.unlockCondition.returnAddress}
                                    />
                                </Bech32HrpContext.Provider>
                                <div className="card--label">
                                    Milestone index
                                </div>
                                <div className="card--value row">
                                    {this.props.unlockCondition.milestoneIndex}
                                </div>
                                <div className="card--label">
                                    Unix time
                                </div>
                                <div className="card--value row">
                                    {this.props.unlockCondition.unixTime}
                                </div>
                            </React.Fragment>
                        )}
                        {this.props.unlockCondition.type === GOVERNOR_ADDRESS_UNLOCK_CONDITION_TYPE && (
                            <Bech32HrpContext.Provider
                                value={{
                                    bech32Hrp: this.networkConfig?.bechHrp ?? "iota"
                                }}
                            >
                                <Address
                                    address={this.props.unlockCondition.address}
                                />
                            </Bech32HrpContext.Provider>
                        )}
                        {this.props.unlockCondition.type === IMMUTABLE_ALIAS_UNLOCK_CONDITION_TYPE && (
                            <Bech32HrpContext.Provider
                                value={{
                                    bech32Hrp: this.networkConfig?.bechHrp ?? "iota"
                                }}
                            >
                                <Address
                                    address={this.props.unlockCondition.address}
                                />
                            </Bech32HrpContext.Provider>
                        )}
                        {this.props.unlockCondition.type === STATE_CONTROLLER_ADDRESS_UNLOCK_CONDITION_TYPE && (
                            <Bech32HrpContext.Provider
                                value={{
                                    bech32Hrp: this.networkConfig?.bechHrp ?? "iota"
                                }}
                            >
                                <Address
                                    address={this.props.unlockCondition.address}
                                />
                            </Bech32HrpContext.Provider>
                        )}
                        <div className="card--label">
                            Type:
                        </div>
                        <div className="card--value row">
                            {this.props.unlockCondition.type}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default UnlockCondition;
