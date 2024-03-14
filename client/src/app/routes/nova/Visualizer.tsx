import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { useGetThemeMode } from "~/helpers/hooks/useGetThemeMode";
import VisualizerInstance from "~features/visualizer-vivagraph/VisualizerInstance";
import { VisualizerRouteProps } from "~app/routes/VisualizerRouteProps";

export default function Visualizer(props: RouteComponentProps<VisualizerRouteProps>): React.JSX.Element {
    const theme = useGetThemeMode();

    return <VisualizerInstance key={theme} {...props} />;
}
