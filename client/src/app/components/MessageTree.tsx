import React, { Component, ReactNode } from "react";
import "./MessageTree.scss";
import { MessageTreeProps } from "./MessageTreeProps";
import { EdgeUI, ItemUI, MessageTreeState, TreeConfig } from "./MessageTreeState";


const DESKTOP_CONFIG: TreeConfig = {
    verticalSpace: 20,
    horizontalSpace: 80,
    itemHeight: 32,
    itemWidth: 144
};

const MOBILE_CONFIG: TreeConfig = {
    verticalSpace: 18,
    horizontalSpace: 16,
    itemHeight: 24,
    itemWidth: 98
};

/**
 * Component which will show the visualizer page.
 */
class MessageTree extends Component<MessageTreeProps, MessageTreeState> {
    /**
     * Create a new instance of MessageTree.
     * @param props The props.
     */
    constructor(props: MessageTreeProps) {
        super(props);
        this.state = {
            config: { ...DESKTOP_CONFIG },
            width: 0,
            height: 0,
            children: [],
            parents: [],
            edges: [],
            currentMessage: this.props.messageId
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        window.scrollTo({
            left: 0,
            top: 0,
            behavior: "smooth"
        });
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        this.loadItemsUI();
    }


    public resize() {
        const isMobile = window.innerWidth < 768;
        const config = isMobile ? MOBILE_CONFIG : DESKTOP_CONFIG;

        if (config !== this.state.config) {
            this.setState(
                {
                    config,
                    width: (config.itemWidth * 3) + (config.horizontalSpace * 2),
                    height: (Math.max(this.props.parentsIds.length, this.props.childrenIds.length) *
                        (config.itemHeight + config.verticalSpace)) -
                        config.verticalSpace
                }, () => {
                    this.loadItemsUI();
                });
        }
    }

    public componentDidUpdate(prevProps: MessageTreeProps): void {
        if (prevProps !== this.props) {
            this.setState(
                {
                    height: (Math.max(this.props.parentsIds.length, this.props.childrenIds.length) *
                        (this.state.config.itemHeight + this.state.config.verticalSpace)) -
                        this.state.config.verticalSpace
                }, () => {
                    this.loadItemsUI();
                });
            const top = document?.getElementById("messages-tree")?.offsetTop ?? 0;
            const OFFSET = 200;
            window.scrollTo({
                left: 0,
                top: top - OFFSET,
                behavior: "smooth"
            });
        }
        console.log("parents", this.state.parents);
    }

    public async componentWillUnmount(): Promise<void> {
        // eslint-disable-next-line unicorn/no-invalid-remove-event-listener
        window.removeEventListener("resize", this.resize.bind(this));
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div
                id="messages-tree"
                className="tree"
                style={{
                    height: `${this.state.height}px`,
                    width: `${this.state.width}px`
                }}
            >

                {/* Parents column */}
                <div className="tree-parents">
                    {/* <div className="parent-title row space-between">
                        <div>
                            <span>Parents</span></div>
                        <div>
                            <span>Children</span></div>

                    </div> */}
                    {this.state.parents?.map(parent => (
                        <div
                            style={{
                                height: `${this.state.config.itemHeight}px`,
                                width: `${this.state.config.itemWidth}px`,
                                left: 0,
                                top: `${parent.top}px`
                            }}
                            className="parent"
                            key={parent.id}
                            onClick={() => {
                                this.setState({ currentMessage: parent.id }, () => {
                                    this.props.onSelected(parent.id, true);
                                });
                            }}
                        >
                            {this.state.config === DESKTOP_CONFIG
                                ? (<React.Fragment>{parent.id.slice(0, 6)}...{parent.id.slice(-6)}</React.Fragment>)
                                : (<React.Fragment>{parent.id.slice(0, 4)}...{parent.id.slice(-4)}</React.Fragment>)}
                        </div>
                    ))}
                </div>

                {/* Root */}
                <div
                    className="root"
                    style={{
                        height: `${this.state.config.itemHeight}px`,
                        width: `${this.state.config.itemWidth}px`
                    }}
                >
                    {this.state.config === DESKTOP_CONFIG
                        ? (<React.Fragment>
                            {this.state.currentMessage.slice(0, 6)}...{this.state.currentMessage.slice(-6)}
                        </React.Fragment>)
                        : (<React.Fragment>
                            {this.state.currentMessage.slice(0, 4)}...{this.state.currentMessage.slice(-4)}
                        </React.Fragment>)}
                </div>

                {/* Children column */}
                <div className="tree-children">

                    {this.state.children?.map(child => (
                        <div
                            style={{
                                height: `${this.state.config.itemHeight}px`,
                                width: `${this.state.config.itemWidth}px`,
                                right: 0,
                                top: `${child.top}px`
                            }}
                            className="child"
                            key={child.id}
                            onClick={() => {
                                this.setState({ currentMessage: child.id }, () => {
                                    this.props.onSelected(child.id, true);
                                });
                            }}
                        >
                            {this.state.config === DESKTOP_CONFIG
                                ? (<React.Fragment>{child.id.slice(0, 6)}...{child.id.slice(-6)}</React.Fragment>)
                                : (<React.Fragment>{child.id.slice(0, 4)}...{child.id.slice(-4)}</React.Fragment>)}

                        </div>
                    ))}
                </div>

                {/* Edges */}
                <svg className="edge">
                    {this.state.edges?.map(edge =>
                    (
                        <line
                            key={edge.id}
                            x1={edge.x1}
                            x2={edge.x2}
                            y1={edge.y1}
                            y2={edge.y2}
                            stroke="black"
                        />
                    )
                    )}
                </svg>
            </div>
        );
    }


