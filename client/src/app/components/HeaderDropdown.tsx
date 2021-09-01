import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { ReactComponent as DropdownIcon } from "./../../assets/chevron-down-gray.svg";
import { HeaderDropdownProps } from "./HeaderDropdownProps";
import { HeaderDropdownState } from "./HeaderDropdownState";
import './HeaderDropdown.scss';

/**
 * Component which will display a transaction.
 */
class HeaderDropdown extends Component<HeaderDropdownProps, HeaderDropdownState> {
    /**
     * Create a new instance of HeaderDropdown.
     * @param props The props.
     */
    constructor(props: HeaderDropdownProps) {
        super(props);
        this.state = {
            isExpanded: false
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <React.Fragment>
                <div onClick={() => this.setState({ isExpanded: !this.state?.isExpanded })}>
                    {this.props.label}
                    <div className={classNames({ opened: this.state.isExpanded })}>
                        <DropdownIcon />
                    </div>
                </div>
                {this.state?.isExpanded && (

                    <div className="menu__expanded">
                        {
                            this.props.columns?.map(col => (
                                <div key={col.label}>
                                    {col.label}
                                    <div>
                                        {col.items?.map(item => (
                                            item.onClick && (<div onClick={() => item.onClick ? item?.onClick(item.label) : ''}>hola</div>)
                                        ))}
                                    </div>
                                </div>
                            )
                            )
                        }
                    </div>
                )
                }
            </React.Fragment>

            // <Link to={this.props.rootPath}>
            //     <img className="logo-image" src={logoHeader} alt="Explorer" />
            // </Link>
        );
    }
}

export default HeaderDropdown;
