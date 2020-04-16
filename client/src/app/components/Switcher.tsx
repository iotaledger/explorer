import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import "./Switcher.scss";
import { SwitcherProps } from "./SwitcherProps";

/**
 * Component which will will show the switcher.
 */
class Switcher extends Component<SwitcherProps, any> {
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
                        key={item.value}
                        className={classNames({
                            selected: item.value === this.props.value
                        })}
                        onClick={() => this.props.onValueChanged(item.value)}
                    >
                        {item.label}
                    </button>
                ))
                }
            </nav>
        );
    }
}

export default Switcher;
