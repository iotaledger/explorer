import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { VisualizerRouteProps } from "../VisualizerRouteProps";
import { VisualizerDefault } from "./VisualizerDefault";

enum Views {
    "default" = "default"
}

export const VisualizerContainer: React.FC<RouteComponentProps<VisualizerRouteProps>> = props => {
    const currentView = Views.default;

    if (currentView === Views.default) {
        return <VisualizerDefault {...props} />;
    }

    return null;
};
