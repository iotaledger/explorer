import React, { Component, ReactNode } from "react";
import { IdentityMsgStatusIconProps } from "./IdentityMsgStatusIconProps";

export default class IdentityMsgStatusIcon extends Component<IdentityMsgStatusIconProps> {
    public render(): ReactNode {
        return (
            <div>
                {/* MINT DIAMOND  */}
                {this.props.status === "integration" && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 6L6 0L0 6L6 12L12 6Z" fill="#14CABF" />
                    </svg>
                )}

                {/* ORANGE TRIANGLE */}
                {this.props.status === "invalid" && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 10L6 0L0 10H6H12Z" fill="#FFA800" />
                    </svg>
                )}

                {/* BLUE CIRCLE */}
                {this.props.status === "diff" && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="5" cy="5" r="5" fill="#6464FF" />
                    </svg>
                )}

                {/* ONE DIAMOND AND TWO CIRCLES */}
                {this.props.status === "unavailable" && (
                    <svg width="39" height="13" viewBox="0 0 39 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="11.6667" y="5.44446" width="16.3333" height="1.55556" fill="#C7C7C7" />
                        <path
                            d="M12.4444 6.22222L6.22222 0L0 6.22222L6.22222 12.4444L12.4444 6.22222Z"
                            fill="#14CABF"
                        />
                        <circle cx="20.0556" cy="6.05556" r="5.05556" fill="#6464FF" />
                        <circle cx="33.0556" cy="6.05556" r="5.05556" fill="#6464FF" />
                    </svg>
                )}
            </div>
        );
    }
}
