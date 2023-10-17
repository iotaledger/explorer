import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { VisualizerRouteProps } from "../../app/routes/VisualizerRouteProps";
import VisualizerInstance from "./VisualizerInstance";

/**
 * This main component we will use to manage what to show: real stream or recorded data
 * @param props
 * @class
 */
export const VisualizerMain: React.FC<RouteComponentProps<VisualizerRouteProps>> = props => (
    <VisualizerInstance {...props} />
    );

export default VisualizerMain;
