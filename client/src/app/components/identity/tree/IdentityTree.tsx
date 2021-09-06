import React, { Component, ReactNode } from "react";
import IdentityTreeItem from "./IdentityTreeItem";
import { IdentityTreeProps } from "./IdentityTreeProps";
import { IdentityTreeState } from "./IdentityTreeState";
import "./IdentityTree.scss";

export default class IdentityMessageIdOverview extends Component<IdentityTreeProps, IdentityTreeState> {
    constructor(props: IdentityTreeProps) {
        super(props);

        this.state = {
            selectedMessageId: this.props.history?.integrationChainData?.[0].messageId ?? ""
        };
    }

    public render(): ReactNode {
        return (
            <div className="identity-tree">
                {this.props.history?.integrationChainData?.map((value, index) => (
                    <IdentityTreeItem
                        network={this.props.network}
                        messageId={value?.messageId}
                        key={index}
                        lastMsg={index === (this.props.history?.integrationChainData?.length ?? 0) - 1}
                        nested={false}
                        firstMsg={index === 0}
                        selectedMessageId={this.state.selectedMessageId}
                        content={value.document}
                        parentLastMsg={undefined}
                        onItemClick={(messageId, content) => {
                            this.setState({
                                selectedMessageId: messageId ?? ""
                            });
                            this.props.onItemClick(messageId ?? "", content);
                        }}
                    />
                ))}
            </div>
        );
    }
}
