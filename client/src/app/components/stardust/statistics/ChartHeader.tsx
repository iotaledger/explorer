import React from "react";
import ChartLegend from "./ChartLegend";
import Modal from "../../Modal";
import { ModalData } from "../../ModalProps";
import "./ChartHeader.scss";

interface ChartHeaderProps {
    readonly title?: string;
    readonly info?: ModalData;
    readonly disabled?: boolean;
    readonly legend?: {
        labels: string[];
        colors: string[];
    };
}

const ChartHeader: React.FC<ChartHeaderProps> = ({ title, info, disabled, legend }) => (
    <div className="chart-header">
        <div className="row space-between margin-b-m ">
            {title && (
                <div className="chart-header__title">
                    <h4>{title}</h4>
                    {info && <Modal icon="info" data={info} />}
                </div>
            )}
        </div>

        {!disabled && legend && <ChartLegend labels={legend.labels} colors={legend.colors} />}
    </div>
);

ChartHeader.defaultProps = {
    disabled: undefined,
    info: undefined,
    legend: undefined,
    title: undefined,
};

export default ChartHeader;
