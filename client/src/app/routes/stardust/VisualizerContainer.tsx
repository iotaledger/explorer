import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { VisualizerDefault } from "./VisualizerDefault";
import VisualizerThree from "../../../features/visualizer-threejs/VisualizerInstance";
import { VisualizerRouteProps } from "../VisualizerRouteProps";
import "./Visualizer.scss";

enum Views {
    "default" = "default",
    "three" = "three"
}

export const VisualizerContainer: React.FC<
    RouteComponentProps<VisualizerRouteProps>
> = props => {
    const [currentView] = useState(Views.three);

    if (currentView === Views.default) {
        return <VisualizerDefault {...props} />;
    }

    if (currentView === Views.three) {
        return <VisualizerThree {...props} />;
    }

    return null;
};
