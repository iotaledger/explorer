import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import DevnetIcon from "~assets/devnet.svg?react";
import MainnetIcon from "~assets/mainnet.svg?react";
import { NetworkSwitcherProps } from "./NetworkSwitcherProps";
import { getNetworkOrder } from "~helpers/networkHelper";
import { MAINNET } from "~models/config/networkType";
import { CHRYSALIS, LEGACY, STARDUST } from "~models/config/protocolVersion";
import "./NetworkSwitcher.scss";

const PROTOCOL_VERIONS_TO_LABEL = {
    [LEGACY]: "Legacy",
    [CHRYSALIS]: "Chrysalis",
    [STARDUST]: "Stardust",
};

/**
 * Component which will show the switcher.
 */
class NetworkSwitcher extends Component<NetworkSwitcherProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const { label, eyebrow, networks, isExpanded, onChange, onClick } = this.props;

        networks.sort((a, b) => getNetworkOrder(a.network) - getNetworkOrder(b.network));
        const isSingleNetwork = networks.length === 1;
        const headerStyle = isSingleNetwork ? {} : { cursor: "pointer" };

        return (
            <div className="network--switcher">
                <div
                    style={headerStyle}
                    className={classNames("network--switcher__header row middle", { opened: isExpanded })}
                    onClick={isSingleNetwork ? () => {} : onClick}
                >
                    <div className="network--switcher__dropdown">
                        <div className="eyebrow">{eyebrow}</div>
                        <div className="label">{label}</div>
                    </div>
                    {!isSingleNetwork && (
                        <div className="icon">
                            <span className="material-icons">expand_more</span>
                        </div>
                    )}

                    <div className={classNames("network--expanded", { opened: isExpanded })}>
                        <div className="networks">
                            {networks.map((network, idx) => (
                                <div className="network" key={idx}>
                                    <div className="network--cards">
                                        <div
                                            className={classNames("network--card row middle", { selected: network.label === label })}
                                            onClick={() => onChange(network.network)}
                                        >
                                            <div className="network--icon row middle center">
                                                {network.network === MAINNET ? <MainnetIcon /> : <DevnetIcon />}
                                            </div>
                                            <div className="network--content">
                                                <div className="label">{network.label}</div>
                                                <div className="protocol">{PROTOCOL_VERIONS_TO_LABEL[network.protocolVersion]}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {isExpanded && <div className="header--expanded--shield" onClick={onClick} />}
                </div>
            </div>
        );
    }
}

export default NetworkSwitcher;
