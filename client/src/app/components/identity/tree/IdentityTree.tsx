import React, { Component, ReactNode } from "react";
import IdentityTreeItem from "./IdentityTreeItem";
import { IdentityTreeProps } from "./IdentityTreeProps";
import { IdentityTreeState } from "./IdentityTreeState";
import "./IdentityTree.scss";

export default class IdentityMessageIdOverview extends Component<IdentityTreeProps, IdentityTreeState> {
    constructor(props: IdentityTreeProps) {
        super(props);

        this.state = {
            selectedMessageId: "test"
        };
    }

    public render(): ReactNode {
        return (
            <div className="tree">
                {this.props.history?.integrationChainData?.map((value, index) => (
                    <IdentityTreeItem
                        network={this.props.network}
                        parentMessageId={undefined}
                        messageId={value?.messageId}
                        messageContent={value?.document}
                        key={index}
                        lastMsg={index === (this.props.history?.integrationChainData?.length ?? 0) - 1}
                        nested={false}
                        firstMsg={index === 0}
                        hasChildren={false}
                        selected={this.state.selectedMessageId === value?.messageId}
                        onClick={() => {
                            this.setState({
                                selectedMessageId: value?.messageId
                            });
                            this.props.onItemClick(value?.messageId, value?.document);
                        }}
                    />
                ))}
            </div>
        );
    }
}
