import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { VisualizerForceGraph } from "../../../visualizerpoc/force-graph/VisualizerForceGraph";
import { VisualizerKanva } from "../../../visualizerpoc/kanva/VisualizerKanva";
import { VisualizerReagraph } from "../../../visualizerpoc/reagraph/VisualizerReagraph";
import { VisualizerVivagraph } from "../../../visualizerpoc/vivagraph-layout/VisualizerVivagraph";
import { VisualizerRouteProps } from "../VisualizerRouteProps";
import { VisualizerDefault } from "./VisualizerDefault";

enum Views {
    "default" = "default",
    "vivagraphlayout" = "vivagraphlayout",
    "forcegraph" = "forcegraph",
    "reagraph" = "reagraph",
    "kanva" = "kanva",
    "webgld3" = "webgld3"
}

export const VisualizerContainer: React.FC<
    RouteComponentProps<VisualizerRouteProps>
> = (props) => {
    const [currentView] = useState(Views.kanva);

    if (currentView === Views.default) {
        return <VisualizerDefault {...props} />;
    }
    if (currentView === Views.vivagraphlayout) {
        return <VisualizerVivagraph {...props} />;
    }
    if (currentView === Views.forcegraph) {
        return <VisualizerForceGraph {...props} />;
    }
    if (currentView === Views.kanva) {
        return <VisualizerKanva {...props} />;
    }

    return null;
};