    private loadItemsUI(): void {
        const parentsHeight = ((this.state.config.itemHeight + this.state.config.verticalSpace) *
            this.props.parentsIds.length) - this.state.config.verticalSpace;
        const childrenHeight = ((this.state.config.itemHeight + this.state.config.verticalSpace) *
            this.props.childrenIds.length) - this.state.config.verticalSpace;

        const parentsOffsetTop = childrenHeight > parentsHeight ? (childrenHeight - parentsHeight) / 2 : 0;
        const childrenOffsetTop = parentsHeight > childrenHeight ? (parentsHeight - childrenHeight) / 2 : 0;

        const parents: ItemUI[] = this.props.parentsIds.map((parent, i) => (
            {
                top: ((this.state.config.itemHeight + this.state.config.verticalSpace) * i) + parentsOffsetTop,
                left: 0,
                id: parent
            }
        ));

        const children: ItemUI[] = this.props.childrenIds.map((child, i) => ({
            top: ((this.state.config.itemHeight + this.state.config.verticalSpace) * i) + childrenOffsetTop,
            right: 0,
            id: child
        }));

        const parentsLinks: EdgeUI[] = parents.map((parent, i) =>
        ({
            id: `edge--parent-${parent.id}`,
            x1: this.state.config.itemWidth,
            x2: ((this.state.width) - this.state.config.itemWidth) * 0.5,
            y1: parent.top + (this.state.config.itemHeight * 0.5),
            y2: Math.max(parentsHeight, childrenHeight) * 0.5
        }
        ));
        const childrenLinks: EdgeUI[] = children.map((child, i) => (
            {
                id: `edge--child-${child.id}`,
                x1: (this.state.width) - this.state.config.itemWidth,
                x2: ((this.state.width) + this.state.config.itemWidth) * 0.5,
                y1: child.top + (this.state.config.itemHeight * 0.5),
                y2: Math.max(parentsHeight, childrenHeight) * 0.5
            }
        ));

        const edges: EdgeUI[] = parentsLinks.concat(childrenLinks);
        this.setState({ parents, children, edges });
    }
}

export default MessageTree;
