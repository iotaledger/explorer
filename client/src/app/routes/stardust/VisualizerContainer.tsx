import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { VisualizerCanvas } from "../../../features/visualizer-canvas/VisualizerCanvas";
import VisualizerThree from "../../../features/visualizer-threejs/VisualizerThree";
import { VisualizerRouteProps } from "../VisualizerRouteProps";
import { VisualizerDefault } from "./VisualizerDefault";

enum Views {
    "default" = "default",
    "kanva" = "kanva",
    "three" = "three"
}

export const VisualizerContainer: React.FC<
    RouteComponentProps<VisualizerRouteProps>
> = (props) => {
    const [currentView] = useState(Views.three);

    if (currentView === Views.default) {
        return <VisualizerDefault {...props} />;
    }
    if (currentView === Views.kanva) {
        return <VisualizerCanvas {...props} />;
    }
    if (currentView === Views.three) {
        return <VisualizerThree {...props} />;
    }

    return null;
};
