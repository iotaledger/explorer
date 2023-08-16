import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { VisualizerCanvas } from "../../../features/visualizer-canvas/VisualizerCanvas";
import { VisualizerRouteProps } from "../VisualizerRouteProps";
import { VisualizerDefault } from "./VisualizerDefault";

enum Views {
    "default" = "default",
    "kanva" = "kanva"
}

export const VisualizerContainer: React.FC<
    RouteComponentProps<VisualizerRouteProps>
> = (props) => {
    const [currentView] = useState(Views.kanva);

    if (currentView === Views.default) {
        return <VisualizerDefault {...props} />;
    }
    if (currentView === Views.kanva) {
        return <VisualizerCanvas {...props} />;
    }

    return null;
};
