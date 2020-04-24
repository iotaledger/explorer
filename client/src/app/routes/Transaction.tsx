import React, { ReactNode } from "react";
import AsyncComponent from "../components/AsyncComponent";
import "./Transaction.scss";
import { TransactionProps } from "./TransactionProps";
import { TransactionState } from "./TransactionState";

/**
 * Component which will will show the transaction page.
 */
class Transaction extends AsyncComponent<TransactionProps, TransactionState> {
    /**
     * Create a new instance of Transaction.
     * @param props The props.
     */
    constructor(props: TransactionProps) {
        super(props);

        this.state = {
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        window.scrollTo(0, 0);
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="transaction">
                {this.props.networkConfig.network}
                <br />
                {this.props.hashType}
                <br />
                {this.props.hash}
            </div>
        );
    }
}

export default Transaction;
