import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import "./DataToggle.scss";
import { DataToggleProps } from "./DataToggleProps";
import { DataToggleState } from "./DataToggleState";
import JsonViewer from "./JsonViewer";

/**
 * Component which will display a section with different contents able to be navigate through tabs.
 */
class DataToggle extends Component<DataToggleProps, DataToggleState> {
    /**
     * Create a new instance of DataToggle.
     * @param props The props.
     */
    constructor(props: DataToggleProps) {
        super(props);
        this.state = {
            activeTab: this.props.options.findIndex(o => o.content !== undefined)
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const activeOption = this.props.options[this.state.activeTab];

        return (
            <div className="data-toggle">
                {activeOption.link ? (
                    <a className="data-toggle--content" href={activeOption.link}>
                        {activeOption.content}
                    </a>
                ) : (
                    activeOption.isJson
                        ? (
                            <div className="data-toggle--content">
                                <JsonViewer json={activeOption.content} />
                            </div>)
                        : (<div className="data-toggle--content">{activeOption.content}</div>)
                )}
                <div className="data-toggle--tabs">
                    {this.props.options.map((option, index) => (
                        option.content ? (
                            <div
                                key={option.label}
                                className={classNames(
                                    "data-toggle--tab",
                                    { "data-toggle--tab__active": this.state.activeTab === index })}
                                onClick={() => this.setState({ activeTab: index })}
                            >
                                {option.label}
                            </div>) : null
                    ))}
                </div>
            </div>
        );
    }
}

export default DataToggle;
