import React, { Component, ReactNode } from "react";
import "./Modal.scss";
import { ModalProps } from "./ModalProps";
import { ModalState } from "./ModalState";


/**
 * Component which will display a transaction.
 */
class Modal extends Component<ModalProps, ModalState> {
    /**
     * Create a new instance of Modal.
     * @param props The props.
     */
    constructor(props: ModalProps) {
        super(props);
        this.state = {
            show: false
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="modal">
                <button
                    type="button"
                    className="modal--icon"
                    onClick={() => this.handleShow()}
                >
                    {this.props.icon === "dots" && (
                        <span className="material-icons">
                            more_horiz
                        </span>)}
                    {this.props.icon === "info" && (
                        <span className="material-icons">
                            info
                        </span>
                    )}
                </button>
                {this.state.show && (
                    <React.Fragment>
                        <div className="modal--content">
                            <div className="modal--header">
                                <div className="modal--title">
                                    {this.props.data?.title}
                                    <button
                                        type="button"
                                        onClick={() => this.handleHide()}
                                    >
                                        <span className="material-icons">close</span>
                                    </button>
                                </div>
                            </div>
                            <div className="modal--description">
                                <div dangerouslySetInnerHTML={{ __html: this.props.data?.description }} />
                                {this.props.data.links && (
                                    <div className="modal--actions">
                                        {this.props.data.links.map((link, index) => (
                                            <a
                                                key={index}
                                                rel="noopener noreferrer"
                                                href={link.href}
                                                target={link.isExternalLink ? "_blank" : "_self"}
                                                className="modal--action"
                                            >
                                                {link.label}
                                            </a>
                                        ))}
                                    </div>
                                )}

                            </div>
                        </div>
                        <div
                            className="modal--bg"
                            onClick={() => {
                                this.handleHide();
                            }}
                        />
                    </React.Fragment>

                )}
            </div>

        );
    }

    private handleShow(): void {
        this.setState({ show: true });
    }

    private handleHide(): void {
        this.setState({ show: false });
    }
}

export default Modal;
