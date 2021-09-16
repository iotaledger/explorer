import QRCode from "qr.js/lib/QRCode";
import React, { Component, ReactNode } from "react";
import { QRProps } from "./QRProps";
import { QRState } from "./QRState";

/**
 * Component which will display a QR code.
 */
class QR extends Component<QRProps, QRState> {
    /**
     * Create a new instance of QR.
     * @param props The props.
     */

    /**
     * The QR size in pixels.
     */
    private readonly size: number = 150;

    constructor(props: QRProps) {
        super(props);
        this.state = {
            cells: []
        };
    }

    public componentDidMount(): void {
        const qr = new QRCode(-1, 1);
        qr.addData(this.props.data);
        qr.make();
        const cells = qr.modules;

        this.setState({ cells });
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <svg
                width={this.size}
                height={this.size}
                viewBox={`0 0 ${this.state.cells.length} ${this.state.cells.length}`}
            >
                {this.state.cells.map((row, rowIndex) => (
                    row.map((cell, cellIndex) => (
                        <rect
                            height={1}
                            key={cellIndex}
                            style={{ fill: cell ? "var(--qr-color)" : "none" }}
                            width={1}
                            x={cellIndex}
                            y={rowIndex}
                        />)
                    )
                ))}
            </svg>

        );
    }
}

export default QR;
