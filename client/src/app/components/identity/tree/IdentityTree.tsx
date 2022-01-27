import "./IdentityTree.scss";

import React, { Component, ReactNode } from "react";

import { IdentityHelper } from "../../../../helpers/identityHelper";
import IdentityTreeItem from "./IdentityTreeItem";
import { IdentityTreeProps } from "./IdentityTreeProps";
import { IdentityTreeState } from "./IdentityTreeState";

export default class IdentityMessageIdOverview extends Component<IdentityTreeProps, IdentityTreeState> {
    constructor(props: IdentityTreeProps) {
        super(props);

        const firstMsg = this.props.history?.integrationChainData?.[0];

        if (!firstMsg) {
            return;
        }

        this.state = {
            selectedMessage: {
                message: firstMsg.document,
                document: firstMsg.document,
                messageId: firstMsg.messageId,
                isDiff: false
            }
        };
    }

    public render(): ReactNode {
        return (
            <div className="identity-tree">
                {this.props.history?.integrationChainData?.map((value, index) => (
                    <IdentityTreeItem
                        network={this.props.network}
                        version={this.props.version}
                        itemMessage={{
                            message: value.document,
                            document: value.document,
                            messageId: value.messageId,
                            isDiff: false
                        }}
                        key={index}
                        lastMsg={index === (this.props.history?.integrationChainData?.length ?? 0) - 1}
                        nested={false}
                        firstMsg={index === 0}
                        selectedMessage={this.state.selectedMessage}
                        parentFirstMsg={undefined}
                        onItemClick={(selectedItem, compareWith) => {
                            this.setState({
                                selectedMessage: selectedItem ?? ""
                            });
                            this.props.onItemClick(selectedItem, compareWith);
                        }}
                        onDiffMessagesUpdate={this.props.onDiffMessagesUpdate}
                    />
                ))}
            </div>
        );
    }
}
