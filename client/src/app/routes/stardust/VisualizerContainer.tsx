import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { VisualizerVivagraph } from "../../../visualizerpoc/vivagraph-layout/VisualizerVivagraph";
import { VisualizerRouteProps } from "../VisualizerRouteProps";
import { VisualizerDefault } from "./VisualizerDefault";

enum Views {
    "default" = "default",
    "vivagraphlayout" = "vivagraphlayout"
}

export const VisualizerContainer: React.FC<RouteComponentProps<VisualizerRouteProps>> = props => {
    const [currentView] = useState(Views.vivagraphlayout);

    if (currentView === Views.default) {
        return <VisualizerDefault {...props} />;
    }
    if (currentView === Views.vivagraphlayout) {
        return <VisualizerVivagraph {...props} />;
    }

    return null;
};
