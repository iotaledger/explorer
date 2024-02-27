import React from "react";
import { useGetThemeMode } from "~/helpers/hooks/useGetThemeMode.js";
import { VisualizerRouteProps } from "~/app/routes/VisualizerRouteProps.js";
import { RouteComponentProps } from "react-router-dom";
import NovaVisualizer from "./VisualizerInstance";

export default function NovaVisualizerWrapper(props: RouteComponentProps<VisualizerRouteProps>): React.JSX.Element {
    const theme = useGetThemeMode();

    return <NovaVisualizer key={theme} {...props} />;
}
