import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import "./Switcher.scss";
import { SwitcherProps } from "./SwitcherProps";

/**
 * Component which will show the switcher.
 */
class Switcher extends Component<SwitcherProps> {
    /**
     * Create a new instance of Switcher.
     * @param props The props.
     */
    constructor(props: SwitcherProps) {
        super(props);

        this.state = {
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <nav className="switcher">
                {this.props.items.map(item => (
                    <button
                        type="button"
                        key={item.value}
                        className={classNames({
                            selected: item.value === this.props.value
                        })}
                        onClick={() => this.props.onChange(item.value)}
                        disabled={this.props.disabled}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>
        );
    }
}

export default Switcher;
