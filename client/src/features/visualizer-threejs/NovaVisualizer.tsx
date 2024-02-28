import React from "react";
import { useGetThemeMode } from "~/helpers/hooks/useGetThemeMode.js";
import { VisualizerRouteProps } from "~/app/routes/VisualizerRouteProps.js";
import { RouteComponentProps } from "react-router-dom";
import VisualizerInstance from "./VisualizerInstance";

export default function NovaVisualizer(props: RouteComponentProps<VisualizerRouteProps>): React.JSX.Element {
    const theme = useGetThemeMode();

    return <VisualizerInstance key={theme} {...props} />;
}
