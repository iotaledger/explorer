import React, { Component, ReactNode } from "react";
import "./MessageTree.scss";
import { MessageTreeProps } from "./MessageTreeProps";
import { EdgeUI, ItemUI, MessageTreeState } from "./MessageTreeState";


interface TreeConfig {
    verticalSpace: number;
    horizontalSpace: number;
    itemWidth: number;
    itemHeight: number;
    width?: number;
    height?: number;
}

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
            isMobile: false,
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
        if (isMobile !== this.state.isMobile) {
            this.setState({ isMobile }, () => {
                this.loadItemsUI();
            });
        }
    }

    public async componentDidUpdate(prevProps: MessageTreeProps): Promise<void> {
        if (prevProps.parentsIds !== this.props.parentsIds) {
            this.loadItemsUI();
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
        const config = this.state.isMobile ? MOBILE_CONFIG : DESKTOP_CONFIG;

        return (
            <div
                className="tree"
                style={{
                    height: `${config.height}px`,
                    width: `${config.width}px`
                }}
            >

                {/* Parents column */}
                <div className="tree-parents">
                    {this.state.parents?.map(parent => (
                        <div
                            style={{
                                height: `${config.itemHeight}px`,
                                width: `${config.itemWidth}px`,
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
                            {parent.id.slice(0, 6)}...{parent.id.slice(-6)}
                        </div>
                    ))}
                </div>

                {/* Root */}
                <div
                    className="root"
                    style={{
                        height: `${config.itemHeight}px`,
                        width: `${config.itemWidth}px`
                    }}
                >
                    {this.state.currentMessage.slice(0, 6)}...{this.state.currentMessage.slice(-6)}
                </div>

                {/* Children column */}
                <div className="tree-children">
                    {this.state.children?.map(child => (
                        <div
                            style={{
                                height: `${config.itemHeight}px`,
                                width: `${config.itemWidth}px`,
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
                            {child.id.slice(0, 6)}...{child.id.slice(-6)}
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
        const config = this.state.isMobile ? MOBILE_CONFIG : DESKTOP_CONFIG;
        const width: number = (config.itemWidth * 3) + (config.horizontalSpace * 2);
        const height: number = (Math.max(this.props.parentsIds.length, this.props.childrenIds.length) *
            (config.itemHeight + config.verticalSpace)) -
            config.verticalSpace;
        config.width = width;
        config.height = height;
        const parentsHeight = ((config.itemHeight + config.verticalSpace) * this.props.parentsIds.length) -
            config.verticalSpace;
        const childrenHeight = ((config.itemHeight + config.verticalSpace) * this.props.childrenIds.length) -
            config.verticalSpace;
        const parentsOffsetTop = childrenHeight > parentsHeight ? (childrenHeight - parentsHeight) / 2 : 0;
        const childrenOffsetTop = parentsHeight > childrenHeight ? (parentsHeight - childrenHeight) / 2 : 0;

        const parents: ItemUI[] = this.props.parentsIds.map((parent, i) => (
            {
                top: ((config.itemHeight + config.verticalSpace) * i) + parentsOffsetTop,
                left: 0,
                id: parent
            }
        ));

        const children: ItemUI[] = this.props.childrenIds.map((child, i) => ({
            top: ((config.itemHeight + config.verticalSpace) * i) + childrenOffsetTop,
            right: 0,
            id: child
        }));

        const parentsLinks: EdgeUI[] = parents.map((parent, i) =>
        ({
            id: `edge--parent-${parent.id}`,
            x1: config.itemWidth,
            x2: (width - config.itemWidth) * 0.5,
            y1: parent.top + (config.itemHeight * 0.5),
            y2: Math.max(parentsHeight, childrenHeight) * 0.5
        }
        ));
        const childrenLinks: EdgeUI[] = children.map((child, i) => (
            {
                id: `edge--child-${child.id}`,
                x1: width - config.itemWidth,
                x2: (width + config.itemWidth) * 0.5,
                y1: child.top + (config.itemHeight * 0.5),
                y2: Math.max(parentsHeight, childrenHeight) * 0.5
            }
        ));

        const edges: EdgeUI[] = parentsLinks.concat(childrenLinks);
        this.setState({ parents, children, edges });
    }
}

export default MessageTree;
