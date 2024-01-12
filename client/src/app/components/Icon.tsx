import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import "./Icon.scss";
import { IconProps } from "./IconProps";

const ICONS: {
    name: string;
    width: string;
    height: string;
    path: {
        d: string;
        fill?: string;
        fillRule?: "evenodd" | "nonzero" | "inherit";
        clipRule?: string | number;
    }[];
}[] = [
        {
            name: "wallet",
            width: "20",
            height: "20",
            path: [
                {
                    // eslint-disable-next-line max-len
                    d: "M6 0C2.68629 0 0 2.68629 0 6V14C0 17.3137 2.68629 20 6 20H14C17.3137 20 20 17.3137 20 14V6C20 2.68629 17.3137 0 14 0H6ZM18 6C18 3.79086 16.2091 2 14 2H6C3.79086 2 2 3.79086 2 6V14C2 16.2091 3.79086 18 6 18H14C16.2091 18 18 16.2091 18 14L14 14C11.7909 14 10 12.2091 10 10C10 7.79086 11.7909 6 14 6L18 6ZM14 8H18V12H14C12.8954 12 12 11.1046 12 10C12 8.89543 12.8954 8 14 8Z",
                    fill: "#25395F",
                    fillRule: "evenodd",
                    clipRule: "evenodd"
                }
            ]
        }
    ];

/**
 * Component which will display the inclusion state.
 */
class Icon extends Component<IconProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        const selectedIcon = ICONS.find(_icon => _icon.name === this.props.icon);

        return (
            selectedIcon ? (
                this.props.boxed ? (
                    <div className={classNames("icon", { boxed: this.props.boxed })}>
                        <svg
                            data-label="icon"
                            width={selectedIcon.width ?? "100%"}
                            height={selectedIcon.height ?? "100%"}
                            viewBox={`0 0 ${selectedIcon.width} ${selectedIcon.height}`}
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {selectedIcon.path.map((path, index) => (
                                <path
                                    key={index}
                                    d={path.d}
                                    fill={path.fill ?? ""}
                                    fillRule={path.fillRule}
                                    clipRule={path.clipRule ?? ""}
                                />
                            ))}
                        </svg>
                    </div>
                ) : (
                    <svg
                        data-label="icon"
                        width={selectedIcon.width ?? "100%"}
                        height={selectedIcon.height ?? "100%"}
                        viewBox={`0 0 ${selectedIcon.width} ${selectedIcon.height}`}
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {selectedIcon.path.map((path, index) => (
                            <path
                                key={index}
                                d={path.d}
                                fill={path.fill ?? ""}
                                fillRule={path.fillRule}
                                clipRule={path.clipRule ?? ""}
                            />
                        ))}
                    </svg>
                )
            ) : null
        );
    }
}

export default Icon;
