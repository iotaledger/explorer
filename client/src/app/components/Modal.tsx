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
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="5" cy="12" r="2" fill="#909FBE" />
                            <circle cx="12" cy="12" r="2" fill="#909FBE" />
                            <circle cx="19" cy="12" r="2" fill="#909FBE" />
                        </svg>

                    )}
                    {this.props.icon === "info" && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M15.25 8C15.25 12.0041 12.0041 15.25 8 15.25C3.99594 15.25 0.75 12.0041 0.75 8C0.75 3.99594 3.99594 0.75 8 0.75C12.0041 0.75 15.25 3.99594 15.25 8ZM8 6C8.82843 6 9.5 5.32843 9.5 4.5C9.5 3.67157 8.82843 3 8 3C7.17157 3 6.5 3.67157 6.5 4.5C6.5 5.32843 7.17157 6 8 6ZM7 12V7H9V12H7Z" fill="#B0BFD9" />
                        </svg>

                    )}
                </button>
                {this.state.show && (
                    <React.Fragment>
                        <div className="modal--content">
                            <div className="modal--header">

                                <div className="title">
                                    {this.props.data?.title}
                                    <button
                                        type="button"
                                        onClick={() => this.handleHide()}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M13.8108 15.293C14.2014 15.6835 14.8345 15.6835 15.225 15.293L15.2926 15.2254C15.6831 14.8349 15.6831 14.2017 15.2926 13.8112L9.4815 8.00009L15.2925 2.189C15.683 1.79847 15.683 1.1653 15.2925 0.774774L15.225 0.707255C14.8345 0.316728 14.2013 0.316729 13.8108 0.707256L7.99978 6.51835L2.18871 0.707202C1.79819 0.316675 1.16503 0.316675 0.774504 0.707202L0.706986 0.774722C0.316464 1.16525 0.316465 1.79842 0.706987 2.18895L6.51806 8.00009L0.706953 13.8113C0.316432 14.2018 0.316432 14.835 0.706954 15.2255L0.774473 15.293C1.16499 15.6835 1.79816 15.6835 2.18868 15.293L7.99978 9.48184L13.8108 15.293Z" fill="#485776" />
                                        </svg>


                                    </button>
                                </div>
                            </div>
                            <div className="modal--description">
                                <div dangerouslySetInnerHTML={{ __html: this.props.data?.description }} />

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
