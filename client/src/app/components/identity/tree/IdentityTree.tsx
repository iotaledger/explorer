import React, { Component, ReactNode } from "react";
import IdentityTreeItem from "./IdentityTreeItem";
import { IdentityTreeProps } from "./IdentityTreeProps";
import { IdentityTreeState } from "./IdentityTreeState";
import "./IdentityTree.scss";

export default class IdentityMessageIdOverview extends Component<IdentityTreeProps, IdentityTreeState> {
    constructor(props: IdentityTreeProps) {
        super(props);

        this.state = {
            counter: ["1", "2", "3", "4"],
            structure: null,
            selectedMessageId: "test"
        };

        const scope = this;

        setInterval(function () {
            // scope.changeStuff()
        }, 1000);
    }

    public render(): ReactNode {
        // return (
        //     <div className="tree">
        //         <IdentityTreeItem
        //             lastMsg={false}
        //             nested={false}
        //             firstMsg={true}
        //             hasChildren={false}
        //             selected={this.state.selectedMessageId === "test"}
        //             onClick={() => {
        //                 this.setState({ selectedMessageId: "test" });
        //             }}
        //         />
        //         <IdentityTreeItem
        //             lastMsg={false}
        //             nested={false}
        //             firstMsg={false}
        //             hasChildren={false}
        //             selected={this.state.selectedMessageId === "test1"}
        //             onClick={() => {
        //                 this.setState({ selectedMessageId: "test1" });
        //             }}
        //         />
        //         <IdentityTreeItem
        //             lastMsg={true}
        //             nested={false}
        //             firstMsg={false}
        //             hasChildren={false}
        //             selected={this.state.selectedMessageId === "test2"}
        //             onClick={() => {
        //                 this.setState({ selectedMessageId: "test2" });
        //             }}
        //         />
        //     </div>
        // );

        console.log(this.props.history?.integrationChainData);

        return (
            <div className="tree">
                {this.props.history?.integrationChainData?.map((value, index) => (
                    <IdentityTreeItem
                        messageId={value?.messageId}
                        key={index}
                        lastMsg={
                            index === ((this.props.history?.integrationChainData?.length ?? 0) - 1)
                        }
                        nested={false}
                        firstMsg={index === 0}
                        hasChildren={false}
                        selected={this.state.selectedMessageId === value?.messageId}
                        onClick={() => {
                            this.setState({ selectedMessageId: value?.messageId });
                            this.props.onItemClick(value?.messageId, value?.document);
                        }}
                    />
                ))}
            </div>
        );
    }

    private changeStuff() {
        this.setState({ counter: [...this.state.counter, "33"] });
    }
}
// <div>
//     <IdentityTreeItem lastMsg={false} nested={false} firstMsg={true} hasChildren={true} />
//     <IdentityTreeItem lastMsg={false} nested={true} firstMsg={true} hasChildren={false} />
//     <IdentityTreeItem lastMsg={true} nested={true} firstMsg={false} hasChildren={false} />
//     <IdentityTreeItem lastMsg={false} nested={false} firstMsg={false} hasChildren={false} />
//     <IdentityTreeItem lastMsg={false} nested={false} firstMsg={false} hasChildren={false} />
// </div>
