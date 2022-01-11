import React, { Component, ReactNode } from "react";
import "./MessageTree.scss";
import { MessageTreeProps } from "./MessageTreeProps";
import { MessageTreeState } from "./MessageTreeState";

interface ItemUI {
    top: number;
    id: string;
}
interface EdgeUI {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
/**
 * Component which will show the visualizer page.
 */
class MessageTree extends Component<MessageTreeProps, MessageTreeState> {
    /**
     * Message tree width.
     */
    private readonly _width: number;

    /**
     * Message tree item width.
     */
    private readonly _itemWidth: number = 144;

    /**
     * Horizontal space between columns.
     */
    private readonly _horizontalSpace: number = 80;

    /**
     * Height of each item.
     */
    private readonly _itemHeight: number = 32;

    /**
     * Vertical space between items.
     */
    private readonly _verticalSpace: number = 10;

    /**
     * Create a new instance of MessageTree.
     * @param props The props.
     */
    constructor(props: MessageTreeProps) {
        super(props);
        this._width = (this._itemWidth * 3) + (this._horizontalSpace * 2);
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
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const [parents, children, edges] = this.getItemsUI();
        const height: number = (Math.max(this.props.parentsIds.length, this.props.childrenIds.length) *
            (this._itemHeight + this._verticalSpace)) -
            this._verticalSpace;
        return (
            <div
                className="tree"
                style={{
                    height: `${height}px`,
                    width: `${this._width}px`
                }}
            >

                {/* Parents column */}
                <div className="tree-parents">
                    {parents.map(parent => (
                        <div
                            style={{
                                height: `${this._itemHeight}px`,
                                width: `${this._itemWidth}px`,
                                left: 0,
                                top: `${parent.top}px`
                            }}
                            className="parent"
                            key={parent.id}
                            onClick={() => {
                                this.props.onSelected(parent.id, true);
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
                        height: `${this._itemHeight}px`,
                        width: `${this._itemWidth}px`
                    }}
                >
                    {this.props.messageId.slice(0, 6)}...{this.props.messageId.slice(-6)}
                </div>

                {/* Children column */}
                <div className="tree-children">
                    {children.map(child => (
                        <div
                            style={{
                                height: `${this._itemHeight}px`,
                                width: `${this._itemWidth}px`,
                                right: 0,
                                top: `${child.top}px`
                            }}
                            className="child"
                            key={child.id}
                            onClick={() => {
                                this.props.onSelected(child.id, true);
                            }}
                        >
                            {child.id.slice(0, 6)}...{child.id.slice(-6)}
                        </div>
                    ))}
                </div>

                {/* Edges */}
                <svg className="edge">
                    {edges.map(edge => (
                        <line
                            key={edge.x1}
                            x1={edge.x1}
                            x2={edge.x2}
                            y1={edge.y1}
                            y2={edge.y2}
                            stroke="black"
                        />
                    ))}
                </svg>
            </div>
        );
    }


    private getItemsUI(): [ItemUI[], ItemUI[], EdgeUI[]] {
        const parentsHeight = ((this._itemHeight + this._verticalSpace) * this.props.parentsIds.length) -
            this._verticalSpace;
        const childrenHeight = ((this._itemHeight + this._verticalSpace) * this.props.childrenIds.length) -
            this._verticalSpace;
        const parentsOffsetTop = childrenHeight > parentsHeight ? (childrenHeight - parentsHeight) / 2 : 0;
        const childrenOffsetTop = parentsHeight > childrenHeight ? (parentsHeight - childrenHeight) / 2 : 0;

        const parents: ItemUI[] = this.props.parentsIds.map((parent, i) => (
            {
                top: ((this._itemHeight + this._verticalSpace) * i) + parentsOffsetTop,
                id: parent
            }
        ));

        const children: ItemUI[] = this.props.childrenIds.map((child, i) => ({
            top: ((this._itemHeight + this._verticalSpace) * i) + childrenOffsetTop,
            id: child
        }));

        const parentsLinks: EdgeUI[] = parents.map((parent, i) =>
        ({
            x1: this._itemWidth,
            x2: (this._width - this._itemWidth) * 0.5,
            y1: parent.top + (this._itemHeight * 0.5),
            y2: Math.max(parentsHeight, childrenHeight) * 0.5
        }
        ));
        const childrenLinks: EdgeUI[] = children.map((child, i) => (
            {
                x1: this._width - this._itemWidth,
                x2: (this._width + this._itemWidth) * 0.5,
                y1: child.top + (this._itemHeight * 0.5),
                y2: Math.max(parentsHeight, childrenHeight) * 0.5
            }
        ));

        const edges: EdgeUI[] = parentsLinks.concat(childrenLinks);
        return [parents, children, edges];
    }
}

export default MessageTree;
