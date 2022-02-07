import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import "./MessageTree.scss";
import { MessageTreeProps } from "./MessageTreeProps";
import { EdgeUI, ItemUI, MessageTreeState, TreeConfig } from "./MessageTreeState";

/**
 * UI tree configuration in desktop.
 */
const DESKTOP_CONFIG: TreeConfig = {
    verticalSpace: 20,
    horizontalSpace: 80,
    itemHeight: 32,
    itemWidth: 205
};

/**
 * UI tree configuration in mobile.
 */
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
            items: [],
            edges: [],
            currentMessage: this.props.messageId,
            isBusy: false
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
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
                    this.setState({ isBusy: false });
                });
            if (prevProps.messageId !== this.props.messageId) {
                // ------- Scroll to messages tree section -------
                const top = document?.getElementById("message-tree")?.offsetTop ?? 0;
                const OFFSET = 200;

                window.scrollTo({
                    left: 0,
                    top: top - OFFSET,
                    behavior: "smooth"
                });
                // -----------------------------------------------
            }
        }
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
            <React.Fragment>
                <div
                    className="message-tree-title row margin-b-m"
                    style={{
                        width: `${this.state.width}px`
                    }}
                >

                    {/* Headings */}
                    <div className="parents-title">Parents</div>
                    <div
                        className="children-title"
                        style={{
                            right: `${this.state.config.itemWidth}px`
                        }}
                    >
                        Children
                    </div>

                </div>
                <div
                    id="message-tree"
                    className={classNames("tree", { busy: this.state.isBusy })}
                    style={{
                        height: `${this.state.height}px`,
                        width: `${this.state.width}px`
                    }}
                >

                    {/* Parents and Children */}
                    {this.state.items?.map(item => (
                        <div
                            style={{
                                height: `${this.state.config.itemHeight}px`,
                                width: `${this.state.config.itemWidth}px`,
                                left: item.type === "parent" ? "0" : "none",
                                right: item.type === "child" ? "0" : "none",
                                top: `${item.top}px`
                            }}
                            className={item.type}
                            key={item.id}
                            onClick={() => {
                                this.setState({ currentMessage: item.id, isBusy: true }, () => {
                                    this.props.onSelected(item.id, true);
                                });
                            }}
                        >
                            {item.id.slice(0, this.state.config === DESKTOP_CONFIG
                                ? 6 : 4)}...{item.id.slice(this.state.config === DESKTOP_CONFIG ? -6 : -4)}
                        </div>
                    ))}

                    {/* Root */}
                    <div
                        className="root"
                        style={{
                            height: `${this.state.config.itemHeight}px`,
                            width: `${this.state.config.itemWidth}px`
                        }}
                    >
                        {this.state.currentMessage.slice(0, this.state.config === DESKTOP_CONFIG
                            ? 6 : 4)}...{this.state.currentMessage.slice(this.state.config === DESKTOP_CONFIG
                                ? -6 : -4)}
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
            </React.Fragment >
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
                id: parent,
                type: "parent"
            }
        ));

        const children: ItemUI[] = this.props.childrenIds.map((child, i) => ({
            top: ((this.state.config.itemHeight + this.state.config.verticalSpace) * i) + childrenOffsetTop,
            id: child,
            type: "child"
        }));

        const items: ItemUI[] = parents.concat(children);

        const edges: EdgeUI[] = items.map((item, i) =>
        ({
            id: `edge--${item.type}-${item.id}`,
            x1: item.type === "parent" ? this.state.config.itemWidth : (this.state.width) - this.state.config.itemWidth,
            x2: ((this.state.width) - (this.state.config.itemWidth * (item.type === "parent" ? 1 : -1))) * 0.5,
            y1: item.top + (this.state.config.itemHeight * 0.5),
            y2: Math.max(parentsHeight, childrenHeight) * 0.5
        }
        ));
        this.setState({ items, edges });
    }
}

export default MessageTree;
